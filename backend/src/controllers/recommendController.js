const { recommend } = require("../services/recommendationEngine");

const getRecommendations = (req, res) => {
  const { query } = req.body;
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return res.status(400).json({ error: "query is required" });
  }
  if (query.length > 500) {
    return res.status(400).json({ error: "query too long" });
  }
  const result = recommend(query.trim());
  res.json(result);
};

module.exports = { getRecommendations };
