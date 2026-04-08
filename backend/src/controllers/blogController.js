const db = require("../db");

// GET /api/blog - Récupérer tous les articles publiés avec filtres
exports.getAllPublishedPosts = async (req, res) => {
  try {
    const { category, page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT DISTINCT
        bp.id, bp.title, bp.slug, bp.excerpt,
        bp.featured_image_url, bp.thumbnail_image,
        bp.created_at, bp.published_at, bp.reading_time,
        bp.view_count, bp.like_count, bp.comment_count,
        bp.avg_rating, bp.rating_count,
        u.full_name as author_name,
        u.email as author_email,
        ARRAY_AGG(DISTINCT bc.name) FILTER (WHERE bc.name IS NOT NULL) as categories,
        ARRAY_AGG(DISTINCT bc.slug) FILTER (WHERE bc.slug IS NOT NULL) as category_slugs
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      LEFT JOIN blog_post_categories bpc ON bp.id = bpc.blog_post_id
      LEFT JOIN blog_categories bc ON bpc.category_id = bc.id
      WHERE bp.is_published = true
        AND bp.moderation_status = 'approved'
        AND (bp.published_at IS NULL OR bp.published_at <= CURRENT_TIMESTAMP)
    `;

    const params = [];
    let paramIndex = 1;

    // Filtre par catégorie
    if (category) {
      query += ` AND bc.slug = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // Recherche textuelle
    if (search) {
      query += ` AND (
        bp.title ILIKE $${paramIndex} OR
        bp.excerpt ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += `
      GROUP BY bp.id, u.full_name, u.email
      ORDER BY bp.published_at DESC NULLS LAST, bp.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    // Requête pour le total
    let countQuery = `
      SELECT COUNT(DISTINCT bp.id) as total
      FROM blog_posts bp
      LEFT JOIN blog_post_categories bpc ON bp.id = bpc.blog_post_id
      LEFT JOIN blog_categories bc ON bpc.category_id = bc.id
      WHERE bp.is_published = true
        AND bp.moderation_status = 'approved'
    `;

    const countParams = [];
    let countParamIndex = 1;
    if (category) {
      countQuery += ` AND bc.slug = $${countParamIndex}`;
      countParams.push(category);
      countParamIndex++;
    }
    if (search) {
      countQuery += ` AND (bp.title ILIKE $${countParamIndex} OR bp.excerpt ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
    }

    const [postsResult, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, countParams)
    ]);

    res.json({
      posts: postsResult.rows,
      total: parseInt(countResult.rows[0].total),
      page: parseInt(page),
      totalPages: Math.ceil(countResult.rows[0].total / limit)
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/blog/recent - Récupérer les articles récents
exports.getRecentPosts = async (req, res) => {
  try {
    const { category, limit = 3 } = req.query;

    let query = `
      SELECT DISTINCT
        bp.id, bp.title, bp.slug, bp.excerpt,
        bp.featured_image_url as main_image_url,
        bp.thumbnail_image, bp.created_at, bp.published_at,
        u.full_name as author_name,
        ARRAY_AGG(DISTINCT bc.name) FILTER (WHERE bc.name IS NOT NULL) as categories
      FROM blog_posts bp
      JOIN users u ON bp.author_id = u.id
      LEFT JOIN blog_post_categories bpc ON bp.id = bpc.blog_post_id
      LEFT JOIN blog_categories bc ON bpc.category_id = bc.id
      WHERE bp.is_published = true
        AND bp.moderation_status = 'approved'
    `;

    const params = [];
    if (category) {
      query += ` AND bc.slug = $1`;
      params.push(category);
    }

    query += `
      GROUP BY bp.id, u.full_name
      ORDER BY bp.published_at DESC NULLS LAST, bp.created_at DESC
      LIMIT $${params.length + 1}
    `;
    params.push(limit);

    const result = await db.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching recent posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/blog/:slug - Récupérer un article par slug (avec incrémentation view_count)
exports.getPostBySlug = async (req, res) => {
  const { slug } = req.params;
  const { lang = 'en' } = req.query;

  try {
    // First get the base post
    const result = await db.query(`
      SELECT
        bp.*,
        u.full_name as author_name,
        u.email as author_email,
        ARRAY_AGG(DISTINCT bc.id) FILTER (WHERE bc.id IS NOT NULL) as category_ids,
        ARRAY_AGG(DISTINCT bc.name) FILTER (WHERE bc.name IS NOT NULL) as categories,
        ARRAY_AGG(DISTINCT bc.slug) FILTER (WHERE bc.slug IS NOT NULL) as category_slugs
      FROM blog_posts bp
      JOIN users u ON bp.author_id = u.id
      LEFT JOIN blog_post_categories bpc ON bp.id = bpc.blog_post_id
      LEFT JOIN blog_categories bc ON bpc.category_id = bc.id
      WHERE bp.slug = $1
        AND bp.is_published = true
        AND bp.moderation_status = 'approved'
      GROUP BY bp.id, u.full_name, u.email
    `, [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Article not found" });
    }

    const post = result.rows[0];

    // Try to get translation for requested language
    if (lang && lang !== 'en') {
      const translationResult = await db.query(`
        SELECT title, content, excerpt, meta_title, meta_description
        FROM blog_post_translations
        WHERE blog_post_id = $1 AND language = $2
      `, [post.id, lang]);

      if (translationResult.rows.length > 0) {
        const translation = translationResult.rows[0];
        post.title = translation.title;
        post.content = translation.content;
        post.excerpt = translation.excerpt || post.excerpt;
        post.meta_title = translation.meta_title || post.meta_title;
        post.meta_description = translation.meta_description || post.meta_description;
        post.language = lang;
      }
    }

    // Get available languages for this post
    const languagesResult = await db.query(`
      SELECT DISTINCT language FROM blog_post_translations WHERE blog_post_id = $1
    `, [post.id]);
    post.available_languages = languagesResult.rows.map(r => r.language);

    // Incrémenter view_count
    await db.query(
      "UPDATE blog_posts SET view_count = view_count + 1 WHERE id = $1",
      [post.id]
    );

    // Mettre à jour le view_count dans la réponse
    post.view_count = (post.view_count || 0) + 1;

    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/blog/:id/like - Toggle like sur un article
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier si déjà liké
    const existingLike = await db.query(
      "SELECT id FROM blog_likes WHERE blog_post_id = $1 AND user_id = $2",
      [id, userId]
    );

    if (existingLike.rows.length > 0) {
      // Unlike
      await db.query(
        "DELETE FROM blog_likes WHERE blog_post_id = $1 AND user_id = $2",
        [id, userId]
      );
      res.json({ liked: false, message: "Post unliked" });
    } else {
      // Like
      await db.query(
        "INSERT INTO blog_likes (blog_post_id, user_id) VALUES ($1, $2)",
        [id, userId]
      );
      res.json({ liked: true, message: "Post liked" });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/blog/:id/like-status - Vérifier si l'utilisateur a liké
exports.getLikeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      "SELECT id FROM blog_likes WHERE blog_post_id = $1 AND user_id = $2",
      [id, userId]
    );

    res.json({ liked: result.rows.length > 0 });
  } catch (error) {
    console.error("Error checking like status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/blog/:id/rate - Noter un article (1-5 étoiles)
exports.rateBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    await db.query(`
      INSERT INTO blog_ratings (blog_post_id, user_id, rating)
      VALUES ($1, $2, $3)
      ON CONFLICT (blog_post_id, user_id)
      DO UPDATE SET rating = $3, updated_at = CURRENT_TIMESTAMP
    `, [id, userId, rating]);

    // Récupérer les nouvelles statistiques
    const stats = await db.query(
      "SELECT avg_rating, rating_count FROM blog_posts WHERE id = $1",
      [id]
    );

    res.json({
      message: "Rating submitted successfully",
      avg_rating: parseFloat(stats.rows[0].avg_rating) || 0,
      rating_count: parseInt(stats.rows[0].rating_count) || 0
    });
  } catch (error) {
    console.error("Error rating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/blog/:id/rating - Récupérer la note de l'utilisateur
exports.getUserRating = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      "SELECT rating FROM blog_ratings WHERE blog_post_id = $1 AND user_id = $2",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.json({ rating: null });
    }

    res.json({ rating: result.rows[0].rating });
  } catch (error) {
    console.error("Error fetching user rating:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/blog/:id/comments - Récupérer les commentaires d'un article
exports.getComments = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT
        c.*,
        u.full_name as user_name,
        u.email as user_email
      FROM blog_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.blog_post_id = $1 AND c.is_approved = true
      ORDER BY c.created_at DESC
    `, [id]);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/blog/:id/comments - Ajouter un commentaire
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, parent_comment_id } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    if (content.trim().length > 5000) {
      return res.status(400).json({ error: "Comment is too long (max 5000 characters)" });
    }

    const result = await db.query(`
      INSERT INTO blog_comments (blog_post_id, user_id, content, parent_comment_id, is_approved)
      VALUES ($1, $2, $3, $4, false)
      RETURNING *
    `, [id, userId, content.trim(), parent_comment_id || null]);

    res.status(201).json({
      message: "Comment submitted for moderation",
      comment: result.rows[0]
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
