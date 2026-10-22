#!/usr/bin/env bash
# Deploy website Sean Truong Real Estate lên VPS: bash /www/wwwroot/seantruongre.com/deploy.sh [--force]
# Kéo code → chỉ build / restart app nào có thay đổi (so dấu vân tay thư mục + file env) → migration + seed → kiểm tra → pm2 save.
# Dùng bởi: người deploy trên VPS aaPanel (2 app pm2: seantruongre_api cổng 3016, seantruongre_web cổng 3008).
# Lưu ý: frontend build xen kẽ vào .next-blue / .next-green (NEXT_DIST_DIR) nên site cũ vẫn chạy trong lúc build, kiểm tra hỏng thì tự quay
# về bản trước. Hai project cùng tên trong aaPanel phải để STOPPED, không Delete. Trạng thái build lưu ở .deploy/. Chi tiết: README.md mục Deploy.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_NAME="${API_NAME:-seantruongre_api}"; API_PORT="${API_PORT:-3016}"
WEB_NAME="${WEB_NAME:-seantruongre_web}"; WEB_PORT="${WEB_PORT:-3008}"
APP_USER="${APP_USER:-www}"
STATE_DIR="$ROOT/.deploy"
LOCK_FILE="${DEPLOY_LOCK_FILE:-/tmp/seantruongre-deploy.lock}"
UPLOAD_BACKUP="${DEPLOY_BACKUP_DIR:-$HOME/seantruongre-deploy-backup}/$(date +%Y%m%d-%H%M%S)"
SITE_URL="http://127.0.0.1:$WEB_PORT"

FORCE_REBUILD=false
DEPLOY_STARTED=$SECONDS
STEP_STARTED=""

say() {
  finish_step
  STEP_STARTED=$SECONDS
  printf '\n\033[1;32m==> %s\033[0m\n' "$1"
}
finish_step() {
  if [ -n "$STEP_STARTED" ]; then printf '    (%ss)\n' "$((SECONDS - STEP_STARTED))"; fi
  STEP_STARTED=""
}
info() { printf '    %s\n' "$1"; }
warn() { printf '\033[1;33m!!  %s\033[0m\n' "$1"; }
die()  { printf '\033[1;31mXX  %s\033[0m\n' "$1"; exit 1; }

print_usage() {
  printf 'Cách dùng: bash deploy.sh [--force]\n  --force  build lại và restart cả 2 app, cài lại gói npm dù không có gì đổi\n'
}

parse_args() {
  local arg
  for arg in "$@"; do
    case "$arg" in
      --force) FORCE_REBUILD=true ;;
      -h|--help) print_usage; exit 0 ;;
      *) print_usage; die "Không hiểu tham số: $arg" ;;
    esac
  done
}

acquire_lock() {
  command -v flock >/dev/null 2>&1 || return 0
  exec 9>"$LOCK_FILE"
  flock -n 9 || die "Đang có một lần deploy khác chạy (khoá $LOCK_FILE) — chờ nó xong rồi chạy lại."
}

check_setup() {
  command -v pm2 >/dev/null 2>&1 || die "Chưa có pm2 → npm install -g pm2 rồi chạy lại."
  grep -q "next start -p $WEB_PORT\"" "$ROOT/frontend-next/package.json" \
    || die "frontend-next/package.json: script start phải là 'next start -p $WEB_PORT' (khớp WEB_PORT)."
  [ -f "$ROOT/backend/.env" ] || die "Chưa có backend/.env — tạo từ backend/.env.example trước."
  grep -qE "^PORT=${API_PORT}[[:space:]]*$" "$ROOT/backend/.env" \
    || die "backend/.env phải có dòng PORT=$API_PORT (khớp API_PORT)."
  { [ -f "$ROOT/frontend-next/.env.local" ] || [ -f "$ROOT/frontend-next/.env" ]; } \
    || die "Chưa có frontend-next/.env.local — tạo từ frontend-next/.env.example trước."
}

port_pid() { ss -tlnpH "sport = :$1" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | head -1 || true; }

is_descendant_of() {
  local pid="$1" ancestor="$2" _
  for _ in 1 2 3 4 5; do
    { [ -z "$pid" ] || [ "$pid" = "1" ]; } && return 1
    [ "$pid" = "$ancestor" ] && return 0
    pid="$(ps -o ppid= -p "$pid" 2>/dev/null | tr -d ' ' || true)"
  done
  return 1
}

is_port_held_by_app() {
  local name="$1" port="$2" holder app_pid
  holder="$(port_pid "$port")"
  app_pid="$(pm2 pid "$name" 2>/dev/null | tr -d '[:space:]' || true)"
  [ -n "$holder" ] && [ -n "$app_pid" ] && [ "$app_pid" != "0" ] && is_descendant_of "$holder" "$app_pid"
}

free_port() {
  local name="$1" port="$2" holder
  holder="$(port_pid "$port")"
  [ -z "$holder" ] && return 0
  is_port_held_by_app "$name" "$port" && return 0
  warn "Cổng $port đang bị PID $holder ($(ps -o comm= -p "$holder" 2>/dev/null || echo '?')) chiếm — không phải pm2 $name → kill."
  warn "Nếu đó là project trong aaPanel: vào panel bấm STOP, không thì nó sẽ bật lại."
  kill "$holder" 2>/dev/null || true
  sleep 2
  [ -n "$(port_pid "$port")" ] && { fuser -k "$port/tcp" >/dev/null 2>&1 || true; sleep 1; }
  return 0
}

wait_port_free() {
  local port="$1" seconds="${2:-20}" _
  for _ in $(seq 1 "$seconds"); do [ -z "$(port_pid "$port")" ] && return 0; sleep 1; done
  return 1
}

wait_app_port() {
  local name="$1" port="$2" _
  for _ in $(seq 1 40); do is_port_held_by_app "$name" "$port" && return 0; sleep 1; done
  return 1
}

restart_app() {
  local name="$1" dir="$2" script="$3" port="$4"
  free_port "$name" "$port"
  if pm2 describe "$name" >/dev/null 2>&1; then
    pm2 stop "$name" >/dev/null
    wait_port_free "$port" 20 || free_port "$name" "$port"
    pm2 start "$name" --update-env >/dev/null
  else
    warn "pm2 chưa có $name → tạo mới: (cd $dir && pm2 start npm --name $name -- run $script)"
    (cd "$dir" && pm2 start npm --name "$name" -- run "$script" >/dev/null)
  fi
  if wait_app_port "$name" "$port"; then
    info "✔ $name (bản mới) mở cổng $port"
  else
    warn "$name chưa mở cổng $port — xem: pm2 logs $name --lines 50"
    return 1
  fi
}

stash_tracked_env_files() {
  local file
  STASHED_ENV_FILES=""
  for file in frontend-next/.env backend/.env; do
    if [ -f "$ROOT/$file" ] && git -C "$ROOT" ls-files --error-unmatch "$file" >/dev/null 2>&1; then
      warn "$file đang được git theo dõi — tạm cất bản trên máy để pull không gãy."
      cp "$ROOT/$file" "$ROOT/$file.deploy-backup"
      git -C "$ROOT" checkout -- "$file" 2>/dev/null || true
      STASHED_ENV_FILES="$STASHED_ENV_FILES $file"
    fi
  done
}

restore_tracked_env_files() {
  local file
  for file in $STASHED_ENV_FILES; do
    mv -f "$ROOT/$file.deploy-backup" "$ROOT/$file"
    info "✔ đã đặt lại $file (bản cấu hình thật trên máy)"
  done
}

reset_npm_rewritten_locks() {
  local file
  for file in backend/package-lock.json frontend-next/package-lock.json; do
    if ! git -C "$ROOT" diff --quiet -- "$file"; then
      warn "$file bị npm trên máy sửa — trả về bản trên GitHub."
      git -C "$ROOT" checkout -- "$file"
    fi
  done
}

move_aside_untracked_collisions() {
  local upstream="$1" file
  git -C "$ROOT" diff --name-only --diff-filter=A HEAD "$upstream" | while IFS= read -r file; do
    if [ -e "$ROOT/$file" ] && ! git -C "$ROOT" ls-files --error-unmatch "$file" >/dev/null 2>&1; then
      mkdir -p "$UPLOAD_BACKUP/$(dirname "$file")"
      mv "$ROOT/$file" "$UPLOAD_BACKUP/$file"
      warn "$file có sẵn trên máy nhưng trùng file mới trên GitHub — đã cất sang $UPLOAD_BACKUP/$file"
    fi
  done
}

pull_latest_code() {
  local before upstream
  git config --global --get-all safe.directory 2>/dev/null | grep -qx "$ROOT" \
    || git config --global --add safe.directory "$ROOT"
  stash_tracked_env_files
  reset_npm_rewritten_locks
  before="$(git -C "$ROOT" rev-parse --short HEAD)"
  git -C "$ROOT" fetch origin
  upstream="$(git -C "$ROOT" rev-parse --abbrev-ref --symbolic-full-name '@{u}')"
  move_aside_untracked_collisions "$upstream"
  git -C "$ROOT" merge --ff-only "$upstream"
  restore_tracked_env_files
  info "Code: $before → $(git -C "$ROOT" rev-parse --short HEAD)"
}

fingerprint_of() {
  local app_dir="$1"; shift
  { git -C "$ROOT" rev-parse "HEAD:$app_dir"; cat "$@" 2>/dev/null || true; } | sha256sum | cut -d' ' -f1
}

needs_build() {
  local stamp="$1" fingerprint="$2" output="$3"
  $FORCE_REBUILD && return 0
  [ -e "$output" ] || return 0
  [ "$(cat "$STATE_DIR/$stamp" 2>/dev/null || true)" != "$fingerprint" ]
}

save_stamp() { mkdir -p "$STATE_DIR"; printf '%s\n' "$2" > "$STATE_DIR/$1"; }

install_packages() {
  local dir="$1" lock_hash
  lock_hash="$(sha256sum "$dir/package-lock.json" | cut -d' ' -f1)"
  if ! $FORCE_REBUILD && [ -d "$dir/node_modules" ] \
    && [ "$(cat "$dir/node_modules/.deploy-lock-hash" 2>/dev/null || true)" = "$lock_hash" ]; then
    info "✔ package-lock.json không đổi — bỏ qua npm ci"
    return 0
  fi
  (cd "$dir" && npm ci --include=dev)
  printf '%s\n' "$lock_hash" > "$dir/node_modules/.deploy-lock-hash"
}

active_frontend_slot() { cat "$STATE_DIR/frontend.slot" 2>/dev/null || echo ".next"; }

spare_frontend_slot() { [ "$(active_frontend_slot)" = ".next-blue" ] && echo ".next-green" || echo ".next-blue"; }

build_frontend_into() {
  local slot="$1" active
  active="$(active_frontend_slot)"
  cd "$ROOT/frontend-next"
  rm -rf "$slot"
  if [ -d "$active/cache" ]; then
    mkdir -p "$slot"
    cp -a "$active/cache" "$slot/cache"
  fi
  NEXT_DIST_DIR="$slot" npm run build
  restore_next_generated_files
  chown -R "$APP_USER:$APP_USER" "$slot" 2>/dev/null || true
}

restore_next_generated_files() {
  git -C "$ROOT" checkout -- frontend-next/next-env.d.ts frontend-next/tsconfig.json 2>/dev/null || true
}

start_frontend_from() {
  export NEXT_DIST_DIR="$1"
  restart_app "$WEB_NAME" "$ROOT/frontend-next" "start" "$WEB_PORT"
}

first_asset_status() {
  local html asset _
  for _ in $(seq 1 15); do
    html="$(curl -fsS "$SITE_URL/" 2>/dev/null || true)"
    asset="$(printf '%s' "$html" | grep -oE '/_next/static/[^" ]+\.(css|js)' | sed -n '1p' || true)"
    if [ -n "$asset" ] && [ "$(curl -sS -o /dev/null -w '%{http_code}' "$SITE_URL$asset" || true)" = "200" ]; then
      info "site  ($WEB_PORT): HTTP 200 — asset 200 $asset"
      return 0
    fi
    sleep 2
  done
  warn "Trang chủ hoặc asset Next chưa trả 200 tại $SITE_URL (đã thử ~30s)."
  return 1
}

warm_and_check_sitemap_pages() {
  local pages page css code bad=0 total=0
  pages="$(curl -fsS "$SITE_URL/sitemap.xml" 2>/dev/null | grep -oE '<loc>[^<]+' | sed -E 's#<loc>https?://[^/]+##' | sort -u || true)"
  [ -n "$pages" ] || pages="/"
  for page in $pages; do curl -s -o /dev/null "$SITE_URL$page" || true; done
  sleep 5
  for page in $pages; do
    total=$((total + 1))
    css="$(curl -fsS "$SITE_URL$page" 2>/dev/null | grep -oE '/_next/static/css/[^" ]+\.css' | head -1 || true)"
    [ -n "$css" ] || continue
    code="$(curl -s -o /dev/null -w '%{http_code}' "$SITE_URL$css" || true)"
    if [ "$code" != "200" ]; then
      warn "Trang $page trỏ tới $css → HTTP $code"
      bad=$((bad + 1))
    fi
  done
  if [ "$bad" -eq 0 ]; then
    info "✔ $total trang trong sitemap đều tải đúng CSS"
  else
    warn "$bad/$total trang còn trỏ CSS cũ — thường tự hết ở lượt truy cập kế tiếp; còn thì chạy lại: bash deploy.sh"
  fi
}

switch_frontend_or_roll_back() {
  local new_slot="$1" old_slot="$2"
  if start_frontend_from "$new_slot" && first_asset_status; then
    save_stamp frontend.slot "$new_slot"
    if [ "$old_slot" = ".next" ]; then rm -rf "$ROOT/frontend-next/.next"; fi
    return 0
  fi
  if [ -f "$ROOT/frontend-next/$old_slot/BUILD_ID" ]; then
    warn "Bản frontend mới lỗi → quay về bản đang chạy trước đó ($old_slot)."
    start_frontend_from "$old_slot" || true
  fi
  die "Frontend mới không chạy được — xem: pm2 logs $WEB_NAME --lines 100"
}

main() {
  parse_args "$@"
  acquire_lock
  check_setup

  say "1/6  Kéo code mới từ GitHub"
  pull_latest_code

  local backend_print frontend_print backend_rebuilt=false frontend_rebuilt=false new_slot old_slot
  backend_print="$(fingerprint_of backend "$ROOT/backend/.env")"
  frontend_print="$(fingerprint_of frontend-next "$ROOT/frontend-next/.env.local" "$ROOT/frontend-next/.env")"
  old_slot="$(active_frontend_slot)"

  say "2/6  Backend: cài gói + build"
  if needs_build backend.build "$backend_print" "$ROOT/backend/dist/main.js"; then
    install_packages "$ROOT/backend"
    (cd "$ROOT/backend" && npm run build)
    chown -R "$APP_USER:$APP_USER" "$ROOT/backend/dist" 2>/dev/null || true
    backend_rebuilt=true
  else
    info "✔ backend/ và backend/.env không đổi — bỏ qua build"
  fi

  say "3/6  Backend: migration + seed"
  (cd "$ROOT/backend" && npm run db:run:prod && npm run db:seed:prod)

  say "4/6  Frontend: cài gói + build (site cũ vẫn chạy trong lúc build)"
  if needs_build frontend.build "$frontend_print" "$ROOT/frontend-next/$old_slot/BUILD_ID"; then
    install_packages "$ROOT/frontend-next"
    new_slot="$(spare_frontend_slot)"
    info "Build vào $new_slot (đang chạy: $old_slot)"
    build_frontend_into "$new_slot"
    frontend_rebuilt=true
  else
    info "✔ frontend-next/ và env frontend không đổi — bỏ qua build"
  fi

  say "5/6  Restart app có thay đổi"
  if $backend_rebuilt; then
    restart_app "$API_NAME" "$ROOT/backend" "start:prod" "$API_PORT" || die "Backend mới không mở cổng — xem: pm2 logs $API_NAME --lines 100"
    save_stamp backend.build "$backend_print"
  else
    info "– $API_NAME giữ nguyên"
  fi
  if $frontend_rebuilt; then
    switch_frontend_or_roll_back "$new_slot" "$old_slot"
    save_stamp frontend.build "$frontend_print"
  else
    info "– $WEB_NAME giữ nguyên ($old_slot)"
  fi
  pm2 save >/dev/null 2>&1 || true

  say "6/6  Kiểm tra"
  first_asset_status || die "Site không trả trang chủ / asset — xem: pm2 logs $WEB_NAME --lines 100"
  if $frontend_rebuilt; then warm_and_check_sitemap_pages; fi
  info "api   ($API_PORT): HTTP $(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$API_PORT/api" || echo 'không kết nối được')  (404 = OK, backend sống)"
  pm2 ls | grep -E "$API_NAME|$WEB_NAME" || true

  say "Xong sau $((SECONDS - DEPLOY_STARTED))s. Mở site nhớ Ctrl+F5. Cột ↺ ở trên còn tăng → aaPanel đang tranh cổng, vào panel STOP project cùng tên."
  STEP_STARTED=""
}

main "$@"
