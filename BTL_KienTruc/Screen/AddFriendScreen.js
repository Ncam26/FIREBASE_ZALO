import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { db } from '../Firebase/Firebase';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

export default function AddFriendScreen() {
  const [email, setEmail] = useState('');
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const addFriend = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Lỗi', 'Vui lòng nhập đúng định dạng email.');
      return;
    }

    try {
      const usersRef = collection(db, 'Users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('Không tìm thấy', 'Email chưa được đăng ký Zala.');
        return;
      }

      const targetUser = querySnapshot.docs[0].data();
      const targetUserId = targetUser.user_id;
      console.log(targetUser)
      console.log(targetUserId)

      if (targetUserId === currentUser.uid) {
        Alert.alert('Lỗi', 'Không thể kết bạn với chính mình.');
        return;
      }

      const requestRef = collection(db, 'friend_requests');
      const checkExist = query(requestRef,
        where('from', '==', currentUser.uid),
        where('to', '==', targetUserId),
        where('status', '==', 'pending')
      );
      const existing = await getDocs(checkExist);
      if (!existing.empty) {
        Alert.alert('Thông báo', 'Bạn đã gửi lời mời đến người này rồi.');
        return;
      }

      await addDoc(requestRef, {
        from: currentUser.uid,
        to: targetUserId,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      Alert.alert('Thành công', 'Lời mời kết bạn đã được gửi!');
      setEmail('');
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thêm bạn bè qua Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập email người bạn muốn kết bạn"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TouchableOpacity style={styles.addButton} onPress={addFriend}>
        <Text style={styles.addButtonText}>Thêm</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f1f1' },
  title: { fontSize: 24, marginBottom: 20 },
  input: { width: '80%', padding: 10, borderWidth: 1, borderColor: '#0078FF', borderRadius: 5, marginBottom: 20 },
  addButton: { backgroundColor: '#0078FF', padding: 10, borderRadius: 5 },
  addButtonText: { color: '#fff', fontWeight: 'bold' }
});
