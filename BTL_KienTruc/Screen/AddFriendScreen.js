import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function AddFriendScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');

  const mockFetch = (url, options) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Giả lập phản hồi thành công
        resolve({
          json: () => Promise.resolve({ success: true, message: 'Yêu cầu kết bạn đã được gửi.' }),
        });
      }, 1000); // Giả lập độ trễ 1 giây
    });
  };

  const addFriend = async () => {
    try {
      const response = await mockFetch('https://67d6776d286fdac89bc1fa6d.mockapi.io/addfriend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Thành công', 'Bạn đã gửi yêu cầu kết bạn.');
      } else {
        Alert.alert('Thất bại', data.message);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thêm bạn bè</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Nhập số điện thoại hoặc tên" 
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
      <TouchableOpacity style={styles.addButton} onPress={addFriend}>
        <Text style={styles.addButtonText}>Thêm</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#0078FF',
    borderRadius: 5,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#0078FF',
    padding: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
  },
});