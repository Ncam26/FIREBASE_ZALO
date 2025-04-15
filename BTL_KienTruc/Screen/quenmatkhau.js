// BTL_KienTruc/Screen/quenmatkhau.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

export default function ForgotPasswordScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleResetPassword = async () => {
    if (!phoneNumber || !newPassword || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu và xác nhận mật khẩu không khớp.');
      return;
    }
    
    // Logic để reset mật khẩu
    try {
      // Gửi yêu cầu đến server để đặt lại mật khẩu
      const response = await axios.post('http://localhost:3000/reset-password', {
        phoneNumber,
        newPassword,
      });
      Alert.alert('Thành công', response.data.message);
      navigation.goBack(); // Quay lại màn hình đăng nhập
    } catch (error) {
      Alert.alert('Lỗi', error.response.data.message || 'Có lỗi xảy ra.');
    }
  };

  return (
    <View style={styles.mainForgot}>
      <Text style={styles.title}>Quên mật khẩu</Text>
      <View style={styles.cardForgot}>
        <View style={styles.textField}>
          <Text style={styles.label}>Số điện thoại:</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Nhập số điện thoại" 
            keyboardType="phone-pad" 
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>

        <View style={styles.textField}>
          <Text style={styles.label}>Mật khẩu mới:</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Nhập mật khẩu mới" 
            secureTextEntry={true} 
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </View>

        <View style={styles.textField}>
          <Text style={styles.label}>Xác nhận mật khẩu:</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Nhập lại mật khẩu mới" 
            secureTextEntry={true} 
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <TouchableOpacity style={styles.btnReset} onPress={handleResetPassword}>
          <Text style={styles.btnText}>ĐẶT LẠI MẬT KHẨU</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Quay lại đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainForgot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f1f1'
  },
  title: {
    fontSize: 32,
    color: '#0078FF',
    fontWeight: 'bold',
    marginBottom: 20
  },
  cardForgot: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  textField: {
    width: '100%',
    marginBottom: 15
  },
  label: {
    color: '#0078FF',
    marginBottom: 5
  },
  input: {
    width: '100%',
    backgroundColor: '#E0F7FF',
    borderRadius: 10,
    padding: 15,
    color: '#0078FF',
    borderWidth: 1,
    borderColor: '#0078FF'
  },
  btnReset: {
    backgroundColor: '#0078FF',
    borderRadius: 10,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 20
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  link: {
    color: '#0078FF',
    marginTop: 10
  },
});