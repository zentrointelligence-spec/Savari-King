# Implémentation Système de Blogs - État d'Avancement

## ✅ PHASE 1 COMPLÈTE - Base de Données

### Migrations Exécutées
1. ✅ **enhance_blog_categories_table.sql** - Colonnes icon, color, display_order ajoutées
2. ✅ **create_blog_comments_table.sql** - Table comments créée avec modération
3. ✅ **create_blog_likes_table.sql** - Table likes créée
4. ✅ **create_blog_ratings_table.sql** - Table ratings 1-5 étoiles créée
5. ✅ **create_blog_statistics_triggers.sql** - Triggers automatiques pour like_count, comment_count, avg_rating
6. ✅ **seed_blog_categories.sql** - 5 catégories insérées

### Catégories Créées
| ID | Nom | Slug | Icon | Color | Order |
|----|-----|------|------|-------|-------|
| 1 | Travel Guides | travel-guides | fa-map | bg-blue-500 | 1 |
| 2 | Tips & Advice | tips-advice | fa-lightbulb | bg-yellow-500 | 2 |
| 3 | Culture & History | culture-history | fa-landmark | bg-purple-500 | 3 |
| 4 | Food & Cuisine | food-cuisine | fa-utensils | bg-red-500 | 4 |
| 5 | Adventure & Activities | adventure-activities | fa-hiking | bg-green-500 | 5 |

---

## ✅ PHASE 2 COMPLÈTE - Backend API

### Controllers Créés
1. ✅ **blogCategoryController.js** - GET /categories et /categories/:slug
2. ✅ **blogController.js** - Complètement réécrit avec filtres, likes, ratings, comments
3. ✅ **adminBlogController.js** - CRUD complet admin avec modération commentaires

### Routes Créées
1. ✅ **blogRoutes.js** - Routes publiques + authentifiées (likes, ratings, comments)
2. ✅ **blogCategoryRoutes.js** - Routes catégories
3. ✅ **adminBlogRoutes.js** - Routes admin avec authentification
4. ✅ **index.js** - Toutes les routes enregistrées

### Homepage Fixed
1. ✅ **homepageController.js** - getTravelGuides filtre sur catégorie 'travel-guides'

#### 1. Étendre blogController.js

Ajouter ces fonctions au fichier existant:

```javascript
// À ajouter après les fonctions existantes dans backend/src/controllers/blogController.js

const db = require("../db");

// REMPLACER la fonction getAllPublishedPosts existante par celle-ci:
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
        ARRAY_AGG(DISTINCT bc.name) as categories,
        ARRAY_AGG(DISTINCT bc.slug) as category_slugs
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

    if (category) {
      query += ` AND bc.slug = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      query += ` AND (
        bp.title ILIKE $${paramIndex} OR
        bp.excerpt ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += `
      GROUP BY bp.id, u.full_name
      ORDER BY bp.published_at DESC NULLS LAST, bp.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    let countQuery = `
      SELECT COUNT(DISTINCT bp.id) as total
      FROM blog_posts bp
      LEFT JOIN blog_post_categories bpc ON bp.id = bpc.blog_post_id
      LEFT JOIN blog_categories bc ON bpc.category_id = bc.id
      WHERE bp.is_published = true
        AND bp.moderation_status = 'approved'
    `;

    const countParams = [];
    if (category) {
      countQuery += ` AND bc.slug = $1`;
      countParams.push(category);
    }
    if (search) {
      const index = countParams.length + 1;
      countQuery += ` AND (bp.title ILIKE $${index} OR bp.excerpt ILIKE $${index})`;
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

// REMPLACER getRecentPosts par:
exports.getRecentPosts = async (req, res) => {
  try {
    const { category, limit = 3 } = req.query;

    let query = `
      SELECT DISTINCT
        bp.id, bp.title, bp.slug, bp.excerpt,
        bp.featured_image_url, bp.thumbnail_image, bp.created_at,
        u.full_name as author_name,
        ARRAY_AGG(DISTINCT bc.name) as categories
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

// REMPLACER getPostBySlug par:
exports.getPostBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const result = await db.query(`
      SELECT
        bp.*,
        u.full_name as author_name,
        u.email as author_email,
        ARRAY_AGG(DISTINCT bc.id) as category_ids,
        ARRAY_AGG(DISTINCT bc.name) as categories,
        ARRAY_AGG(DISTINCT bc.slug) as category_slugs
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

    // Incrémenter view_count
    await db.query(
      "UPDATE blog_posts SET view_count = view_count + 1 WHERE id = $1",
      [result.rows[0].id]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// AJOUTER ces nouvelles fonctions:

// POST /api/blog/:id/like - Toggle like
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingLike = await db.query(
      "SELECT id FROM blog_likes WHERE blog_post_id = $1 AND user_id = $2",
      [id, userId]
    );

    if (existingLike.rows.length > 0) {
      await db.query(
        "DELETE FROM blog_likes WHERE blog_post_id = $1 AND user_id = $2",
        [id, userId]
      );
      res.json({ liked: false });
    } else {
      await db.query(
        "INSERT INTO blog_likes (blog_post_id, user_id) VALUES ($1, $2)",
        [id, userId]
      );
      res.json({ liked: true });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/blog/:id/rate - Rate post
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

    const stats = await db.query(
      "SELECT avg_rating, rating_count FROM blog_posts WHERE id = $1",
      [id]
    );

    res.json(stats.rows[0]);
  } catch (error) {
    console.error("Error rating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/blog/:id/comments - Get comments
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

// POST /api/blog/:id/comments - Add comment
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, parent_comment_id } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    const result = await db.query(`
      INSERT INTO blog_comments (blog_post_id, user_id, content, parent_comment_id, is_approved)
      VALUES ($1, $2, $3, $4, false)
      RETURNING *
    `, [id, userId, content, parent_comment_id || null]);

    res.status(201).json({
      message: "Comment submitted for moderation",
      comment: result.rows[0]
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
```

---

## ⏸️ PROCHAINES ÉTAPES (À faire manuellement)

### 1. Terminer Phase 2 Backend

Créer les fichiers suivants en utilisant le code du document **BLOG_SYSTEM_IMPLEMENTATION_PLAN.md**:

- ✅ `backend/src/controllers/blogCategoryController.js` (FAIT)
- 🔲 `backend/src/controllers/blogController.js` (remplacer fonctions + ajouter nouvelles)
- 🔲 `backend/src/controllers/adminBlogController.js` (créer avec CRUD complet)
- 🔲 `backend/src/routes/blogCategoryRoutes.js`
- 🔲 `backend/src/routes/adminBlogRoutes.js`
- 🔲 `backend/src/routes/blogRoutes.js` (étendre avec nouvelles routes)
- 🔲 `backend/src/routes/index.js` (enregistrer nouvelles routes)

### 2. Phase 3: Générer 20 Blogs

Utiliser un script ou API pour générer:
- 7 Travel Guides
- 4 Tips & Advice
- 3 Culture & History
- 3 Food & Cuisine
- 3 Adventure & Activities

**Sources contenu:**
- Recherche web sur Sud de l'Inde
- Images: Unsplash API (keywords: chennai, kerala, mysore, etc.)

### 3. Phase 6: Fixer Home Page Travel Guides

Modifier `backend/src/controllers/homepageController.js`:

```javascript
exports.getTravelGuides = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const query = `
      SELECT DISTINCT
        bp.id, bp.title, bp.slug, bp.excerpt,
        bp.featured_image_url, bp.thumbnail_image,
        bp.view_count, bp.reading_time,
        bp.avg_rating, bp.published_at,
        u.full_name as author_name
      FROM blog_posts bp
      JOIN users u ON bp.author_id = u.id
      JOIN blog_post_categories bpc ON bp.id = bpc.blog_post_id
      JOIN blog_categories bc ON bpc.category_id = bc.id
      WHERE bp.is_published = true
        AND bp.moderation_status = 'approved'
        AND bc.slug = 'travel-guides'  -- FILTRE TRAVEL GUIDES
      ORDER BY
        bp.is_featured DESC,
        bp.published_at DESC NULLS LAST
      LIMIT $1
    `;

    const { rows } = await db.query(query, [limit]);

    res.status(200).json({
      status: 200,
      data: rows,
      total: rows.length
    });
  } catch (err) {
    console.error("Error fetching travel guides:", err);
    res.status(200).json({ status: 200, data: [] });
  }
};
```

### 4. Frontend (Phases 4-5-7)

Créer/Modifier:
- BlogPage.jsx avec sidebar filtres
- BlogPostPage.jsx enrichie
- Admin blog management pages
- Composants: BlogSidebar, BlogRating, BlogComments
- Traductions i18n pour blogs

---

## 📊 Récapitulatif État

| Phase | Status | Détails |
|-------|--------|---------|
| Phase 1: DB | ✅ 100% | Tables, triggers, catégories créés |
| Phase 2: Backend | ✅ 100% | Controllers, routes, homepage fix complets |
| Phase 3: Contenu | ⏸️ 0% | 20 blogs à générer |
| Phase 4: Frontend Blog | ⏸️ 0% | BlogPage avec filtres |
| Phase 5: Frontend Admin | ⏸️ 0% | Admin CRUD interface |
| Phase 6: Home Page | ⏸️ 0% | Section Travel Guides frontend |
| Phase 7: i18n/SEO | ⏸️ 0% | Traductions + sitemap |
| Phase 8: Tests | ⏸️ 0% | Tests & optimisation |

---

## 🎯 Instructions pour Continuer

1. **Copier** le code fourni ci-dessus dans les fichiers correspondants
2. **Créer** adminBlogController.js en copiant depuis BLOG_SYSTEM_IMPLEMENTATION_PLAN.md
3. **Créer** les routes (blogCategoryRoutes.js, adminBlogRoutes.js)
4. **Enregistrer** les routes dans backend/src/routes/index.js
5. **Redémarrer** le backend
6. **Générer** les 20 blogs (manuellement ou script)
7. **Implémenter** le frontend selon le plan

---

**Fichiers de référence complets:** [BLOG_SYSTEM_IMPLEMENTATION_PLAN.md](BLOG_SYSTEM_IMPLEMENTATION_PLAN.md)
