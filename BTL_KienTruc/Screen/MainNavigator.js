import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from './UserContext';

// Import các màn hình chính
import ChatsScreen from './ChatsScreen';
import ContactsScreen from './ContactsScreen';
import TimelineScreen from './TimelineScreen';
import ProfileScreen from './ProfileScreen';
import AddFriendScreen from './AddFriendScreen';
import EditProfileScreen from './EditProfile';
import FriendRequestsScreen from './FriendRequestsScreen';
const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  const { user, isEditing } = useUser();
  const [isEditingState, setIsEditingState] = useState(false);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Chats':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Contacts':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'AddFriend':
              iconName = focused ? 'person-add' : 'person-add-outline';
              break;
            case 'Timeline':
              iconName = focused ? 'compass' : 'compass-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1E90FF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
        },
        headerStyle: {
          backgroundColor: '#1E90FF',
        },
        headerTintColor: '#FFFFFF',
      })}
    >
      <Tab.Screen name="Chats" component={ChatsScreen} options={{ title: 'Tin nhắn' }} />
      <Tab.Screen name="AddFriend" component={AddFriendScreen} options={{ title: 'Kết bạn' }} />
      <Tab.Screen name="Contacts" component={ContactsScreen} options={{ title: 'Bạn bè' }} />
      <Tab.Screen name="Timeline" component={TimelineScreen} options={{ title: 'Khám Phá' }} />
      <Tab.Screen 
        name="Profile" 
        component={(props) => <ProfileScreen {...props} setIsEditing={setIsEditingState} />} 
        options={{ title: 'Cá nhân', tabBarStyle: { display: isEditingState ? 'none' : 'flex' } }}
      />
      <Tab.Screen name="EditProfile" component={(props) => <EditProfileScreen {...props} setIsEditing={setIsEditingState} />} options={{ title: 'Chỉnh Sửa' }} />
      <Tab.Screen name="FriendRequests" component={FriendRequestsScreen} />
    </Tab.Navigator>
  );
}