# Class Diagram cho Chức Năng Survey trong Hệ thống

## Tổng quan

Class Diagram này mô tả cấu trúc của chức năng Survey (Khảo sát) trong hệ thống Phòng Chống Ma Túy, bao gồm các lớp chính, mối quan hệ giữa chúng, và cách thức backend xử lý khảo sát.

## Class Diagram cho Survey

```
+---------------------+        +----------------------+        +----------------------+
|   SurveyController  |        |    SurveyService    |        |      SurveyDao       |
+---------------------+        +----------------------+        +----------------------+
| - surveyService     |------->| - surveyDao         |------->| - baseDao            |
+---------------------+        | - userService       |        +----------------------+
| + getSurveys()      |        +----------------------+        | + findAll()          |
| + getSurvey(id)     |        | + getSurveys()       |        | + findById(id)       |
| + submitResponse()  |        | + getSurveyById(id)  |        | + save(survey)       |
| + getResults()      |        | + submitResponse()   |        | + update(survey)     |
+---------------------+        | + getResults()       |        | + delete(id)         |
                               +----------------------+        +----------------------+
                                          |                             |
                                          |                             |
                                          v                             v
+---------------------+        +----------------------+        +----------------------+
|       Survey        |        |       Question       |        |    SurveyResponse    |
+---------------------+        +----------------------+        +----------------------+
| - id: Long          |        | - id: Long           |        | - id: Long           |
| - title: String     |<>----->| - surveyId: Long     |        | - surveyId: Long     |
| - description: String|       | - text: String       |        | - userId: Long       |
| - startDate: Date   |        | - type: QuestionType |<>----->| - answers: List      |
| - endDate: Date     |        | - required: Boolean  |        | - submissionDate: Date|
| - status: Status    |        | - options: List      |        | - status: Status     |
| - questions: List   |        +----------------------+        +----------------------+
+---------------------+                  |                             |
                                         |                             |
                                         v                             v
                               +----------------------+        +----------------------+
                               |        Option        |        |        Answer        |
                               +----------------------+        +----------------------+
                               | - id: Long           |        | - id: Long           |
                               | - questionId: Long   |        | - responseId: Long   |
                               | - text: String       |        | - questionId: Long   |
                               +----------------------+        | - optionIds: List    |
                                                              | - textAnswer: String  |
                                                              +----------------------+
```

## Giải thích các lớp

### Controller Layer

**SurveyController**
- Kế thừa từ `BaseController`
- Chịu trách nhiệm xử lý các HTTP requests liên quan đến khảo sát
- Phương thức:
  - `getSurveys()`: Lấy danh sách khảo sát (GET `/api/surveys`)
  - `getSurvey(id)`: Lấy chi tiết khảo sát (GET `/api/surveys/{surveyId}`)
  - `submitResponse()`: Gửi câu trả lời khảo sát (POST `/api/surveys/{surveyId}/submit`)
  - `getResults()`: Lấy kết quả khảo sát (GET `/api/surveys/{surveyId}/results`)

### Service Layer

**SurveyService**
- Xử lý business logic của chức năng khảo sát
- Phụ thuộc vào `SurveyDao` để truy cập dữ liệu
- Phụ thuộc vào `UserService` để xác thực người dùng
- Phương thức:
  - `getSurveys()`: Lấy danh sách khảo sát, áp dụng phân trang và lọc
  - `getSurveyById(id)`: Lấy chi tiết khảo sát theo ID
  - `submitResponse()`: Xử lý và lưu trữ câu trả lời khảo sát từ người dùng
  - `getResults()`: Tính toán và trả về kết quả thống kê của khảo sát

### Data Access Layer

**SurveyDao**
- Kế thừa từ `BaseDao`
- Chịu trách nhiệm truy xuất dữ liệu khảo sát từ cơ sở dữ liệu
- Phương thức:
  - `findAll()`: Truy vấn tất cả khảo sát
  - `findById(id)`: Truy vấn khảo sát theo ID
  - `save(survey)`: Lưu khảo sát mới
  - `update(survey)`: Cập nhật khảo sát
  - `delete(id)`: Xóa khảo sát

### Model Layer

**Survey**
- Kế thừa từ `BaseBean`
- Đại diện cho một khảo sát trong hệ thống
- Thuộc tính:
  - `id`: ID của khảo sát
  - `title`: Tiêu đề khảo sát
  - `description`: Mô tả khảo sát
  - `startDate`: Ngày bắt đầu
  - `endDate`: Ngày kết thúc
  - `status`: Trạng thái (OPEN, CLOSED, DRAFT)
  - `questions`: Danh sách câu hỏi

**Question**
- Đại diện cho một câu hỏi trong khảo sát
- Thuộc tính:
  - `id`: ID của câu hỏi
  - `surveyId`: ID của khảo sát chứa câu hỏi
  - `text`: Nội dung câu hỏi
  - `type`: Loại câu hỏi (TEXT, MULTIPLE_CHOICE, CHECKBOX, RATING)
  - `required`: Yêu cầu trả lời hay không
  - `options`: Danh sách lựa chọn (cho câu hỏi trắc nghiệm)

**Option**
- Đại diện cho một lựa chọn trong câu hỏi trắc nghiệm
- Thuộc tính:
  - `id`: ID của lựa chọn
  - `questionId`: ID của câu hỏi chứa lựa chọn
  - `text`: Nội dung lựa chọn

**SurveyResponse**
- Đại diện cho một phản hồi khảo sát từ người dùng
- Thuộc tính:
  - `id`: ID của phản hồi
  - `surveyId`: ID của khảo sát
  - `userId`: ID của người dùng
  - `answers`: Danh sách câu trả lời
  - `submissionDate`: Thời gian nộp
  - `status`: Trạng thái (COMPLETED, PARTIAL)

**Answer**
- Đại diện cho một câu trả lời trong phản hồi khảo sát
- Thuộc tính:
  - `id`: ID của câu trả lời
  - `responseId`: ID của phản hồi khảo sát
  - `questionId`: ID của câu hỏi
  - `optionIds`: Danh sách ID lựa chọn (cho câu hỏi trắc nghiệm)
  - `textAnswer`: Câu trả lời văn bản (cho câu hỏi tự luận)

## Mối quan hệ giữa các lớp

- **SurveyController** sử dụng **SurveyService** để xử lý business logic
- **SurveyService** sử dụng **SurveyDao** để truy xuất dữ liệu
- **Survey** có quan hệ composition với **Question** (một khảo sát chứa nhiều câu hỏi)
- **Question** có quan hệ composition với **Option** (một câu hỏi có thể có nhiều lựa chọn)
- **SurveyResponse** có quan hệ composition với **Answer** (một phản hồi khảo sát chứa nhiều câu trả lời)
- **Answer** có liên kết với **Question** (mỗi câu trả lời tương ứng với một câu hỏi)

## Luồng xử lý dữ liệu

### 1. Tạo và quản lý khảo sát (dành cho Admin)

```
Client -> SurveyController.createSurvey() -> SurveyService.createSurvey() -> SurveyDao.save() -> Database
```

### 2. Lấy danh sách khảo sát

```
Client -> SurveyController.getSurveys() -> SurveyService.getSurveys() -> SurveyDao.findAll() -> Database -> Client
```

### 3. Lấy chi tiết khảo sát

```
Client -> SurveyController.getSurvey(id) -> SurveyService.getSurveyById(id) -> SurveyDao.findById(id) -> Database -> Client
```

### 4. Gửi câu trả lời khảo sát

```
Client -> SurveyController.submitResponse() -> SurveyService.submitResponse() -> 
    -> Validate User (UserService)
    -> Validate Survey & Questions
    -> Create SurveyResponse & Answers
    -> SurveyDao.saveResponse() -> Database -> Client
```

### 5. Lấy kết quả khảo sát

```
Client -> SurveyController.getResults() -> SurveyService.getResults() -> 
    -> SurveyDao.findById(id) -> Get Survey
    -> SurveyDao.getResponsesBySurveyId(id) -> Get All Responses
    -> Calculate Statistics
    -> Format Results -> Client
```

## Cách Backend Thực Hiện Chức Năng Survey

### 1. Định nghĩa Schema trong cơ sở dữ liệu

Backend sử dụng Hibernate/JPA để ánh xạ các lớp Java vào các bảng trong cơ sở dữ liệu:

- Bảng `surveys`: Lưu trữ thông tin khảo sát
- Bảng `questions`: Lưu trữ câu hỏi, liên kết với bảng surveys
- Bảng `options`: Lưu trữ các lựa chọn, liên kết với bảng questions
- Bảng `survey_responses`: Lưu trữ phản hồi khảo sát, liên kết với bảng surveys và users
- Bảng `answers`: Lưu trữ câu trả lời, liên kết với bảng survey_responses và questions

### 2. Annotations trong JPA

Backend sử dụng JPA annotations để định nghĩa các entity và mối quan hệ:

```java
@Entity
@Table(name = "surveys")
public class Survey extends BaseBean {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String description;
    
    @Temporal(TemporalType.DATE)
    private Date startDate;
    
    @Temporal(TemporalType.DATE)
    private Date endDate;
    
    @Enumerated(EnumType.STRING)
    private SurveyStatus status;
    
    @OneToMany(mappedBy = "survey", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Question> questions;
    
    // Getters and setters
}

@Entity
@Table(name = "questions")
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "survey_id")
    private Survey survey;
    
    private String text;
    
    @Enumerated(EnumType.STRING)
    private QuestionType type;
    
    private boolean required;
    
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Option> options;
    
    // Getters and setters
}
```

### 3. Data Access Layer

Backend sử dụng Spring Data JPA để triển khai các repository cho việc truy xuất dữ liệu:

```java
public interface SurveyRepository extends JpaRepository<Survey, Long> {
    List<Survey> findByStatus(SurveyStatus status);
    List<Survey> findByStartDateBeforeAndEndDateAfter(Date now, Date now2);
}

public interface SurveyResponseRepository extends JpaRepository<SurveyResponse, Long> {
    List<SurveyResponse> findBySurveyId(Long surveyId);
    List<SurveyResponse> findByUserId(Long userId);
}
```

### 4. Business Logic trong Service Layer

Backend xử lý business logic trong các service:

```java
@Service
public class SurveyServiceImpl implements SurveyService {
    
    @Autowired
    private SurveyRepository surveyRepository;
    
    @Autowired
    private SurveyResponseRepository responseRepository;
    
    @Autowired
    private UserService userService;
    
    @Override
    public Page<Survey> getSurveys(Pageable pageable, SurveyStatus status) {
        if (status != null) {
            return surveyRepository.findByStatus(status, pageable);
        }
        return surveyRepository.findAll(pageable);
    }
    
    @Override
    public Survey getSurveyById(Long id) {
        return surveyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Survey not found with id " + id));
    }
    
    @Override
    @Transactional
    public SurveyResponse submitResponse(Long surveyId, SurveyResponseDTO responseDTO) {
        // Validate survey exists
        Survey survey = getSurveyById(surveyId);
        
        // Validate survey is open
        if (survey.getStatus() != SurveyStatus.OPEN) {
            throw new BadRequestException("Survey is not open for responses");
        }
        
        // Validate user exists
        userService.getUserById(responseDTO.getUserId());
        
        // Create survey response
        SurveyResponse response = new SurveyResponse();
        response.setSurvey(survey);
        response.setUserId(responseDTO.getUserId());
        response.setSubmissionDate(new Date());
        response.setStatus(SurveyResponseStatus.COMPLETED);
        
        // Process answers
        List<Answer> answers = processAnswers(responseDTO.getAnswers(), survey.getQuestions());
        response.setAnswers(answers);
        
        // Save response
        return responseRepository.save(response);
    }
    
    @Override
    public SurveyResultDTO getResults(Long surveyId) {
        // Get survey
        Survey survey = getSurveyById(surveyId);
        
        // Get all responses for the survey
        List<SurveyResponse> responses = responseRepository.findBySurveyId(surveyId);
        
        // Calculate statistics
        SurveyResultDTO result = new SurveyResultDTO();
        result.setSurveyId(surveyId);
        result.setTitle(survey.getTitle());
        result.setTotalResponses(responses.size());
        
        // Calculate completion rate and question results
        double completedCount = responses.stream()
            .filter(r -> r.getStatus() == SurveyResponseStatus.COMPLETED)
            .count();
        
        result.setCompletionRate((responses.size() > 0) ? 
            (completedCount / responses.size()) * 100 : 0);
        
        result.setQuestionResults(calculateQuestionResults(survey.getQuestions(), responses));
        
        return result;
    }
    
    // Helper methods for processing answers and calculating results
    // ...
}
```

### 5. Presentation Layer (Controller)

Backend xử lý HTTP requests trong controller:

```java
@RestController
@RequestMapping("/api/surveys")
public class SurveyController extends BaseController {
    
    @Autowired
    private SurveyService surveyService;
    
    @GetMapping
    public ResponseEntity<?> getSurveys(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) SurveyStatus status) {
        
        Pageable pageable = PageRequest.of(
            (page != null) ? page : 0, 
            (size != null) ? size : 10
        );
        
        Page<Survey> surveys = surveyService.getSurveys(pageable, status);
        return ResponseEntity.ok(surveys);
    }
    
    @GetMapping("/{surveyId}")
    public ResponseEntity<?> getSurvey(@PathVariable Long surveyId) {
        Survey survey = surveyService.getSurveyById(surveyId);
        return ResponseEntity.ok(survey);
    }
    
    @PostMapping("/{surveyId}/submit")
    public ResponseEntity<?> submitResponse(
            @PathVariable Long surveyId,
            @RequestBody SurveyResponseDTO responseDTO) {
        
        SurveyResponse response = surveyService.submitResponse(surveyId, responseDTO);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{surveyId}/results")
    public ResponseEntity<?> getResults(@PathVariable Long surveyId) {
        SurveyResultDTO results = surveyService.getResults(surveyId);
        return ResponseEntity.ok(results);
    }
}
```

### 6. Spring Boot Configuration

Backend sử dụng Spring Boot để cấu hình và khởi chạy ứng dụng:

```java
@SpringBootApplication
public class DrugPreventionApplication {
    public static void main(String[] args) {
        SpringApplication.run(DrugPreventionApplication.class, args);
    }
}
```

## Kết luận

Cấu trúc backend cho chức năng Survey được thiết kế theo mô hình phân lớp Controller-Service-Repository, sử dụng Spring Boot và JPA/Hibernate. Các entity được liên kết với nhau qua các mối quan hệ phù hợp để đảm bảo tính toàn vẹn dữ liệu và hiệu suất truy vấn. Backend cung cấp API RESTful để tương tác với frontend, cho phép người dùng xem, tham gia khảo sát và admin có thể quản lý khảo sát và xem kết quả.
