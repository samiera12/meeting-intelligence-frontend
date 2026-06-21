import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getOverdueActionItems, updateActionItemStatus } from '../api/actionItems';
import { ActionItem } from '../types';

export default function OverdueItemsScreen() {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchOverdue() {
    try {
      const result = await getOverdueActionItems();
      setItems(result.actionItems);
    } catch (err) {
      console.error('Failed to load overdue items', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchOverdue();
    }, [])
  );

  function onRefresh() {
    setRefreshing(true);
    fetchOverdue();
  }

  async function markComplete(item: ActionItem) {
    try {
      await updateActionItemStatus(item.id, 'COMPLETED');
      fetchOverdue();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={items}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={items.length === 0 ? styles.emptyContainer : { paddingVertical: 12 }}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.emptyText}>🎉 Nothing overdue!</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.task}>{item.task}</Text>
          {item.assignee && <Text style={styles.meta}>👤 {item.assignee}</Text>}
          <Text style={styles.overdueDate}>
            ⚠️ Was due {item.due_date && new Date(item.due_date).toLocaleDateString()}
          </Text>
          <TouchableOpacity style={styles.completeBtn} onPress={() => markComplete(item)}>
            <Text style={styles.completeBtnText}>Mark Complete</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flexGrow: 1 },
  emptyText: { fontSize: 16, color: '#666' },
  card: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 8,
  },
  task: { fontSize: 15, fontWeight: '600' },
  meta: { fontSize: 13, color: '#666', marginTop: 4 },
  overdueDate: { fontSize: 13, color: '#dc2626', fontWeight: '600', marginTop: 4 },
  completeBtn: {
    marginTop: 10,
    backgroundColor: '#dcfce7',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  completeBtnText: { color: '#166534', fontWeight: '700', fontSize: 13 },
});