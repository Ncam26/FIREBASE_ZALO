import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

export default function ContactsScreen({ navigation }) {
  // 👥 Danh sách giả lập user
  const currentUserId = 'userA';
  const users = [
    { id: 'userB', name: 'Nguyễn Văn B' },
    { id: 'userC', name: 'Trần Thị C' },
  ];

  const handleSelectUser = (chatWithUserId) => {
    navigation.navigate('Chats', {
      currentUserId,
      chatWithUserId,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn bạn để chat:</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userItem} onPress={() => handleSelectUser(item.id)}>
            <Text style={styles.userText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  userItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
  },
  userText: {
    fontSize: 18,
    color: '#333',
  },
});
