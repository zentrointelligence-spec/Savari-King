import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../config/api";
import { debounce } from "lodash";

// Optimisation avec React.memo pour éviter les re-renders inutiles
const BlogCard = React.memo(({ post, t }) => (
  <Link to={`/blog/${post.slug}`} className="block group">
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
      <div className="relative overflow-hidden">
        <img
          src={post.main_image_url}
          alt={post.title}
          className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
          <i className="fas fa-calendar-alt mr-1"></i>
          {new Date(post.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center mb-3 text-sm text-gray-500">
          <i className="fas fa-user-circle mr-2 text-primary"></i>
          <span>{post.author_name}</span>
          <span className="mx-2">•</span>
          <i className="fas fa-clock mr-1"></i>
          <span>5 min read</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2">
          {post.title}
        </h2>
        <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-primary group-hover:text-secondary transition-colors duration-300 flex items-center">
            {t("blog.readMore")}
            <i className="fas fa-arrow-right ml-2 transform group-hover:translate-x-1 transition-transform duration-300"></i>
          </span>
          <div className="flex space-x-2">
            <i className="fas fa-heart text-gray-300 hover:text-red-500 cursor-pointer transition-colors duration-200"></i>
            <i className="fas fa-bookmark text-gray-300 hover:text-primary cursor-pointer transition-colors duration-200"></i>
          </div>
        </div>
      </div>
    </div>
  </Link>
));

// Optimisation avec React.memo pour éviter les re-renders inutiles
const LoadingCard = React.memo(() => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
    <div className="h-56 bg-gray-300"></div>
    <div className="p-6">
      <div className="flex items-center mb-3">
        <div className="h-4 bg-gray-300 rounded w-24"></div>
        <div className="mx-2 w-1 h-1 bg-gray-300 rounded-full"></div>
        <div className="h-4 bg-gray-300 rounded w-16"></div>
      </div>
      <div className="h-6 bg-gray-300 rounded mb-3"></div>
      <div className="h-4 bg-gray-300 rounded mb-2"></div>
      <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
      <div className="flex justify-between">
        <div className="h-4 bg-gray-300 rounded w-20"></div>
        <div className="flex space-x-2">
          <div className="h-4 w-4 bg-gray-300 rounded"></div>
          <div className="h-4 w-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  </div>
));

const BlogPage = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(6);
  const [hasMore, setHasMore] = useState(true);

  // Optimisation de la fonction de récupération des posts avec mise en cache
  const fetchPosts = useCallback(async () => {
    try {
      // Vérifier si les données sont déjà en cache
      const cachedPosts = sessionStorage.getItem('blogPosts');
      const cachedTimestamp = sessionStorage.getItem('blogPostsTimestamp');
      const now = new Date().getTime();
      
      // Si les données sont en cache et ont moins de 5 minutes, les utiliser
      if (cachedPosts && cachedTimestamp && now - parseInt(cachedTimestamp) < 300000) {
        const parsedPosts = JSON.parse(cachedPosts);
        // S'assurer que c'est un tableau
        const postsArray = Array.isArray(parsedPosts) ? parsedPosts : (parsedPosts.posts || []);
        setPosts(postsArray);
        setFilteredPosts(postsArray);
        setLoading(false);
        return;
      }

      // Sinon, faire une nouvelle requête
      const response = await api.get("/api/blog");
      // L'API retourne { posts, total, page, totalPages }
      const postsArray = response.data.posts || response.data || [];
      setPosts(postsArray);
      setFilteredPosts(postsArray);

      // Mettre en cache les données
      sessionStorage.setItem('blogPosts', JSON.stringify(postsArray));
      sessionStorage.setItem('blogPostsTimestamp', now.toString());
    } catch (error) {
      console.error("Failed to fetch blog posts:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Optimisation de la recherche avec debounce
  const debouncedSearch = useCallback(
    debounce((term) => {
      const filtered = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(term.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredPosts(filtered);
      setCurrentPage(1); // Réinitialiser à la première page lors d'une nouvelle recherche
    }, 300),
    [posts]
  );
  
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);
  
  // Calcul des posts à afficher pour la pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = Array.isArray(filteredPosts) ? filteredPosts.slice(indexOfFirstPost, indexOfLastPost) : [];
  
  // Fonction pour charger plus de posts (pagination infinie)
  const loadMorePosts = () => {
    const postsLength = Array.isArray(filteredPosts) ? filteredPosts.length : 0;
    if (currentPage * postsPerPage < postsLength) {
      setCurrentPage(currentPage + 1);
    } else {
      setHasMore(false);
    }
  };
  
  // Observer d'intersection pour le chargement infini
  const observerTarget = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (observerTarget.current && !loading) {
      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMorePosts();
        }
      }, { threshold: 1.0 });
      observerRef.current.observe(observerTarget.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore, loadMorePosts]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-secondary py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              <i className="fas fa-blog mr-4"></i>
              {t("blog.title")}
            </h1>
            <p className="text-xl text-white/90 mb-8">{t("blog.subtitle")}</p>

            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              <input
                type="text"
                placeholder={t("blog.searchPosts")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full border-0 focus:ring-2 focus:ring-white/50 focus:outline-none text-gray-700 placeholder-gray-500"
                aria-label={t("blog.searchPosts")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Blog Stats */}
      <div className="bg-white py-12 border-b">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-3xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-newspaper mr-2"></i>
                {posts.length}+
              </div>
              <p className="text-gray-600">{t("blog.title")}</p>
            </div>
            <div className="group">
              <div className="text-3xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-map-marked-alt mr-2"></i>
                50+
              </div>
              <p className="text-gray-600">
                {t("home.whyChooseUs.destinations")}
              </p>
            </div>
            <div className="group">
              <div className="text-3xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-users mr-2"></i>
                10K+
              </div>
              <p className="text-gray-600">
                {t("home.whyChooseUs.satisfaction")}
              </p>
            </div>
            <div className="group">
              <div className="text-3xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-star mr-2"></i>
                4.9
              </div>
              <p className="text-gray-600">{t("home.testimonials.subtitle")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="container mx-auto px-6 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <LoadingCard key={index} />
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {searchTerm
                  ? `${t("common.search")} (${filteredPosts.length})`
                  : t("blog.recentPosts")}
              </h2>
              {searchTerm && (
                <p className="text-gray-600">
                  Showing results for "
                  <span className="font-semibold text-primary">
                    {searchTerm}
                  </span>
                  "
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentPosts.map((post) => (
                <BlogCard key={post.id} post={post} t={t} />
              ))}
            </div>
            
            {/* Indicateur de chargement pour la pagination infinie */}
            {hasMore && filteredPosts.length > postsPerPage && (
              <div ref={observerTarget} className="flex justify-center mt-8">
                <button 
                  onClick={loadMorePosts}
                  className="bg-primary text-white px-6 py-3 rounded-full hover:bg-secondary transition-colors duration-300"
                >
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  {t("common.loadMore")}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">
              {t("errors.404.title")}
            </h3>
            <p className="text-gray-500 mb-6">{t("errors.404.message")}</p>
            <button
              onClick={() => setSearchTerm("")}
              className="bg-primary text-white px-6 py-3 rounded-full hover:bg-secondary transition-colors duration-300"
            >
              <i className="fas fa-refresh mr-2"></i>
              {t("common.all")}
            </button>
          </div>
        )}
      </div>

      {/* Newsletter Subscription */}
      <div className="bg-gradient-to-r from-primary to-secondary py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <i className="fas fa-envelope text-4xl text-white mb-4"></i>
            <h3 className="text-3xl font-bold text-white mb-4">
              {t("footer.newsletter")}
            </h3>
            <p className="text-white/90 mb-8">
              {t("footer.subscribeNewsletter")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder={t("common.email")}
                className="flex-1 px-4 py-3 rounded-full border-0 focus:ring-2 focus:ring-white/50 focus:outline-none"
              />
              <button className="bg-white text-primary px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300">
                <i className="fas fa-paper-plane mr-2"></i>
                {t("footer.newsletter")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
