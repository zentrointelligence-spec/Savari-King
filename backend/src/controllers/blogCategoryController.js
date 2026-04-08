const db = require("../db");

// GET /api/blog/categories - Récupérer toutes les catégories avec compteur de posts
exports.getAllCategories = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        bc.*,
        COUNT(DISTINCT bpc.blog_post_id) FILTER (WHERE bp.is_published = true) as post_count
      FROM blog_categories bc
      LEFT JOIN blog_post_categories bpc ON bc.id = bpc.category_id
      LEFT JOIN blog_posts bp ON bpc.blog_post_id = bp.id
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

// GET /api/blog/categories/:slug - Récupérer une catégorie spécifique
exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await db.query(
      `SELECT bc.*,
        COUNT(DISTINCT bpc.blog_post_id) FILTER (WHERE bp.is_published = true) as post_count
       FROM blog_categories bc
       LEFT JOIN blog_post_categories bpc ON bc.id = bpc.category_id
       LEFT JOIN blog_posts bp ON bpc.blog_post_id = bp.id
       WHERE bc.slug = $1 AND bc.is_active = true
       GROUP BY bc.id`,
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
