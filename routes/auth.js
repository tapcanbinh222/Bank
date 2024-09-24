const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');

// Trang đăng ký
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// Xử lý đăng ký
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phoneNumber, address, password } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', { error: 'Email đã được sử dụng.' });
    }

    // Tạo số tài khoản duy nhất
    const accountNumber = crypto.randomBytes(6).toString('hex');

    // Tạo người dùng mới (không mã hóa mật khẩu)
    const newUser = new User({
      fullName,
      email,
      phoneNumber,
      address,
      password,  // Lưu trực tiếp mật khẩu không mã hóa
      accountNumber,
    });

    await newUser.save();
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.render('register', { error: 'Đã xảy ra lỗi. Vui lòng thử lại.' });
  }
});

// Trang đăng nhập
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Xử lý đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm người dùng theo email
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {  // Kiểm tra mật khẩu trực tiếp không mã hóa
      return res.render('login', { error: 'Email hoặc mật khẩu không đúng.' });
    }

    // Lưu thông tin người dùng vào session
    req.session.user = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: user.address,
      accountNumber: user.accountNumber,
      balance: user.balance,
    };

    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.render('login', { error: 'Đã xảy ra lỗi. Vui lòng thử lại.' });
  }
});

// Xử lý đăng xuất
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Đã xảy ra lỗi khi đăng xuất:', err);
    }
    res.redirect('/login');
  });
});

module.exports = router;
