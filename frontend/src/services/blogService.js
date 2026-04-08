import { api } from '../config/api';

const blogService = {
  // Get all published blog posts with filters
  getAllPosts: async (params = {}) => {
    try {
      const { category, page = 1, limit = 10, search } = params;
      const queryParams = new URLSearchParams();

      if (category) queryParams.append('category', category);
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      if (search) queryParams.append('search', search);

      const response = await api.get(`/blog?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      throw error;
    }
  },

  // Get recent blog posts for homepage
  getRecentPosts: async (limit = 3) => {
    try {
      const response = await api.get(`/blog/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent posts:', error);
      throw error;
    }
  },

  // Get single blog post by slug
  getPostBySlug: async (slug, language = 'en') => {
    try {
      const response = await api.get(`/blog/${slug}?lang=${language}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching blog post:', error);
      throw error;
    }
  },

  // Get all categories
  getCategories: async () => {
    try {
      const response = await api.get('/blog/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get category by slug
  getCategoryBySlug: async (slug) => {
    try {
      const response = await api.get(`/blog/categories/${slug}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  // Like/unlike a blog post (requires authentication)
  toggleLike: async (postId) => {
    try {
      const response = await api.post(`/blog/${postId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  },

  // Get user's like status for a post (requires authentication)
  getLikeStatus: async (postId) => {
    try {
      const response = await api.get(`/blog/${postId}/like-status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching like status:', error);
      throw error;
    }
  },

  // Rate a blog post (requires authentication)
  ratePost: async (postId, rating) => {
    try {
      const response = await api.post(`/blog/${postId}/rate`, { rating });
      return response.data;
    } catch (error) {
      console.error('Error rating post:', error);
      throw error;
    }
  },

  // Get user's rating for a post (requires authentication)
  getUserRating: async (postId) => {
    try {
      const response = await api.get(`/blog/${postId}/rating`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user rating:', error);
      throw error;
    }
  },

  // Get comments for a post
  getComments: async (postId) => {
    try {
      const response = await api.get(`/blog/${postId}/comments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  // Add a comment (requires authentication)
  addComment: async (postId, content, parentCommentId = null) => {
    try {
      const response = await api.post(`/blog/${postId}/comments`, {
        content,
        parent_comment_id: parentCommentId
      });
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }
};

export default blogService;
