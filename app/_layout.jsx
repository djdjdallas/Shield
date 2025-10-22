// Root layout for the app with tab navigation
import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons, Foundation, AntDesign } from '@expo/vector-icons';

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        headerStyle: {
          backgroundColor: '#3B82F6',
        },
        headerTintColor: '#fff',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scanner',
          headerTitle: 'Scam Shield',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="security" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          headerTitle: 'Scan History',
          tabBarIcon: ({ color, size }) => (
            <Foundation name="clock" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="info"
        options={{
          title: 'Info',
          headerTitle: 'How It Works',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="infocirlceo" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}