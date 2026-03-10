Client GDD Placeholder

• Mục lục:
 • Tổng quan Client Core/UI
 • Thành phần: UI Layer, EventBus, ActionQueue, Core Modules
 • Giao tiếp với Server: giao thức và contract
• Mô tả ngắn:
 • Mô tả vai trò của Client trong CCN2 (UI tương tác, xử lý sự kiện, gửi lệnh tới Server).
 • Liên kết với EventBus và ActionQueue để xử lý flow gameplay.
• Giao tiếp với Server (gợi ý):
 • Gửi lệnh/nhật ký sự kiện tới Server qua API/Socket.
 • Nhận phản hồi và cập nhật UI tương ứng.
• Gợi ý kiểm thử (cuộc xem nhanh):
 • Kiểm tra luồng từ UI -> Server -> Output UI.
 • Kiểm tra consistency giữa EventBus và AQ.