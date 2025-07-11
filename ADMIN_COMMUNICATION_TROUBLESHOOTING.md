# Hướng dẫn khắc phục lỗi trang Admin Communication

Nếu bạn đang gặp vấn đề hiển thị dữ liệu trên trang Chi tiết chương trình truyền thông ở đường dẫn `/admin/communication/programs/1`, đây là một số bước khắc phục:

## Vấn đề hiển thị "Chưa xác định" hoặc thiếu thông tin

### Nguyên nhân có thể:

1. **Đang sử dụng dữ liệu giả lập (Mock Data)**: Chế độ Mock Data được bật và không đủ chi tiết cho trang admin.
2. **API thật không trả về đủ dữ liệu**: API backend đang hoạt động nhưng không trả về đầy đủ thông tin cần thiết.
3. **Lỗi hiển thị dữ liệu trong component**: Component hiển thị không xử lý đúng dữ liệu nhận được.
4. **Trạng thái (status) không được hiển thị đúng**: Trạng thái có thể không được hiển thị đúng sau khi cập nhật chương trình.

### Cách khắc phục:

1. **Tắt chế độ Mock Data**:
   - Tìm biểu tượng ⚠️ hoặc nút M ở góc dưới bên phải màn hình
   - Nhấp vào để mở rộng và bỏ chọn "Sử dụng dữ liệu giả lập"
   - Trang sẽ tự động tải lại và sử dụng API thật

2. **Kiểm tra API thật**:
   - Mở DevTools (F12) > Network
   - Tìm request đến `/communication/programs/1` 
   - Kiểm tra response để xem API có trả về đủ thông tin không

3. **Hiểu rõ cấu trúc dữ liệu API trả về**:
   - API chỉ trả về các trường sau:
     ```json
     {
       "programId": 1,
       "title": "Nói Không Với Ma Túy - Bảo Vệ Tương Lai",
       "description": "Chương trình tuyên truyền nâng cao nhận thức...",
       "participantCount": 1,
       "interactionCount": 8,
       "averageRating": null,
       "feedbackCount": 10,
       "startDate": "2025-01-13T00:00:00",
       "endDate": "2025-12-29T00:00:00",
       "status": "completed",
       "createdAt": "2025-01-15T15:00:00",
       "updatedAt": "2025-07-07T14:26:00",
       "finalAverageRating": null
     }
     ```
   - Không nên hiển thị hoặc yêu cầu các trường không có trong API này

4. **Xử lý trạng thái (status) chính xác**:
   - Đảm bảo trạng thái được hiển thị chính xác bất kể chữ hoa/thường
   - Trạng thái có thể là: "ACTIVE", "INACTIVE", "COMPLETED", "DRAFT", "PENDING", "CANCELLED"
   - Khi cập nhật chương trình, trạng thái nên được hiển thị ngay mà không cần tải lại trang

5. **Kiểm tra lỗi trong Console**:
   - Mở DevTools (F12) > Console
   - Xem có lỗi API hoặc lỗi JavaScript nào không
   - Nếu có lỗi, ghi lại và báo cho team backend hoặc frontend

## Vấn đề với trạng thái (Status) không hiển thị đúng

Nếu trạng thái của chương trình không hiển thị đúng sau khi cập nhật, nguyên nhân có thể là:

1. **Không đồng bộ giữa chữ hoa và chữ thường**: API backend có thể trả về trạng thái với chữ hoa (ví dụ: "ACTIVE"), trong khi frontend đang xử lý với chữ thường ("active").

2. **Thiếu xử lý một số trạng thái**: Có thể frontend chưa xử lý tất cả các trạng thái có thể có (ACTIVE, INACTIVE, COMPLETED, DRAFT, PENDING, CANCELLED).

3. **Cache dữ liệu**: Dữ liệu cũ có thể được cache trong ứng dụng.

### Cách khắc phục:

1. **Đảm bảo xử lý case-insensitive**: 
   ```jsx
   // Ví dụ cách xử lý đúng
   const normalizedStatus = status ? status.toUpperCase() : '';
   
   const statusMap = {
     'ACTIVE': { color: 'bg-green-100 text-green-800', text: 'Hoạt động' },
     'INACTIVE': { color: 'bg-gray-100 text-gray-800', text: 'Tạm dừng' },
     // các trạng thái khác...
   };
   
   const statusInfo = statusMap[normalizedStatus] || { color: 'bg-gray-100 text-gray-800', text: status || 'Không xác định' };
   ```

2. **Kiểm tra API trả về giá trị trạng thái gì**:
   - Sử dụng DevTools > Network để xem response API
   - Kiểm tra trường `status` trong response
   - Đảm bảo frontend xử lý đúng giá trị này

3. **Sửa các dropdown để dùng cùng format với API**:
   - Trong form chỉnh sửa, đảm bảo options trong dropdown status dùng đúng format:
   ```jsx
   <option value="ACTIVE">Hoạt động</option>
   <option value="INACTIVE">Tạm dừng</option>
   // các options khác...
   ```

4. **Làm mới dữ liệu sau khi cập nhật**:
   - Sau khi cập nhật chương trình thành công, nên chuyển hướng về trang chi tiết
   - Hoặc tự động làm mới dữ liệu từ API

## Các thay đổi đã được thực hiện để khắc phục vấn đề

Các file dưới đây đã được cập nhật để xử lý đúng trạng thái của chương trình và cải thiện việc hiển thị:

1. **CommunicationProgramDetail.jsx (Admin và User)**:
   - Cập nhật hàm `getStatusBadge()` để xử lý case-insensitive
   - Thêm đầy đủ các trạng thái có thể có
   - Cải thiện hiển thị badge trạng thái

2. **CommunicationProgramList.jsx (Admin)**:
   - Cập nhật hàm `getStatusBadge()` tương tự như ở Detail
   - Đảm bảo hiển thị nhất quán

3. **CommunicationPrograms.jsx (User)**:
   - Thêm hàm `getStatusBadge()` chính xác
   - Cập nhật hiển thị badge trạng thái
   - Cập nhật dropdown lọc trạng thái để sử dụng chữ hoa

4. **CommunicationProgramForm.jsx**:
   - Đảm bảo sử dụng giá trị viết hoa cho trạng thái (ACTIVE, INACTIVE, v.v.)
   - Cập nhật tất cả dropdown status để sử dụng giá trị phù hợp với API

Những thay đổi này đảm bảo rằng trạng thái của chương trình sẽ được hiển thị chính xác, ngay cả khi API trả về các giá trị với định dạng chữ hoa/thường khác nhau.

## Lưu ý quan trọng

- Các trang admin chỉ nên hiển thị thông tin mà API thực sự trả về, không hiển thị "Chưa xác định" cho các trường không có
- Trạng thái chương trình cần được hiển thị chính xác và nhất quán trong toàn bộ ứng dụng
- Chỉ sử dụng Mock Data khi thực sự cần thiết, ưu tiên sử dụng API thật
- Trang chi tiết chương trình nên hiển thị đúng thông tin ngay sau khi cập nhật, không yêu cầu tải lại trang
