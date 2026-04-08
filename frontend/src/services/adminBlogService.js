import api from '../config/api';

/**
 * Admin Blog Service
 * Handles all admin blog management API calls
 */

const adminBlogService = {
  // ============================================
  // BLOG POST MANAGEMENT
  // ============================================

  /**
   * Get all blog posts (admin view - includes drafts)
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by status: 'published', 'draft', or undefined for all
   * @param {string} params.category - Filter by category slug
   * @param {string} params.search - Search query
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 20)
   * @returns {Promise} { posts, total, page, totalPages }
   */
  getAllPosts: async (params = {}) => {
    const { status, category, search, page = 1, limit = 20 } = params;
    const queryParams = new URLSearchParams();

    if (status) queryParams.append('status', status);
    if (category) queryParams.append('category', category);
    if (search) queryParams.append('search', search);
    queryParams.append('page', page);
    queryParams.append('limit', limit);

    const response = await api.get(`/admin/blog?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Get a single blog post by ID (admin)
   * @param {number} id - Post ID
   * @returns {Promise} Post object with full details including category_ids
   */
  getPostById: async (id) => {
    const response = await api.get(`/admin/blog/${id}`);
    return response.data;
  },

  /**
   * Create a new blog post
   * @param {Object} postData - Post data
   * @param {string} postData.title - Post title (required)
   * @param {string} postData.slug - URL-friendly slug (required)
   * @param {string} postData.excerpt - Short summary
   * @param {string} postData.content - Full HTML content (required)
   * @param {string} postData.featured_image_url - Featured image URL
   * @param {string} postData.thumbnail_image - Thumbnail image URL
   * @param {boolean} postData.is_published - Publish status (default: false)
   * @param {boolean} postData.is_featured - Featured status (default: false)
   * @param {string} postData.moderation_status - Moderation status
   * @param {string} postData.published_at - Publish date
   * @param {number} postData.reading_time - Reading time in minutes
   * @param {string} postData.meta_title - SEO meta title
   * @param {string} postData.meta_description - SEO meta description
   * @param {number[]} postData.category_ids - Array of category IDs
   * @returns {Promise} { message, post }
   */
  createPost: async (postData) => {
    const response = await api.post('/admin/blog', postData);
    return response.data;
  },

  /**
   * Update an existing blog post
   * @param {number} id - Post ID
   * @param {Object} postData - Updated post data (same fields as createPost)
   * @returns {Promise} { message, post }
   */
  updatePost: async (id, postData) => {
    const response = await api.put(`/admin/blog/${id}`, postData);
    return response.data;
  },

  /**
   * Delete a blog post
   * @param {number} id - Post ID
   * @returns {Promise} { message }
   */
  deletePost: async (id) => {
    const response = await api.delete(`/admin/blog/${id}`);
    return response.data;
  },

  // ============================================
  // COMMENT MODERATION
  // ============================================

  /**
   * Get all pending comments awaiting moderation
   * @returns {Promise} Array of pending comments with user and post info
   */
  getPendingComments: async () => {
    const response = await api.get('/admin/blog/comments/pending');
    return response.data;
  },

  /**
   * Approve a comment
   * @param {number} commentId - Comment ID
   * @returns {Promise} { message, comment }
   */
  approveComment: async (commentId) => {
    const response = await api.put(`/admin/blog/comments/${commentId}/approve`);
    return response.data;
  },

  /**
   * Delete a comment
   * @param {number} commentId - Comment ID
   * @returns {Promise} { message }
   */
  deleteComment: async (commentId) => {
    const response = await api.delete(`/admin/blog/comments/${commentId}`);
    return response.data;
  },

  // ============================================
  // BLOG STATISTICS
  // ============================================

  /**
   * Get blog statistics
   * @returns {Promise} {
   *   published_count,
   *   draft_count,
   *   total_views,
   *   total_likes,
   *   total_comments,
   *   overall_avg_rating,
   *   pending_comments
   * }
   */
  getBlogStats: async () => {
    const response = await api.get('/admin/blog/stats');
    return response.data;
  },

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  /**
   * Generate URL-friendly slug from title
   * @param {string} title - Post title
   * @returns {string} URL-friendly slug
   */
  generateSlug: (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/-+/g, '-');     // Replace multiple hyphens with single
  },

  /**
   * Calculate estimated reading time based on word count
   * Assumes average reading speed of 200 words per minute
   * @param {string} content - HTML content
   * @returns {number} Estimated reading time in minutes
   */
  calculateReadingTime: (content) => {
    // Strip HTML tags
    const text = content.replace(/<[^>]*>/g, '');
    // Count words
    const words = text.trim().split(/\s+/).length;
    // Calculate minutes (200 words per minute average)
    const minutes = Math.ceil(words / 200);
    return minutes;
  }
};

export default adminBlogService;
