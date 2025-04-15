// BTL_KienTruc/Server/server.js
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: 'http://localhost:8082', // Chỉ cho phép yêu cầu từ nguồn này
}));
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'YOUR_EMAIL@gmail.com', // Thay bằng email của bạn
    pass: 'YOUR_PASSWORD' // Thay bằng mật khẩu của bạn
  }
});

app.post('/send-otp', (req, res) => {
  const { email, code } = req.body;

  const mailOptions = {
    from: 'YOUR_EMAIL@gmail.com',
    to: email,
    subject: 'Mã OTP của bạn',
    text: `Mã OTP của bạn là: ${code}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send('Lỗi khi gửi email');
    }
    res.status(200).send('Email đã được gửi');
  });
});

app.post('/reset-password', async (req, res) => {
  const { phoneNumber, newPassword } = req.body;

  // Logic để xác thực và đặt lại mật khẩu
  // Giả sử bạn đã xác thực và đặt lại mật khẩu thành công
  res.status(200).send({ message: 'Mật khẩu đã được đặt lại thành công.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});