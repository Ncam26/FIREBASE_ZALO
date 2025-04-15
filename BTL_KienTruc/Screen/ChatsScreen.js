import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { db, storage } from '../Firebase/Firebase';
import { collection, addDoc, onSnapshot, query, doc, setDoc, getDocs, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import uuid from 'react-native-uuid';

const MESSAGE_COLLECTION = 'Messages';

export default function ChatsScreen({ route }) {
  const { currentUserId , chatWithUserId } = route?.params || {};
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [conversationId, setConversationId] = useState(null);

  useEffect(() => {
    const findOrCreateConversation = async () => {
      const q = query(collection(db, 'UserConversation'), where('user_id', '==', currentUserId));
      const snapshot = await getDocs(q);

      let found = null;
      for (const docSnap of snapshot.docs) {
        const con_id = docSnap.data().con_id;
        const checkQ = query(collection(db, 'UserConversation'), where('con_id', '==', con_id), where('user_id', '==', chatWithUserId));
        const checkSnap = await getDocs(checkQ);
        if (!checkSnap.empty) {
          found = con_id;
          break;
        }
      }

      if (!found) {
        const newConId = `con_${uuid.v4()}`;
        await addDoc(collection(db, 'UserConversation'), {
          con_id: newConId,
          user_id: currentUserId
        });
        await addDoc(collection(db, 'UserConversation'), {
          con_id: newConId,
          user_id: chatWithUserId
        });
        await setDoc(doc(db, 'Conversations', newConId), {
          con_id: newConId,
          admin: currentUserId,
          is_group: false,
          members: [currentUserId, chatWithUserId],
          mess_info: [],
          name: '',
          time: Date.now()
        });
        setConversationId(newConId);
      } else {
        setConversationId(found);
      }
    };

    findOrCreateConversation();
  }, [currentUserId, chatWithUserId]);

  useEffect(() => {
    if (!conversationId) return;
    const q = query(collection(db, MESSAGE_COLLECTION), where('con_id', '==', conversationId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sortedMsgs = msgs.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(sortedMsgs);
    });
    return () => unsubscribe();
  }, [conversationId]);

  const sendMessage = async () => {
    if (inputText.trim() && conversationId) {
      await addDoc(collection(db, MESSAGE_COLLECTION), {
        con_id: conversationId,
        sender_id: currentUserId,
        content: inputText,
        type: 'text',
        createdAt: Date.now(),
        timestamp: Date.now()
      });
      setInputText('');
    }
  };

  const uploadImage = () => {
    launchImageLibrary({ mediaType: 'mixed' }, async (response) => {
      if (response.didCancel || response.errorCode) return;

      const asset = response.assets?.[0];
      if (!asset || !conversationId) return;

      const type = asset.type?.startsWith('video') ? 'video' : 'image';
      const fileName = `${uuid.v4()}-${asset.fileName}`;
      const fileRef = ref(getStorage(), `uploads/${fileName}`);

      const responseBlob = await fetch(asset.uri);
      const blob = await responseBlob.blob();

      await uploadBytes(fileRef, blob);
      const downloadURL = await getDownloadURL(fileRef);

      await addDoc(collection(db, MESSAGE_COLLECTION), {
        con_id: conversationId,
        sender_id: currentUserId,
        receiver_id: chatWithUserId,
        content: '',
        type,
        url: downloadURL,
        createdAt: Date.now(),
        timestamp: Date.now()
      });
    });
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.sender_id === currentUserId;

    return (
      <View style={[styles.messageContainer, isCurrentUser ? styles.userAlign : styles.friendAlign]}>
        <View style={[styles.message, isCurrentUser ? styles.userMessage : styles.friendMessage]}>
          {item.type === 'image' && <Image source={{ uri: item.url }} style={styles.image} />}
          {item.type === 'video' && <Text style={styles.messageText}>[Video: {item.url}]</Text>}
          {item.type === 'text' && item.content && <Text style={styles.messageText}>{item.content}</Text>}
        </View>
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
  container: { flex: 1, backgroundColor: '#f1f1f1' },
  messageContainer: { flexDirection: 'row', marginVertical: 5, marginHorizontal: 10 },
  userAlign: { justifyContent: 'flex-end' },
  friendAlign: { justifyContent: 'flex-start' },
  message: { padding: 10, borderRadius: 10, maxWidth: '75%' },
  userMessage: { backgroundColor: '#3f15d6', alignSelf: 'flex-end' },
  friendMessage: { backgroundColor: '#514869', alignSelf: 'flex-start' },
  messageText: { color: '#fff', fontSize: 16 },
  image: { width: 200, height: 200, borderRadius: 10 },
  inputContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', padding: 10, backgroundColor: '#fff',
    alignItems: 'center', borderTopWidth: 1, borderColor: '#ccc',
  },
  input: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, marginRight: 10 },
  sendButton: { backgroundColor: '#3f15d6', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 15 },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
  uploadButton: { marginRight: 10 },
});