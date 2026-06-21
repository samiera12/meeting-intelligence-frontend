import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';
import { createMeeting } from '../api/meetings';
import { TranscriptEntry } from '../types';

type Nav = NativeStackNavigationProp<AppStackParamList, 'CreateMeeting'>;

export default function CreateMeetingScreen() {
  const navigation = useNavigation<Nav>();
  const [title, setTitle] = useState('');
  const [participantsText, setParticipantsText] = useState('');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([
    { timestamp: '', speaker: '', text: '' },
  ]);
  const [saving, setSaving] = useState(false);

  function updateTranscriptEntry(index: number, field: keyof TranscriptEntry, value: string) {
    setTranscript((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  function addTranscriptRow() {
    setTranscript((prev) => [...prev, { timestamp: '', speaker: '', text: '' }]);
  }

  function removeTranscriptRow(index: number) {
    setTranscript((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    const participants = participantsText
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    if (!title.trim()) {
      Alert.alert('Missing title', 'Please enter a meeting title.');
      return;
    }
    if (participants.length === 0) {
      Alert.alert('Missing participants', 'Add at least one participant email, comma-separated.');
      return;
    }
    const validTranscript = transcript.filter((t) => t.timestamp && t.speaker && t.text);
    if (validTranscript.length === 0) {
      Alert.alert('Missing transcript', 'Add at least one transcript entry.');
      return;
    }

    setSaving(true);
    try {
      const meeting = await createMeeting({
        title: title.trim(),
        participants,
        meetingDate: new Date().toISOString(),
        transcript: validTranscript,
      });
      navigation.replace('MeetingDetail', { meetingId: meeting.id });
    } catch (err: any) {
      const message =
        err.response?.data?.error?.details
          ?.map((d: any) => d.message)
          .join('\n') ||
        err.response?.data?.error?.message ||
        'Failed to create meeting';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.label}>Meeting Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Sprint Planning"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Participants (comma-separated emails)</Text>
        <TextInput
          style={styles.input}
          placeholder="alice@example.com, bob@example.com"
          autoCapitalize="none"
          value={participantsText}
          onChangeText={setParticipantsText}
        />

        <Text style={styles.label}>Transcript</Text>
        {transcript.map((entry, index) => (
          <View key={index} style={styles.transcriptRow}>
            <TextInput
              style={[styles.input, styles.timestampInput]}
              placeholder="00:10"
              value={entry.timestamp}
              onChangeText={(v) => updateTranscriptEntry(index, 'timestamp', v)}
            />
            <TextInput
              style={[styles.input, styles.speakerInput]}
              placeholder="Speaker"
              value={entry.speaker}
              onChangeText={(v) => updateTranscriptEntry(index, 'speaker', v)}
            />
            <TouchableOpacity
              onPress={() => removeTranscriptRow(index)}
              style={styles.removeBtn}
            >
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        {transcript.map((entry, index) => (
          <TextInput
            key={`text-${index}`}
            style={[styles.input, { marginTop: -8, marginBottom: 12 }]}
            placeholder="What was said..."
            multiline
            value={entry.text}
            onChangeText={(v) => updateTranscriptEntry(index, 'text', v)}
          />
        ))}

        <TouchableOpacity style={styles.addRowBtn} onPress={addTranscriptRow}>
          <Text style={styles.addRowBtnText}>+ Add transcript line</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={saving}>
          <Text style={styles.submitBtnText}>{saving ? 'Saving...' : 'Create Meeting'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 12, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 8,
  },
  transcriptRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timestampInput: { width: 70 },
  speakerInput: { flex: 1 },
  removeBtn: { padding: 8 },
  removeBtnText: { color: '#ef4444', fontSize: 16 },
  addRowBtn: { paddingVertical: 8, marginBottom: 16 },
  addRowBtnText: { color: '#2563eb', fontWeight: '600' },
  submitBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});