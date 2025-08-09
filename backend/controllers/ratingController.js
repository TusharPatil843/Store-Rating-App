const db = require('../config/db');

exports.submitRating = async (req, res) => {
  const userId = req.user.id;
  const storeId = req.params.storeId;
  const { rating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ msg: 'Rating must be between 1 and 5' });
  }

  try {
    // Check if user already rated
    const [existing] = await db.query(
      'SELECT * FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    if (existing.length) {
      // Update existing rating
      await db.query(
        'UPDATE ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND store_id = ?',
        [rating, userId, storeId]
      );
      return res.json({ msg: 'Rating updated successfully' });
    }

    // Insert new rating
    await db.query(
      'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
      [userId, storeId, rating]
    );

    res.status(201).json({ msg: 'Rating submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error submitting rating' });
  }
};

exports.getUserRatingsForStore = async (req, res) => {
  const userId = req.user.id;
  const storeId = req.params.storeId;

  try {
    const [[storeInfo]] = await db.query(
      `
      SELECT 
        s.*, 
        IFNULL(ROUND(AVG(r.rating), 1), 0) as average_rating,
        (
          SELECT rating 
          FROM ratings 
          WHERE user_id = ? AND store_id = s.id
        ) AS user_rating
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE s.id = ?
      GROUP BY s.id
      `,
      [userId, storeId]
    );

    if (!storeInfo) return res.status(404).json({ msg: 'Store not found' });

    res.json(storeInfo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error fetching store ratings' });
  }
};


exports.getRatingsForStoreOwner = async (req, res) => {
  const ownerId = req.user.id;

  try {
    const [ratings] = await db.query(
      `
      SELECT 
        s.name AS store_name,
        s.id AS store_id,
        u.name AS user_name,
        u.email,
        r.rating,
        r.updated_at
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      WHERE s.owner_id = ?
      ORDER BY r.updated_at DESC
      `,
      [ownerId]
    );

    const [[avgRating]] = await db.query(
      `
      SELECT ROUND(AVG(r.rating), 1) AS average_rating
      FROM ratings r
      JOIN stores s ON s.id = r.store_id
      WHERE s.owner_id = ?
      `,
      [ownerId]
    );

    res.json({
      average_rating: avgRating?.average_rating || 0,
      ratings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error fetching store owner dashboard' });
  }
};
