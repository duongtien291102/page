/**
 * BỘ XỬ LÝ ĐẶT HÀNG & TRACKING ĐỘC LẬP (ORDER HANDLER)
 * Thay thế hoàn toàn máy chủ nhận đơn mặc định của LadiPage bằng cấu hình trong config.js
 */
(function () {
  var cfg = window.SITE_CONFIG || {};

  // --- 1. Khởi tạo Facebook Pixel & TikTok Pixel riêng (nếu có cấu hình) ---
  function initPixels() {
    var pixels = cfg.pixels || {};
    var isThankYouPage = window.location.pathname.indexOf("thankyou") !== -1;

    if (pixels.facebookPixelId && pixels.facebookPixelId.trim() !== "") {
      var fbId = pixels.facebookPixelId.trim();
      !(function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = "2.0";
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

      window.fbq("init", fbId);
      window.fbq("track", "PageView");
      if (isThankYouPage) {
        window.fbq("track", "Purchase", { value: 199000, currency: "VND" });
        window.fbq("track", "CompleteRegistration");
      } else {
        window.fbq("track", "ViewContent");
      }
    }

    if (pixels.tiktokPixelId && pixels.tiktokPixelId.trim() !== "") {
      var ttId = pixels.tiktokPixelId.trim();
      !(function (w, d, t) {
        w.TiktokAnalyticsObject = t;
        var ttq = (w[t] = w[t] || []);
        ttq.methods = [
          "page", "track", "identify", "instances", "debug", "on", "off",
          "once", "ready", "alias", "group", "enableCookie", "disableCookie"
        ];
        ttq.setAndDefer = function (t, e) {
          t[e] = function () {
            t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
          };
        };
        for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
        ttq.load = function (e, n) {
          var i = "https://analytics.tiktok.com/i18n/pixel/events.js";
          ttq._i = ttq._i || {};
          ttq._i[e] = [];
          ttq._i[e]._u = i;
          ttq._t = ttq._t || {};
          ttq._t[e] = +new Date();
          ttq._o = ttq._o || {};
          ttq._o[e] = n || {};
          var s = document.createElement("script");
          s.type = "text/javascript";
          s.async = !0;
          s.src = i + "?sdkid=" + e + "&lib=" + t;
          var a = document.getElementsByTagName("script")[0];
          a.parentNode.insertBefore(s, a);
        };
        ttq.load(ttId);
        ttq.page();
        if (isThankYouPage) {
          ttq.track("CompletePayment", { value: 199000, currency: "VND" });
        }
      })(window, document, "ttq");
    }
  }

  // --- 2. Hàm làm sạch chuỗi địa giới hành chính của LadiPage (VD: "01:Thành phố Hà Nội" -> "Thành phố Hà Nội") ---
  function cleanLocationValue(val) {
    if (!val || typeof val !== "string") return "";
    var parts = val.split(":");
    return parts.length > 1 ? parts.slice(1).join(":").trim() : val.trim();
  }

  // --- 3. Chuẩn hóa dữ liệu đơn hàng từ payload của LadiPage ---
  function normalizeOrderData(rawPayload) {
    var fields = {};
    if (rawPayload && Array.isArray(rawPayload.form_data)) {
      rawPayload.form_data.forEach(function (item) {
        if (!item || !item.name) return;
        var val = item.value;
        if (Array.isArray(val)) {
          val = val.join(", ");
        }
        fields[item.name] = val != null ? String(val).trim() : "";
      });
    }

    var state = cleanLocationValue(fields.state);
    var district = cleanLocationValue(fields.district);
    var ward = cleanLocationValue(fields.ward);
    var streetAddress = fields.address || "";

    var addressParts = [streetAddress, ward, district, state].filter(function (p) {
      return p && p.length > 0;
    });

    var now = new Date();
    var timestamp = now.toLocaleString("vi-VN", { hour12: false });

    return {
      order_id: "DH" + now.getTime().toString().slice(-8),
      timestamp: timestamp,
      iso_date: now.toISOString(),
      form_id: (rawPayload && rawPayload.ladi_form_id) || "",
      name: fields.name || "",
      phone: fields.phone || "",
      address: streetAddress,
      ward: ward,
      district: district,
      province: state,
      full_address: addressParts.join(", "),
      combo: fields.form_item555 || "",
      color: fields.form_item573 || "",
      size: fields.form_item574 || "",
      message: fields.message || "",
      page_url: window.location.href,
      raw_fields: fields
    };
  }

  // --- 4. Gửi dữ liệu đơn hàng tới các kênh đã cấu hình ---
  function dispatchOrder(order) {
    var promises = [];

    // Lưu bản sao vào localStorage & sessionStorage để kiểm tra và hiển thị ở trang cảm ơn
    try {
      sessionStorage.setItem("last_order", JSON.stringify(order));
      var savedOrders = JSON.parse(localStorage.getItem("cloned_orders") || "[]");
      savedOrders.unshift(order);
      localStorage.setItem("cloned_orders", JSON.stringify(savedOrders.slice(0, 200)));
      console.log("[OrderHandler] Đã ghi nhận đơn hàng:", order);
    } catch (e) {
      console.warn("[OrderHandler] Không thể lưu localStorage:", e);
    }

    // 4a. Gửi về Google Sheets (Google Apps Script Web App)
    if (cfg.googleSheets && cfg.googleSheets.enabled && cfg.googleSheets.webAppUrl) {
      var gsPromise = fetch(cfg.googleSheets.webAppUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(order)
      }).catch(function (err) {
        console.error("[OrderHandler] Lỗi gửi Google Sheets:", err);
      });
      promises.push(gsPromise);
    }

    // 4b. Gửi thông báo qua Telegram Bot
    if (cfg.telegram && cfg.telegram.enabled && cfg.telegram.botToken && cfg.telegram.chatId) {
      var tgText = [
        "🛒 <b>ĐƠN HÀNG MỚI (" + order.order_id + ")</b>",
        "━━━━━━━━━━━━━━━━━━",
        "👤 <b>Khách hàng:</b> " + (order.name || "Không ghi"),
        "📞 <b>SĐT:</b> <code>" + (order.phone || "") + "</code>",
        "📍 <b>Địa chỉ:</b> " + (order.full_address || "Không ghi"),
        "📦 <b>Gói chọn:</b> " + (order.combo || "Chưa chọn"),
        "🎨 <b>Màu sắc:</b> " + (order.color || "Chưa chọn"),
        "📏 <b>Kích cỡ:</b> " + (order.size || "Chưa chọn"),
        "📝 <b>Lời nhắn:</b> " + (order.message || "Không có"),
        "⏰ <b>Thời gian:</b> " + order.timestamp
      ].join("\n");

      var tgUrl = "https://api.telegram.org/bot" + cfg.telegram.botToken.trim() + "/sendMessage";
      var tgPromise = fetch(tgUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: cfg.telegram.chatId.trim(),
          text: tgText,
          parse_mode: "HTML"
        })
      }).catch(function (err) {
        console.error("[OrderHandler] Lỗi gửi Telegram:", err);
      });
      promises.push(tgPromise);
    }

    // 4c. Gửi về Webhook tùy chỉnh (Make, n8n, Zapier, CRM...)
    if (cfg.webhook && cfg.webhook.enabled && cfg.webhook.url) {
      var whHeaders = Object.assign({ "Content-Type": "application/json" }, cfg.webhook.headers || {});
      var whPromise = fetch(cfg.webhook.url, {
        method: "POST",
        headers: whHeaders,
        body: JSON.stringify(order)
      }).catch(function (err) {
        console.error("[OrderHandler] Lỗi gửi Webhook:", err);
      });
      promises.push(whPromise);
    }

    return Promise.all(promises);
  }

  // --- 5. Can thiệp vào LadiPageScript để chặn gửi đơn về server chủ cũ và điều hướng về hệ thống riêng ---
  function hookLadiPageForm() {
    if (
      typeof window.LadiPageScript === "undefined" ||
      !window.LadiPageScript ||
      !window.LadiPageScript.runtime ||
      !window.LadiPageScript.const
    ) {
      setTimeout(hookLadiPageForm, 50);
      return;
    }

    var lps = window.LadiPageScript;

    // Xóa danh sách máy chủ dự phòng của LadiPage để mọi request gửi form đều đi qua send_request_response
    lps.const.API_FORM_DATA_LIST = [];
    if (lps.runtime.tmp && lps.runtime.tmp.send_request_configs) {
      delete lps.runtime.tmp.send_request_configs[lps.const.API_FORM_DATA];
    }

    lps.runtime.send_request_response = lps.runtime.send_request_response || {};

    var handleIntercept = function (url, bodyStr, callback) {
      var payload = {};
      try {
        payload = typeof bodyStr === "string" ? JSON.parse(bodyStr) : bodyStr || {};
      } catch (e) {}

      // status_send == 1 là auto-capture khi khách đang gõ dở -> bỏ qua, trả về 200 giả lập ngay
      if (payload.status_send === 1) {
        if (typeof callback === "function") {
          callback(JSON.stringify({ code: 200 }), 200, { readyState: 4, status: 200 }, url);
        }
        return true;
      }

      // status_send == 2 là khi khách bấm nút "ĐẶT HÀNG NGAY"
      var order = normalizeOrderData(payload);
      dispatchOrder(order).finally(function () {
        if (typeof callback === "function") {
          callback(JSON.stringify({ code: 200 }), 200, { readyState: 4, status: 200 }, url);
        }
        // Đảm bảo chuyển hướng sang trang cảm ơn nếu LadiPage chưa tự chuyển hướng sau 800ms
        var targetTy = (cfg.thankYouPageUrl || "thankyou.html").trim();
        if (targetTy) {
          setTimeout(function () {
            if (window.location.href.indexOf(targetTy) === -1) {
              window.location.href = targetTy;
            }
          }, 800);
        }
      });

      // Trả về true để ngăn LadiPage gửi XMLHttpRequest thật tới api1.ldpform.com
      return true;
    };

    lps.runtime.send_request_response[lps.const.API_FORM_DATA] = handleIntercept;
    lps.runtime.send_request_response["https://api1.ldpform.com/sendform"] = handleIntercept;
    lps.runtime.send_request_response["https://api2.ldpform.com/sendform"] = handleIntercept;
    lps.runtime.send_request_response["https://api1.ldpform.net/sendform"] = handleIntercept;
    lps.runtime.send_request_response["https://api2.ldpform.net/sendform"] = handleIntercept;
  }

  // --- 6. Cập nhật link Fanpage tùy chỉnh nếu được cấu hình ---
  function updateCustomLinks() {
    if (cfg.links && cfg.links.fanpageUrl && cfg.links.fanpageUrl.trim() !== "") {
      var newUrl = cfg.links.fanpageUrl.trim();
      var links = document.querySelectorAll('a[href*="facebook.com/kalamita"]');
      links.forEach(function (a) {
        a.href = newUrl;
      });
    }
  }

  initPixels();
  hookLadiPageForm();
  document.addEventListener("DOMContentLoaded", updateCustomLinks);
})();
