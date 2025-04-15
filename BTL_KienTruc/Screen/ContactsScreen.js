import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { db } from '../Firebase/Firebase';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function ContactsScreen({ navigation }) {
  const [friends, setFriends] = useState([]);
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const fetchFriends = async () => {
      try {
        // Tìm những người đã accepted với currentUser
        const q = query(
          collection(db, 'friend_requests'),
          where('status', '==', 'accepted'),
          where('from', '==', currentUser.uid)
        );
        const q2 = query(
          collection(db, 'friend_requests'),
          where('status', '==', 'accepted'),
          where('to', '==', currentUser.uid)
        );

        const [fromSnap, toSnap] = await Promise.all([getDocs(q), getDocs(q2)]);

        // Tạo danh sách UID bạn bè
        const friendIds = new Set();
        fromSnap.forEach(doc => friendIds.add(doc.data().to));
        toSnap.forEach(doc => friendIds.add(doc.data().from));

        // Lấy thông tin user từ collection 'users'
        const userDocs = await Promise.all(
          Array.from(friendIds).map(async uid => {
            const userQ = query(collection(db, 'users'), where('uid', '==', uid));
            const userSnap = await getDocs(userQ);
            return userSnap.docs[0]?.data();
          })
        );

        setFriends(userDocs.filter(Boolean));
      } catch (error) {
        console.error(error);
      }
    };

    fetchFriends();
  }, []);

  const handleSelectUser = (friend) => {
    navigation.navigate('Chats', {
      currentUserId: currentUser.uid,
      chatWithUserId: friend.uid,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bạn bè của bạn:</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userItem} onPress={() => handleSelectUser(item)}>
            <Text style={styles.userText}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ color: '#888' }}>Bạn chưa có bạn bè nào!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#f1f1f1', padding: 20,
  },
  title: {
    fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333',
  },
  userItem: {
    padding: 15, backgroundColor: '#fff', borderRadius: 10, marginBottom: 10,
  },
  userText: {
    fontSize: 18, color: '#333',
  },
});
