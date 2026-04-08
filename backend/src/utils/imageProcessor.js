const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

/**
 * Generates a thumbnail from an uploaded image file.
 * @param {string} sourcePath - The path to the original file.
 * @param {string} filename - The image filename.
 * @param {number} width - Desired thumbnail width.
 * @returns {string} - Path to the generated thumbnail file.
 */
async function generateThumbnail(sourcePath, filename, width = 300) {
  try {
    const thumbnailDir = path.join(
      __dirname,
      "../../uploads/gallery/thumbnails"
    );
    fs.mkdirSync(thumbnailDir, { recursive: true });
    const ext = path.extname(filename);
    const baseName = path.basename(filename, ext);
    const thumbFilename = `${baseName}_thumb${ext}`;
    const thumbPath = path.join(thumbnailDir, thumbFilename);

    await sharp(sourcePath).resize({ width }).toFile(thumbPath);

    return `/uploads/gallery/thumbnails/${thumbFilename}`;
  } catch (err) {
    console.error("Error generating thumbnail:", err);
    throw err;
  }
}

module.exports = { generateThumbnail };
