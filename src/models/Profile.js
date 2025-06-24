class Profile {
  constructor(data = {}) {
    this._profileId = data.profileId || null;
    this._userId = data.userId || null;
    this._username = data.username || '';
    this._fullName = data.fullName || '';
    this._email = data.email || '';
    this._phone = data.phone || '';
    this._dateOfBirth = data.dateOfBirth || '';
    this._gender = data.gender || '';
    
    this._lastSurveyDate = data.lastSurveyDate || null;
    this._lastSurveyScore = data.lastSurveyScore || null;
    this._lastSurveyRiskLevel = data.lastSurveyRiskLevel || null;
  }

  get profileId() { return this._profileId; }
  set profileId(value) { this._profileId = value; }

  get userId() { return this._userId; }
  set userId(value) { this._userId = value; }

  get username() { return this._username; }
  set username(value) { this._username = value; }

  get fullName() { return this._fullName; }
  set fullName(value) { this._fullName = value; }

  get email() { return this._email; }
  set email(value) { this._email = value; }

  get phone() { return this._phone; }
  set phone(value) { this._phone = value; }

  get dateOfBirth() { return this._dateOfBirth; }
  set dateOfBirth(value) { this._dateOfBirth = value; }

  get gender() { return this._gender; }
  set gender(value) { this._gender = value; }

  get lastSurveyDate() { return this._lastSurveyDate; }
  set lastSurveyDate(value) { this._lastSurveyDate = value; }

  get lastSurveyScore() { return this._lastSurveyScore; }
  set lastSurveyScore(value) { this._lastSurveyScore = value; }

  get lastSurveyRiskLevel() { return this._lastSurveyRiskLevel; }
  set lastSurveyRiskLevel(value) { this._lastSurveyRiskLevel = value; }

  hasTakenSurvey() {
    return this._lastSurveyDate !== null;
  }

  getFormattedLastSurveyDate() {
    if (!this._lastSurveyDate) return "Chưa có";
    try {
      return new Date(this._lastSurveyDate).toLocaleDateString('vi-VN');
    } catch (e) {
      return "Định dạng không hợp lệ";
    }
  }

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

  toJSON() {
    return {
      profileId: this._profileId,
      userId: this._userId,
      username: this._username,
      fullName: this._fullName,
      email: this._email,
      phone: this._phone,
      dateOfBirth: this._dateOfBirth,
      gender: this._gender,
      lastSurveyDate: this._lastSurveyDate,
      lastSurveyScore: this._lastSurveyScore,
      lastSurveyRiskLevel: this._lastSurveyRiskLevel
    };
  }
  
  static fromJSON(data) {
    return new Profile(data);
  }
}

export default Profile;