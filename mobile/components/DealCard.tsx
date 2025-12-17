// mobile/components/DealCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Card } from './Card';

interface DealCardProps {
  deal: any;
  onPress: () => void;
}

export const DealCard: React.FC<DealCardProps> = ({ deal, onPress }) => {
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
    <Pressable onPress={onPress}>
      <Card>
        <Text style={styles.title} numberOfLines={1}>
          {deal.title}
        </Text>
        
        <View style={styles.row}>
          <Text style={styles.value}>${deal.value?.toLocaleString() || 0}</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: getStageColor(deal.stage) },
            ]}
          >
            <Text style={styles.badgeText}>{deal.stage}</Text>
          </View>
        </View>

        {deal.contact && (
          <Text style={styles.contact}>
            {deal.contact.name || 'No contact'}
          </Text>
        )}

        <View style={styles.meta}>
          <Text style={styles.metaText}>
            {Math.round((deal.probability || 0) * 100)}% likely
          </Text>
          {deal.expectedCloseDate && (
            <Text style={styles.metaText}>
              Close: {new Date(deal.expectedCloseDate).toLocaleDateString()}
            </Text>
          )}
        </View>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0066CC',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  contact: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
