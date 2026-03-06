import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getSession } from '../../lib/session';

export default function RootLayout() {
  const role = getSession()?.user?.role;
  const canAddProperty = role === 'seller' || role === 'agent';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#001a2d',
        tabBarInactiveTintColor: '#888'
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, size }) => <Ionicons name="heart" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="add-property"
        options={{
          title: 'Add',
          href: canAddProperty ? undefined : null,
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => <Ionicons name="notifications" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null
        }}
      />
    </Tabs>
  );
}
