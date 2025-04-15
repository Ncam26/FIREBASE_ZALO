// BTL_KienTruc/Screen/otp.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios'; // Thêm axios để gọi API

const generateUniqueCode = () => {
  const digits = new Set();
  while (digits.size < 6) {
    digits.add(Math.floor(Math.random() * 10));
  }
  return Array.from(digits).join('');
};

export default function OtpScreen({ navigation, route }) {
  const { email } = route.params; // Nhận email từ tham số
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExpired(true);
      Alert.alert('Hết hạn', 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.');
    }, 60000); // 60 giây

    return () => clearTimeout(timer); // Dọn dẹp timer khi component unmount
  }, []);

  const sendOtpEmail = async (email, code) => {
    try {
      await axios.post('http://localhost:3000/send-otp', { email, code }); // Thay localhost bằng URL của API nếu cần
      Alert.alert('Thành công', 'Mã OTP đã được gửi qua email.');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi mã OTP. Vui lòng thử lại.');
    }
  };

  const handleSendOtp = async () => {
    const code = generateUniqueCode();
    setGeneratedOtp(code);
    await sendOtpEmail(email, code); // Gọi hàm gửi email
  };

  const handleVerifyOtp = () => {
    if (isExpired) {
      Alert.alert('Lỗi', 'Mã OTP đã hết hạn.');
      return;
    }
    if (otp === generatedOtp) {
      Alert.alert('Thành công', 'Mã OTP hợp lệ!');
      navigation.navigate('Login'); // Quay lại màn hình đăng nhập
    } else {
      Alert.alert('Lỗi', 'Mã OTP không hợp lệ.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nhập mã OTP</Text>
      <TouchableOpacity style={styles.btn} onPress={handleSendOtp}>
        <Text style={styles.btnText}>Gửi mã OTP</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Nhập mã OTP"
        value={otp}
        onChangeText={setOtp}
      />
      <TouchableOpacity style={styles.btn} onPress={handleVerifyOtp}>
        <Text style={styles.btnText}>Xác nhận mã OTP</Text>
      </TouchableOpacity>
      {isExpired && <Text style={styles.expiredText}>Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: '80%',
  },
  btn: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '80%',
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  expiredText: {
    color: 'red',
    marginTop: 10,
  },
});