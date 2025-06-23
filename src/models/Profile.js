/**
 * Lớp đại diện cho hồ sơ người dùng (Model Class)
 * Thiết kế theo nguyên tắc OOP với thuộc tính private, getter/setter
 */
class Profile {
  constructor(data = {}) {
    this._profileId = data.profileId || null;
    this._userId = data.userId || null;
    this._username = data.username || '';
    this._fullName = data.fullName || '';
    this._email = data.email || '';
    this._phoneNumber = data.phoneNumber || '';
    this._dateOfBirth = data.dateOfBirth || '';
    this._gender = data.gender || 'Nam';
    this._address = data.address || '';
    this._bio = data.bio || '';
    this._avatar = data.avatar || null;
    
    // Thông tin khảo sát
    this._lastSurveyId = data.lastSurveyId || null;
    this._lastSurveyDate = data.lastSurveyDate || null;
    this._lastSurveyScore = data.lastSurveyScore || null;
    this._lastSurveyRiskLevel = data.lastSurveyRiskLevel || null;
    this._surveyHistory = data.surveyHistory || []; // Lịch sử làm khảo sát
  }

  // Getters và setters cho ID
  get profileId() { return this._profileId; }
  set profileId(value) { this._profileId = value; }

  get userId() { return this._userId; }
  set userId(value) { this._userId = value; }

  // Getters và setters cho thông tin cá nhân
  get username() { return this._username; }
  set username(value) { this._username = value; }

  get fullName() { return this._fullName; }
  set fullName(value) { this._fullName = value; }

  get email() { return this._email; }
  set email(value) { this._email = value; }

  get phoneNumber() { return this._phoneNumber; }
  set phoneNumber(value) { this._phoneNumber = value; }

  get dateOfBirth() { return this._dateOfBirth; }
  set dateOfBirth(value) { this._dateOfBirth = value; }

  get gender() { return this._gender; }
  set gender(value) { this._gender = value; }

  get address() { return this._address; }
  set address(value) { this._address = value; }

  get bio() { return this._bio; }
  set bio(value) { this._bio = value; }

  get avatar() { return this._avatar; }
  set avatar(value) { this._avatar = value; }

  // Getters và setters cho thông tin khảo sát
  get lastSurveyId() { return this._lastSurveyId; }
  set lastSurveyId(value) { this._lastSurveyId = value; }

  get lastSurveyDate() { return this._lastSurveyDate; }
  set lastSurveyDate(value) { this._lastSurveyDate = value; }

  get lastSurveyScore() { return this._lastSurveyScore; }
  set lastSurveyScore(value) { this._lastSurveyScore = value; }

  get lastSurveyRiskLevel() { return this._lastSurveyRiskLevel; }
  set lastSurveyRiskLevel(value) { this._lastSurveyRiskLevel = value; }

  get surveyHistory() { return this._surveyHistory; }
  set surveyHistory(value) { this._surveyHistory = value; }

  /**
   * Kiểm tra người dùng đã từng làm khảo sát chưa
   * @returns {boolean} true nếu đã từng làm khảo sát
   */
  hasTakenSurvey() {
    return this._lastSurveyId !== null;
  }

  /**
   * Định dạng ngày khảo sát gần nhất
   * @returns {string} Ngày được định dạng hoặc "Chưa có"
   */
  getFormattedLastSurveyDate() {
    if (!this._lastSurveyDate) return "Chưa có";
    try {
      return new Date(this._lastSurveyDate).toLocaleDateString('vi-VN');
    } catch (e) {
      return "Định dạng không hợp lệ";
    }
  }

  /**
   * Lấy trạng thái khảo sát của người dùng
   * @returns {object} Đối tượng chứa thông tin trạng thái khảo sát
   */
  getSurveyStatus() {
    if (!this.hasTakenSurvey()) {
      return {
        taken: false,
        message: "Bạn chưa làm khảo sát nào. Vui lòng làm khảo sát để biết được sự hiểu biết về phòng chống ma túy của bản thân.",
        buttonText: "Làm khảo sát ngay"
      };
    }

    let riskMessage = "";
    let riskClass = "";

    switch(this._lastSurveyRiskLevel) {
      case "Cao":
        riskMessage = "Mức độ nguy cơ cao. Bạn nên tham khảo ý kiến chuyên gia.";
        riskClass = "text-red-600";
        break;
      case "Trung bình":
        riskMessage = "Mức độ nguy cơ trung bình. Hãy chú ý đến các thói quen của bạn.";
        riskClass = "text-yellow-600";
        break;
      case "Thấp":
        riskMessage = "Mức độ nguy cơ thấp. Hãy tiếp tục duy trì lối sống lành mạnh.";
        riskClass = "text-green-600";
        break;
      default:
        riskMessage = "Chưa có đánh giá mức độ nguy cơ.";
        riskClass = "text-gray-600";
    }

    return {
      taken: true,
      date: this.getFormattedLastSurveyDate(),
      score: this._lastSurveyScore || "Chưa có",
      riskLevel: this._lastSurveyRiskLevel || "Chưa đánh giá",
      message: riskMessage,
      riskClass: riskClass,
      buttonText: "Làm lại khảo sát"
    };
  }

  /**
   * Chuyển đối tượng Profile thành dạng JSON để gửi API
   * @returns {Object} Object JSON đại diện cho profile
   */
  toJSON() {
    return {
      profileId: this._profileId,
      userId: this._userId,
      username: this._username,
      fullName: this._fullName,
      email: this._email,
      phoneNumber: this._phoneNumber,
      dateOfBirth: this._dateOfBirth,
      gender: this._gender,
      address: this._address,
      bio: this._bio,
      avatar: this._avatar,
      lastSurveyId: this._lastSurveyId,
      lastSurveyDate: this._lastSurveyDate,
      lastSurveyScore: this._lastSurveyScore,
      lastSurveyRiskLevel: this._lastSurveyRiskLevel,
      surveyHistory: this._surveyHistory
    };
  }
  
  /**
   * Phương thức tĩnh để tạo đối tượng Profile từ dữ liệu API
   * @param {Object} data Dữ liệu từ API
   * @returns {Profile} Đối tượng Profile mới
   */
  static fromJSON(data) {
    return new Profile(data);
  }
}

export default Profile;

// Thay vì import trực tiếp
import HeavyComponent from './HeavyComponent';

// Sử dụng dynamic import
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));