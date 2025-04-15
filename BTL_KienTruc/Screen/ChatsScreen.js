import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { db } from '../Firebase/Firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp,doc, setDoc } from 'firebase/firestore';

export default function ChatsScreen({ route }) {
  // 🧠 Giả lập người dùng (sau này thay bằng auth.currentUser.uid)
  const { currentUserId = 'userA', chatWithUserId = 'userB' } = route?.params || {};

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'message'), orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filteredMessages = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((msg) =>
          (msg.senderId === currentUserId && msg.receiverId === chatWithUserId) ||
          (msg.senderId === chatWithUserId && msg.receiverId === currentUserId)
        );

      setMessages(filteredMessages);
    });

    return () => unsubscribe();
  }, [currentUserId, chatWithUserId]);

  const sendMessage = async () => {
    if (inputText.trim()) {
      await addDoc(collection(db, 'message'), {
        senderId: currentUserId,
        receiverId: chatWithUserId,
        text: inputText,
        createdAt: serverTimestamp(),
      });
      setInputText('');
    }
  };

  const uploadImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (response.didCancel || response.errorCode) {
        console.log('User cancelled or error');
      } else {
        const uri = response.assets[0].uri;
        await addDoc(collection(db, 'message'), {
          senderId: currentUserId,
          receiverId: chatWithUserId,
          image: uri,
          text: '',
          createdAt: serverTimestamp(),
        });
      }
    });
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === currentUserId;

    return (
      <View style={[styles.message, isCurrentUser ? styles.userMessage : styles.friendMessage]}>
        {item.image && (
          <Image source={{ uri: item.image }} style={styles.image} />
        )}
        {item.text !== '' && (
          <Text style={styles.messageText}>{item.text}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message"
          placeholderTextColor="#a0a0a0"
        />
        <TouchableOpacity onPress={uploadImage} style={styles.uploadButton}>
          <Icon name="image" size={22} color="#3f15d6" />
        </TouchableOpacity>
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f1f1',
  },
  message: {
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    maxWidth: '75%',
  },
  userMessage: {
    backgroundColor: '#3f15d6',
    alignSelf: 'flex-end',
  },
  friendMessage: {
    backgroundColor: '#514869',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#3f15d6',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  uploadButton: {
    marginRight: 10,
  },
});
