import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon,
  StarIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import blogService from '../services/blogService';
import BlogCard from '../components/blog/BlogCard';

const BlogDetailPage = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User interactions
  const [isLiked, setIsLiked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Get current language
  const currentLanguage = i18n.language?.split('-')[0] || 'en';

  // Fetch post details
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await blogService.getPostBySlug(slug, currentLanguage);
        setPost(data);

        // Fetch related posts (same category)
        if (data.category_slugs && data.category_slugs.length > 0) {
          const relatedData = await blogService.getAllPosts({
            category: data.category_slugs[0],
            limit: 3
          });
          // Filter out current post
          setRelatedPosts(relatedData.posts.filter(p => p.id !== data.id).slice(0, 3));
        }

        // Fetch comments
        const commentsData = await blogService.getComments(data.id);
        setComments(commentsData);

        // If user is logged in, fetch their interactions
        if (user) {
          try {
            const likeStatus = await blogService.getLikeStatus(data.id);
            setIsLiked(likeStatus.liked);
          } catch (err) {
            // User not logged in or error
          }

          try {
            const ratingData = await blogService.getUserRating(data.id);
            setUserRating(ratingData.rating || 0);
          } catch (err) {
            // User hasn't rated yet
          }
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(t('blog.errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, user, t, currentLanguage]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Handle like toggle
  const handleLike = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/blog/${slug}` } });
      return;
    }

    try {
      const result = await blogService.toggleLike(post.id);
      setIsLiked(result.liked);
      setPost(prev => ({
        ...prev,
        like_count: result.liked ? prev.like_count + 1 : prev.like_count - 1
      }));
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  // Handle rating
  const handleRating = async (rating) => {
    if (!user) {
      navigate('/login', { state: { from: `/blog/${slug}` } });
      return;
    }

    try {
      await blogService.ratePost(post.id, rating);
      setUserRating(rating);

      // Refresh post to get updated average rating
      const updatedPost = await blogService.getPostBySlug(slug);
      setPost(prev => ({
        ...prev,
        avg_rating: updatedPost.avg_rating,
        rating_count: updatedPost.rating_count
      }));
    } catch (err) {
      console.error('Error rating post:', err);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate('/login', { state: { from: `/blog/${slug}` } });
      return;
    }

    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      await blogService.addComment(post.id, commentText);
      setCommentText('');
      alert(t('blog.commentSubmitted'));

      // Refresh comments
      const commentsData = await blogService.getComments(post.id);
      setComments(commentsData);
    } catch (err) {
      console.error('Error submitting comment:', err);
      alert(t('blog.commentError'));
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert(t('blog.linkCopied'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
              <div className="h-64 bg-gray-300 rounded mb-6"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-4 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || t('blog.notFound')}
            </h1>
            <Link to="/blog" className="text-blue-600 hover:text-blue-700 underline">
              {t('blog.backToList')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="max-w-4xl mx-auto mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-600">{t('common.home')}</Link>
          <ChevronRightIcon className="w-4 h-4" />
          <Link to="/blog" className="hover:text-blue-600">{t('blog.title')}</Link>
          {post.categories && post.categories.length > 0 && (
            <>
              <ChevronRightIcon className="w-4 h-4" />
              <span className="text-gray-900">{post.categories[0]}</span>
            </>
          )}
        </nav>

        <article className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            {/* Categories */}
            {post.categories && post.categories.length > 0 && (
              <div className="mb-4">
                {post.categories.map((category, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded-full mr-2"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                <span>{formatDate(post.published_at || post.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                <span>{post.reading_time} {t('blog.minRead')}</span>
              </div>
              <div className="flex items-center gap-2">
                <EyeIcon className="w-5 h-5" />
                <span>{post.view_count}</span>
              </div>
            </div>

            {/* Featured Image */}
            {post.featured_image_url && (
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-96 object-cover rounded-xl shadow-lg mb-8"
              />
            )}

            {/* Interactions Bar */}
            <div className="flex items-center justify-between py-4 border-y border-gray-200">
              <div className="flex items-center gap-6">
                {/* Like Button */}
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2 hover:text-red-600 transition"
                >
                  {isLiked ? (
                    <HeartSolidIcon className="w-6 h-6 text-red-600" />
                  ) : (
                    <HeartIcon className="w-6 h-6" />
                  )}
                  <span className="font-semibold">{post.like_count}</span>
                </button>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none"
                      >
                        {(hoverRating || userRating) >= star ? (
                          <StarSolidIcon className="w-6 h-6 text-yellow-500" />
                        ) : (
                          <StarIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                    ))}
                  </div>
                  {post.avg_rating > 0 && (
                    <span className="text-sm text-gray-600">
                      {post.avg_rating.toFixed(1)} ({post.rating_count})
                    </span>
                  )}
                </div>

                {/* Comments Count */}
                <div className="flex items-center gap-2 text-gray-600">
                  <ChatBubbleLeftIcon className="w-6 h-6" />
                  <span>{post.comment_count}</span>
                </div>
              </div>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                <ShareIcon className="w-5 h-5" />
                <span className="hidden sm:inline">{t('blog.share')}</span>
              </button>
            </div>
          </header>

          {/* Content */}
          <div
            className="prose prose-lg max-w-none mb-12
              [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mt-8 [&>h2]:mb-4
              [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-gray-800 [&>h3]:mt-6 [&>h3]:mb-3
              [&>p]:text-gray-700 [&>p]:leading-relaxed [&>p]:mb-4
              [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4
              [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4
              [&>li]:mb-2"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Comments Section */}
          <section className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('blog.comments')} ({comments.length})
            </h2>

            {/* Comment Form */}
            {user ? (
              <form onSubmit={handleCommentSubmit} className="mb-8">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={t('blog.commentPlaceholder')}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                  maxLength="5000"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || submittingComment}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingComment ? t('blog.submitting') : t('blog.submitComment')}
                </button>
              </form>
            ) : (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600">
                  {t('blog.loginToComment')}{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-700 underline">
                    {t('common.login')}
                  </Link>
                </p>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                      {comment.user_name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">{comment.user_name}</span>
                        <span className="text-sm text-gray-500">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}

              {comments.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  {t('blog.noComments')}
                </p>
              )}
            </div>
          </section>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('blog.relatedPosts')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <BlogCard key={relatedPost.id} post={relatedPost} compact />
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </div>
  );
};

export default BlogDetailPage;
