import apiClient from '../utils/axios';

class SurveyService {
  constructor() {
    this.API_URL = '/surveys';
  }

  async getAllSurveys() {
    return await apiClient.get(this.API_URL, { withCredentials: true });
  }

  async getSurveyById(surveyId) {
    return await apiClient.get(`${this.API_URL}/${surveyId}`, { withCredentials: true });
  }

  async submitSurveyResponse(responseData) {
    return await apiClient.post(`${this.API_URL}/responses`, responseData, { withCredentials: true });
  }

  async getUserResponsesAndAnalysis(surveyId = null) {
    return await apiClient.get(`${this.API_URL}/responses/user`, { params: { surveyId }, withCredentials: true });
  }

  async getSurveyResponseById(responseId) {
    return await apiClient.get(`${this.API_URL}/responses/${responseId}`, { withCredentials: true });
  }

  async getSurveyResult(responseId) {
    return await apiClient.get(`${this.API_URL}/responses/result/${responseId}`, { withCredentials: true });
  }

  async getSurveyAnswersByResponseId(responseId) {
    return await apiClient.get(`${this.API_URL}/answers`, { params: { responseId }, withCredentials: true });
  }

  async getUserSurveyResponse(surveyId) {
    return await apiClient.get(`${this.API_URL}/responses/user`, { params: { surveyId }, withCredentials: true });
  }
}

const surveyService = new SurveyService();

export const getAllSurveys = surveyService.getAllSurveys.bind(surveyService);
export const getSurveyById = surveyService.getSurveyById.bind(surveyService);
export const submitSurveyResponse = surveyService.submitSurveyResponse.bind(surveyService);
export const getUserResponsesAndAnalysis = surveyService.getUserResponsesAndAnalysis.bind(surveyService);
export const getSurveyResponseById = surveyService.getSurveyResponseById.bind(surveyService);
export const getSurveyResult = surveyService.getSurveyResult.bind(surveyService);
export const getSurveyAnswersByResponseId = surveyService.getSurveyAnswersByResponseId.bind(surveyService);
export const getUserSurveyResponse = surveyService.getUserSurveyResponse.bind(surveyService);

export default surveyService;