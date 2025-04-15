import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function ChatsScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    // socketService.connect('qruvhn82ll');

    // socketService.subscribeToMessages((message) => {
    //   setMessages((prevMessages) => [...prevMessages, message]);
    // });

    // return () => {
    //   socketService.disconnect();
    // };
  }, []);

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage = { id: Date.now().toString(), text: inputText, sender: 'user' };
      // socketService.sendMessage(newMessage);
      setInputText('');
    }
  };

  const uploadImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const newMessage = {
          id: Date.now().toString(),
          text: '',
          image: response.uri,
          sender: 'user',
        };
        // socketService.sendMessage(newMessage);
      }
    });
  };

  const renderMessage = ({ item }) => {
    return (
      <View style={[styles.message, item.sender === 'user' ? styles.userMessage : styles.friendMessage]}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
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
          <Icon name="download" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {/* Logic để mở emoji */}} style={styles.emojiButton}>
          <Text style={styles.emojiButtonText}>😀</Text>
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
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#3f15d6',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  uploadButton: {
    padding: 10,
  },
  emojiButton: {
    padding: 10,
  },
  emojiButtonText: {
    color: '#fff',
    fontSize: 20,
  },
});