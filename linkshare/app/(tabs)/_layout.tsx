import { Tabs } from 'expo-router';
import React from 'react';
 

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
 

export default function TabLayout() {
 

  return (
    <Tabs
  screenOptions={{
    tabBarActiveTintColor: '#ffffff', // white icons when active
    tabBarInactiveTintColor: '#ffffff', // white icons when inactive
    headerShown: false,
    tabBarButton: HapticTab,
    tabBarBackground: TabBarBackground,
    tabBarStyle: {
      backgroundColor: '#000000', // solid black background
      borderTopWidth: 0,
      elevation: 0,
    },
  }}
>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
