
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Owner Login API
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: 'Password is required.'
      });
    }

    if (!process.env.OWNER_PASSWORD_HASH || !process.env.JWT_SECRET) {
      return res.status(500).json({
        message: 'Owner login configuration is missing.'
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      process.env.OWNER_PASSWORD_HASH
    );

    if (!isMatch) {
      return res.status(401).json({
        message: 'Incorrect password.'
      });
    }

    const token = jwt.sign(
      { role: 'owner' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      message: 'Owner login successful.',
      token
    });

  } catch (error) {
    console.error('Login Error:', error.message);

    return res.status(500).json({
      message: 'Login failed.'
    });
  }
});

module.exports = router;
