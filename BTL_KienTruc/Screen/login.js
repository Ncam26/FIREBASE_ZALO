import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../Firebase/Firebase'; // import Firestore
import { useUser } from './UserContext'; // dùng UserContext

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = getAuth();
  const { setUser } = useUser(); // Lấy hàm setUser

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Lấy dữ liệu người dùng từ Firestore
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUser(userData); // Cập nhật context
        navigation.navigate('MainApp'); // Chuyển đến màn hình chính
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng.');
      }

    } catch (error) {
      Alert.alert('Lỗi', error.message);
    }
  };

  return (
    <View style={styles.mainLogin}>
      <Text style={styles.title}>ZaLo</Text>
      <View style={styles.cardLogin}>
        <Text style={styles.loginTitle}>Đăng nhập</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Nhập email" 
          value={email}
          onChangeText={setEmail}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Nhập mật khẩu" 
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={handleLogin} style={styles.btnLogin}>
          <Text style={styles.btnText}>ĐĂNG NHẬP</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotPasswordBtn}>
          <Text style={styles.link}>Quên mật khẩu?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerBtn}>
          <Text style={styles.link}>Đăng ký tài khoản mới</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainLogin: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cardLogin: {
    width: '90%',
    padding: 25,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  loginTitle: {
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
  },
  btnLogin: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerBtn: {
    marginTop: 10,
    alignItems: 'center',
  },
  link: {
    color: '#007BFF',
    fontSize: 16,
  },
  forgotPasswordBtn: {
    marginTop: 10,
    alignItems: 'center',
  },
});
