# Plan d'Implémentation du Système de Blogs Complet

## 🎯 Objectif Global

Créer un système de blogs complet avec catégories, gestion admin, fonctionnalités sociales, et contenu initial de 20 articles sur le Sud de l'Inde.

---

## 📋 Spécifications Validées

### **1. Architecture**
- ✅ Système de catégories many-to-many (`blog_categories` + `blog_post_categories`)
- ✅ Travel Guides = une catégorie de blog parmi d'autres
- ✅ Support multilingue via i18n (comme le reste de l'app)

### **2. Catégories de Blogs**
1. **Travel Guides** (Guides de Voyage)
2. **Tips & Advice** (Conseils et Astuces)
3. **Culture & History** (Culture et Histoire)
4. **Food & Cuisine** (Gastronomie)
5. **Adventure & Activities** (Aventure et Activités)

### **3. Fonctionnalités**
- ✅ Système de likes/favoris
- ✅ Commentaires sur les blogs
- ✅ Rating/Notes (1-5 étoiles)
- ✅ Partage social
- ✅ Related tours/destinations
- ✅ Table of contents automatique
- ✅ Tags/Mots-clés
- ❌ Newsletter subscription (pas prioritaire)
- ❌ Gallery d'images (page séparée existante)

### **4. Interface**
- **Home Page:** Section "Travel Guides" affichant 3-6 derniers Travel Guides uniquement
- **Blog Page:** Sidebar avec filtres de catégories
- **Admin Panel:** Interface complète de gestion

### **5. Contenu Initial**
- **20 blogs total:**
  - 7 Travel Guides
  - 13 autres blogs répartis dans les 4 autres catégories
- **Contexte:** Sud de l'Inde
- **Génération:** Contenu et images via recherche web

### **6. SEO**
- Sitemap XML pour blogs
- Meta tags (déjà dans structure DB)
- URLs optimisées

---

## 🏗️ Architecture Technique

### **Base de Données**

```
blog_categories (Table des catégories)
├── id (PK)
├── name
├── slug
├── description
├── icon (FontAwesome icon name)
├── color (Tailwind color class)
├── display_order
└── created_at

blog_posts (Table existante - utilisation complète)
├── Relations via blog_post_categories
└── Champ "category" VARCHAR obsolète (migration)

blog_post_categories (Table de liaison)
├── blog_post_id (FK)
├── category_id (FK)
└── PRIMARY KEY (blog_post_id, category_id)

blog_comments (Nouvelle table)
├── id (PK)
├── blog_post_id (FK)
├── user_id (FK)
├── parent_comment_id (FK, nullable - pour réponses)
├── content
├── is_approved
├── created_at
└── updated_at

blog_likes (Nouvelle table)
├── id (PK)
├── blog_post_id (FK)
├── user_id (FK)
├── created_at
└── UNIQUE (blog_post_id, user_id)

blog_ratings (Nouvelle table)
├── id (PK)
├── blog_post_id (FK)
├── user_id (FK)
├── rating (1-5)
├── created_at
└── UNIQUE (blog_post_id, user_id)
```

---

## 📅 Plan d'Implémentation par Phases

---

## **PHASE 1: Fondations Base de Données** ⏱️ 1-2h

### ✅ Tâches

#### 1.1 Créer les Catégories Initiales
```sql
-- Migration: seed_blog_categories.sql
INSERT INTO blog_categories (name, slug, description, icon, color, display_order) VALUES
('Travel Guides', 'travel-guides', 'Comprehensive guides for exploring South India', 'fa-map', 'bg-blue-500', 1),
('Tips & Advice', 'tips-advice', 'Practical tips for travelers', 'fa-lightbulb', 'bg-yellow-500', 2),
('Culture & History', 'culture-history', 'Discover the rich heritage of South India', 'fa-landmark', 'bg-purple-500', 3),
('Food & Cuisine', 'food-cuisine', 'Culinary adventures in South Indian cuisine', 'fa-utensils', 'bg-red-500', 4),
('Adventure & Activities', 'adventure-activities', 'Thrilling experiences and outdoor activities', 'fa-hiking', 'bg-green-500', 5);
```

#### 1.2 Créer Tables Manquantes
```sql
-- Migration: create_blog_comments_table.sql
CREATE TABLE blog_comments (
  id SERIAL PRIMARY KEY,
  blog_post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id INTEGER REFERENCES blog_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blog_comments_post ON blog_comments(blog_post_id, created_at DESC);
CREATE INDEX idx_blog_comments_user ON blog_comments(user_id);
CREATE INDEX idx_blog_comments_parent ON blog_comments(parent_comment_id);

-- Migration: create_blog_likes_table.sql
CREATE TABLE blog_likes (
  id SERIAL PRIMARY KEY,
  blog_post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (blog_post_id, user_id)
);

CREATE INDEX idx_blog_likes_post ON blog_likes(blog_post_id);
CREATE INDEX idx_blog_likes_user ON blog_likes(user_id);

-- Migration: create_blog_ratings_table.sql
CREATE TABLE blog_ratings (
  id SERIAL PRIMARY KEY,
  blog_post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (blog_post_id, user_id)
);

CREATE INDEX idx_blog_ratings_post ON blog_ratings(blog_post_id);
CREATE INDEX idx_blog_ratings_user ON blog_ratings(user_id);
```

#### 1.3 Améliorer Table blog_categories
```sql
-- Migration: enhance_blog_categories_table.sql
ALTER TABLE blog_categories
ADD COLUMN icon VARCHAR(50) DEFAULT 'fa-bookmark',
ADD COLUMN color VARCHAR(50) DEFAULT 'bg-gray-500',
ADD COLUMN display_order INTEGER DEFAULT 0,
ADD COLUMN is_active BOOLEAN DEFAULT true;

CREATE INDEX idx_blog_categories_active ON blog_categories(is_active, display_order);
```

#### 1.4 Triggers pour Statistiques Auto
```sql
-- Migration: create_blog_statistics_triggers.sql

-- Trigger pour mettre à jour like_count
CREATE OR REPLACE FUNCTION update_blog_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE blog_posts SET like_count = like_count + 1 WHERE id = NEW.blog_post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE blog_posts SET like_count = like_count - 1 WHERE id = OLD.blog_post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_blog_like_count
AFTER INSERT OR DELETE ON blog_likes
FOR EACH ROW EXECUTE FUNCTION update_blog_like_count();

-- Trigger pour mettre à jour comment_count
CREATE OR REPLACE FUNCTION update_blog_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.is_approved = true THEN
    UPDATE blog_posts SET comment_count = comment_count + 1 WHERE id = NEW.blog_post_id;
  ELSIF TG_OP = 'DELETE' AND OLD.is_approved = true THEN
    UPDATE blog_posts SET comment_count = comment_count - 1 WHERE id = OLD.blog_post_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.is_approved != OLD.is_approved THEN
    IF NEW.is_approved THEN
      UPDATE blog_posts SET comment_count = comment_count + 1 WHERE id = NEW.blog_post_id;
    ELSE
      UPDATE blog_posts SET comment_count = comment_count - 1 WHERE id = NEW.blog_post_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_blog_comment_count
AFTER INSERT OR UPDATE OR DELETE ON blog_comments
FOR EACH ROW EXECUTE FUNCTION update_blog_comment_count();

-- Trigger pour mettre à jour avg_rating et rating_count
CREATE OR REPLACE FUNCTION update_blog_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE blog_posts
  SET
    avg_rating = (SELECT AVG(rating)::NUMERIC(3,2) FROM blog_ratings WHERE blog_post_id = COALESCE(NEW.blog_post_id, OLD.blog_post_id)),
    rating_count = (SELECT COUNT(*) FROM blog_ratings WHERE blog_post_id = COALESCE(NEW.blog_post_id, OLD.blog_post_id))
  WHERE id = COALESCE(NEW.blog_post_id, OLD.blog_post_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_blog_rating_stats
AFTER INSERT OR UPDATE OR DELETE ON blog_ratings
FOR EACH ROW EXECUTE FUNCTION update_blog_rating_stats();
```

### 📊 Résultat Phase 1
- ✅ 5 catégories créées et configurées
- ✅ Tables comments, likes, ratings créées
- ✅ Triggers automatiques pour statistiques
- ✅ Indexes pour performance

---

## **PHASE 2: Backend API - CRUD Complet** ⏱️ 2-3h

### ✅ Tâches

#### 2.1 Blog Categories Controller
**Fichier:** `backend/src/controllers/blogCategoryController.js`

```javascript
const db = require("../db");

// GET /api/blog/categories - Récupérer toutes les catégories
exports.getAllCategories = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT bc.*,
        COUNT(DISTINCT bpc.blog_post_id) as post_count
      FROM blog_categories bc
      LEFT JOIN blog_post_categories bpc ON bc.id = bpc.category_id
      LEFT JOIN blog_posts bp ON bpc.blog_post_id = bp.id AND bp.is_published = true
      WHERE bc.is_active = true
      GROUP BY bc.id
      ORDER BY bc.display_order ASC, bc.name ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/blog/categories/:slug - Récupérer une catégorie
exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await db.query(
      "SELECT * FROM blog_categories WHERE slug = $1 AND is_active = true",
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
```

#### 2.2 Enhanced Blog Controller
**Fichier:** `backend/src/controllers/blogController.js` (étendre)

```javascript
// GET /api/blog?category=travel-guides&page=1&limit=10
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

// GET /api/blog/recent?category=travel-guides&limit=6
exports.getRecentPosts = async (req, res) => {
  try {
    const { category, limit = 3 } = req.query;

    let query = `
      SELECT DISTINCT
        bp.id, bp.title, bp.slug, bp.excerpt,
        bp.featured_image_url, bp.created_at,
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

// GET /api/blog/:slug - Avec incrémentation view_count
exports.getPostBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    // Récupérer le post avec toutes ses données
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

// POST /api/blog/:id/like - Toggle like
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Depuis auth middleware

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
      res.json({ liked: false });
    } else {
      // Like
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

// POST /api/blog/:id/rate - Ajouter/Modifier rating
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
      DO UPDATE SET rating = $3
    `, [id, userId, rating]);

    // Récupérer nouvelles stats
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

// GET /api/blog/:id/comments - Récupérer commentaires
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

// POST /api/blog/:id/comments - Ajouter commentaire
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

#### 2.3 Admin Blog Controller
**Fichier:** `backend/src/controllers/adminBlogController.js`

```javascript
const db = require("../db");

// GET /api/admin/blog - Tous les posts (admin)
exports.getAllPosts = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        bp.*,
        u.full_name as author_name,
        ARRAY_AGG(DISTINCT bc.name) as categories
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      LEFT JOIN blog_post_categories bpc ON bp.id = bpc.blog_post_id
      LEFT JOIN blog_categories bc ON bpc.category_id = bc.id
      GROUP BY bp.id, u.full_name
      ORDER BY bp.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching admin posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/admin/blog - Créer un post
exports.createPost = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const {
      title, slug, content, excerpt, featured_image_url, thumbnail_image,
      category_ids, tags, is_published, is_featured, reading_time,
      meta_title, meta_description, meta_keywords
    } = req.body;

    const authorId = req.user.id;

    // Créer le post
    const postResult = await client.query(`
      INSERT INTO blog_posts (
        title, slug, content, excerpt, featured_image_url, thumbnail_image,
        author_id, is_published, is_featured, reading_time,
        meta_title, meta_description, meta_keywords,
        published_at, moderation_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      title, slug, content, excerpt, featured_image_url, thumbnail_image,
      authorId, is_published, is_featured, reading_time,
      meta_title, meta_description, meta_keywords,
      is_published ? new Date() : null, 'approved'
    ]);

    const postId = postResult.rows[0].id;

    // Associer catégories
    if (category_ids && category_ids.length > 0) {
      for (const categoryId of category_ids) {
        await client.query(
          "INSERT INTO blog_post_categories (blog_post_id, category_id) VALUES ($1, $2)",
          [postId, categoryId]
        );
      }
    }

    // Ajouter tags
    if (tags && tags.length > 0) {
      await client.query(
        "UPDATE blog_posts SET tags = $1 WHERE id = $2",
        [tags, postId]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(postResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};

// PUT /api/admin/blog/:id - Mettre à jour un post
exports.updatePost = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const updateFields = req.body;

    // Construire la requête dynamiquement
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    const allowedFields = [
      'title', 'slug', 'content', 'excerpt', 'featured_image_url',
      'thumbnail_image', 'is_published', 'is_featured', 'reading_time',
      'meta_title', 'meta_description', 'meta_keywords', 'tags'
    ];

    for (const [key, value] of Object.entries(updateFields)) {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (setClause.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    values.push(id);
    const query = `
      UPDATE blog_posts
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await client.query(query, values);

    // Mettre à jour catégories si fourni
    if (updateFields.category_ids) {
      await client.query("DELETE FROM blog_post_categories WHERE blog_post_id = $1", [id]);
      for (const categoryId of updateFields.category_ids) {
        await client.query(
          "INSERT INTO blog_post_categories (blog_post_id, category_id) VALUES ($1, $2)",
          [id, categoryId]
        );
      }
    }

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};

// DELETE /api/admin/blog/:id - Supprimer un post
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM blog_posts WHERE id = $1", [id]);

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/admin/blog/comments/pending - Commentaires en attente
exports.getPendingComments = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        c.*,
        u.full_name as user_name,
        bp.title as post_title
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

// PUT /api/admin/blog/comments/:id/approve - Approuver commentaire
exports.approveComment = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "UPDATE blog_comments SET is_approved = true WHERE id = $1",
      [id]
    );

    res.json({ message: "Comment approved" });
  } catch (error) {
    console.error("Error approving comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
```

#### 2.4 Routes
**Fichiers à créer/modifier:**

```javascript
// backend/src/routes/blogRoutes.js (étendre)
const express = require("express");
const blogController = require("../controllers/blogController");
const { authenticateToken } = require("../middleware/authMiddleware");
const router = express.Router();

// Routes publiques
router.get("/", blogController.getAllPublishedPosts);
router.get("/recent", blogController.getRecentPosts);
router.get("/:slug", blogController.getPostBySlug);
router.get("/:id/comments", blogController.getComments);

// Routes authentifiées
router.post("/:id/like", authenticateToken, blogController.toggleLike);
router.post("/:id/rate", authenticateToken, blogController.rateBlogPost);
router.post("/:id/comments", authenticateToken, blogController.addComment);

module.exports = router;

// backend/src/routes/blogCategoryRoutes.js (nouveau)
const express = require("express");
const categoryController = require("../controllers/blogCategoryController");
const router = express.Router();

router.get("/", categoryController.getAllCategories);
router.get("/:slug", categoryController.getCategoryBySlug);

module.exports = router;

// backend/src/routes/adminBlogRoutes.js (nouveau)
const express = require("express");
const adminBlogController = require("../controllers/adminBlogController");
const { authenticateToken, requireAdmin } = require("../middleware/authMiddleware");
const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get("/", adminBlogController.getAllPosts);
router.post("/", adminBlogController.createPost);
router.put("/:id", adminBlogController.updatePost);
router.delete("/:id", adminBlogController.deletePost);

router.get("/comments/pending", adminBlogController.getPendingComments);
router.put("/comments/:id/approve", adminBlogController.approveComment);

module.exports = router;
```

#### 2.5 Enregistrer Routes dans index.js
```javascript
// backend/src/routes/index.js (ajouter)
const blogCategoryRoutes = require("./blogCategoryRoutes");
const adminBlogRoutes = require("./adminBlogRoutes");

router.use("/blog/categories", blogCategoryRoutes);
router.use("/admin/blog", adminBlogRoutes);
```

### 📊 Résultat Phase 2
- ✅ API CRUD complète pour blogs
- ✅ Filtrage par catégorie
- ✅ Likes, ratings, commentaires
- ✅ Routes admin sécurisées

---

## **PHASE 3: Génération Contenu - 20 Blogs** ⏱️ 3-4h

### ✅ Stratégie de Contenu

#### Distribution par Catégorie:
1. **Travel Guides** - 7 articles
2. **Tips & Advice** - 4 articles
3. **Culture & History** - 3 articles
4. **Food & Cuisine** - 3 articles
5. **Adventure & Activities** - 3 articles

#### Sujets pour Travel Guides (7):
1. "Complete Guide to Chennai: Gateway to South India"
2. "Exploring Kerala Backwaters: A Comprehensive Travel Guide"
3. "Pondicherry Travel Guide: French Colonial Charm Meets Indian Culture"
4. "Mysore Palace and Beyond: Ultimate Mysore Travel Guide"
5. "Hampi: A Complete Guide to the Ancient Ruins"
6. "Coorg Travel Guide: Scotland of India"
7. "Madurai Temple City: Complete Traveler's Guide"

#### Sujets pour Tips & Advice (4):
1. "10 Essential Travel Tips for First-Time Visitors to South India"
2. "Best Time to Visit South India: Season-by-Season Guide"
3. "How to Travel South India on a Budget"
4. "Safety Tips for Solo Female Travelers in South India"

#### Sujets pour Culture & History (3):
1. "The Rich Dravidian Heritage of South India"
2. "Ancient Temples of Tamil Nadu: Architectural Marvels"
3. "Classical Dance Forms of South India: Bharatanatyam, Kathakali & More"

#### Sujets pour Food & Cuisine (3):
1. "Ultimate Guide to South Indian Cuisine: From Dosa to Biryani"
2. "Street Food Delights in Chennai and Bangalore"
3. "Spice Plantations of Kerala: A Culinary Journey"

#### Sujets pour Adventure & Activities (3):
1. "Trekking in the Western Ghats: Best Routes and Tips"
2. "Water Sports in Goa and Karnataka Coast"
3. "Wildlife Safaris: Best National Parks in South India"

### 📝 Structure Article Type:

```javascript
{
  title: "Complete Guide to Chennai: Gateway to South India",
  slug: "complete-guide-chennai-gateway-south-india",
  excerpt: "Discover Chennai, the vibrant capital of Tamil Nadu...",
  content: "Full article content with sections, paragraphs...",
  featured_image_url: "URL from Unsplash/Pexels API",
  thumbnail_image: "Thumbnail version",
  reading_time: 8, // Minutes
  tags: ["Chennai", "Tamil Nadu", "Travel Guide", "South India"],
  meta_title: "Chennai Travel Guide 2025 | Complete City Guide",
  meta_description: "...",
  meta_keywords: "chennai travel, chennai guide, tamil nadu tourism",
  is_published: true,
  is_featured: false, // 2-3 seront featured
  language: "en" // Traduit ensuite
}
```

### 🖼️ Sources Images:
- **Unsplash API** pour images libres de droits
- **Pexels API** comme fallback
- Keywords: "Chennai India", "Kerala backwaters", "Mysore palace", etc.

### 📊 Résultat Phase 3
- ✅ 20 articles complets créés
- ✅ Images haute qualité associées
- ✅ SEO optimisé pour chaque article
- ✅ Tags et catégories assignés

---

## **PHASE 4: Frontend - Blog Page Améliorée** ⏱️ 2-3h

### ✅ Tâches

#### 4.1 BlogPage.jsx avec Sidebar Filtres
```jsx
// Structure proposée:
<div className="container">
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
    {/* Sidebar - 1/4 */}
    <aside className="lg:col-span-1">
      {/* Filtres catégories */}
      {/* Recherche */}
      {/* Tags populaires */}
    </aside>

    {/* Main Content - 3/4 */}
    <main className="lg:col-span-3">
      {/* Liste blogs */}
      {/* Pagination */}
    </main>
  </div>
</div>
```

#### 4.2 BlogPostPage.jsx Enrichie
- Affichage contenu complet
- Boutons Like/Share
- Système de rating (étoiles)
- Section commentaires
- Posts similaires
- Breadcrumbs avec catégorie

#### 4.3 Composants Nouveaux
- `BlogSidebar.jsx` - Filtres catégories
- `BlogCategoryFilter.jsx` - Liste catégories avec compteurs
- `BlogRating.jsx` - Stars rating component
- `BlogComments.jsx` - Section commentaires
- `BlogShare.jsx` - Boutons partage social

### 📊 Résultat Phase 4
- ✅ Page blog avec sidebar filtres
- ✅ Page article enrichie
- ✅ Composants réutilisables

---

## **PHASE 5: Frontend - Admin Interface** ⏱️ 3-4h

### ✅ Tâches

#### 5.1 Admin Blog Management Page
**Fichier:** `frontend/src/pages/admin/AdminBlogPage.jsx`

Fonctionnalités:
- Liste tous les blogs (table)
- Filtres: catégorie, status, recherche
- Actions: Edit, Delete, Publish/Unpublish
- Bouton "Create New Blog"

#### 5.2 Admin Blog Editor
**Fichier:** `frontend/src/pages/admin/AdminBlogEditorPage.jsx`

Fonctionnalités:
- Rich text editor (TinyMCE ou Quill)
- Upload images
- Sélection catégories (checkboxes)
- Tags input
- Meta fields (SEO)
- Preview mode
- Save draft / Publish

#### 5.3 Admin Comments Moderation
**Fichier:** `frontend/src/pages/admin/AdminBlogCommentsPage.jsx`

Fonctionnalités:
- Liste commentaires en attente
- Approve/Reject
- Delete

### 📊 Résultat Phase 5
- ✅ Interface admin complète
- ✅ Création/édition blogs
- ✅ Modération commentaires

---

## **PHASE 6: Intégration Home Page** ⏱️ 1h

### ✅ Tâches

#### 6.1 Fixer getTravelGuides Endpoint
```javascript
// backend/src/controllers/homepageController.js
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
        AND bc.slug = 'travel-guides'  -- ✅ FILTRE TRAVEL GUIDES
      ORDER BY
        bp.is_featured DESC,
        bp.published_at DESC NULLS LAST
      LIMIT $1
    `;

    const { rows } = await pool.query(query, [limit]);

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

#### 6.2 TravelGuide.jsx - Adapter au format API
```jsx
// Mapper les champs correctement
const guides = data.map(post => ({
  id: post.id,
  title: post.title,
  slug: post.slug,
  description: post.excerpt,
  image_url: post.featured_image_url || post.thumbnail_image,
  author: post.author_name,
  publishedAt: post.published_at,
  viewCount: post.view_count,
  readingTime: post.reading_time,
  category: 'Travel Guide'
}));
```

### 📊 Résultat Phase 6
- ✅ Home page affiche Travel Guides filtrés
- ✅ Lien vers page blog fonctionnel

---

## **PHASE 7: Multilangue & SEO** ⏱️ 2-3h

### ✅ Tâches

#### 7.1 Traductions i18n
Ajouter clés dans `frontend/src/i18n/locales/`:

```json
// en.json, fr.json, es.json, etc.
{
  "blog": {
    "title": "Travel Blog",
    "categories": "Categories",
    "allPosts": "All Posts",
    "searchPlaceholder": "Search articles...",
    "readMore": "Read More",
    "likePost": "Like this post",
    "ratePost": "Rate this article",
    "comments": "Comments",
    "addComment": "Add a comment",
    "sharePost": "Share",
    "relatedPosts": "Related Articles"
  }
}
```

#### 7.2 Sitemap XML Generator
**Fichier:** `backend/src/utils/sitemapGenerator.js`

```javascript
const db = require("../db");

exports.generateBlogSitemap = async () => {
  const result = await db.query(`
    SELECT slug, updated_at
    FROM blog_posts
    WHERE is_published = true
    ORDER BY updated_at DESC
  `);

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  result.rows.forEach(post => {
    xml += '  <url>\n';
    xml += `    <loc>https://yourdomain.com/blog/${post.slug}</loc>\n`;
    xml += `    <lastmod>${post.updated_at.toISOString()}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
};

// Route: GET /api/sitemap-blog.xml
```

### 📊 Résultat Phase 7
- ✅ Blogs traduits via i18n
- ✅ Sitemap XML généré dynamiquement

---

## **PHASE 8: Tests & Optimisation** ⏱️ 1-2h

### ✅ Tâches

- Tester CRUD complet
- Vérifier filtres catégories
- Tester likes/ratings/commentaires
- Performance: indexes, queries optimisées
- SEO: vérifier meta tags
- Responsive design
- Lazy loading images

---

## 📊 Estimation Totale

| Phase | Durée | Description |
|-------|-------|-------------|
| 1 | 1-2h | Base de données |
| 2 | 2-3h | Backend API |
| 3 | 3-4h | Génération contenu |
| 4 | 2-3h | Frontend blog page |
| 5 | 3-4h | Admin interface |
| 6 | 1h | Home page integration |
| 7 | 2-3h | Multilangue & SEO |
| 8 | 1-2h | Tests |
| **TOTAL** | **15-22h** | **~2-3 jours** |

---

## 🚀 Ordre d'Exécution Recommandé

1. **Phase 1** (DB) → Fondations solides
2. **Phase 2** (Backend) → API fonctionnelle
3. **Phase 3** (Contenu) → Données réelles
4. **Phase 6** (Home) → Quick win visible
5. **Phase 4** (Frontend Blog) → UX complète
6. **Phase 5** (Admin) → Gestion autonome
7. **Phase 7** (i18n/SEO) → Finitions
8. **Phase 8** (Tests) → Validation

---

## 📝 Notes Importantes

### **Images & Contenu**
- Utiliser Unsplash API (50 requests/hour gratuit)
- Keywords spécifiques: "chennai street", "kerala backwaters boat", etc.
- Contenu généré via recherche web + structure manuelle

### **Performance**
- Pagination par défaut: 10 posts/page
- Cache API responses (Redis si disponible)
- Lazy load images (Intersection Observer)

### **Sécurité**
- Sanitize HTML content (DOMPurify)
- Rate limiting sur likes/comments
- CSRF protection
- XSS prevention

---

**Prêt à démarrer l'implémentation?** 🎯

Je propose de commencer par la **Phase 1 (Base de Données)** pour poser les fondations.
