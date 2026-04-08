import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const BlogCard = ({ post, compact = false }) => {
  const { t, i18n } = useTranslation();

  // Format date based on current language
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Get category badges
  const getCategoryBadges = () => {
    if (!post.categories || post.categories.length === 0) return null;

    return post.categories.map((category, index) => (
      <span
        key={index}
        className="inline-block px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full mr-2"
      >
        {category}
      </span>
    ));
  };

  if (compact) {
    // Compact version for sidebars or related posts
    return (
      <Link to={`/blog/${post.slug}`} className="flex gap-4 hover:bg-gray-50 p-3 rounded-lg transition">
        <img
          src={post.thumbnail_image || post.featured_image_url}
          alt={post.title}
          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
            {post.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />
              {post.reading_time} {t('blog.minRead')}
            </span>
            {post.avg_rating > 0 && (
              <span className="flex items-center gap-1">
                <StarIcon className="w-3 h-3 text-yellow-500" />
                {post.avg_rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Full card version for main blog listing
  return (
    <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      {/* Featured Image */}
      <Link to={`/blog/${post.slug}`} className="relative block overflow-hidden h-48 md:h-56">
        <img
          src={post.featured_image_url}
          alt={post.title}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {post.is_featured && (
          <div className="absolute top-3 left-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            {t('blog.featured')}
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Categories */}
        <div className="mb-3">
          {getCategoryBadges()}
        </div>

        {/* Title */}
        <Link to={`/blog/${post.slug}`}>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition line-clamp-2">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
          {post.excerpt}
        </p>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-4 h-4" />
            <span>{formatDate(post.published_at || post.created_at)}</span>
          </div>

          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            <span>{post.reading_time} {t('blog.minRead')}</span>
          </div>

          {post.view_count > 0 && (
            <div className="flex items-center gap-1">
              <EyeIcon className="w-4 h-4" />
              <span>{post.view_count}</span>
            </div>
          )}

          {post.like_count > 0 && (
            <div className="flex items-center gap-1">
              <HeartIcon className="w-4 h-4 text-red-500" />
              <span>{post.like_count}</span>
            </div>
          )}

          {post.avg_rating > 0 && (
            <div className="flex items-center gap-1">
              <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
              <span>{post.avg_rating.toFixed(1)} ({post.rating_count})</span>
            </div>
          )}
        </div>

        {/* Read More Button */}
        <Link
          to={`/blog/${post.slug}`}
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold transition"
        >
          {t('blog.readMore')}
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
};

export default BlogCard;
