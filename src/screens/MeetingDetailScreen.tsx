import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { AppStackParamList } from '../navigation/types';
import { getMeeting, analyzeMeeting } from '../api/meetings';
import { Meeting, AnalysisItem } from '../types';

type DetailRoute = RouteProp<AppStackParamList, 'MeetingDetail'>;

export default function MeetingDetailScreen() {
  const route = useRoute<DetailRoute>();
  const { meetingId } = route.params;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  async function fetchMeeting() {
    try {
      const data = await getMeeting(meetingId);
      setMeeting(data);
    } catch (err) {
      console.error('Failed to load meeting', err);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchMeeting();
    }, [meetingId])
  );

  async function handleAnalyze() {
    setAnalyzing(true);
    try {
      await analyzeMeeting(meetingId);
      await fetchMeeting(); // refresh to pull in the saved analysis
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Analysis failed';
      Alert.alert('Analysis Error', message);
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading || !meeting) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const hasAnalysis = !!meeting.analyzed_at;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>{meeting.title}</Text>
      <Text style={styles.subtitle}>
        {new Date(meeting.meeting_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Text>
      <Text style={styles.participants}>{meeting.participants.join(', ')}</Text>

      <View style={styles.divider} />

      <Text style={styles.sectionHeader}>Transcript</Text>
      {meeting.transcript?.map((entry, i) => (
        <View key={i} style={styles.transcriptLine}>
          <Text style={styles.transcriptTimestamp}>[{entry.timestamp}]</Text>
          <Text style={styles.transcriptText}>
            <Text style={styles.transcriptSpeaker}>{entry.speaker}: </Text>
            {entry.text}
          </Text>
        </View>
      ))}

      <View style={styles.divider} />

      {!hasAnalysis ? (
        <TouchableOpacity style={styles.analyzeBtn} onPress={handleAnalyze} disabled={analyzing}>
          <Text style={styles.analyzeBtnText}>
            {analyzing ? 'Analyzing...' : '✨ Analyze Meeting'}
          </Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity
            style={styles.reanalyzeBtn}
            onPress={handleAnalyze}
            disabled={analyzing}
          >
            <Text style={styles.reanalyzeBtnText}>
              {analyzing ? 'Re-analyzing...' : '↻ Re-analyze'}
            </Text>
          </TouchableOpacity>

          <AnalysisSection title="Summary" items={meeting.summary} />
          <AnalysisSection title="Decisions" items={meeting.decisions} />
          <AnalysisSection title="Action Items" items={meeting.analysisActionItems} taskField />
          <AnalysisSection title="Follow-ups" items={meeting.follow_ups} />
        </>
      )}
    </ScrollView>
  );
}

function AnalysisSection({
  title,
  items,
  taskField,
}: {
  title: string;
  items?: AnalysisItem[];
  taskField?: boolean;
}) {
  if (!items || items.length === 0) {
    return (
      <View style={styles.analysisSection}>
        <Text style={styles.sectionHeader}>{title}</Text>
        <Text style={styles.emptyAnalysis}>None found in this transcript.</Text>
      </View>
    );
  }

  return (
    <View style={styles.analysisSection}>
      <Text style={styles.sectionHeader}>{title}</Text>
      {items.map((item, i) => (
        <View key={i} style={styles.analysisCard}>
          <Text style={styles.analysisText}>
            {taskField ? item.task : item.text}
            {taskField && item.assignee ? ` — ${item.assignee}` : ''}
          </Text>
          <View style={styles.citationRow}>
            {item.citations.map((c, j) => (
              <View key={j} style={styles.citationBadge}>
                <Text style={styles.citationBadgeText}>📍 {c.timestamp}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  participants: { fontSize: 13, color: '#999', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 16 },
  sectionHeader: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  transcriptLine: { marginBottom: 10 },
  transcriptTimestamp: { fontSize: 12, color: '#999', marginBottom: 2 },
  transcriptText: { fontSize: 14, lineHeight: 20 },
  transcriptSpeaker: { fontWeight: '600' },
  analyzeBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  analyzeBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  reanalyzeBtn: {
    borderWidth: 1,
    borderColor: '#7c3aed',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  reanalyzeBtnText: { color: '#7c3aed', fontWeight: '600' },
  analysisSection: { marginBottom: 20 },
  emptyAnalysis: { color: '#999', fontSize: 13, fontStyle: 'italic' },
  analysisCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  analysisText: { fontSize: 14, marginBottom: 6 },
  citationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  citationBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  citationBadgeText: { fontSize: 11, color: '#4338ca', fontWeight: '600' },
});