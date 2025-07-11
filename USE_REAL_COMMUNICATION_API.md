# Hướng dẫn sử dụng API Communication thật

## Cấu hình API

Hệ thống đã được cấu hình mặc định để sử dụng API thật thay vì dữ liệu giả lập (mock data). Dưới đây là hướng dẫn để đảm bảo hệ thống sử dụng API thật một cách đúng đắn.

## Endpoint API

Dựa vào mã backend, API Communication có các endpoint sau:

- **GET /api/communication**: Lấy tất cả chương trình
- **GET /api/communication/{programId}**: Lấy chi tiết một chương trình
- **POST /api/communication**: Tạo chương trình mới
- **PUT /api/communication/{programId}**: Cập nhật chương trình
- **DELETE /api/communication/{programId}**: Xóa chương trình
- **POST /api/communication/feedback**: Tạo phản hồi
- **GET /api/communication/feedback/{feedbackId}**: Lấy chi tiết phản hồi
- **GET /api/communication/feedbacks**: Lấy tất cả phản hồi
- **PUT /api/communication/feedback/{feedbackId}**: Cập nhật phản hồi
- **DELETE /api/communication/feedback/{feedbackId}**: Xóa phản hồi
- **POST /api/communication/{programId}/join**: Tham gia chương trình
- **GET /api/communication/{programId}/summary**: Lấy thông tin tổng quan của chương trình
- **GET /api/communication/user/{userId}/joined-programs**: Lấy danh sách chương trình người dùng đã tham gia
- **GET /api/communication/{programId}/participation-status**: Kiểm tra trạng thái tham gia của người dùng

## Điều kiện để API thật hoạt động

1. **Backend đang chạy**: Đảm bảo server backend đang chạy tại `http://localhost:8080`
2. **Tắt mock data**: 
   - Tính năng mock data mặc định đã tắt
   - Bạn có thể kiểm tra bằng cách nhấp vào nút "A" ở góc dưới bên phải màn hình
   - Đảm bảo "Sử dụng dữ liệu giả lập" KHÔNG được chọn

3. **Đăng nhập với quyền thích hợp**: 
   - Để xem chương trình: cần quyền `VIEW_PROGRAMS`
   - Để quản lý chương trình: cần quyền `MANAGE_PROGRAMS`

## Khắc phục sự cố

### Nếu không thấy dữ liệu:

1. **Kiểm tra console** (F12 > Console) để xem lỗi API cụ thể
2. **Kiểm tra Network** (F12 > Network) để xem request tới API có thành công không
3. **Đảm bảo endpoint đúng**: 
   - Backend: `/api/communication/...`
   - Frontend: Đã cấu hình baseURL là `http://localhost:8080/api`

### Nếu có thông báo lỗi CORS:

1. Đảm bảo backend có cấu hình CORS cho phép frontend gọi API
2. Backend cần cho phép origin từ `http://localhost:5173` (port mặc định của Vite)

### Nếu có thông báo lỗi xác thực:

1. Đảm bảo đã đăng nhập với tài khoản có quyền thích hợp
2. Kiểm tra cookie và token xác thực có được gửi kèm trong request không

## Chuyển về sử dụng mock data (nếu cần)

Trong trường hợp API thật chưa sẵn sàng và bạn cần sử dụng mock data tạm thời:

1. Nhấp vào nút "A" ở góc dưới bên phải màn hình
2. Chọn "Sử dụng dữ liệu giả lập"
3. Trang sẽ tự động tải lại và sử dụng mock data khi API thật gặp lỗi
