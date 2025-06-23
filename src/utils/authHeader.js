// New file to centralize authentication header logic
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  
  if (token) {
    console.log('Getting auth header with token:', token.substring(0, 15) + '...');
    return { 'Authorization': `Bearer ${token}` };
  } else {
    console.warn('No token found in localStorage when calling getAuthHeader()');
    return {};
  }
};

export default getAuthHeader;