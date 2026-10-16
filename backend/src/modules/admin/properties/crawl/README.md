# Thu thập listing Zillow

Mở **Admin → Bất động sản → Thu thập nhà** (`/admin/property-crawl`).

1. Dán URL trang tìm kiếm Zillow, mỗi dòng một URL. Nút **Điền URL 58 county California** tạo các điểm bắt đầu theo county.
2. Chọn **Trang bắt đầu trên Zillow** (mặc định 1) và số trang / listing tối đa. Ví dụ bắt đầu 6, lấy 5 trang sẽ xử lý trang 6–10 nếu nguồn còn trang và chưa chạm giới hạn listing. Preset county dùng trang bắt đầu 1, tối đa 300 trang / 10.000 listing.
3. Bắt đầu và xem tiến độ. Worker xử lý từng trang, chờ 3 giây giữa các lượt xử lý; có thể đóng trang quản trị.
4. Mở liên kết nguồn, kiểm tra dữ liệu và chọn listing. Mỗi trang xem trước có tối đa 50 tin; checkbox đầu bảng hoặc nút **Chọn tất cả trên trang này** chỉ chọn nhà chưa nhập trong các dòng đang hiển thị. Chuyển trang hoặc đổi lượt sẽ bỏ lựa chọn. Nút **Bỏ chọn** xóa lựa chọn của trang hiện tại.
5. Mặc định nhà mới được lưu ẩn. Bật **Hiển thị ngay các nhà mới sau khi nhập** nếu muốn xuất bản. Nhà cũ giữ trạng thái hiện/ẩn.

Nhà có nhãn **Đã nhập** được loại khỏi chọn tất cả. Nếu trang hiện tại đã nhập hết nhưng trang khác còn nhà, giao diện hướng dẫn chuyển trang.
Số nhà đã chọn luôn chỉ tính các dòng chưa nhập trên trang hiện tại, tối đa 50, kể cả khi lượt có hàng nghìn listing.
Nhập thành công bỏ chọn; nhập lỗi giữ các lựa chọn của trang đó để thử lại. Không tự gọi nhập trong kiểm thử giao diện thật.

## Lấy tiếp các trang sau

Trong **Các lượt gần đây**, chọn lượt đã dừng. Khối **Mốc tiếp tục crawl** hiển thị trang nguồn đã xử lý gần nhất,
trang nguồn kế tiếp và liên kết URL đã lưu. Điền **Số trang lấy thêm** và **Số listing lấy thêm tối đa**, rồi bấm **Crawl tiếp**.

Ví dụ lượt đầu lấy đủ trang 1–5, đặt lấy thêm 5 trang thì hệ thống dùng mốc trang 6 và xử lý tiếp 6–10.
Không cần dán lại URL, không tạo lượt mới, không xóa tin đã có. Mốc và hàng đợi được lưu MySQL nên vẫn dùng được sau restart.
Giới hạn lấy thêm cộng từ số trang đã xử lý / số listing hiện có, không cộng vào hạn mức cũ chưa dùng hết.

Nếu chạm giới hạn listing giữa trang 5, mốc vẫn là trang 5: lần tiếp theo đọc lại trang này, bỏ qua các mã đã lưu và lấy phần còn thiếu.
Trang chỉ được tính là đã xử lý khi không còn listing hợp lệ bị bỏ lại vì giới hạn. Lượt lỗi / đã dừng cũng có thể tiếp tục khi còn URL chờ.
Nếu nguồn chặn, cần xử lý nguyên nhân trước khi thử lại; nút tiếp tục không vượt được giới hạn của Zillow.
Khi không còn URL chờ thì không có nút tiếp tục. Với nhiều county, số trang gắn với URL của từng county, không phải số trang toàn bang.
Phân trang **Trang xem trước** ở cuối bảng chỉ chuyển danh sách tin đã thu thập, không điều khiển crawler.

## Cài đặt

```bash
cd backend
npm run db:run
npm run build
```

Restart API sau build. Frontend cần build/restart như bình thường. Không cần API key hoặc dịch vụ crawl trả phí.
Quyền xem: `PROPERTY_LIST`; tạo/dừng: `PROPERTY_CREATE`; nhập: cả `PROPERTY_CREATE` và `PROPERTY_UPDATE`.
Không cần seed quyền mới.

## Phạm vi và dữ liệu

- Parser đã được thử với HTML trực tiếp từ trang Zillow California. Chỉ nhận house, condo và townhouse có giá đăng bán,
  địa chỉ CA, mã Zillow và trạng thái `FOR_SALE` / `COMING_SOON`; bỏ qua đất, nhà cho thuê, đã bán, giá ước tính và dữ liệu không đủ điều kiện.
- Lưu địa chỉ, giá, phòng ngủ/tắm (có số lẻ), diện tích nếu có, tọa độ thật nếu hợp lệ, ảnh nguồn (tối đa 40), brokerage,
  URL và thời điểm thu thập. Không lấy Zestimate làm giá bán, không tự sinh tọa độ cho tin crawl.
- Đây là dữ liệu từ trang kết quả tìm kiếm: mô tả, tiện ích, lịch sử giá, mã MLS, ngày đăng và các thông số chi tiết khác có thể thiếu.
  Không tải thêm trang chi tiết trong phiên bản này. Admin bổ sung nội dung trước khi xuất bản.
- Khóa chống trùng là `(source, source_key)`; nhà nhập tay không tự ghép theo địa chỉ.
  Nhập lại cùng bản xem trước không tạo thêm nhà; bản xem trước mới có thể cập nhật nhà đã nhập từ nguồn.
- Cập nhật các trường nguồn có dữ liệu; giữ slug, mô tả, SEO, nổi bật và trạng thái hiện/ẩn.
  Không khôi phục nhà đã bị admin xóa mềm, không áp bản xem trước cũ hơn dữ liệu đã nhập.
- Ảnh giữ URL Zillow, không tải vào thư viện. Nguồn có thể đổi/chặn URL ảnh.
- Trạng thái hoàn tất nghĩa là đã xử lý hết URL được nguồn cung cấp trong lượt, không có nghĩa đã lấy toàn bộ California.
  Nguồn có thể giới hạn số trang/kết quả. Chia nhỏ URL theo địa lý / khoảng giá để mở rộng độ phủ; vẫn cần kiểm chứng độc lập.
- Không tự đánh dấu nhà đã bán/xóa khi nó biến mất khỏi kết quả. Tiếp tục chỉ lấy phần chưa thu thập; muốn làm mới tin đã có phải tạo lượt crawl mới và nhập bản xem trước mới.
- Redfin và Luxury Portfolio chưa có adapter: truy cập trực tiếp từ môi trường phát triển nhận trang chặn HTTP 405 / 403.
  Không triển khai vượt CAPTCHA hoặc dùng endpoint nội bộ của nguồn.
- Crawl không tự cấp quyền đăng lại nội dung/ảnh; điều kiện tái sử dụng vẫn theo thỏa thuận với nguồn.

## Vận hành

Hàng đợi, bản xem trước và lịch retry lưu MySQL. Sau restart, worker tiếp tục các lượt `queued` / `running`,
chỉ chạy khi đã tới `nextAttemptAt`. Mỗi tick xử lý một trang và chờ 3 giây trước tick tiếp theo.
Các lượt được chọn theo thời điểm xử lý gần nhất để lượt dài không giữ hàng đợi mãi; các county trong mỗi lượt cũng luân phiên.
Mỗi lần bắt đầu hoặc tiếp tục giới hạn tối đa 1.000 trang / 20.000 listing mới, tối đa 60 URL đầu vào và tối đa 5 lượt chờ/chạy.

Khóa MySQL theo database ngăn hai worker lấy trang cùng lúc; khóa riêng bảo vệ tạo/tiếp tục lượt và nhập listing.
Request HTTP không giữ transaction mở. Các listing mới được ghi theo lô, cùng transaction với tiến độ và hàng đợi;
lỗi ghi mốc sẽ rollback cả trang, có thể thử lại từ URL cũ mà không bỏ sót / nhân đôi dữ liệu.
Import cũng nguyên tử và được khóa giữa các lượt. Lỗi làm mới cache sau khi import không biến thao tác đã commit thành lỗi nhập;
log ghi `crawl.import.cache_refresh_failed`, cache public vẫn hết hạn theo TTL bình thường.

| Tình huống | Xử lý |
|---|---|
| Timeout, lỗi kết nối tạm thời, HTTP 408/425/500/502/503/504, deadlock | Tối đa 3 lần retry thêm cho cùng trang, chờ 5 / 15 / 45 giây, hoặc lâu hơn nếu có Retry-After |
| Hết retry | `failed` nếu chưa có dữ liệu, `partial` nếu đã có; giữ URL để admin tiếp tục |
| HTTP 401/403/405/429 hoặc nhận diện trang xác minh kể cả HTTP 200 | `blocked`, giữ URL, không tự retry; tạm nghỉ nguồn tối thiểu 60 giây hoặc theo Retry-After trước khi cho tiếp tục |
| Một lượt đang bị nguồn chặn và còn thời gian nghỉ | Các lượt khác trong cùng database cũng tạm ngừng gọi Zillow; hủy lượt không bỏ thời gian nghỉ đã lưu |
| JSON/cấu trúc HTML đổi hoặc lỗi không được phân loại tạm thời | Dừng với mã lỗi; cần kiểm tra parser/nguồn |
| Admin hủy hoặc app shutdown | Hủy HTTP đang chờ trong process hiện tại; không commit dữ liệu sau hủy, giữ mốc phục hồi sau shutdown |

`Retry-After` hỗ trợ số giây và ngày HTTP, giới hạn thời gian chờ tối đa 24 giờ. Một trang thành công reset `retryCount`,
giữ `failureCount` của cả lượt. `coverageLimited` ghi nhận nguồn giới hạn kết quả, dù trạng thái xử lý URL là `completed`.
`duplicateCount` đếm mã đã có trong lượt khi hoàn tất xử lý trang; đọc lại trang dở có thể được tính là trùng.
`skipped` đếm mục không đạt tiêu chí trên trang hoàn tất, không phải số listing bị mất trên toàn thị trường.

Admin hiển thị tổng lỗi, lần retry trang hiện tại, số trùng, thời gian xử lý trang gần nhất và thời điểm xử lý gần nhất.
Các trường thống kê mới của lượt cũ bắt đầu từ 0; không suy ngược lịch sử từ listing đã lưu.
Log có các sự kiện `crawl.page.saved`, `crawl.page.failed`, `crawl.worker.error`, `crawl.shutdown.error` để theo dõi trên server.

## Kiểm tra

```bash
npm test -- --runInBand
npm run check:crawl
npx tsc --noEmit -p tsconfig.json
npm run build
```

`check:crawl` chỉ chạy khi `.env` trỏ MySQL local, cần quyền tạo database. Nó tự tạo và xóa database ngẫu nhiên
`crawl_check_<12 ký tự hex>`, kiểm tra migration, nhập/cập nhật/chống trùng, retry qua restart, giới hạn retry, cooldown,
công bằng giữa các lượt, hai worker, hủy/shutdown giữa request, rollback khi ghi mốc thất bại và lỗi cache sau import.
Không thay đổi database ứng dụng và không gửi request đến Zillow.

Kiểm tra giao diện khi API/frontend local đang chạy và đã có ít nhất một listing xem trước:

```bash
cd frontend-next
node scripts/check-property-crawl-ui.mjs
```

Script dùng Chrome/Edge headless, đăng nhập tài khoản seed (có thể đổi bằng `CRAWL_CHECK_EMAIL` / `CRAWL_CHECK_PASSWORD`),
kiểm tra preset county, chọn tin và bố cục 1440/390px. Không bấm nhập hoặc tạo lượt crawl.
Đặt `CRAWL_CHECK_SELECTION=1` để dùng API mô phỏng kiểm tra chọn riêng 45/50/25 nhà trên từng trang,
chuyển trang bỏ chọn, chỉ nhập các dòng đang hiển thị và phục hồi sau lỗi; không ghi vào dữ liệu thật.
