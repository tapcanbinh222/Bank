// routes/transaction.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Trang nạp tiền
router.get('/deposit', authMiddleware, (req, res) => {
  res.render('deposit', { error: null, success: null });
});

// Xử lý nạp tiền
router.post('/deposit', authMiddleware, async (req, res) => {
  try {
    const amount = parseFloat(req.body.amount);
    if (amount <= 0) {
      return res.render('deposit', { error: 'Số tiền phải lớn hơn 0.', success: null });
    }

    // Cập nhật số dư
    const user = await User.findById(req.session.user._id);
    user.balance += amount;
    await user.save();

    // Lưu giao dịch
    const transaction = new Transaction({
      userId: user._id,
      transactionType: 'deposit',
      amount,
    });
    await transaction.save();

    req.session.user.balance = user.balance; // Cập nhật session
    res.render('deposit', { success: 'Nạp tiền thành công!', error: null });
  } catch (error) {
    console.error(error);
    res.render('deposit', { error: 'Đã xảy ra lỗi. Vui lòng thử lại.', success: null });
  }
});

// Trang rút tiền
router.get('/withdraw', authMiddleware, (req, res) => {
  res.render('withdraw', { error: null, success: null });
});

// Xử lý rút tiền
router.post('/withdraw', authMiddleware, async (req, res) => {
  try {
    const amount = parseFloat(req.body.amount);
    if (amount <= 0) {
      return res.render('withdraw', { error: 'Số tiền phải lớn hơn 0.', success: null });
    }

    const user = await User.findById(req.session.user._id);
    if (user.balance < amount) {
      return res.render('withdraw', { error: 'Số dư không đủ.', success: null });
    }

    // Cập nhật số dư
    user.balance -= amount;
    await user.save();

    // Lưu giao dịch
    const transaction = new Transaction({
      userId: user._id,
      transactionType: 'withdrawal',
      amount,
    });
    await transaction.save();

    req.session.user.balance = user.balance; // Cập nhật session
    res.render('withdraw', { 
      success: { 
        amount, 
        newBalance: user.balance 
      }, 
      error: null 
    });
  } catch (error) {
    console.error(error);
    res.render('withdraw', { error: 'Đã xảy ra lỗi. Vui lòng thử lại.', success: null });
  }
});



// Trang lịch sử giao dịch
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.session.user._id }).sort({ transactionDate: -1 });
    res.render('transactions', { transactions });
  } catch (error) {
    console.error(error);
    res.render('transactions', { error: 'Đã xảy ra lỗi. Vui lòng thử lại.' });
  }
});

module.exports = router;
