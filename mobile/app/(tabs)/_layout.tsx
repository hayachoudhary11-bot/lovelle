import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].surface,
          borderTopColor: Colors[colorScheme ?? 'light'].border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <IconSymbol size={28} name="house.fill" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => <IconSymbol size={28} name="message.fill" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => <IconSymbol size={28} name="paperplane.fill" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="todo"
        options={{
          title: 'To-Do',
          tabBarIcon: ({ color, focused }) => <IconSymbol size={28} name="checklist" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, focused }) => <IconSymbol size={28} name="calendar" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'Gallery',
          tabBarIcon: ({ color, focused }) => <IconSymbol size={28} name="gallery" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="prompts"
        options={{
          title: 'Prompts',
          tabBarIcon: ({ color, focused }) => <IconSymbol size={28} name="prompts" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: 'Challenges',
          tabBarIcon: ({ color, focused }) => <IconSymbol size={28} name="challenges" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="drawing"
        options={{
          title: 'Drawing',
          tabBarIcon: ({ color, focused }) => <IconSymbol size={28} name="drawing" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => <IconSymbol size={28} name="settings" color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
