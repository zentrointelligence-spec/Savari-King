const db = require("../db");

// GET /api/admin/blog - Récupérer tous les articles (admin view - y compris brouillons)
exports.getAllPosts = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT DISTINCT
        bp.id, bp.title, bp.slug, bp.excerpt,
        bp.featured_image_url, bp.thumbnail_image,
        bp.is_published, bp.is_featured, bp.moderation_status,
        bp.created_at, bp.published_at, bp.updated_at,
        bp.view_count, bp.like_count, bp.comment_count,
        bp.avg_rating, bp.rating_count, bp.reading_time,
        u.full_name as author_name,
        u.email as author_email,
        ARRAY_AGG(DISTINCT bc.name) FILTER (WHERE bc.name IS NOT NULL) as categories,
        ARRAY_AGG(DISTINCT bc.slug) FILTER (WHERE bc.slug IS NOT NULL) as category_slugs
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      LEFT JOIN blog_post_categories bpc ON bp.id = bpc.blog_post_id
      LEFT JOIN blog_categories bc ON bpc.category_id = bc.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Filtre par statut de publication
    if (status === "published") {
      query += ` AND bp.is_published = true`;
    } else if (status === "draft") {
      query += ` AND bp.is_published = false`;
    }

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
        bp.excerpt ILIKE $${paramIndex} OR
        bp.content ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += `
      GROUP BY bp.id, u.full_name, u.email
      ORDER BY bp.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    // Requête pour le total
    let countQuery = `
      SELECT COUNT(DISTINCT bp.id) as total
      FROM blog_posts bp
      LEFT JOIN blog_post_categories bpc ON bp.id = bpc.blog_post_id
      LEFT JOIN blog_categories bc ON bpc.category_id = bc.id
      WHERE 1=1
    `;

    const countParams = [];
    let countParamIndex = 1;

    if (status === "published") {
      countQuery += ` AND bp.is_published = true`;
    } else if (status === "draft") {
      countQuery += ` AND bp.is_published = false`;
    }

    if (category) {
      countQuery += ` AND bc.slug = $${countParamIndex}`;
      countParams.push(category);
      countParamIndex++;
    }

    if (search) {
      countQuery += ` AND (bp.title ILIKE $${countParamIndex} OR bp.excerpt ILIKE $${countParamIndex} OR bp.content ILIKE $${countParamIndex})`;
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
    console.error("Error fetching admin posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/admin/blog/:id - Récupérer un article par ID (admin)
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT
        bp.*,
        u.full_name as author_name,
        u.email as author_email,
        ARRAY_AGG(DISTINCT bc.id) FILTER (WHERE bc.id IS NOT NULL) as category_ids,
        ARRAY_AGG(DISTINCT bc.name) FILTER (WHERE bc.name IS NOT NULL) as categories,
        ARRAY_AGG(DISTINCT bc.slug) FILTER (WHERE bc.slug IS NOT NULL) as category_slugs
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      LEFT JOIN blog_post_categories bpc ON bp.id = bpc.blog_post_id
      LEFT JOIN blog_categories bc ON bpc.category_id = bc.id
      WHERE bp.id = $1
      GROUP BY bp.id, u.full_name, u.email
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/admin/blog - Créer un nouvel article
exports.createPost = async (req, res) => {
  const client = await db.pool.connect();

  try {
    const {
      title,
      slug,
      excerpt,
      content,
      featured_image_url,
      thumbnail_image,
      is_published = false,
      is_featured = false,
      moderation_status = "pending",
      published_at,
      reading_time,
      meta_title,
      meta_description,
      category_ids = []
    } = req.body;

    const author_id = req.user.id;

    // Validation
    if (!title || !slug || !content) {
      return res.status(400).json({ error: "Title, slug, and content are required" });
    }

    await client.query("BEGIN");

    // Vérifier si le slug existe déjà
    const slugCheck = await client.query(
      "SELECT id FROM blog_posts WHERE slug = $1",
      [slug]
    );

    if (slugCheck.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Slug already exists" });
    }

    // Insérer l'article
    const insertResult = await client.query(`
      INSERT INTO blog_posts (
        title, slug, excerpt, content,
        featured_image_url, thumbnail_image,
        author_id, is_published, is_featured,
        moderation_status, published_at, reading_time,
        meta_title, meta_description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      title, slug, excerpt, content,
      featured_image_url, thumbnail_image,
      author_id, is_published, is_featured,
      moderation_status, published_at, reading_time,
      meta_title || title, meta_description || excerpt
    ]);

    const newPost = insertResult.rows[0];

    // Associer les catégories
    if (category_ids.length > 0) {
      const categoryValues = category_ids.map((cat_id, index) =>
        `($1, $${index + 2})`
      ).join(", ");

      await client.query(
        `INSERT INTO blog_post_categories (blog_post_id, category_id) VALUES ${categoryValues}`,
        [newPost.id, ...category_ids]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Article created successfully",
      post: newPost
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};

// PUT /api/admin/blog/:id - Mettre à jour un article
exports.updatePost = async (req, res) => {
  const client = await db.pool.connect();

  try {
    const { id } = req.params;
    const {
      title,
      slug,
      excerpt,
      content,
      featured_image_url,
      thumbnail_image,
      is_published,
      is_featured,
      moderation_status,
      published_at,
      reading_time,
      meta_title,
      meta_description,
      category_ids
    } = req.body;

    await client.query("BEGIN");

    // Vérifier si l'article existe
    const existingPost = await client.query(
      "SELECT id FROM blog_posts WHERE id = $1",
      [id]
    );

    if (existingPost.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Article not found" });
    }

    // Vérifier si le slug est déjà utilisé par un autre article
    if (slug) {
      const slugCheck = await client.query(
        "SELECT id FROM blog_posts WHERE slug = $1 AND id != $2",
        [slug, id]
      );

      if (slugCheck.rows.length > 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Slug already exists" });
      }
    }

    // Construire la requête de mise à jour dynamiquement
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      values.push(title);
      paramIndex++;
    }
    if (slug !== undefined) {
      updates.push(`slug = $${paramIndex}`);
      values.push(slug);
      paramIndex++;
    }
    if (excerpt !== undefined) {
      updates.push(`excerpt = $${paramIndex}`);
      values.push(excerpt);
      paramIndex++;
    }
    if (content !== undefined) {
      updates.push(`content = $${paramIndex}`);
      values.push(content);
      paramIndex++;
    }
    if (featured_image_url !== undefined) {
      updates.push(`featured_image_url = $${paramIndex}`);
      values.push(featured_image_url);
      paramIndex++;
    }
    if (thumbnail_image !== undefined) {
      updates.push(`thumbnail_image = $${paramIndex}`);
      values.push(thumbnail_image);
      paramIndex++;
    }
    if (is_published !== undefined) {
      updates.push(`is_published = $${paramIndex}`);
      values.push(is_published);
      paramIndex++;
    }
    if (is_featured !== undefined) {
      updates.push(`is_featured = $${paramIndex}`);
      values.push(is_featured);
      paramIndex++;
    }
    if (moderation_status !== undefined) {
      updates.push(`moderation_status = $${paramIndex}`);
      values.push(moderation_status);
      paramIndex++;
    }
    if (published_at !== undefined) {
      updates.push(`published_at = $${paramIndex}`);
      values.push(published_at);
      paramIndex++;
    }
    if (reading_time !== undefined) {
      updates.push(`reading_time = $${paramIndex}`);
      values.push(reading_time);
      paramIndex++;
    }
    if (meta_title !== undefined) {
      updates.push(`meta_title = $${paramIndex}`);
      values.push(meta_title);
      paramIndex++;
    }
    if (meta_description !== undefined) {
      updates.push(`meta_description = $${paramIndex}`);
      values.push(meta_description);
      paramIndex++;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    if (updates.length > 0) {
      values.push(id);
      await client.query(
        `UPDATE blog_posts SET ${updates.join(", ")} WHERE id = $${paramIndex}`,
        values
      );
    }

    // Mettre à jour les catégories si fournies
    if (category_ids !== undefined) {
      // Supprimer les anciennes associations
      await client.query(
        "DELETE FROM blog_post_categories WHERE blog_post_id = $1",
        [id]
      );

      // Insérer les nouvelles associations
      if (category_ids.length > 0) {
        const categoryValues = category_ids.map((cat_id, index) =>
          `($1, $${index + 2})`
        ).join(", ");

        await client.query(
          `INSERT INTO blog_post_categories (blog_post_id, category_id) VALUES ${categoryValues}`,
          [id, ...category_ids]
        );
      }
    }

    await client.query("COMMIT");

    // Récupérer l'article mis à jour
    const updatedPost = await db.query(
      "SELECT * FROM blog_posts WHERE id = $1",
      [id]
    );

    res.json({
      message: "Article updated successfully",
      post: updatedPost.rows[0]
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};

// DELETE /api/admin/blog/:id - Supprimer un article
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM blog_posts WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/admin/blog/comments/pending - Récupérer les commentaires en attente de modération
exports.getPendingComments = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        c.*,
        u.full_name as user_name,
        u.email as user_email,
        bp.title as post_title,
        bp.slug as post_slug
      FROM blog_comments c
      JOIN users u ON c.user_id = u.id
      JOIN blog_posts bp ON c.blog_post_id = bp.id
      WHERE c.is_approved = false
      ORDER BY c.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching pending comments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /api/admin/blog/comments/:id/approve - Approuver un commentaire
exports.approveComment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "UPDATE blog_comments SET is_approved = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json({
      message: "Comment approved successfully",
      comment: result.rows[0]
    });
  } catch (error) {
    console.error("Error approving comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/admin/blog/comments/:id - Supprimer un commentaire
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM blog_comments WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/admin/blog/stats - Statistiques globales du blog
exports.getBlogStats = async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT
        COUNT(*) FILTER (WHERE is_published = true) as published_count,
        COUNT(*) FILTER (WHERE is_published = false) as draft_count,
        SUM(view_count) as total_views,
        SUM(like_count) as total_likes,
        SUM(comment_count) as total_comments,
        AVG(avg_rating) FILTER (WHERE avg_rating > 0) as overall_avg_rating
      FROM blog_posts
    `);

    const pendingComments = await db.query(
      "SELECT COUNT(*) as count FROM blog_comments WHERE is_approved = false"
    );

    res.json({
      ...stats.rows[0],
      pending_comments: parseInt(pendingComments.rows[0].count)
    });
  } catch (error) {
    console.error("Error fetching blog stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
