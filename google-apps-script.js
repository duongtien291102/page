/**
 * MÃ GOOGLE APPS SCRIPT NHẬN ĐƠN HÀNG TỰ ĐỘNG VÀO GOOGLE SHEETS
 *
 * Cách cài đặt:
 * 1. Mở một file Google Sheets mới trên Google Drive của bạn.
 * 2. Vào menu: Tiện ích mở rộng (Extensions) -> Apps Script.
 * 3. Xóa toàn bộ code mặc định và dán toàn bộ đoạn code bên dưới vào, bấm Lưu (Ctrl + S).
 * 4. Bấm nút "Triển khai" (Deploy) góc trên bên phải -> "Tùy chọn triển khai mới" (New deployment).
 * 5. Chọn loại: "Ứng dụng web" (Web app).
 *    - Thực thi dưới dạng (Execute as): Tôi (Me)
 *    - Ai có quyền truy cập (Who has access): Bất kỳ ai (Anyone)  <-- RẤT QUAN TRỌNG!
 * 6. Bấm "Triển khai" (Deploy), cấp quyền truy cập, sau đó copy đường link "URL ứng dụng web" (Web app URL).
 * 7. Mở file `config.js`, bật `googleSheets.enabled = true` và dán URL vào `googleSheets.webAppUrl`.
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Tạo dòng tiêu đề tự động nếu Sheet đang trống
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Mã Đơn Hàng",
        "Thời Gian",
        "Họ Và Tên",
        "Số Điện Thoại",
        "Gói / Số Lượng",
        "Màu Sắc",
        "Kích Cỡ (Size)",
        "Địa Chỉ Đầy Đủ",
        "Địa Chỉ Chi Tiết",
        "Phường / Xã",
        "Quận / Huyện",
        "Tỉnh / Thành Phố",
        "Lời Nhắn",
        "Form ID",
        "Link Trang Đặt"
      ]);
      sheet.getRange(1, 1, 1, 15).setFontWeight("bold").setBackground("#d9ead3");
    }

    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.order_id || "",
      data.timestamp || "",
      data.name || "",
      "'" + (data.phone || ""), // Thêm dấu nháy đơn để giữ số 0 ở đầu SĐT
      data.combo || "",
      data.color || "",
      data.size || "",
      data.full_address || "",
      data.address || "",
      data.ward || "",
      data.district || "",
      data.province || "",
      data.message || "",
      data.form_id || "",
      data.page_url || ""
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ status: "success", order_id: data.order_id })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
