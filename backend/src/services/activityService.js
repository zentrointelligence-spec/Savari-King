const db = require('../db');

const logUserActivity = async (userId, activityType, details = {}) => {
  try {
    const newActivity = {
      type: activityType,
      timestamp: new Date().toISOString(),
      details,
    };

    // Atomically update the user's activity log and count
    await db.query(
      `UPDATE users
       SET
         activity_count = activity_count + 1,
         recent_activities = (
           SELECT jsonb_agg(elem)
           FROM (
             SELECT elem
             FROM jsonb_array_elements(
               jsonb_insert(COALESCE(recent_activities, '[]'::jsonb), '{0}', $1::jsonb)
             ) AS elem
             LIMIT 5
           ) AS limited_activities
         )
       WHERE id = $2`,
      [JSON.stringify(newActivity), userId]
    );
  } catch (error) {
    console.error(`Failed to log user activity for user ${userId}:`, error);
    // We don't want to throw an error here, as logging activity should not
    // block the main user action.
  }
};

module.exports = {
  logUserActivity,
};
