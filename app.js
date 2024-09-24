// app.js

// Import các module cần thiết
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Kiểm tra biến môi trường
console.log('MongoDB URI:',process.env.MONGODB_URI);

// Kết nối tới MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected successfully to MongoDB Atlas"))
.catch(err => console.log("Failed to connect to MongoDB:", err));


// Cấu hình session
// Cấu hình session trong app.js
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      
      mongoUrl: process.env.MONGODB_URI || 'mongodb+srv://lethanhtrung28042000:1@cluster0.dtlad.mongodb.net/bank?retryWrites=true&w=majority&appName=Cluster0', // Dùng biến môi trường đúng
    }),
    cookie: { maxAge: 60000 }
    
  })
  
);

  

// Cấu hình body parser để xử lý dữ liệu POST từ form
app.use(express.urlencoded({ extended: true }));

// Thiết lập thư mục tĩnh cho các tệp CSS, JS
app.use(express.static(path.join(__dirname, 'public')));

// Cấu hình EJS làm view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware để thêm biến user vào tất cả các view EJS
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// Import các tuyến đường (routes)
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const transactionRoutes = require('./routes/transaction');

// Sử dụng các tuyến đường
app.use(authRoutes);
app.use(userRoutes);
app.use(transactionRoutes);
app.get('/', (req, res) => {
    res.redirect('/login');
  });
// Xử lý lỗi 404 - Trang không tồn tại
app.use((req, res, next) => {
  res.status(404).render('404');
});

app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    res.render('dashboard', { title: 'Bảng Điều Khiển', user: req.session.user });
  } else {
    res.redirect('/login');
  }
});

// Khởi động server
const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên http://localhost:${PORT}`);
});
