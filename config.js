/**
 * CẤU HÌNH ĐẶT HÀNG & THEO DÕI (TRACKING PIXEL)
 * Bạn chỉ cần chỉnh sửa các thông số bên dưới để nhận đơn hàng về hệ thống riêng của mình.
 */
window.SITE_CONFIG = {
  // 1. Cấu hình chuyển hướng sau khi đặt hàng thành công
  thankYouPageUrl: "thankyou.html", // Đường dẫn trang cảm ơn (mặc định: "thankyou.html" đã được clone sẵn)

  // 2. Cấu hình gửi đơn hàng về Google Sheets (thông qua Google Apps Script Web App)
  googleSheets: {
    enabled: false, // Đổi thành true sau khi dán link Web App URL
    webAppUrl: ""   // Ví dụ: "https://script.google.com/macros/s/AKfycbx.../exec"
  },

  // 3. Cấu hình gửi thông báo đơn hàng tức thì qua Telegram Bot
  telegram: {
    enabled: false, // Đổi thành true sau khi điền botToken và chatId
    botToken: "",   // Ví dụ: "1234567890:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw"
    chatId: ""      // Ví dụ: "-1001234567890" (ID nhóm) hoặc ID cá nhân
  },

  // 4. Cấu hình gửi dữ liệu về Webhook tùy chỉnh (Make.com, n8n, Zapier, Pancake, CRM riêng...)
  webhook: {
    enabled: false, // Đổi thành true nếu muốn gửi JSON POST tới Webhook riêng
    url: "",        // Ví dụ: "https://hook.eu1.make.com/xxxxxxxxx"
    headers: {
      "Content-Type": "application/json"
    }
  },

  // 5. Cấu hình mã theo dõi quảng cáo (Pixels) của riêng bạn (để trống nếu không dùng)
  pixels: {
    facebookPixelId: "", // Ví dụ: "123456789012345"
    tiktokPixelId: ""    // Ví dụ: "CXXXXXXXXXXXXXXXXXXX"
  },

  // 6. Link Fanpage / Liên hệ thay thế trên trang (để trống nếu giữ nguyên)
  links: {
    fanpageUrl: "" // Ví dụ: "https://www.facebook.com/ten-fanpage-cua-ban"
  }
};
