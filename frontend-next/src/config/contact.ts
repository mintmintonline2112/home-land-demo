/**
 * Thông tin liên hệ + hồ sơ môi giới mặc định của Sean Truong Real Estate (văn phòng, email, điện thoại, giờ làm việc, website, ảnh đại diện vuông + ảnh chân dung).
 * Dùng bởi: settings/site-settings.ts (resolveContact), layout/Footer.tsx, trang chi tiết nhà (properties/[slug]), ContactPageScreen.tsx, SettingsScreen.tsx.
 * Lưu ý: chỉ dùng khi Admin → Trang Liên hệ → Thông tin công ty để trống ô tương ứng. photo / portrait là ảnh trong Thư viện (backend/uploads),
 * resolveContact đổi thành link tuyệt đối.
 */
export const SITE_CONTACT = {
  name: "Sean Truong",
  title: "Realtor® · First Team Real Estate",
  office: "First Team Real Estate",
  brokerageLicense: "CA DRE# 01008773",
  location: "Irvine, CA 92604",
  address: "4040 Barranca Pkwy #100",
  email: "SeanTruong@FirstTeam.com",
  phone: "(949) 668-3326",
  phoneHref: "tel:+19496683326",
  hours: "Monday — Saturday: 8:00 AM — 7:00 PM · Sunday: By appointment",
  website: "https://seantruongre.com",
  photo: "uploads/team/sean-truong-avatar.jpg",
  portrait: "uploads/team/sean-truong.jpg",
  about:
    "Sean Truong is a Realtor® with First Team Real Estate, helping families buy and sell homes across Orange County and the San Francisco Bay Area — in English and Vietnamese.",
} as const;
