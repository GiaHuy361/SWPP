import axios from '../utils/axios';

/**
 * Service class xử lý tất cả các thao tác liên quan đến khảo sát
 */
class SurveyService {
  constructor() {
    this.API_URL = '/surveys';
  }
  
  /**
   * Lấy tất cả khảo sát
   * @returns {Promise<Array>} Promise trả về danh sách khảo sát
   */
  async getAllSurveys() {
    try {
      const response = await axios.get(this.API_URL);
      return response;
    } catch (error) {
      console.error('Error fetching surveys:', error);
      // Trả về mock data nếu API call thất bại (chỉ để test UI)
      return {
        data: [
          {
            id: 1,
            title: 'Đánh giá mức độ hiểu biết về ma túy',
            description: 'Khảo sát này sẽ giúp đánh giá mức độ hiểu biết của bạn về tác hại của ma túy và các chất gây nghiện.',
            createdAt: new Date().toISOString(),
            questions: 10,
            estimatedTime: '5 phút'
          },
          {
            id: 2,
            title: 'Đánh giá nguy cơ tiếp xúc ma túy',
            description: 'Khảo sát này giúp xác định mức độ nguy cơ tiếp xúc với ma túy trong môi trường của bạn.',
            createdAt: new Date().toISOString(),
            questions: 12,
            estimatedTime: '7 phút'
          }
        ]
      };
    }
  }

  /**
   * Lấy chi tiết một khảo sát theo ID
   * @param {number|string} surveyId - ID của khảo sát
   * @returns {Promise<Object>} Promise trả về chi tiết khảo sát
   */
  async getSurveyById(surveyId) {
    try {
      const response = await axios.get(`${this.API_URL}/${surveyId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching survey ID ${surveyId}:`, error);
      throw error;
    }
  }

  /**
   * Gửi câu trả lời khảo sát
   * @param {number|string} surveyId - ID của khảo sát
   * @param {Object} answers - Đối tượng chứa câu trả lời
   * @returns {Promise<Object>} Promise trả về kết quả khảo sát
   */
  async submitSurveyResponse(surveyId, answers) {
    try {
      const response = await axios.post(
        `${this.API_URL}/${surveyId}/responses`, 
        { answers }
      );
      
      return response;
    } catch (error) {
      console.error('Error submitting survey response:', error);
      throw error;
    }
  }

  /**
   * Lấy kết quả và phân tích của người dùng
   * @returns {Promise<Object>} Promise trả về phân tích người dùng
   */
  async getUserResponsesAndAnalysis() {
    try {
      const response = await axios.get(`${this.API_URL}/user-analysis`);
      return response;
    } catch (error) {
      console.error('Error fetching user analysis:', error);
      throw error;
    }
  }
  
  /**
   * Lấy kết quả khảo sát mới nhất
   * @returns {Promise<Object>} Promise trả về kết quả mới nhất
   */
  async getLatestResult() {
    try {
      const response = await axios.get(`${this.API_URL}/results/latest`);
      return response;
    } catch (error) {
      console.error('Error fetching latest result:', error);
      throw error;
    }
  }
}

// Tạo instance và export các phương thức
const surveyService = new SurveyService();

export const getAllSurveys = surveyService.getAllSurveys.bind(surveyService);
export const getSurveyById = surveyService.getSurveyById.bind(surveyService);
export const submitSurveyResponse = surveyService.submitSurveyResponse.bind(surveyService);
export const getUserResponsesAndAnalysis = surveyService.getUserResponsesAndAnalysis.bind(surveyService);
export const getLatestResult = surveyService.getLatestResult.bind(surveyService);

export default surveyService;