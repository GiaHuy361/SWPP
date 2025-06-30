import apiClient from '../utils/axios';

class SurveyService {
  constructor() {
    this.API_URL = '/surveys';
  }

  async getAllSurveys() {
    return await apiClient.get(this.API_URL, { withCredentials: true });
  }

  async getSurveyById(surveyId) {
    if (!/^\d+$/.test(surveyId)) {
      throw new Error('Invalid surveyId: Must be a number');
    }
    return await apiClient.get(`${this.API_URL}/${surveyId}`, { withCredentials: true });
  }

  async createSurvey(surveyData) {
    return await apiClient.post(this.API_URL, surveyData, { withCredentials: true });
  }

  async updateSurvey(surveyId, surveyData) {
    if (!/^\d+$/.test(surveyId)) {
      throw new Error('Invalid surveyId: Must be a number');
    }
    return await apiClient.put(`${this.API_URL}/${surveyId}`, surveyData, { withCredentials: true });
  }

  async deleteSurvey(surveyId) {
    if (!/^\d+$/.test(surveyId)) {
      throw new Error('Invalid surveyId: Must be a number');
    }
    return await apiClient.delete(`${this.API_URL}/${surveyId}`, { withCredentials: true });
  }

  async getAllSurveyTypes() {
    return await apiClient.get(`${this.API_URL}/types`, { withCredentials: true });
  }

  async getSurveyTypeById(typeId) {
    if (!/^\d+$/.test(typeId)) {
      throw new Error('Invalid typeId: Must be a number');
    }
    return await apiClient.get(`${this.API_URL}/types/${typeId}`, { withCredentials: true });
  }

  async createSurveyType(typeData) {
    return await apiClient.post(`${this.API_URL}/types`, typeData, { withCredentials: true });
  }

  async updateSurveyType(typeId, typeData) {
    if (!/^\d+$/.test(typeId)) {
      throw new Error('Invalid typeId: Must be a number');
    }
    return await apiClient.put(`${this.API_URL}/types/${typeId}`, typeData, { withCredentials: true });
  }

  async deleteSurveyType(typeId) {
    if (!/^\d+$/.test(typeId)) {
      throw new Error('Invalid typeId: Must be a number');
    }
    return await apiClient.delete(`${this.API_URL}/types/${typeId}`, { withCredentials: true });
  }

  async getAllSurveyQuestions() {
    return await apiClient.get(`${this.API_URL}/questions`, { withCredentials: true });
  }

  async getSurveyQuestionById(questionId) {
    if (!/^\d+$/.test(questionId)) {
      throw new Error('Invalid questionId: Must be a number');
    }
    return await apiClient.get(`${this.API_URL}/questions/${questionId}`, { withCredentials: true });
  }

  async createSurveyQuestion(questionData) {
    return await apiClient.post(`${this.API_URL}/questions`, questionData, { withCredentials: true });
  }

  async updateSurveyQuestion(questionId, questionData) {
    if (!/^\d+$/.test(questionId)) {
      throw new Error('Invalid questionId: Must be a number');
    }
    return await apiClient.put(`${this.API_URL}/questions/${questionId}`, questionData, { withCredentials: true });
  }

  async deleteSurveyQuestion(questionId) {
    if (!/^\d+$/.test(questionId)) {
      throw new Error('Invalid questionId: Must be a number');
    }
    return await apiClient.delete(`${this.API_URL}/questions/${questionId}`, { withCredentials: true });
  }

  async getSurveyOptionById(optionId) {
    if (!/^\d+$/.test(optionId)) {
      throw new Error('Invalid optionId: Must be a number');
    }
    return await apiClient.get(`${this.API_URL}/options/${optionId}`, { withCredentials: true });
  }

  async submitSurveyResponse(responseData) {
    return await apiClient.post(`${this.API_URL}/responses`, responseData, { withCredentials: true });
  }

  async submitSurveyAndGetRecommendations(responseData) {
    return await apiClient.post(`${this.API_URL}/responses/submit-and-recommend`, responseData, { withCredentials: true });
  }

  async getUserResponsesAndAnalysis(surveyId = null) {
    return await apiClient.get(`${this.API_URL}/responses/user`, { params: { surveyId }, withCredentials: true });
  }

  async getSurveyResponseById(responseId) {
    if (!/^\d+$/.test(responseId)) {
      throw new Error('Invalid responseId: Must be a number');
    }
    return await apiClient.get(`${this.API_URL}/responses/${responseId}`, { withCredentials: true });
  }

  async getSurveyResult(responseId) {
    if (!/^\d+$/.test(responseId)) {
      throw new Error('Invalid responseId: Must be a number');
    }
    return await apiClient.get(`${this.API_URL}/responses/result/${responseId}`, { withCredentials: true });
  }

  async getSurveyAnswersByResponseId(responseId) {
    if (!/^\d+$/.test(responseId)) {
      throw new Error('Invalid responseId: Must be a number');
    }
    return await apiClient.get(`${this.API_URL}/answers`, { params: { responseId }, withCredentials: true });
  }

  async getUserSurveyResponse(surveyId) {
    if (surveyId && !/^\d+$/.test(surveyId)) {
      throw new Error('Invalid surveyId: Must be a number');
    }
    return await apiClient.get(`${this.API_URL}/responses/user`, { params: { surveyId }, withCredentials: true });
  }
}

const surveyService = new SurveyService();

export const getAllSurveys = surveyService.getAllSurveys.bind(surveyService);
export const getSurveyById = surveyService.getSurveyById.bind(surveyService);
export const createSurvey = surveyService.createSurvey.bind(surveyService);
export const updateSurvey = surveyService.updateSurvey.bind(surveyService);
export const deleteSurvey = surveyService.deleteSurvey.bind(surveyService);
export const getAllSurveyTypes = surveyService.getAllSurveyTypes.bind(surveyService);
export const getSurveyTypeById = surveyService.getSurveyTypeById.bind(surveyService);
export const createSurveyType = surveyService.createSurveyType.bind(surveyService);
export const updateSurveyType = surveyService.updateSurveyType.bind(surveyService);
export const deleteSurveyType = surveyService.deleteSurveyType.bind(surveyService);
export const getAllSurveyQuestions = surveyService.getAllSurveyQuestions.bind(surveyService);
export const getSurveyQuestionById = surveyService.getSurveyQuestionById.bind(surveyService);
export const createSurveyQuestion = surveyService.createSurveyQuestion.bind(surveyService);
export const updateSurveyQuestion = surveyService.updateSurveyQuestion.bind(surveyService);
export const deleteSurveyQuestion = surveyService.deleteSurveyQuestion.bind(surveyService);
export const getSurveyOptionById = surveyService.getSurveyOptionById.bind(surveyService);
export const submitSurveyResponse = surveyService.submitSurveyResponse.bind(surveyService);
export const submitSurveyAndGetRecommendations = surveyService.submitSurveyAndGetRecommendations.bind(surveyService);
export const getUserResponsesAndAnalysis = surveyService.getUserResponsesAndAnalysis.bind(surveyService);
export const getSurveyResponseById = surveyService.getSurveyResponseById.bind(surveyService);
export const getSurveyResult = surveyService.getSurveyResult.bind(surveyService);
export const getSurveyAnswersByResponseId = surveyService.getSurveyAnswersByResponseId.bind(surveyService);
export const getUserSurveyResponse = surveyService.getUserSurveyResponse.bind(surveyService);

export default surveyService;