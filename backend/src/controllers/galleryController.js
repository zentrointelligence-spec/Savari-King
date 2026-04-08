const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { generateThumbnail } = require("../utils/imageProcessor");
const db = require("../db");

// Configuration du stockage pour multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads/gallery");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});
const upload = multer({ storage });

// --- Fonctions du Contrôleur ---

// Récupérer toutes les images avec des filtres optionnels
exports.getImages = async (req, res) => {
  const { category, sort, search, tags, featured } = req.query;

  let query = "SELECT * FROM gallery_images";
  const params = [];
  const conditions = [];

  // Filtrage par catégorie
  if (category) {
    conditions.push(`category = $${params.length + 1}`);
    params.push(category);
  }

  // Filtrage par tags
  if (tags) {
    const tagArray = tags.split(",").map((tag) => tag.trim());
    conditions.push(`tags && $${params.length + 1}`);
    params.push(tagArray);
  }

  // Filtrage par featured
  if (featured === "true") {
    conditions.push(`is_featured = true`);
  }

  // Recherche textuelle
  if (search && search.trim()) {
    conditions.push(
      `(title ILIKE $${params.length + 1} OR location ILIKE $${
        params.length + 1
      } OR description ILIKE $${params.length + 1})`
    );
    params.push(`%${search.trim()}%`);
  }

  // Ajouter les conditions WHERE
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  // Tri
  if (sort === "date") {
    query += " ORDER BY created_at DESC, date DESC";
  } else if (sort === "popularity") {
    query += " ORDER BY views DESC";
  } else if (sort === "featured") {
    query += " ORDER BY is_featured DESC, views DESC";
  } else {
    query += " ORDER BY created_at DESC";
  }

  try {
    const result = await db.query(query, params);

    // Enrichir les données avec des informations calculées
    const enrichedImages = result.rows.map((img) => ({
      ...img,
      // Calculer la popularité relative
      popularity_score:
        img.views > 0 ? Math.min(100, (img.views / 10) * 10) : 0,
      // Ajouter des badges dynamiques
      badges: [
        ...(img.is_featured ? ["featured"] : []),
        ...(img.views > 50 ? ["popular"] : []),
        ...(new Date(img.created_at) >
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          ? ["new"]
          : []),
      ],
    }));

    res.json(enrichedImages);
  } catch (err) {
    console.error("Error fetching images:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Récupérer une seule image par son ID et incrémenter les vues
exports.getImageById = async (req, res) => {
  const { id } = req.params;
  try {
    // Incrémenter les vues
    await db.query(
      "UPDATE gallery_images SET views = views + 1 WHERE id = $1",
      [id]
    );

    // Récupérer l'image
    const result = await db.query(
      "SELECT * FROM gallery_images WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Image not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching image by id:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Uploader une nouvelle image
exports.uploadImage = [
  upload.single("image"),
  async (req, res) => {
    const { title, description, location, category, date } = req.body;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    try {
      const fullImagePath = path.join(
        __dirname,
        "../../uploads/gallery",
        req.file.filename
      );
      const thumbnailPath = await generateThumbnail(
        fullImagePath,
        req.file.filename
      );

      // La requête INSERT est maintenant correcte et complète
      const result = await db.query(
        `INSERT INTO gallery_images (title, description, location, category, date, filename, path, thumbnail_path, views)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0) RETURNING *`,
        [
          title,
          description,
          location,
          category,
          date || new Date(),
          req.file.filename,
          `/uploads/gallery/${req.file.filename}`,
          thumbnailPath,
        ]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Error uploading image:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];

// Mettre à jour les métadonnées d'une image
exports.updateImage = async (req, res) => {
  const { id } = req.params;
  const { title, description, location, category } = req.body;
  try {
    const result = await db.query(
      `UPDATE gallery_images 
             SET title = $1, description = $2, location = $3, category = $4 
             WHERE id = $5 RETURNING *`,
      [title, description, location, category, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Image not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating image:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Supprimer une image
exports.deleteImage = async (req, res) => {
  const { id } = req.params;
  try {
    // D'abord, récupérer les chemins des fichiers pour les supprimer
    const imagePaths = await db.query(
      "SELECT path, thumbnail_path FROM gallery_images WHERE id = $1",
      [id]
    );
    if (imagePaths.rows.length === 0) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Supprimer l'image de la base de données
    await db.query("DELETE FROM gallery_images WHERE id = $1", [id]);

    // Supprimer les fichiers du système de fichiers
    const { path: imagePath, thumbnail_path: thumbPath } = imagePaths.rows[0];
    const fullImagePath = path.join(__dirname, "../..", imagePath);
    const fullThumbPath = path.join(__dirname, "../..", thumbPath);

    if (fs.existsSync(fullImagePath)) fs.unlinkSync(fullImagePath);
    if (fs.existsSync(fullThumbPath)) fs.unlinkSync(fullThumbPath);

    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error("Error deleting image:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
