# Cấu Trúc Backend và API Endpoints

## Giới Thiệu

Tài liệu này mô tả cấu trúc backend của hệ thống và cung cấp thông tin về các API endpoints cho các chức năng chính: Survey (Khảo sát), Course (Khóa học) và Appointment (Đặt lịch hẹn).

## Cấu Trúc Backend

Backend được thiết kế theo mô hình phân lớp với kiến trúc MVC (Model-View-Controller), tuân theo các nguyên tắc thiết kế hướng đối tượng. Dựa trên sơ đồ UML được cung cấp, cấu trúc có các thành phần chính sau:

### Controllers
- **BaseController**: Lớp controller cơ sở cung cấp các chức năng chung
- **ProductController**: Quản lý các sản phẩm/dịch vụ, kế thừa từ BaseController

### DAOs (Data Access Objects)
- **BaseDao**: Lớp DAO cơ sở cung cấp các thao tác CRUD chung
- **ProductDao**: Quản lý truy cập dữ liệu cho sản phẩm/dịch vụ
- **UserDao**: Quản lý truy cập dữ liệu người dùng

### Beans/Models
- **BaseBean**: Lớp model cơ sở
- **ProductBean**: Model cho sản phẩm/dịch vụ
- **UserBean**: Model cho người dùng

### Utilities
- **MyUtils**: Lớp tiện ích
- **RequestFilter**: Bộ lọc xử lý yêu cầu

## API Endpoints

### 1. Chức năng Survey (Khảo sát)

#### Lấy danh sách khảo sát
- **URL**: `/api/surveys`
- **Method**: GET
- **Description**: Lấy danh sách tất cả các khảo sát có sẵn
- **Parameters**:
  - `page` (optional): Số trang
  - `size` (optional): Kích thước trang
  - `status` (optional): Trạng thái khảo sát (OPEN, CLOSED)
- **Response**:
```json
{
  "content": [
    {
      "id": 1,
      "title": "Đánh giá nhận thức về ma túy",
      "description": "Khảo sát về nhận thức và kiến thức về ma túy và tác hại",
      "startDate": "2025-06-01",
      "endDate": "2025-07-31",
      "status": "OPEN",
      "questionCount": 15
    },
    ...
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "totalElements": 25,
    "totalPages": 3
  }
}
```

#### Lấy chi tiết khảo sát
- **URL**: `/api/surveys/{surveyId}`
- **Method**: GET
- **Description**: Lấy thông tin chi tiết về một khảo sát cụ thể
- **Parameters**:
  - `surveyId`: ID của khảo sát
- **Response**:
```json
{
  "id": 1,
  "title": "Đánh giá nhận thức về ma túy",
  "description": "Khảo sát về nhận thức và kiến thức về ma túy và tác hại",
  "startDate": "2025-06-01",
  "endDate": "2025-07-31",
  "status": "OPEN",
  "questions": [
    {
      "id": 101,
      "text": "Bạn biết gì về tác hại của ma túy?",
      "type": "TEXT",
      "required": true,
      "options": []
    },
    {
      "id": 102,
      "text": "Bạn đã từng được tuyên truyền về phòng chống ma túy chưa?",
      "type": "MULTIPLE_CHOICE",
      "required": true,
      "options": [
        {"id": 1, "text": "Chưa bao giờ"},
        {"id": 2, "text": "Một vài lần"},
        {"id": 3, "text": "Nhiều lần"}
      ]
    },
    ...
  ]
}
```

#### Gửi câu trả lời khảo sát
- **URL**: `/api/surveys/{surveyId}/submit`
- **Method**: POST
- **Description**: Gửi câu trả lời cho một khảo sát
- **Parameters**:
  - `surveyId`: ID của khảo sát
- **Request Body**:
```json
{
  "userId": 1234,
  "answers": [
    {
      "questionId": 101,
      "textAnswer": "Ma túy có thể gây hại cho sức khỏe và tinh thần..."
    },
    {
      "questionId": 102,
      "optionIds": [2]
    },
    ...
  ]
}
```
- **Response**:
```json
{
  "id": 5001,
  "surveyId": 1,
  "userId": 1234,
  "submissionDate": "2025-07-12T14:30:00",
  "status": "COMPLETED"
}
```

#### Lấy kết quả khảo sát
- **URL**: `/api/surveys/{surveyId}/results`
- **Method**: GET
- **Description**: Lấy kết quả thống kê của một khảo sát
- **Parameters**:
  - `surveyId`: ID của khảo sát
- **Response**:
```json
{
  "surveyId": 1,
  "title": "Đánh giá nhận thức về ma túy",
  "totalResponses": 150,
  "completionRate": 78.5,
  "questionResults": [
    {
      "questionId": 102,
      "questionText": "Bạn đã từng được tuyên truyền về phòng chống ma túy chưa?",
      "optionResults": [
        {"optionId": 1, "optionText": "Chưa bao giờ", "count": 45, "percentage": 30.0},
        {"optionId": 2, "optionText": "Một vài lần", "count": 85, "percentage": 56.7},
        {"optionId": 3, "optionText": "Nhiều lần", "count": 20, "percentage": 13.3}
      ]
    },
    ...
  ]
}
```

### 2. Chức năng Course (Khóa học)

#### Lấy danh sách khóa học
- **URL**: `/api/courses`
- **Method**: GET
- **Description**: Lấy danh sách tất cả các khóa học có sẵn
- **Parameters**:
  - `page` (optional): Số trang
  - `size` (optional): Kích thước trang
  - `category` (optional): Danh mục khóa học
  - `level` (optional): Cấp độ khóa học (BEGINNER, INTERMEDIATE, ADVANCED)
  - `ageGroup` (optional): Nhóm tuổi mục tiêu
- **Response**:
```json
{
  "content": [
    {
      "id": 1,
      "title": "Hiểu biết cơ bản về ma túy và phòng tránh",
      "description": "Khóa học cung cấp kiến thức cơ bản về các loại ma túy phổ biến và tác hại của chúng",
      "level": "BEGINNER",
      "category": "PREVENTION",
      "duration": "4 weeks",
      "enrollmentCount": 256,
      "ageGroups": ["13-18", "19-25"],
      "thumbnailUrl": "/images/courses/basic-drugs-awareness.jpg"
    },
    ...
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "totalElements": 35,
    "totalPages": 4
  }
}
```

#### Lấy chi tiết khóa học
- **URL**: `/api/courses/{courseId}`
- **Method**: GET
- **Description**: Lấy thông tin chi tiết về một khóa học cụ thể
- **Parameters**:
  - `courseId`: ID của khóa học
- **Response**:
```json
{
  "id": 1,
  "title": "Hiểu biết cơ bản về ma túy và phòng tránh",
  "description": "Khóa học cung cấp kiến thức cơ bản về các loại ma túy phổ biến và tác hại của chúng",
  "level": "BEGINNER",
  "category": "PREVENTION",
  "duration": "4 weeks",
  "enrollmentCount": 256,
  "ageGroups": ["13-18", "19-25"],
  "thumbnailUrl": "/images/courses/basic-drugs-awareness.jpg",
  "lessons": [
    {
      "id": 101,
      "title": "Giới thiệu về các loại ma túy phổ biến",
      "description": "Bài học giới thiệu các loại ma túy phổ biến và đặc điểm nhận biết",
      "duration": "45 minutes",
      "videoUrl": "/videos/lesson1.mp4"
    },
    {
      "id": 102,
      "title": "Tác hại của ma túy đối với sức khỏe",
      "description": "Tìm hiểu các tác động tiêu cực của ma túy đến sức khỏe thể chất và tinh thần",
      "duration": "60 minutes",
      "videoUrl": "/videos/lesson2.mp4"
    },
    ...
  ],
  "quizzes": [
    {
      "id": 201,
      "title": "Kiểm tra kiến thức bài 1",
      "questionCount": 10,
      "passingScore": 7
    },
    ...
  ]
}
```

#### Đăng ký khóa học
- **URL**: `/api/courses/{courseId}/enroll`
- **Method**: POST
- **Description**: Đăng ký tham gia một khóa học
- **Parameters**:
  - `courseId`: ID của khóa học
- **Request Body**:
```json
{
  "userId": 1234
}
```
- **Response**:
```json
{
  "enrollmentId": 3001,
  "courseId": 1,
  "userId": 1234,
  "enrollmentDate": "2025-07-12T14:30:00",
  "status": "ENROLLED"
}
```

#### Cập nhật tiến độ khóa học
- **URL**: `/api/courses/enrollments/{enrollmentId}/progress`
- **Method**: PUT
- **Description**: Cập nhật tiến độ hoàn thành khóa học
- **Parameters**:
  - `enrollmentId`: ID của bản ghi đăng ký khóa học
- **Request Body**:
```json
{
  "lessonId": 102,
  "completed": true,
  "lastAccessedTime": "2025-07-12T16:45:00"
}
```
- **Response**:
```json
{
  "enrollmentId": 3001,
  "courseId": 1,
  "userId": 1234,
  "progress": 40.0,
  "completedLessons": [101, 102],
  "lastAccessedLesson": 102,
  "lastAccessedTime": "2025-07-12T16:45:00"
}
```

#### Nộp bài kiểm tra
- **URL**: `/api/courses/quizzes/{quizId}/submit`
- **Method**: POST
- **Description**: Nộp câu trả lời cho bài kiểm tra trong khóa học
- **Parameters**:
  - `quizId`: ID của bài kiểm tra
- **Request Body**:
```json
{
  "userId": 1234,
  "answers": [
    {
      "questionId": 301,
      "optionId": 2
    },
    {
      "questionId": 302,
      "optionId": 1
    },
    ...
  ]
}
```
- **Response**:
```json
{
  "attemptId": 7001,
  "quizId": 201,
  "userId": 1234,
  "score": 8,
  "totalQuestions": 10,
  "passStatus": "PASSED",
  "attemptDate": "2025-07-12T17:30:00",
  "feedback": "Chúc mừng! Bạn đã vượt qua bài kiểm tra."
}
```

### 3. Chức năng Appointment (Đặt lịch hẹn)

#### Lấy danh sách dịch vụ tư vấn
- **URL**: `/api/counseling/services`
- **Method**: GET
- **Description**: Lấy danh sách các dịch vụ tư vấn có sẵn
- **Response**:
```json
[
  {
    "id": 1,
    "name": "Tư vấn cá nhân về phòng chống ma túy",
    "description": "Buổi tư vấn một-một với chuyên gia về các vấn đề liên quan đến ma túy",
    "duration": 60,
    "price": 0,
    "isOnline": true
  },
  {
    "id": 2,
    "name": "Tư vấn gia đình",
    "description": "Buổi tư vấn dành cho gia đình có thành viên đang gặp vấn đề liên quan đến ma túy",
    "duration": 90,
    "price": 0,
    "isOnline": true
  },
  ...
]
```

#### Lấy danh sách chuyên gia tư vấn
- **URL**: `/api/counselors`
- **Method**: GET
- **Description**: Lấy danh sách các chuyên gia tư vấn
- **Parameters**:
  - `serviceId` (optional): Lọc theo dịch vụ tư vấn
  - `specialty` (optional): Lọc theo chuyên môn
- **Response**:
```json
[
  {
    "id": 1,
    "name": "Dr. Nguyễn Văn A",
    "title": "Chuyên gia tâm lý",
    "specialties": ["Nghiện ma túy", "Tư vấn thanh thiếu niên"],
    "experience": 10,
    "bio": "Tiến sĩ Tâm lý học với hơn 10 năm kinh nghiệm...",
    "imageUrl": "/images/counselors/nguyen-van-a.jpg",
    "rating": 4.8,
    "reviewCount": 120
  },
  ...
]
```

#### Kiểm tra khung giờ có sẵn
- **URL**: `/api/counselors/{counselorId}/availability`
- **Method**: GET
- **Description**: Kiểm tra khung giờ có sẵn của chuyên gia tư vấn
- **Parameters**:
  - `counselorId`: ID của chuyên gia tư vấn
  - `date`: Ngày muốn kiểm tra (format: YYYY-MM-DD)
- **Response**:
```json
{
  "counselorId": 1,
  "date": "2025-07-15",
  "availableSlots": [
    {
      "id": 101,
      "startTime": "09:00:00",
      "endTime": "10:00:00"
    },
    {
      "id": 102,
      "startTime": "10:30:00",
      "endTime": "11:30:00"
    },
    {
      "id": 105,
      "startTime": "14:00:00",
      "endTime": "15:00:00"
    },
    ...
  ]
}
```

#### Đặt lịch hẹn
- **URL**: `/api/appointments`
- **Method**: POST
- **Description**: Tạo lịch hẹn mới với chuyên gia tư vấn
- **Request Body**:
```json
{
  "userId": 1234,
  "counselorId": 1,
  "serviceId": 1,
  "slotId": 102,
  "date": "2025-07-15",
  "contactMethod": "ONLINE",
  "notes": "Tôi muốn được tư vấn về cách phòng tránh ma túy cho con tôi."
}
```
- **Response**:
```json
{
  "appointmentId": 5001,
  "userId": 1234,
  "counselorId": 1,
  "counselorName": "Dr. Nguyễn Văn A",
  "serviceId": 1,
  "serviceName": "Tư vấn cá nhân về phòng chống ma túy",
  "date": "2025-07-15",
  "startTime": "10:30:00",
  "endTime": "11:30:00",
  "status": "CONFIRMED",
  "contactMethod": "ONLINE",
  "meetingUrl": "https://meet.example.com/appointment-5001",
  "notes": "Tôi muốn được tư vấn về cách phòng tránh ma túy cho con tôi.",
  "createdAt": "2025-07-12T18:30:00"
}
```

#### Hủy lịch hẹn
- **URL**: `/api/appointments/{appointmentId}/cancel`
- **Method**: PUT
- **Description**: Hủy lịch hẹn đã đặt
- **Parameters**:
  - `appointmentId`: ID của lịch hẹn
- **Request Body**:
```json
{
  "cancellationReason": "Có việc đột xuất, không thể tham gia buổi tư vấn"
}
```
- **Response**:
```json
{
  "appointmentId": 5001,
  "status": "CANCELLED",
  "cancellationReason": "Có việc đột xuất, không thể tham gia buổi tư vấn",
  "cancellationTime": "2025-07-14T09:15:00"
}
```

#### Lấy danh sách lịch hẹn của người dùng
- **URL**: `/api/users/{userId}/appointments`
- **Method**: GET
- **Description**: Lấy danh sách lịch hẹn của một người dùng
- **Parameters**:
  - `userId`: ID của người dùng
  - `status` (optional): Lọc theo trạng thái (UPCOMING, COMPLETED, CANCELLED)
- **Response**:
```json
[
  {
    "appointmentId": 5001,
    "counselorName": "Dr. Nguyễn Văn A",
    "serviceName": "Tư vấn cá nhân về phòng chống ma túy",
    "date": "2025-07-15",
    "startTime": "10:30:00",
    "endTime": "11:30:00",
    "status": "UPCOMING",
    "contactMethod": "ONLINE"
  },
  {
    "appointmentId": 4980,
    "counselorName": "Dr. Trần Thị B",
    "serviceName": "Tư vấn gia đình",
    "date": "2025-07-05",
    "startTime": "14:00:00",
    "endTime": "15:30:00",
    "status": "COMPLETED",
    "contactMethod": "IN_PERSON",
    "feedbackRating": 5,
    "feedbackComment": "Buổi tư vấn rất hữu ích và thông tin"
  },
  ...
]
```

## Cấu Trúc Mã Nguồn Backend

Dựa trên sơ đồ UML và các API endpoint, cấu trúc thư mục backend của dự án sẽ như sau:

```
src/
├── main/
│   ├── java/
│   │   └── com/
│   │       └── drugprevention/
│   │           ├── config/
│   │           │   ├── SecurityConfig.java
│   │           │   └── WebConfig.java
│   │           ├── controller/
│   │           │   ├── BaseController.java
│   │           │   ├── SurveyController.java
│   │           │   ├── CourseController.java
│   │           │   ├── AppointmentController.java
│   │           │   └── UserController.java
│   │           ├── dao/
│   │           │   ├── BaseDao.java
│   │           │   ├── SurveyDao.java
│   │           │   ├── CourseDao.java
│   │           │   ├── AppointmentDao.java
│   │           │   └── UserDao.java
│   │           ├── model/
│   │           │   ├── BaseBean.java
│   │           │   ├── Survey.java
│   │           │   ├── Question.java
│   │           │   ├── SurveyResponse.java
│   │           │   ├── Course.java
│   │           │   ├── Lesson.java
│   │           │   ├── Enrollment.java
│   │           │   ├── Quiz.java
│   │           │   ├── QuizAttempt.java
│   │           │   ├── CounselingService.java
│   │           │   ├── Counselor.java
│   │           │   ├── Appointment.java
│   │           │   └── User.java
│   │           ├── service/
│   │           │   ├── SurveyService.java
│   │           │   ├── CourseService.java
│   │           │   ├── AppointmentService.java
│   │           │   └── UserService.java
│   │           ├── util/
│   │           │   ├── MyUtils.java
│   │           │   └── RequestFilter.java
│   │           └── DrugPreventionApplication.java
│   └── resources/
│       ├── application.properties
│       └── data.sql
└── test/
    └── java/
        └── com/
            └── drugprevention/
                ├── controller/
                ├── service/
                └── dao/
```

## Mối Quan Hệ Giữa Các Lớp

Dựa trên sơ đồ UML được cung cấp:

1. **Controllers và DAOs**:
   - `BaseController` là lớp cha cho các controllers, cung cấp các chức năng chung
   - `ProductController` kế thừa từ `BaseController`
   - `ProductController` sử dụng `ProductDao` và `MyUtils`
   - `BaseDao` là lớp cha cho tất cả các DAOs
   - `ProductDao` và `UserDao` kế thừa từ `BaseDao`

2. **Models/Beans**:
   - `BaseBean` là lớp cha cho các models
   - `ProductBean` và `UserBean` kế thừa từ `BaseBean`
   - `ProductBean` được sử dụng bởi `ProductController` và `ProductDao`
   - `UserBean` được sử dụng bởi `UserDao` và `RequestFilter`

3. **Utilities**:
   - `MyUtils` cung cấp các tiện ích cho `ProductController`
   - `RequestFilter` tương tác với `UserBean`

## Kết Luận

Tài liệu này đã mô tả các API endpoints và cấu trúc backend cho ba chức năng chính của hệ thống: Survey (Khảo sát), Course (Khóa học) và Appointment (Đặt lịch hẹn). Các API được thiết kế dựa trên RESTful principles, với các endpoint rõ ràng cho từng chức năng, và dựa trên sơ đồ UML để đảm bảo tính nhất quán với kiến trúc hệ thống.
