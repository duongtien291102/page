# Hướng Dẫn Sử Dụng & Cấu Hình Trang Landing Page Đã Clone

Trang Landing Page `https://www.kalamita.vn/nbt1depk251fb` cùng trang Cảm ơn đã được clone nguyên bản 100% về thư mục `e:\thao` và hoạt động hoàn toàn độc lập.

## 1. Cấu trúc thư mục
- [`index.html`](file:///e:/thao/index.html): Trang Landing Page chính (đã trỏ toàn bộ hình ảnh, video, icon, script về thư mục `assets/` và gỡ bỏ mã theo dõi/nhận đơn của chủ cũ).
- [`thankyou.html`](file:///e:/thao/thankyou.html): Trang Cảm Ơn sau khi khách đặt hàng thành công.
- [`config.js`](file:///e:/thao/config.js): File cấu hình trung tâm để bạn điền link **Google Sheets**, **Telegram Bot**, **Webhook** và **Facebook/TikTok Pixel** của riêng mình.
- [`order-handler.js`](file:///e:/thao/order-handler.js): Bộ xử lý chặn dữ liệu gửi về LadiPage gốc và chuyển hướng đơn hàng từ cả 2 form (`#FORM464` ở giữa trang và `#FORM556` ở trong Popup đặt hàng) về hệ thống của bạn.
- [`google-apps-script.js`](file:///e:/thao/google-apps-script.js): Mã nguồn mẫu gắn vào Google Sheets để tự động ghi đơn hàng mới vào bảng tính.
- `assets/`: Chứa toàn bộ 146 file tài nguyên local (video MP4, hình ảnh sản phẩm, thư viện địa giới hành chính Việt Nam `location.vn.min.js`, engine giao diện LadiPage đã được vô hiệu hóa kiểm tra bản quyền/tên miền).

---

## 2. Cách cấu hình nhận đơn hàng (Mở file `config.js`)

### Cách 1: Nhận đơn hàng qua Google Sheets
1. Mở một bảng tính Google Sheets mới -> chọn **Tiện ích mở rộng (Extensions)** -> **Apps Script**.
2. Copy toàn bộ nội dung trong file [`google-apps-script.js`](file:///e:/thao/google-apps-script.js) dán vào Apps Script và bấm **Lưu**.
3. Bấm **Triển khai (Deploy)** -> **Tùy chọn triển khai mới (New deployment)** -> chọn loại **Ứng dụng web (Web app)**.
4. Phần *Ai có quyền truy cập (Who has access)*: chọn **Bất kỳ ai (Anyone)** -> bấm **Triển khai** và copy **Web app URL**.
5. Mở [`config.js`](file:///e:/thao/config.js) và sửa:
   ```js
   googleSheets: {
     enabled: true,
     webAppUrl: "https://script.google.com/macros/s/AKfycb.../exec"
   }
   ```

### Cách 2: Nhận thông báo đơn hàng tức thì qua Telegram
1. Nhắn tin cho `@BotFather` trên Telegram, gõ `/newbot` để tạo Bot và lấy `botToken`.
2. Thêm Bot vào nhóm nhận đơn (hoặc nhắn tin trực tiếp với Bot) và lấy `chatId`.
3. Mở [`config.js`](file:///e:/thao/config.js) và sửa:
   ```js
   telegram: {
     enabled: true,
     botToken: "123456789:AAH...",
     chatId: "-100123456789"
   }
   ```

### Cách 3: Gửi đơn qua Webhook (Make.com, n8n, Zapier, Pancake, CRM...)
Mở [`config.js`](file:///e:/thao/config.js) và bật:
```js
webhook: {
  enabled: true,
  url: "https://hook.eu1.make.com/...",
  headers: {
    "Content-Type": "application/json"
  }
}
```

### Cài đặt Facebook Pixel & TikTok Pixel
Chỉ cần điền ID Pixel của bạn vào [`config.js`](file:///e:/thao/config.js), hệ thống sẽ tự động kích hoạt sự kiện `PageView`, `ViewContent` ở trang chính và `Purchase` / `CompleteRegistration` ở trang `thankyou.html`:
```js
pixels: {
  facebookPixelId: "ID_PIXEL_FACEBOOK_CUA_BAN",
  tiktokPixelId: "ID_PIXEL_TIKTOK_CUA_BAN"
}
```

---

## 3. Cách chạy thử nghiệm trên máy (Local)
Để các tính năng tải danh sách Tỉnh/Thành - Quận/Huyện - Phường/Xã hoạt động chuẩn nhất như trên hosting thật, bạn có thể chạy một web server nội bộ tại thư mục `e:\thao`:
```powershell
python -m http.server 8080
```
Sau đó mở trình duyệt truy cập: `http://localhost:8080`
*(Mọi đơn hàng đặt thử nghiệm cũng được lưu sẵn trong `localStorage` tại key `cloned_orders` trong DevTools -> Application -> Local Storage).*
