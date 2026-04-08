import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiUtils } from '../utils/apiUtils';

// Composant pour l'image avec lazy loading
const LazyImage = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  return (
    <div className={`relative ${className}`}>
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
      )}
      {error && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <i className="fas fa-image text-gray-400 text-4xl"></i>
        </div>
      )}
      <img 
        src={src} 
        alt={alt} 
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
};

const BlogPostPage = () => {
  const { slug } = useParams();
  const { i18n } = useTranslation();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(42); // Valeur par défaut
  const [showShareToast, setShowShareToast] = useState(false);

  // Get current language
  const currentLanguage = i18n.language?.split('-')[0] || 'en';

  // Optimisation de la fonction de récupération des posts avec mise en cache
  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);

      // Cache key includes language
      const cacheKey = `blogPost-${slug}-${currentLanguage}`;
      const cachedPost = sessionStorage.getItem(cacheKey);
      const cachedTimestamp = sessionStorage.getItem(`${cacheKey}-timestamp`);
      const now = new Date().getTime();

      // Si les données sont en cache et ont moins de 5 minutes, les utiliser
      if (cachedPost && cachedTimestamp && now - parseInt(cachedTimestamp) < 300000) {
        const parsedPost = JSON.parse(cachedPost);
        // Only use cache if post data is valid
        if (parsedPost.post && parsedPost.post.id) {
          setPost(parsedPost.post);
          setRelatedPosts(parsedPost.related || []);
          setLoading(false);
          return;
        }
        // Invalid cache, clear it
        sessionStorage.removeItem(cacheKey);
        sessionStorage.removeItem(`${cacheKey}-timestamp`);
      }

      // Sinon, faire une nouvelle requête avec la langue
      const [postResponse, allPostsResponse] = await Promise.all([
        apiUtils.getBlogPost(slug, currentLanguage),
        apiUtils.getBlogPosts()
      ]);

      setPost(postResponse.data);

      // Fetch related posts (excluding current post)
      // L'API retourne { posts, total, page, totalPages }
      const allPosts = allPostsResponse.data.posts || allPostsResponse.data || [];
      const related = Array.isArray(allPosts)
        ? allPosts.filter((p) => p.slug !== slug).slice(0, 3)
        : [];
      setRelatedPosts(related);

      // Mettre en cache les données
      sessionStorage.setItem(cacheKey, JSON.stringify({
        post: postResponse.data,
        related: related
      }));
      sessionStorage.setItem(`${cacheKey}-timestamp`, now.toString());
    } catch (error) {
      console.error("Failed to fetch post:", error);
    } finally {
      setLoading(false);
    }
  }, [slug, currentLanguage]);
  
  useEffect(() => {
    fetchPost();
    
    // Nettoyage lors du démontage du composant
    return () => {
      // Annuler les requêtes en cours si nécessaire
    };
  }, [fetchPost]);

  // Optimisation de la fonction de partage
  const handleShare = useCallback((platform) => {
    const url = window.location.href;
    const title = post?.title || "";

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url
      )}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
    };

    window.open(shareUrls[platform], "_blank", "width=600,height=400");
  }, [post]);

  // Optimisation de la fonction de copie dans le presse-papier
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  }, []);
  
  // Gestion optimisée des likes
  const handleLike = useCallback(() => {
    if (isLiked) {
      setLikesCount(prev => prev - 1);
    } else {
      setLikesCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
    
    // Dans une application réelle, on enverrait une requête au serveur ici
    // pour persister le like, mais de manière optimiste (sans attendre la réponse)
  }, [isLiked]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded mb-4"></div>
              <div className="h-4 bg-gray-300 rounded mb-8 w-1/3"></div>
              <div className="h-64 bg-gray-300 rounded-lg mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-6xl text-gray-400 mb-4"></i>
          <h2 className="text-3xl font-bold text-gray-600 mb-4">
            Article Not Found
          </h2>
          <p className="text-gray-500 mb-8">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/blog"
            className="bg-primary text-white px-6 py-3 rounded-full hover:bg-secondary transition-colors duration-300 inline-flex items-center"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link
              to="/"
              className="hover:text-primary transition-colors duration-200"
            >
              <i className="fas fa-home"></i>
            </Link>
            <i className="fas fa-chevron-right text-gray-400"></i>
            <Link
              to="/blog"
              className="hover:text-primary transition-colors duration-200"
            >
              Blog
            </Link>
            <i className="fas fa-chevron-right text-gray-400"></i>
            <span className="text-gray-800 font-medium truncate">
              {post.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Article Content */}
      <article className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Author and Meta Info */}
            <div className="flex flex-wrap items-center justify-between mb-6 p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {post.author_name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {post.author_name}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <i className="fas fa-calendar-alt mr-1"></i>
                      {new Date(post.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="flex items-center">
                      <i className="fas fa-clock mr-1"></i>5 min read
                    </span>
                    <span className="flex items-center">
                      <i className="fas fa-eye mr-1"></i>
                      1.2K views
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 mt-4 md:mt-0">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-full transition-all duration-300 ${
                    isLiked
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"
                  }`}
                >
                  <i
                    className={`fas fa-heart ${isLiked ? "text-red-600" : ""}`}
                  ></i>
                  <span className="text-sm font-medium">{likesCount}</span>
                </button>
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    isBookmarked
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-primary hover:text-white"
                  }`}
                >
                  <i className="fas fa-bookmark"></i>
                </button>
              </div>
            </div>
          </header>

          {/* Featured Image - Lazy Loaded */}
          <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
            <LazyImage
              src={post.main_image_url}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>

          {/* Article Content */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <div
              className="prose lg:prose-xl max-w-none
                [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mt-8 [&>h2]:mb-4
                [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-gray-800 [&>h3]:mt-6 [&>h3]:mb-3
                [&>p]:text-gray-700 [&>p]:leading-relaxed [&>p]:mb-4
                [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4
                [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4
                [&>li]:mb-2
                [&>a]:text-blue-600 [&>a]:underline"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Share Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <i className="fas fa-share-alt mr-2 text-primary"></i>
              Share this article
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleShare("facebook")}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors duration-300"
              >
                <i className="fab fa-facebook-f"></i>
                <span>Facebook</span>
              </button>
              <button
                onClick={() => handleShare("twitter")}
                className="flex items-center space-x-2 bg-blue-400 text-white px-4 py-2 rounded-full hover:bg-blue-500 transition-colors duration-300"
              >
                <i className="fab fa-twitter"></i>
                <span>Twitter</span>
              </button>
              <button
                onClick={() => handleShare("linkedin")}
                className="flex items-center space-x-2 bg-blue-800 text-white px-4 py-2 rounded-full hover:bg-blue-900 transition-colors duration-300"
              >
                <i className="fab fa-linkedin-in"></i>
                <span>LinkedIn</span>
              </button>
              <button
                onClick={() => handleShare("whatsapp")}
                className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors duration-300"
              >
                <i className="fab fa-whatsapp"></i>
                <span>WhatsApp</span>
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition-colors duration-300"
              >
                <i className="fas fa-link"></i>
                <span>Copy Link</span>
              </button>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-newspaper mr-2 text-primary"></i>
                Related Articles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    to={`/blog/${relatedPost.slug}`}
                    className="group block"
                  >
                    <div className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
                      <LazyImage
                        src={relatedPost.main_image_url}
                        alt={relatedPost.title}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-800 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                          {relatedPost.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Back to Blog Button */}
      <div className="container mx-auto px-6 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <Link
            to="/blog"
            className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-full hover:bg-secondary transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to All Articles
          </Link>
        </div>
      </div>
      
      {/* Toast de notification pour le partage */}
      {showShareToast && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg animate-fadeIn z-50">
          <div className="flex items-center">
            <i className="fas fa-check-circle text-green-400 mr-2"></i>
            <span>Lien copié dans le presse-papier!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPostPage;
