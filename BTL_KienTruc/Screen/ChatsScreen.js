import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image, Animated, Alert, Modal, ActivityIndicator } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { db } from '../Firebase/Firebase';
import { collection, addDoc, onSnapshot, query, doc, setDoc, getDocs, where, updateDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import uuid from 'react-native-uuid';
import moment from 'moment';
import { Picker } from 'emoji-mart-native';
import * as ImagePicker from 'expo-image-picker';

const MESSAGE_COLLECTION = 'Messages';

export default function ChatsScreen({ route }) {
  const { currentUserId , chatWithUserId } = route?.params || {};
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
        await addDoc(collection(db, 'UserConversation'), { con_id: newConId, user_id: currentUserId });
        await addDoc(collection(db, 'UserConversation'), { con_id: newConId, user_id: chatWithUserId });
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
      const sorted = msgs.sort((a, b) => a.createdAt - b.createdAt);
      setMessages(sorted);
      //Hiệu ứng mờ dần cho mỗi tin nhắn mới
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
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
        timestamp: Date.now(),
        isRevoked: false
      });
      setInputText('');
    }
  };

  const uploadImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) return;
    const pickerResult = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (pickerResult.cancelled || !pickerResult.uri) return;
    setIsUploading(true);
    const blob = await (await fetch(pickerResult.uri)).blob();
    const fileName = `${uuid.v4()}.jpg`;
    const fileRef = ref(getStorage(), `uploads/${fileName}`);
    await uploadBytes(fileRef, blob);
    const downloadURL = await getDownloadURL(fileRef);
    await addDoc(collection(db, MESSAGE_COLLECTION), {
      con_id: conversationId,
      sender_id: currentUserId,
      receiver_id: chatWithUserId,
      content: '',
      type: 'image',
      url: downloadURL,
      createdAt: Date.now(),
      timestamp: Date.now(),
      isRevoked: false
    });
    setIsUploading(false);
  };

  //Xử lý emoji chọn vào inputText mượt

  const handleEmojiClick = (emoji) => {
    if (emoji?.native) {
      setInputText(prev => prev + emoji.native);
      setShowEmojiPicker(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteDoc(doc(db, MESSAGE_COLLECTION, messageId));
    } catch (error) {
      Alert.alert('Error', 'Could not delete message.');
    }
  };

  const handleRevokeMessage = async (messageId) => {
    try {
      await updateDoc(doc(db, MESSAGE_COLLECTION, messageId), {
        isRevoked: true,
        revokedAt: Date.now()
      });
    } catch (error) {
      Alert.alert('Error', 'Could not revoke message.');
    }
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.sender_id === currentUserId;
    const time = moment(item.createdAt).format('HH:mm');

    return (
      <Animated.View style={[{ opacity: fadeAnim }, styles.messageContainer, isCurrentUser ? styles.userAlign : styles.friendAlign]}>
       
        <TouchableOpacity
          onLongPress={() => {
            if (isCurrentUser) {
              setSelectedMessage(item);
              setShowMoreOptions(true);
            }
          }}
          style={[styles.message, isCurrentUser ? styles.userMessage : styles.friendMessage]}
        >
         
          <View style={styles.avatar}>
            <Icon name="user-circle" size={24} color="#fff" />
          </View>
          {item.isRevoked ? (
            <Text style={styles.revokedMessageText}>Thu Hồi Tin Nhắn</Text>
          ) : (
            <>
              {item.type === 'image' && <Image source={{ uri: item.url }} style={styles.image} />}
              {item.type === 'text' && item.content && <Text style={styles.messageText}>{item.content}</Text>}
              <Text style={styles.timestamp}>{time}</Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={() => setShowEmojiPicker(!showEmojiPicker)} style={styles.uploadButton}>
          <Icon name="smile-o" size={22} color="#3f15d6" />
        </TouchableOpacity>
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
     
      {showEmojiPicker && (
        <View style={styles.emojiPickerContainer}>
          <Picker onSelect={handleEmojiClick} theme="light" />
        </View>
      )}
      {showMoreOptions && selectedMessage && (
        <Modal
          visible={showMoreOptions}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMoreOptions(false)}
        >
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowMoreOptions(false)}>
            <View style={styles.moreOptionsContent}>
              <TouchableOpacity style={styles.moreOption} onPress={() => { handleRevokeMessage(selectedMessage.id); setShowMoreOptions(false); }}>
                <Icon name="undo" size={18} color="#ff3b30" />
                <Text style={[styles.moreOptionText, styles.recallText]}>Recall</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.moreOption} onPress={() => { handleDeleteMessage(selectedMessage.id); setShowMoreOptions(false); }}>
                <Icon name="trash" size={18} color="#8e8e93" />
                <Text style={styles.moreOptionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

     
      {isUploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Uploading...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f1f1' },
  messageContainer: { flexDirection: 'row', marginVertical: 5, marginHorizontal: 10 },
  userAlign: { justifyContent: 'flex-end' },
  friendAlign: { justifyContent: 'flex-start' },
  message: { padding: 10, borderRadius: 10, maxWidth: '75%', position: 'relative' },
  userMessage: { backgroundColor: '#3f15d6', alignSelf: 'flex-end' },
  friendMessage: { backgroundColor: '#514869', alignSelf: 'flex-start' },
  messageText: { color: '#fff', fontSize: 16 },
  timestamp: { marginTop: 5, color: '#ccc', fontSize: 12, textAlign: 'right' },
  inputContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', padding: 10, backgroundColor: '#fff',
    alignItems: 'center', borderTopWidth: 1, borderColor: '#ccc', zIndex: 10,
  },
  input: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, marginRight: 10 },
  sendButton: { backgroundColor: '#3f15d6', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 15 },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
  uploadButton: { marginRight: 10 },
  emojiPickerContainer: {
    position: 'absolute', bottom: 70, left: 0, right: 0,
    backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#ccc', height: 300, zIndex: 5,
  },
  image: { width: 200, height: 200, borderRadius: 10 },
  revokedMessageText: { color: '#999', fontStyle: 'italic' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center',
  },
  moreOptionsContent: {
    backgroundColor: '#222', borderRadius: 8, padding: 10, width: 200,
  },
  moreOption: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15,
  },
  moreOptionText: { fontSize: 15, marginLeft: 15, color: '#fff' },
  recallText: { color: '#ff3b30' },
  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 20,
  },
  loadingText: { color: '#fff', fontSize: 16, marginTop: 10 },
  avatar: {
    position: 'absolute', top: -20, left: -30,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#888', justifyContent: 'center', alignItems: 'center'
  },
});
