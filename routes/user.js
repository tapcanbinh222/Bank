const express = require('express');
const router = express.Router();  // Đảm bảo router được khai báo đúng
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// Trang bảng điều khiển
router.get('/dashboard', authMiddleware, (req, res) => {
  res.render('dashboard', { user: req.session.user });
});

// Trang xem thông tin cá nhân
router.get('/profile', authMiddleware, (req, res) => {
  const user = req.session.user;  // Lấy thông tin người dùng từ session
  
  if (!user.balance) {
    user.balance = 0;  // Đặt giá trị mặc định nếu balance là undefined
  }

  res.render('profile', { 
    user,  // Truyền toàn bộ đối tượng user vào view
    success: null, 
    error: null 
  });
});

// Xử lý cập nhật thông tin cá nhân
router.post('/profile', authMiddleware, async (req, res) => {
  try {
    const { fullName, email, phoneNumber, address } = req.body;
    const user = await User.findById(req.session.user._id);

    // Cập nhật thông tin trong cơ sở dữ liệu
    user.fullName = fullName;
    user.email = email;
    user.phoneNumber = phoneNumber;
    user.address = address;

    await user.save();

    // Cập nhật lại session với thông tin mới
    req.session.user.fullName = fullName;
    req.session.user.email = email;
    req.session.user.phoneNumber = phoneNumber;
    req.session.user.address = address;

    // Hiển thị lại trang profile với thông tin đã cập nhật
    res.render('profile', { user: req.session.user, success: 'Cập nhật thông tin thành công!', error: null });
  } catch (error) {
    console.error(error);
    res.render('profile', { user: req.session.user, error: 'Đã xảy ra lỗi. Vui lòng thử lại.', success: null });
  }
});

// Trang đổi mật khẩu
router.get('/change-password', authMiddleware, (req, res) => {
  res.render('change-password', { error: null, success: null });
});

// Xử lý đổi mật khẩu (không sử dụng bcrypt)
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.session.user._id);

    // Kiểm tra mật khẩu hiện tại
    if (user.password !== currentPassword) {
      return res.render('change-password', { error: 'Mật khẩu hiện tại không đúng.', success: null });
    }

    // Kiểm tra mật khẩu mới và xác nhận mật khẩu
    if (newPassword !== confirmPassword) {
      return res.render('change-password', { error: 'Mật khẩu mới và xác nhận mật khẩu không khớp.', success: null });
    }

    // Cập nhật mật khẩu (không mã hóa)
    user.password = newPassword;
    await user.save();

    res.render('change-password', { success: 'Đổi mật khẩu thành công!', error: null });
  } catch (error) {
    console.error(error);
    res.render('change-password', { error: 'Đã xảy ra lỗi. Vui lòng thử lại.', success: null });
  }
});

// Trang xem số dư tài khoản
router.get('/balance', (req, res) => {
  // Kiểm tra session người dùng
  if (!req.session.user) {
    return res.redirect('/login'); // Nếu chưa đăng nhập, chuyển hướng về trang đăng nhập
  }

  // Hiển thị trang số dư tài khoản
  res.render('balance', { user: req.session.user });
});

module.exports = router;  // Đảm bảo xuất khẩu đúng router
