import apiClient from "../utils/axios";

const BlogService = {
  getPublishedPosts: async (page = 0, size = 6) => {
    try {
      const response = await apiClient.get(`/api/blogposts/published?page=${page}&size=${size}`, {
        headers: { Authorization: undefined }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllPosts: async (page = 0, size = 10) => {
    try {
      const response = await apiClient.get(`/api/blogposts/all?page=${page}&size=${size}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPostBySlug: async (slug) => {
    try {
      const response = await apiClient.get(`/api/blogposts/${slug}`, {
        headers: { Authorization: undefined }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPostById: async (id) => {
    try {
      const response = await apiClient.get(`/api/blogposts/id/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCommentsByPost: async (postId) => {
    try {
      const response = await apiClient.get(`/api/blogposts/${postId}/comments`, {
        headers: { Authorization: undefined }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addComment: async (postId, content, parentId = null) => {
    try {
      const response = await apiClient.post(`/api/blogposts/${postId}/comments`, { content, parentId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addBookmark: async (postId) => {
    try {
      const response = await apiClient.post(`/api/bookmarks/${postId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  removeBookmark: async (postId) => {
    try {
      await apiClient.delete(`/api/bookmarks/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (error) {
      throw error;
    }
  },

  addReaction: async (postId, type) => {
    try {
      const response = await apiClient.post(`/api/posts/${postId}/reactions`, { type }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  removeReaction: async (postId) => {
    try {
      await apiClient.delete(`/api/posts/${postId}/reactions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (error) {
      throw error;
    }
  },

  getUserReaction: async (postId) => {
    try {
      const response = await apiClient.get(`/api/posts/${postId}/reactions/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getReactionCounts: async (postId) => {
    try {
      const response = await apiClient.get(`/api/posts/${postId}/reactions/counts`, {
        headers: { Authorization: undefined }
      });
      return response.data;
    } catch (error) {
      return { LIKE: 0, LOVE: 0, APPLAUSE: 0 };
    }
  },

  createPost: async (postData) => {
    try {
      const response = await apiClient.post(`/api/blogposts`, postData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updatePost: async (id, postData) => {
    try {
      const response = await apiClient.put(`/api/blogposts/${id}`, postData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deletePost: async (id) => {
    try {
      await apiClient.delete(`/api/blogposts/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (error) {
      throw error;
    }
  },

  publishPost: async (id) => {
    try {
      const response = await apiClient.post(`/api/blogposts/${id}/publish`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCategories: async () => {
    try {
      const response = await apiClient.get(`/api/categories`, {
        headers: { Authorization: undefined }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createCategory: async (categoryData) => {
    try {
      const response = await apiClient.post(`/api/categories`, categoryData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCategoryBySlug: async (slug) => {
    try {
      const response = await apiClient.get(`/api/categories/${slug}`, {
        headers: { Authorization: undefined }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  recordView: async (postId) => {
    try {
      const response = await apiClient.post(`/api/posts/${postId}/views`, {}, {
        headers: { Authorization: undefined }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getViewCount: async (postId) => {
    try {
      const response = await apiClient.get(`/api/posts/${postId}/views/count`, {
        headers: { Authorization: undefined }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default BlogService;