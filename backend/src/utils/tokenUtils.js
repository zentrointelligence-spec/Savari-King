const crypto = require("crypto");

// Génère une chaîne de caractères aléatoire et sécurisée en hexadécimal.
const generateToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

module.exports = { generateToken };
