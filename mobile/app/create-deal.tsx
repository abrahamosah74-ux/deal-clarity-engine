// mobile/app/create-deal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useDealsStore } from '@/stores/dealsStore';
import { useAuthStore } from '@/stores/authStore';
import { ErrorMessage } from '@/components/ErrorMessage';

const STAGES = [
  'prospect',
  'qualified',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
];

export default function CreateDealScreen() {
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState('prospect');
  const [probability, setProbability] = useState('50');
  const [description, setDescription] = useState('');
  const { createDeal, isLoading, error, clearError } = useDealsStore();
  const { user } = useAuthStore();

  const handleCreate = async () => {
    if (!title || !value) {
      return;
    }

    try {
      await createDeal({
        title,
        value: parseInt(value),
        stage,
        probability: parseInt(probability) / 100,
        description: description || undefined,
        team: user?.team,
      });
      router.push('/(tabs)/deals');
    } catch (err) {
      // Error handled by store
    }
  };

  const isValid = title && value;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.wrapper}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#0066CC" />
          </Pressable>
          <Text style={styles.headerTitle}>New Deal</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {error && (
            <ErrorMessage
              message={error}
              onDismiss={clearError}
            />
          )}

          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.label}>Deal Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter deal title"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
              editable={!isLoading}
            />
          </View>

          {/* Value & Stage Row */}
          <View style={styles.row}>
            <View style={[styles.section, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Value ($) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                value={value}
                onChangeText={setValue}
                editable={!isLoading}
              />
            </View>

            <View style={[styles.section, { flex: 1 }]}>
              <Text style={styles.label}>Stage</Text>
              <View style={styles.picker}>
                <Text style={styles.pickerText}>
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </Text>
                <MaterialIcons
                  name="expand-more"
                  size={20}
                  color="#6B7280"
                />
              </View>
            </View>
          </View>

          {/* Probability */}
          <View style={styles.section}>
            <Text style={styles.label}>
              Probability ({probability}%)
            </Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderValue}>{probability}%</Text>
              <TextInput
                style={styles.input}
                placeholder="0-100"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                value={probability}
                onChangeText={(text) => {
                  const num = parseInt(text) || 0;
                  setProbability(String(Math.min(100, Math.max(0, num))));
                }}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Add deal notes..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              editable={!isLoading}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={() => router.back()}
            >
              <Text style={[styles.buttonText, { color: '#0066CC' }]}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.button,
                styles.createButton,
                !isValid || isLoading ? styles.buttonDisabled : null,
              ]}
              onPress={handleCreate}
              disabled={!isValid || isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Creating...' : 'Create Deal'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  wrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textarea: {
    textAlignVertical: 'top',
    height: 100,
  },
  picker: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#1F2937',
  },
  sliderContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066CC',
    minWidth: 40,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  createButton: {
    backgroundColor: '#0066CC',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
