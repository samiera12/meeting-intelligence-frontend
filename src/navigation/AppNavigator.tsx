import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackParamList } from './types';
import MeetingsListScreen from '../screens/MeetingsListScreen';
import MeetingDetailScreen from '../screens/MeetingDetailScreen';
import CreateMeetingScreen from '../screens/CreateMeetingScreen';
import ActionItemsListScreen from '../screens/ActionItemsListScreen';
import OverdueItemsScreen from '../screens/OverdueItemsScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MeetingsList"
        component={MeetingsListScreen}
        options={{ title: 'Meetings' }}
      />
      <Stack.Screen
        name="MeetingDetail"
        component={MeetingDetailScreen}
        options={{ title: 'Meeting Details' }}
      />
      <Stack.Screen
        name="CreateMeeting"
        component={CreateMeetingScreen}
        options={{ title: 'New Meeting' }}
      />
      <Stack.Screen
        name="ActionItemsList"
        component={ActionItemsListScreen}
        options={{ title: 'Action Items' }}
      />
      <Stack.Screen
        name="OverdueItems"
        component={OverdueItemsScreen}
        options={{ title: 'Overdue' }}
      />
    </Stack.Navigator>
  );
}