import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';
import { listMeetings } from '../api/meetings';
import { Meeting } from '../types';
import { useAuth } from '../context/AuthContext';

type Nav = NativeStackNavigationProp<AppStackParamList, 'MeetingsList'>;

export default function MeetingsListScreen() {
  const navigation = useNavigation<Nav>();
  const { logout } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchMeetings() {
    try {
      const result = await listMeetings(1, 50);
      setMeetings(result.meetings);
    } catch (err) {
      console.error('Failed to load meetings', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Refetch every time this screen comes into focus (e.g. after creating a meeting)
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchMeetings();
    }, [])
  );

  function onRefresh() {
    setRefreshing(true);
    fetchMeetings();
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.actionItemsBtn}
          onPress={() => navigation.navigate('ActionItemsList')}
        >
          <Text style={styles.actionItemsBtnText}>Action Items</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={meetings}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={meetings.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No meetings yet. Create one to get started.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('MeetingDetail', { meetingId: item.id })}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>
              {new Date(item.meeting_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.cardParticipants}>
              {item.participants.length} participant{item.participants.length !== 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateMeeting')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionItemsBtn: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionItemsBtnText: { color: '#4338ca', fontWeight: '600' },
  logoutText: { color: '#ef4444', fontWeight: '600' },
  emptyContainer: { flexGrow: 1 },
  emptyText: { color: '#999', fontSize: 15 },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#666', marginBottom: 2 },
  cardParticipants: { fontSize: 13, color: '#999' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    backgroundColor: '#2563eb',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 28, fontWeight: '300' },
});