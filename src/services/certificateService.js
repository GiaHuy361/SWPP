import axios from '../utils/axios';

export const getCertificateByEnrollmentId = (enrollmentId) =>
  axios.get(`/enrollments/${enrollmentId}/certificates`);
