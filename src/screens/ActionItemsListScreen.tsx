import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';
import { listActionItems, updateActionItemStatus } from '../api/actionItems';
import { ActionItem, ActionItemStatus } from '../types';
import StatusBadge from '../components/StatusBadge';

type Nav = NativeStackNavigationProp<AppStackParamList, 'ActionItemsList'>;

const STATUS_FILTERS: (ActionItemStatus | 'ALL')[] = ['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'];
const NEXT_STATUS: Record<ActionItemStatus, ActionItemStatus> = {
  PENDING: 'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
  COMPLETED: 'PENDING',
};

export default function ActionItemsListScreen() {
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ActionItemStatus | 'ALL'>('ALL');

  async function fetchItems() {
    try {
      const result = await listActionItems({
        limit: 100,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      setItems(result.actionItems);
    } catch (err) {
      console.error('Failed to load action items', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchItems();
    }, [statusFilter])
  );

  function onRefresh() {
    setRefreshing(true);
    fetchItems();
  }

  async function cycleStatus(item: ActionItem) {
    const newStatus = NEXT_STATUS[item.status];
    try {
      await updateActionItemStatus(item.id, newStatus);
      fetchItems();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.overdueBtn}
          onPress={() => navigation.navigate('OverdueItems')}
        >
          <Text style={styles.overdueBtnText}>⚠️ View Overdue</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={{ paddingHorizontal: 12 }}
      >
        {STATUS_FILTERS.map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterChip, statusFilter === status && styles.filterChipActive]}
            onPress={() => setStatusFilter(status)}
          >
            <Text
              style={[
                styles.filterChipText,
                statusFilter === status && styles.filterChipTextActive,
              ]}
            >
              {status.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={items.length === 0 ? styles.emptyContainer : { paddingBottom: 20 }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No action items found.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTask}>{item.task}</Text>
                <StatusBadge status={item.status} />
              </View>
              {item.assignee && <Text style={styles.cardMeta}>👤 {item.assignee}</Text>}
              {item.due_date && (
                <Text style={styles.cardMeta}>
                  📅 Due {new Date(item.due_date).toLocaleDateString()}
                </Text>
              )}
              <TouchableOpacity style={styles.cycleBtn} onPress={() => cycleStatus(item)}>
                <Text style={styles.cycleBtnText}>
                  Mark as {NEXT_STATUS[item.status].replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { padding: 16, paddingBottom: 8 },
  overdueBtn: {
    backgroundColor: '#fef2f2',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  overdueBtnText: { color: '#dc2626', fontWeight: '700' },
  filterRow: { flexGrow: 0, marginBottom: 8 },
  filterChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  filterChipText: { fontSize: 13, color: '#444', fontWeight: '600' },
  filterChipTextActive: { color: '#fff' },
  emptyContainer: { flexGrow: 1 },
  emptyText: { color: '#999' },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 10,
    padding: 14,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTask: { fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8 },
  cardMeta: { fontSize: 13, color: '#666', marginTop: 4 },
  cycleBtn: {
    marginTop: 10,
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  cycleBtnText: { fontSize: 13, fontWeight: '600', color: '#333' },
});