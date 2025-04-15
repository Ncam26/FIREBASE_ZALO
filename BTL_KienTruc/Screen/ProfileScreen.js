import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useUser } from './UserContext'; // Import UserContext

export default function ProfileScreen({ navigation, setIsEditing }) {
  const { user, setIsEditing: contextSetIsEditing } = useUser(); // Sử dụng UserContext

  const handleLogout = () => {
    // Logic for logging out can be added here
    navigation.navigate('Login');
  };

  const handleEditProfile = () => {
    setIsEditing(true); // Đặt state để ẩn tab
    navigation.navigate('EditProfile');
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.avatar}
        source={{ uri: 'https://img-cdn.2game.vn/pictures/2game/2019/10/09/2game-natra-ma-dong-h5-logo-1.png' }} // Thay thế bằng URL ảnh đại diện thực tế
      />
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Số điện thoại:</Text>
        <Text style={styles.infoValue}>{user.phone}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Địa chỉ:</Text>
        <Text style={styles.infoValue}>{user.address}</Text>
      </View>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
        <Text style={styles.editButtonText}>Chỉnh sửa</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f1f1', // Light background
    padding: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#0078FF', // Zalo blue for border
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0078FF', // Zalo blue for text
    marginBottom: 10,
  },
  email: {
    fontSize: 18,
    color: '#0078FF', // Zalo blue for text
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0078FF', // Zalo blue for text
    marginRight: 5,
  },
  infoValue: {
    fontSize: 16,
    color: '#0078FF', // Zalo blue for text
  },
  logoutButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#0078FF', // Zalo blue for button
    borderRadius: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#0078FF', // Zalo blue for button
    borderRadius: 5,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});