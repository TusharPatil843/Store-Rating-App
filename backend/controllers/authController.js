const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
  const { name, email, password, address, role } = req.body;

  if (!name || !email || !password || !role)
    return res.status(400).json({ msg: 'Missing required fields' });

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length)
      return res.status(400).json({ msg: 'Email already exists' });

    // Insert new user
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, role]
    );

    // Fetch the newly created user
    const [newUser] = await db.query('SELECT id, name, email, address, role FROM users WHERE id = ?', [result.insertId]);

    //  Return user in response
    res.status(201).json({
      msg: 'User registered successfully',
      user: newUser[0] // This is the object frontend expects
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};


exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!user.length)
      return res.status(400).json({ msg: 'User not found' });

    const valid = await bcrypt.compare(password, user[0].password);
    if (!valid)
      return res.status(400).json({ msg: 'Invalid password' });

    const token = jwt.sign(
      { id: user[0].id, role: user[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token, user: { id: user[0].id, name: user[0].name, role: user[0].role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Login error' });
  }
};

exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id; // comes from JWT middleware

  if (!currentPassword || !newPassword)
    return res.status(400).json({ msg: 'Missing current or new password' });

  try {
    // Fetch user from DB
    const [userResult] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    const user = userResult[0];

    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Compare current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Current password is incorrect' });

    // Validate and hash new password
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ msg: 'New password must be 8–16 chars with 1 uppercase and 1 special char' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ msg: 'Server error while updating password' });
  }
};

