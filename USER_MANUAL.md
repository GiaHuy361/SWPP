# Hướng dẫn sử dụng Hệ thống Phòng Chống Ma Túy

## 1. Tổng quan ứng dụng

### Tổng quan công nghệ và môi trường phát triển
Hệ thống Phòng Chống Ma Túy được phát triển với các công nghệ hiện đại, tạo ra trải nghiệm mượt mà và thân thiện với người dùng:

**Công nghệ frontend:**
- **React**: Framework JavaScript hiện đại để xây dựng giao diện người dùng tương tác, cho phép tạo ra các thành phần UI tái sử dụng
- **Vite**: Công cụ build nhanh và nhẹ cho các ứng dụng web hiện đại
- **Tailwind CSS**: Framework CSS tiện ích để thiết kế giao diện nhanh chóng và linh hoạt
- **React Router**: Quản lý điều hướng trong ứng dụng React
- **Context API**: Quản lý trạng thái toàn cục của ứng dụng, đặc biệt là trạng thái xác thực người dùng

**Công nghệ backend:**
- **Spring Boot**: Framework Java mạnh mẽ cho phát triển ứng dụng backend với các tính năng như dependency injection, quản lý bảo mật, và xử lý giao dịch
- **JPA/Hibernate**: Framework ORM để ánh xạ các đối tượng Java với cơ sở dữ liệu quan hệ
- **MySQL**: Hệ quản trị cơ sở dữ liệu quan hệ để lưu trữ dữ liệu của ứng dụng
- **RESTful APIs**: Kiến trúc API hiện đại cho phép giao tiếp giữa client và server
- **JSON Web Token (JWT)**: Cơ chế xác thực và phân quyền không trạng thái
- **Maven**: Công cụ quản lý phụ thuộc và build tự động cho dự án Java

**Kiến trúc hệ thống:**
- **Microservices**: Ứng dụng được thiết kế theo kiến trúc microservices cho phép phát triển, triển khai và mở rộng các dịch vụ một cách độc lập
- **Mô hình MVC**: Tổ chức code theo mô hình Model-View-Controller giúp phân tách rõ ràng logic nghiệp vụ và giao diện người dùng
- **Xử lý đa luồng**: Tối ưu hóa hiệu suất hệ thống thông qua xử lý đa luồng
- **Caching**: Sử dụng cơ chế cache để giảm tải cho database và tăng tốc độ phản hồi
- **Tích hợp bên thứ ba**: Kết nối với các dịch vụ như email, thông báo đẩy, và xử lý thanh toán

**Môi trường phát triển:**
- **Node.js**: Môi trường runtime JavaScript để chạy các công cụ phát triển
- **npm**: Quản lý gói để cài đặt và quản lý các thư viện
- **VS Code**: Editor được đề xuất để phát triển và chỉnh sửa mã nguồn
- **Git/GitHub**: Hệ thống quản lý mã nguồn và phiên bản
- **IntelliJ IDEA/Eclipse**: IDE cho phát triển Java Spring Boot
- **Docker**: Đóng gói ứng dụng và các dependencies vào containers
- **Jenkins**: Tự động hóa quy trình CI/CD (Continuous Integration/Continuous Deployment)

**Yêu cầu hệ thống:**
- Trình duyệt web hiện đại (Chrome, Firefox, Safari, Edge phiên bản mới nhất)
- Kết nối internet ổn định
- Thiết bị có độ phân giải tối thiểu 1280x720 để có trải nghiệm tốt nhất

**Đặc điểm kỹ thuật:**
- Thiết kế responsive, tương thích với nhiều thiết bị (desktop, tablet, mobile)
- Tối ưu hóa hiệu suất tải trang và tương tác
- Bảo mật với JWT (JSON Web Token) cho xác thực người dùng
- Lưu trữ dữ liệu cục bộ bằng localStorage và sessionStorage
- Xử lý form mạnh mẽ với validation và feedback tức thời
- API Documentation với Swagger
- Logging và monitoring hệ thống
- Backup và phục hồi dữ liệu tự động

### Mục đích của ứng dụng
Hệ thống "Phòng Chống Ma Túy" là một nền tảng web được phát triển nhằm cung cấp thông tin, tư vấn và hỗ trợ trong công tác phòng chống ma túy. Ứng dụng này là một công cụ giúp nâng cao nhận thức của cộng đồng về tác hại của ma túy, cung cấp kiến thức về phòng chống và các biện pháp ứng phó, đồng thời tạo môi trường tương tác giữa người dùng và chuyên gia trong lĩnh vực này.

### Các tính năng chính
1. **Quản lý khóa học**: Cung cấp các khóa học trực tuyến về phòng chống ma túy
2. **Chương trình truyền thông**: Quản lý và tham gia các chương trình truyền thông về phòng chống ma túy
3. **Blog**: Chia sẻ bài viết, tin tức liên quan đến phòng chống ma túy
4. **Khảo sát**: Tham gia và quản lý các khảo sát về chủ đề ma túy và phòng chống
5. **Lịch hẹn**: Đặt lịch tư vấn với chuyên gia
6. **Quản lý người dùng và phân quyền**: Phân cấp người dùng và phân quyền hệ thống
7. **Thông báo**: Hệ thống thông báo nội bộ

### Các luồng công việc chính
1. Đăng ký, đăng nhập và quản lý thông tin cá nhân
2. Tham gia và hoàn thành các khóa học
3. Tham gia chương trình truyền thông
4. Tham gia khảo sát và xem kết quả
5. Đặt lịch hẹn và theo dõi lịch hẹn
6. Quản lý nội dung (khóa học, blog, khảo sát, chương trình truyền thông)
7. Quản lý người dùng và phân quyền

## 2. Các luồng công việc chi tiết

### Workflow 1: Đăng ký và đăng nhập hệ thống

#### Bước 1: Đăng ký tài khoản

**Mô tả:** Người dùng mới cần tạo tài khoản để có thể sử dụng đầy đủ các tính năng của hệ thống.

1. Truy cập trang chủ và nhấp vào nút "Đăng ký" ở góc trên bên phải của màn hình
2. Điền đầy đủ thông tin vào form đăng ký:
   - Họ và tên: Nhập họ và tên đầy đủ
   - Email: Nhập địa chỉ email hợp lệ (sẽ dùng để xác thực và đăng nhập)
   - Mật khẩu: Tạo mật khẩu có ít nhất 8 ký tự, bao gồm chữ cái, số và ký tự đặc biệt
   - Xác nhận mật khẩu: Nhập lại mật khẩu để xác nhận
3. Nhấn nút "Đăng ký" để hoàn tất quá trình
4. Hệ thống sẽ gửi mã xác thực đến email đã đăng ký
5. Nhập mã xác thực để hoàn tất việc đăng ký tài khoản

#### Bước 2: Đăng nhập hệ thống

**Mô tả:** Người dùng đã có tài khoản sử dụng thông tin đăng ký để đăng nhập vào hệ thống.

1. Truy cập trang chủ và nhấp vào nút "Đăng nhập" ở góc trên bên phải
2. Nhập thông tin đăng nhập:
   - Email: Nhập địa chỉ email đã đăng ký
   - Mật khẩu: Nhập mật khẩu đã tạo
3. Nhấn nút "Đăng nhập" để truy cập vào hệ thống
4. Nếu quên mật khẩu, nhấp vào "Quên mật khẩu?" và làm theo hướng dẫn để khôi phục mật khẩu

#### Bước 3: Cập nhật thông tin cá nhân

**Mô tả:** Sau khi đăng nhập, người dùng có thể cập nhật thông tin cá nhân trong hồ sơ của mình.

1. Sau khi đăng nhập, nhấp vào biểu tượng người dùng ở góc trên bên phải
2. Chọn "Hồ sơ" từ menu thả xuống
3. Trong trang Hồ sơ, bạn có thể:
   - Cập nhật thông tin cá nhân (họ tên, ngày sinh, địa chỉ, số điện thoại)
   - Thay đổi mật khẩu
   - Cập nhật ảnh đại diện
4. Sau khi điền thông tin, nhấn "Lưu thay đổi" để cập nhật hồ sơ

### Workflow 2: Tham gia và hoàn thành khóa học

#### Bước 1: Xem danh sách khóa học

**Mô tả:** Người dùng có thể xem tất cả các khóa học có sẵn trong hệ thống.

1. Đăng nhập vào hệ thống
2. Từ thanh điều hướng chính, nhấp vào "Khóa học"
3. Danh sách khóa học sẽ hiển thị với thông tin ngắn gọn về mỗi khóa học:
   - Tên khóa học
   - Mô tả ngắn
   - Cấp độ (Beginner, Intermediate, Advanced)
   - Số người đã tham gia
4. Sử dụng bộ lọc ở bên trái để lọc khóa học theo:
   - Cấp độ
   - Nhóm tuổi
   - Chủ đề

#### Bước 2: Đăng ký khóa học

**Mô tả:** Người dùng chọn và đăng ký tham gia khóa học mình quan tâm.

1. Từ danh sách khóa học, nhấp vào khóa học muốn tham gia
2. Xem thông tin chi tiết về khóa học:
   - Mô tả đầy đủ
   - Nội dung bài học
   - Thời lượng
   - Yêu cầu
3. Nhấn nút "Đăng ký khóa học"
4. Xác nhận đăng ký bằng cách nhấn "Xác nhận"
5. Hệ thống sẽ thêm khóa học vào danh sách "Khóa học của tôi"

#### Bước 3: Học và hoàn thành khóa học

**Mô tả:** Người dùng tham gia và hoàn thành các bài học trong khóa học.

1. Truy cập vào "Khóa học của tôi" từ thanh điều hướng hoặc bảng điều khiển cá nhân
2. Chọn khóa học đã đăng ký
3. Bắt đầu từ bài học đầu tiên bằng cách nhấp vào nó
4. Xem nội dung bài học (video, văn bản, hình ảnh)
5. Hoàn thành bài kiểm tra sau mỗi bài học (nếu có)
6. Tiếp tục với các bài học tiếp theo
7. Sau khi hoàn thành tất cả bài học và bài kiểm tra, nhấn nút "Hoàn thành khóa học"
8. Nhận chứng chỉ hoàn thành (nếu có) và xem kết quả tổng quan

### Workflow 3: Tham gia chương trình truyền thông

#### Bước 1: Xem danh sách chương trình truyền thông

**Mô tả:** Người dùng có thể xem các chương trình truyền thông về phòng chống ma túy.

1. Đăng nhập vào hệ thống
2. Từ thanh điều hướng, chọn "Chương trình truyền thông"
3. Danh sách các chương trình truyền thông sẽ hiển thị với:
   - Tên chương trình
   - Thời gian diễn ra
   - Địa điểm
   - Mô tả ngắn
4. Sử dụng các bộ lọc để tìm chương trình phù hợp:
   - Theo thời gian
   - Theo địa điểm
   - Theo chủ đề

#### Bước 2: Xem chi tiết và đăng ký tham gia

**Mô tả:** Người dùng xem thông tin chi tiết và đăng ký tham gia chương trình.

1. Nhấp vào chương trình truyền thông mà bạn quan tâm
2. Xem thông tin chi tiết:
   - Mô tả đầy đủ
   - Lịch trình chi tiết
   - Diễn giả/người tổ chức
   - Mục tiêu chương trình
3. Nhấn nút "Đăng ký tham gia"
4. Điền thông tin cần thiết (nếu có)
5. Nhấn "Xác nhận đăng ký"
6. Nhận xác nhận đăng ký qua email hoặc thông báo trong hệ thống

#### Bước 3: Phản hồi sau chương trình

**Mô tả:** Người dùng gửi phản hồi sau khi tham gia chương trình.

1. Sau khi chương trình kết thúc, truy cập vào "Chương trình đã tham gia" từ bảng điều khiển
2. Chọn chương trình đã tham gia
3. Nhấn vào nút "Gửi phản hồi"
4. Điền vào form phản hồi:
   - Đánh giá mức độ hài lòng (1-5 sao)
   - Ý kiến về nội dung chương trình
   - Đề xuất cải thiện
5. Nhấn "Gửi phản hồi" để hoàn tất

### Workflow 4: Tham gia khảo sát và xem kết quả

#### Bước 1: Xem danh sách khảo sát

**Mô tả:** Người dùng xem các khảo sát hiện có trong hệ thống.

1. Đăng nhập vào hệ thống
2. Từ thanh điều hướng, chọn "Khảo sát"
3. Danh sách khảo sát sẽ hiển thị với thông tin:
   - Tên khảo sát
   - Chủ đề
   - Thời gian tham gia
   - Trạng thái (Đang mở/Đã đóng)

#### Bước 2: Tham gia khảo sát

**Mô tả:** Người dùng tham gia vào khảo sát.

1. Nhấp vào khảo sát muốn tham gia từ danh sách
2. Xem thông tin chi tiết về khảo sát:
   - Mục đích
   - Thời gian dự kiến hoàn thành
   - Số câu hỏi
3. Nhấn nút "Bắt đầu khảo sát"
4. Trả lời các câu hỏi được hiển thị:
   - Câu hỏi trắc nghiệm (chọn một hoặc nhiều đáp án)
   - Câu hỏi thang điểm
   - Câu hỏi mở (trả lời tự do)
5. Sử dụng nút "Tiếp theo" để di chuyển qua các câu hỏi
6. Sau khi trả lời tất cả các câu hỏi, nhấn nút "Hoàn thành"
7. Xác nhận gửi câu trả lời bằng cách nhấn "Xác nhận"

#### Bước 3: Xem kết quả khảo sát

**Mô tả:** Người dùng có thể xem kết quả của các khảo sát đã tham gia (nếu được phép).

1. Từ danh sách khảo sát, tìm khảo sát đã tham gia
2. Nhấp vào "Xem kết quả" (chỉ hiển thị nếu kết quả đã sẵn sàng và người dùng được phép xem)
3. Xem tổng hợp kết quả:
   - Biểu đồ thống kê câu trả lời
   - Phân tích kết quả
   - So sánh với câu trả lời của bạn (nếu có)

### Workflow 5: Đặt và quản lý lịch hẹn

#### Bước 1: Xem và chọn dịch vụ tư vấn

**Mô tả:** Người dùng xem các dịch vụ tư vấn có sẵn và chọn dịch vụ phù hợp.

1. Đăng nhập vào hệ thống
2. Từ thanh điều hướng, chọn "Lịch hẹn" hoặc "Đặt lịch hẹn"
3. Xem danh sách các dịch vụ tư vấn:
   - Tên dịch vụ
   - Mô tả
   - Thời gian tư vấn
   - Chuyên gia tư vấn
4. Nhấp vào dịch vụ bạn muốn đặt lịch

#### Bước 2: Đặt lịch hẹn

**Mô tả:** Người dùng chọn thời gian và đặt lịch hẹn với chuyên gia.

1. Sau khi chọn dịch vụ, xem thông tin chi tiết về dịch vụ và chuyên gia
2. Nhấn nút "Đặt lịch hẹn"
3. Chọn ngày và giờ phù hợp từ lịch hiển thị (chỉ hiển thị các khung giờ còn trống)
4. Điền thông tin bổ sung:
   - Lý do tư vấn
   - Câu hỏi/vấn đề cụ thể (nếu có)
   - Phương thức liên hệ ưa thích (trực tiếp/trực tuyến)
5. Nhấn "Xác nhận lịch hẹn"
6. Nhận xác nhận đặt lịch qua email hoặc thông báo trong hệ thống

#### Bước 3: Quản lý lịch hẹn

**Mô tả:** Người dùng xem, hủy hoặc đặt lại lịch hẹn đã tạo.

1. Từ thanh điều hướng, chọn "Lịch hẹn của tôi"
2. Xem danh sách các lịch hẹn:
   - Sắp tới
   - Đã hoàn thành
   - Đã hủy
3. Với lịch hẹn sắp tới, bạn có thể:
   - Xem chi tiết lịch hẹn
   - Hủy lịch hẹn (nhấn "Hủy" và xác nhận)
   - Đặt lại lịch hẹn (nhấn "Đặt lại" và chọn thời gian mới)
4. Sau khi lịch hẹn hoàn thành, bạn có thể:
   - Đánh giá cuộc tư vấn
   - Xem ghi chú hoặc đề xuất từ chuyên gia (nếu có)
   - Đặt lịch hẹn tiếp theo (nếu cần)

### Workflow 6: Quản lý nội dung (cho Admin và người dùng có quyền)

#### Bước 1: Truy cập trang quản trị

**Mô tả:** Admin hoặc người dùng có quyền quản lý truy cập vào bảng điều khiển quản trị.

1. Đăng nhập với tài khoản có quyền quản trị
2. Nhấp vào biểu tượng cài đặt hoặc "Quản lý" trên thanh điều hướng
3. Chọn loại nội dung muốn quản lý:
   - Khóa học
   - Chương trình truyền thông
   - Blog
   - Khảo sát
   - Lịch hẹn

#### Bước 2: Quản lý khóa học

**Mô tả:** Thêm, sửa, xóa và quản lý khóa học.

1. Từ bảng điều khiển quản trị, chọn "Quản lý khóa học"
2. Xem danh sách khóa học hiện có
3. Thêm khóa học mới:
   - Nhấn "Thêm khóa học mới"
   - Điền thông tin khóa học (tên, mô tả, cấp độ, nhóm tuổi, v.v.)
   - Tải lên hình ảnh đại diện
   - Nhấn "Lưu" để tạo khóa học
4. Sửa khóa học:
   - Nhấp vào khóa học cần sửa
   - Chỉnh sửa thông tin
   - Nhấn "Cập nhật" để lưu thay đổi
5. Xóa khóa học:
   - Nhấp vào biểu tượng xóa bên cạnh khóa học
   - Xác nhận xóa

#### Bước 3: Quản lý chương trình truyền thông

**Mô tả:** Tạo và quản lý các chương trình truyền thông.

1. Từ bảng điều khiển quản trị, chọn "Quản lý chương trình truyền thông"
2. Xem danh sách chương trình hiện có
3. Tạo chương trình mới:
   - Nhấn "Thêm chương trình mới"
   - Điền thông tin chương trình (tên, thời gian, địa điểm, mô tả)
   - Tải lên hình ảnh và tài liệu liên quan
   - Nhấn "Lưu" để tạo chương trình
4. Quản lý người tham gia:
   - Chọn chương trình
   - Xem danh sách người đăng ký tham gia
   - Xuất danh sách người tham gia (nếu cần)
5. Xem và phản hồi ý kiến:
   - Chọn chương trình
   - Xem danh sách phản hồi
   - Trả lời hoặc đánh dấu phản hồi

#### Bước 4: Quản lý blog

**Mô tả:** Tạo và quản lý bài viết blog.

1. Từ bảng điều khiển quản trị, chọn "Quản lý blog"
2. Xem danh sách bài viết hiện có
3. Tạo bài viết mới:
   - Nhấn "Thêm bài viết mới"
   - Điền thông tin bài viết (tiêu đề, nội dung, danh mục)
   - Tải lên hình ảnh minh họa
   - Thiết lập trạng thái (Nháp/Xuất bản)
   - Nhấn "Lưu" để tạo bài viết
4. Chỉnh sửa bài viết:
   - Chọn bài viết cần sửa
   - Chỉnh sửa nội dung
   - Nhấn "Cập nhật" để lưu thay đổi

#### Bước 5: Quản lý khảo sát

**Mô tả:** Tạo và quản lý các khảo sát.

1. Từ bảng điều khiển quản trị, chọn "Quản lý khảo sát"
2. Xem danh sách khảo sát hiện có
3. Tạo khảo sát mới:
   - Nhấn "Thêm khảo sát mới"
   - Điền thông tin khảo sát (tên, mô tả, thời hạn)
   - Thêm câu hỏi và các lựa chọn
   - Thiết lập trạng thái (Mở/Đóng)
   - Nhấn "Lưu" để tạo khảo sát
4. Xem kết quả khảo sát:
   - Chọn khảo sát
   - Xem thống kê và biểu đồ kết quả
   - Xuất kết quả (nếu cần)

### Workflow 7: Quản lý người dùng và phân quyền

#### Bước 1: Truy cập quản lý người dùng

**Mô tả:** Admin truy cập vào phần quản lý người dùng để xem và quản lý tài khoản.

1. Đăng nhập với tài khoản admin
2. Từ thanh điều hướng hoặc bảng điều khiển quản trị, chọn "Quản lý người dùng"
3. Xem danh sách người dùng với thông tin:
   - Tên người dùng
   - Email
   - Vai trò/quyền
   - Trạng thái tài khoản

#### Bước 2: Thêm người dùng mới

**Mô tả:** Admin tạo tài khoản mới cho người dùng.

1. Từ trang Quản lý người dùng, nhấn "Thêm người dùng"
2. Điền thông tin người dùng:
   - Họ và tên
   - Email
   - Mật khẩu
   - Vai trò (Admin, Chuyên gia, Người dùng thường)
3. Tùy chọn gửi email thông báo cho người dùng mới
4. Nhấn "Lưu" để tạo tài khoản

#### Bước 3: Quản lý vai trò và phân quyền

**Mô tả:** Admin thiết lập và quản lý các vai trò và quyền hạn trong hệ thống.

1. Từ bảng điều khiển quản trị, chọn "Phân quyền"
2. Xem danh sách vai trò hiện có
3. Tạo vai trò mới:
   - Nhấn "Thêm vai trò"
   - Đặt tên vai trò
   - Chọn các quyền cho vai trò đó
   - Nhấn "Lưu" để tạo vai trò
4. Chỉnh sửa vai trò:
   - Chọn vai trò cần sửa
   - Thay đổi quyền
   - Nhấn "Cập nhật" để lưu thay đổi
5. Gán vai trò cho người dùng:
   - Quay lại danh sách người dùng
   - Chọn người dùng cần gán vai trò
   - Chọn vai trò từ menu thả xuống
   - Nhấn "Cập nhật" để lưu thay đổi

#### Bước 4: Vô hiệu hóa hoặc xóa tài khoản

**Mô tả:** Admin vô hiệu hóa hoặc xóa tài khoản người dùng khi cần thiết.

1. Từ danh sách người dùng, tìm tài khoản cần xử lý
2. Vô hiệu hóa tài khoản:
   - Nhấn vào nút "Vô hiệu hóa" bên cạnh tên người dùng
   - Xác nhận hành động
3. Xóa tài khoản:
   - Nhấn vào nút "Xóa" bên cạnh tên người dùng
   - Xác nhận hành động (lưu ý: hành động này không thể hoàn tác)

## Tổng kết

Hệ thống Phòng Chống Ma Túy cung cấp một nền tảng toàn diện để nâng cao nhận thức về phòng chống ma túy, với các tính năng đa dạng bao gồm khóa học trực tuyến, chương trình truyền thông, blog thông tin, khảo sát và dịch vụ tư vấn. Hệ thống được thiết kế với giao diện người dùng thân thiện, dễ tiếp cận, cùng với khả năng phân quyền linh hoạt để phục vụ nhiều đối tượng người dùng khác nhau.

Người dùng có thể dễ dàng điều hướng thông qua các luồng công việc chính như đăng ký và đăng nhập, tham gia khóa học và chương trình truyền thông, tham gia khảo sát, đặt lịch hẹn với chuyên gia, và nhiều tính năng khác. Đối với admin và người dùng có quyền quản lý, hệ thống cung cấp các công cụ để quản lý nội dung, người dùng và phân quyền một cách hiệu quả.
