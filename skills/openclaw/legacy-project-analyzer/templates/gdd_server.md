Server GDD Placeholder

• Mục lục:
 • Tổng quan Server Core
 • Thành phần: Socket Handler, Game Logic, Persistence, API Endpoints
 • Giao tiếp Client-Server: contract và luồng tin nhắn
• Mô tả ngắn:
 • Vai trò: xử lý game logic phía server, xác thực hành động, quản lý trạng thái trò chơi, và gửi cập nhật về client.
 • Kiến trúc: server-authoritative với luồng sự kiện qua EventBus/AQ.
• Giao tiếp Client-Server (gợi ý):
 • Client -> Server: { type: "command", action, payload, sessionId }
 • Server -> Client: { type: "update", state, status, timestamp }
• Gợi ý kiểm thử (cuộc xem nhanh):
 • Xác thực hành động, cập nhật trạng thái và thông báo đúng định dạng.