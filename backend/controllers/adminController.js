const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    const [[{ total_users }]] = await db.query('SELECT COUNT(*) AS total_users FROM users');
    const [[{ total_stores }]] = await db.query('SELECT COUNT(*) AS total_stores FROM stores');
    const [[{ total_ratings }]] = await db.query('SELECT COUNT(*) AS total_ratings FROM ratings');

    res.json({ total_users, total_stores, total_ratings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Dashboard fetch error' });
  }
};

exports.getAllUsers = async (req, res) => {
  const { name, email, role } = req.query;

  let sql = `SELECT id, name, email, address, role FROM users WHERE 1`;
  const params = [];

  if (name) {
    sql += ' AND name LIKE ?';
    params.push(`%${name}%`);
  }
  if (email) {
    sql += ' AND email LIKE ?';
    params.push(`%${email}%`);
  }
  if (role) {
    sql += ' AND role = ?';
    params.push(role);
  }

  try {
    const [users] = await db.query(sql, params);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'User list fetch error' });
  }
};
