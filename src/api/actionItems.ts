import { apiClient } from './client';
import { ActionItem, ActionItemStatus, Pagination } from '../types';

interface ListFilters {
  page?: number;
  limit?: number;
  status?: ActionItemStatus;
  assignee?: string;
  meetingId?: string;
}

export async function listActionItems(filters: ListFilters = {}) {
  const res = await apiClient.get('/api/action-items', { params: filters });
  return res.data.data as { actionItems: ActionItem[]; pagination: Pagination };
}

export async function getOverdueActionItems() {
  const res = await apiClient.get('/api/action-items/overdue');
  return res.data.data as { actionItems: ActionItem[] };
}

export async function updateActionItemStatus(id: string, status: ActionItemStatus) {
  const res = await apiClient.patch(`/api/action-items/${id}/status`, { status });
  return res.data.data as ActionItem;
}

export async function createActionItem(input: {
  task: string;
  assignee?: string;
  meetingId?: string;
  dueDate?: string;
}) {
  const res = await apiClient.post('/api/action-items', input);
  return res.data.data as ActionItem;
}