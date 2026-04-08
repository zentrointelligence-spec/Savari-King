import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import adminBlogService from '../../services/adminBlogService';
import blogService from '../../services/blogService';

const AdminBlogFormPage = () => {
  const { id } = useParams(); // undefined for new post, post ID for edit
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    thumbnail_image: '',
    is_published: false,
    is_featured: false,
    reading_time: 0,
    meta_title: '',
    meta_description: '',
    category_ids: []
  });

  // Auto-generate slug from title
  const [autoSlug, setAutoSlug] = useState(true);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await blogService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  // Fetch post data if editing
  useEffect(() => {
    if (isEditMode) {
      const fetchPost = async () => {
        try {
          const post = await adminBlogService.getPostById(id);
          setFormData({
            title: post.title || '',
            slug: post.slug || '',
            excerpt: post.excerpt || '',
            content: post.content || '',
            featured_image_url: post.featured_image_url || '',
            thumbnail_image: post.thumbnail_image || '',
            is_published: post.is_published || false,
            is_featured: post.is_featured || false,
            reading_time: post.reading_time || 0,
            meta_title: post.meta_title || '',
            meta_description: post.meta_description || '',
            category_ids: post.category_ids || []
          });
          setAutoSlug(false); // Don't auto-generate slug when editing
        } catch (error) {
          console.error('Error fetching post:', error);
          toast.error('Failed to load blog post');
          navigate('/admin/blog');
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [id, isEditMode, navigate]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Auto-generate slug from title
    if (name === 'title' && autoSlug && !isEditMode) {
      setFormData(prev => ({
        ...prev,
        slug: adminBlogService.generateSlug(value)
      }));
    }

    // Auto-calculate reading time when content changes
    if (name === 'content') {
      const readingTime = adminBlogService.calculateReadingTime(value);
      setFormData(prev => ({
        ...prev,
        reading_time: readingTime
      }));
    }
  };

  // Handle category selection
  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter(id => id !== categoryId)
        : [...prev.category_ids, categoryId]
    }));
  };

  // Handle form submission
  const handleSubmit = async (e, publish = false) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.slug.trim()) {
      toast.error('Slug is required');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Content is required');
      return;
    }
    if (formData.category_ids.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    setSaving(true);

    try {
      const postData = {
        ...formData,
        is_published: publish,
        published_at: publish && !isEditMode ? new Date().toISOString() : undefined
      };

      let result;
      if (isEditMode) {
        result = await adminBlogService.updatePost(id, postData);
        toast.success('Blog post updated successfully');
      } else {
        result = await adminBlogService.createPost(postData);
        toast.success('Blog post created successfully');
      }

      navigate('/admin/blog');
    } catch (error) {
      console.error('Error saving post:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to save blog post');
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle save as draft
  const handleSaveAsDraft = (e) => {
    handleSubmit(e, false);
  };

  // Handle publish
  const handlePublish = (e) => {
    handleSubmit(e, true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blog post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/admin/blog"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Blog List
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
        </div>

        <form onSubmit={handleSaveAsDraft}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div className="bg-white rounded-lg shadow p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter blog post title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  required
                />
              </div>

              {/* Slug */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    URL Slug <span className="text-red-500">*</span>
                  </label>
                  {!isEditMode && (
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={autoSlug}
                        onChange={(e) => setAutoSlug(e.target.checked)}
                        className="mr-2"
                      />
                      Auto-generate from title
                    </label>
                  )}
                </div>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={(e) => {
                    handleChange(e);
                    setAutoSlug(false);
                  }}
                  placeholder="url-friendly-slug"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Preview: /blog/{formData.slug || 'your-slug-here'}
                </p>
              </div>

              {/* Excerpt */}
              <div className="bg-white rounded-lg shadow p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  placeholder="Brief summary of the post (150-200 characters recommended)..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.excerpt.length} characters
                </p>
              </div>

              {/* Content */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <span className="text-sm text-gray-500">
                    Reading time: ~{formData.reading_time} min
                  </span>
                </div>
                <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                  <strong>HTML Editor:</strong> Use HTML tags for formatting (h2, h3, p, ul, li, strong, em, etc.)
                </div>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Write your blog post content in HTML format..."
                  rows="20"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.content.replace(/<[^>]*>/g, '').split(/\s+/).length} words
                </p>
              </div>

              {/* SEO Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      name="meta_title"
                      value={formData.meta_title}
                      onChange={handleChange}
                      placeholder="SEO title (defaults to post title)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.meta_title.length}/60 characters (optimal: 50-60)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      name="meta_description"
                      value={formData.meta_description}
                      onChange={handleChange}
                      placeholder="SEO description (defaults to excerpt)"
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.meta_description.length}/160 characters (optimal: 150-160)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
              {/* Publish Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Publish</h3>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save as Draft'}
                  </button>

                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={saving}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Publishing...' : (isEditMode && formData.is_published ? 'Update & Keep Published' : 'Publish Now')}
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Featured Post</span>
                  </label>
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Categories <span className="text-red-500">*</span>
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.category_ids.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Featured Image */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Image</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL (1200x800)
                    </label>
                    <input
                      type="url"
                      name="featured_image_url"
                      value={formData.featured_image_url}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {formData.featured_image_url && (
                    <div>
                      <img
                        src={formData.featured_image_url}
                        alt="Featured preview"
                        className="w-full h-40 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/1200x800?text=Invalid+Image+URL';
                        }}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thumbnail URL (600x400)
                    </label>
                    <input
                      type="url"
                      name="thumbnail_image"
                      value={formData.thumbnail_image}
                      onChange={handleChange}
                      placeholder="https://example.com/thumbnail.jpg"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Tip: Use <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Unsplash</a> for free high-quality images
                </p>
              </div>

              {/* Reading Time */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reading Time</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="reading_time"
                    value={formData.reading_time}
                    onChange={handleChange}
                    min="1"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-700">minutes</span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Auto-calculated based on word count (200 words/min). You can override it manually.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminBlogFormPage;
