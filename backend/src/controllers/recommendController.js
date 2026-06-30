const { recommend } = require("../services/recommendationEngine");

const getRecommendations = async (req, res) => {
  const { query, travelDate } = req.body;

  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return res.status(400).json({ error: "query is required" });
  }
  if (query.length > 500) {
    return res.status(400).json({ error: "query too long (max 500 chars)" });
  }

  try {
    const result = await recommend(query.trim(), travelDate || null);
    res.json(result);
  } catch (err) {
    console.error("[recommend] error:", err.message);
    res.status(500).json({ error: "Recommendation service temporarily unavailable." });
  }
};

module.exports = { getRecommendations };
