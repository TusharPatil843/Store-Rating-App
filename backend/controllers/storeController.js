const db = require('../config/db');

exports.addStore = async (req, res) => {
  const { name, email, address, owner_id } = req.body;

  try {
    await db.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, owner_id || null]
    );
    res.status(201).json({ msg: 'Store added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to add store' });
  }
};

exports.getAllStores = async (req, res) => {
  const { name, email, address } = req.query;

  let sql = `
    SELECT s.*, 
      IFNULL(ROUND(AVG(r.rating), 1), 0) AS average_rating
    FROM stores s
    LEFT JOIN ratings r ON s.id = r.store_id
    WHERE 1
  `;

  const params = [];

  if (name) {
    sql += ' AND s.name LIKE ?';
    params.push(`%${name}%`);
  }
  if (email) {
    sql += ' AND s.email LIKE ?';
    params.push(`%${email}%`);
  }
  if (address) {
    sql += ' AND s.address LIKE ?';
    params.push(`%${address}%`);
  }

  sql += ' GROUP BY s.id ORDER BY s.id DESC';

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to fetch stores' });
  }
};

exports.getStoreById = async (req, res) => {
  const id = req.params.id;
  try {
    const [[store]] = await db.query(
      'SELECT * FROM stores WHERE id = ?',
      [id]
    );
    if (!store) return res.status(404).json({ msg: 'Store not found' });
    res.json(store);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error fetching store' });
  }
};

exports.updateStore = async (req, res) => {
  const id = req.params.id;
  const { name, email, address, owner_id } = req.body;

  try {
    await db.query(
      'UPDATE stores SET name=?, email=?, address=?, owner_id=? WHERE id=?',
      [name, email, address, owner_id || null, id]
    );
    res.json({ msg: 'Store updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to update store' });
  }
};

exports.deleteStore = async (req, res) => {
  const id = req.params.id;
  try {
    await db.query('DELETE FROM stores WHERE id=?', [id]);
    res.json({ msg: 'Store deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to delete store' });
  }
};
