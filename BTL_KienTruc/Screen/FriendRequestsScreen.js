import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { db } from '../Firebase/Firebase';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';

export default function FriendRequestsScreen() {
  const [requests, setRequests] = useState([]);
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const fetchRequests = async () => {
      try {
        const q = query(collection(db, 'friend_requests'), where('to', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
  
        const requestsData = await Promise.all(querySnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
  
          // Lấy thêm thông tin người gửi
          const userRef = doc(db, 'users', data.from);
          const userSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', data.from)));
          const sender = !userSnap.empty ? userSnap.docs[0].data() : { name: 'Không rõ', email: '' };
  
          return {
            id: docSnap.id,
            ...data,
            senderName: sender.name || sender.email, // ưu tiên name
          };
        }));
  
        setRequests(requestsData);
      } catch (error) {
        console.error(error);
        Alert.alert('Lỗi', 'Không thể lấy danh sách lời mời.');
      }
    };
  
    fetchRequests();
  }, []);

  const acceptRequest = async (request) => {
    try {
      await updateDoc(doc(db, 'friend_requests', request.id), {
        status: 'accepted',
      });
      Alert.alert('Đã chấp nhận lời mời kết bạn!');
      setRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể chấp nhận lời mời.');
    }
  };

  const rejectRequest = async (request) => {
    try {
      await deleteDoc(doc(db, 'friend_requests', request.id));
      Alert.alert('Đã từ chối lời mời.');
      setRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể từ chối lời mời.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.requestItem}>
      <Text style={styles.emailText}>Từ: {item.senderName}</Text>
      <View style={styles.buttons}>
        <TouchableOpacity onPress={() => acceptRequest(item)} style={styles.acceptBtn}>
          <Text style={styles.btnText}>Chấp nhận</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => rejectRequest(item)} style={styles.rejectBtn}>
          <Text style={styles.btnText}>Từ chối</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lời mời kết bạn</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Không có lời mời nào.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f1f1f1',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  requestItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emailText: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  acceptBtn: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  rejectBtn: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
  },
});
