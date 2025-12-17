// mobile/app/deal/[id].tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useDealsStore } from '@/stores/dealsStore';
import { Card } from '@/components/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

export default function DealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedDeal, isLoading, fetchDealById } = useDealsStore();

  useEffect(() => {
    if (id) {
      fetchDealById(id);
    }
  }, [id]);

  if (isLoading || !selectedDeal) {
    return <LoadingSpinner />;
  }

  const getStageColor = (stage: string) => {
    const colors: any = {
      prospect: '#3B82F6',
      qualified: '#10B981',
      proposal: '#F59E0B',
      negotiation: '#8B5CF6',
      closed_won: '#059669',
      closed_lost: '#EF4444',
    };
    return colors[stage] || '#6B7280';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Deal Header */}
        <Card style={styles.headerCard}>
          <Text style={styles.title}>{selectedDeal.title}</Text>
          <View style={styles.row}>
            <Text style={styles.value}>
              ${selectedDeal.value?.toLocaleString() || 0}
            </Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: getStageColor(selectedDeal.stage) },
              ]}
            >
              <Text style={styles.badgeText}>
                {selectedDeal.stage?.toUpperCase()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Deal Information */}
        <Card>
          <Text style={styles.sectionTitle}>Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Probability</Text>
            <Text style={styles.value}>
              {Math.round((selectedDeal.probability || 0) * 100)}%
            </Text>
          </View>

          {selectedDeal.expectedCloseDate && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Expected Close</Text>
              <Text style={styles.value}>
                {new Date(
                  selectedDeal.expectedCloseDate
                ).toLocaleDateString()}
              </Text>
            </View>
          )}

          {selectedDeal.contact && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Contact</Text>
              <Text style={styles.value}>
                {selectedDeal.contact.name || 'N/A'}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.label}>Created</Text>
            <Text style={styles.value}>
              {formatDistanceToNow(
                new Date(selectedDeal.createdAt),
                { addSuffix: true }
              )}
            </Text>
          </View>
        </Card>

        {/* Description */}
        {selectedDeal.description && (
          <Card>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {selectedDeal.description}
            </Text>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.button, styles.primaryButton]}
            onPress={() => {
              router.push(`/edit-deal/${selectedDeal._id}`);
            }}
          >
            <MaterialIcons name="edit" size={20} color="#fff" />
            <Text style={styles.buttonText}>Edit</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.back()}
          >
            <MaterialIcons name="close" size={20} color="#0066CC" />
            <Text style={[styles.buttonText, { color: '#0066CC' }]}>
              Close
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerCard: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0066CC',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#0066CC',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
