import { apiClient } from './client';
import { Meeting, Pagination, TranscriptEntry } from '../types';

export async function createMeeting(input: {
  title: string;
  participants: string[];
  meetingDate: string;
  transcript: TranscriptEntry[];
}) {
  const res = await apiClient.post('/api/meetings', input);
  return res.data.data as Meeting;
}

export async function getMeeting(id: string) {
  const res = await apiClient.get(`/api/meetings/${id}`);
  return res.data.data as Meeting;
}

export async function listMeetings(page = 1, limit = 10) {
  const res = await apiClient.get('/api/meetings', { params: { page, limit } });
  return res.data.data as { meetings: Meeting[]; pagination: Pagination };
}

export async function analyzeMeeting(id: string) {
  const res = await apiClient.post(`/api/meetings/${id}/analyze`);
  return res.data.data;
}