import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  Clock,
  Shield,
  AlertTriangle,
  Activity,
  Lock,
  Eye,
  Zap,
  Network,
  Brain,
  CheckCircle,
  XCircle,
  Info,
  TrendingUp,
  Filter,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export interface SecurityEvent {
  id: string;
  type: 'scan' | 'threat' | 'encryption' | 'access' | 'network' | 'ai' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: number;
  details?: {
    source?: string;
    action?: string;
    result?: string;
    metadata?: Record<string, any>;
  };
  resolved?: boolean;
}

interface SecurityTimelineProps {
  events?: SecurityEvent[];
  maxEvents?: number;
  showFilters?: boolean;
}

export function SecurityTimeline({ 
  events = [], 
  maxEvents = 20,
  showFilters = true 
}: SecurityTimelineProps) {
  const [filteredEvents, setFilteredEvents] = useState<SecurityEvent[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | SecurityEvent['type']>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | SecurityEvent['severity']>('all');

  // Generate sample events if none provided
  const sampleEvents: SecurityEvent[] = [
    {
      id: '1',
      type: 'ai',
      severity: 'low',
      title: 'AI Security Scan Completed',
      description: 'Comprehensive AI threat analysis completed successfully',
      timestamp: Date.now() - 300000,
      details: {
        source: 'AI Engine',
        action: 'Deep Scan',
        result: 'No threats detected',
        metadata: { confidence: 95, duration: '2.3s' }
      },
      resolved: true,
    },
    {
      id: '2',
      type: 'threat',
      severity: 'medium',
      title: 'Network Anomaly Detected',
      description: 'Unusual network traffic pattern identified',
      timestamp: Date.now() - 600000,
      details: {
        source: 'Network Monitor',
        action: 'Traffic Analysis',
        result: 'Anomaly flagged',
        metadata: { severity: 3.2, location: 'External' }
      },
      resolved: false,
    },
    {
      id: '3',
      type: 'encryption',
      severity: 'low',
      title: 'Encryption Keys Rotated',
      description: 'Automatic key rotation completed successfully',
      timestamp: Date.now() - 900000,
      details: {
        source: 'Encryption Engine',
        action: 'Key Rotation',
        result: 'Success',
        metadata: { algorithm: 'XChaCha20-Poly1305', keySize: 256 }
      },
      resolved: true,
    },
    {
      id: '4',
      type: 'access',
      severity: 'high',
      title: 'Failed Authentication Attempt',
      description: 'Multiple failed biometric authentication attempts',
      timestamp: Date.now() - 1200000,
      details: {
        source: 'Auth System',
        action: 'Biometric Auth',
        result: 'Failed (3 attempts)',
        metadata: { attempts: 3, lockout: true }
      },
      resolved: true,
    },
    {
      id: '5',
      type: 'compliance',
      severity: 'low',
      title: 'GDPR Compliance Check',
      description: 'Automated compliance verification completed',
      timestamp: Date.now() - 1800000,
      details: {
        source: 'Compliance Engine',
        action: 'GDPR Check',
        result: 'Compliant',
        metadata: { regulations: ['GDPR', 'CCPA'], score: 98 }
      },
      resolved: true,
    },
  ];

  const allEvents = events.length > 0 ? events : sampleEvents;

  useEffect(() => {
    let filtered = allEvents;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(event => event.type === selectedFilter);
    }

    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(event => event.severity === selectedSeverity);
    }

    filtered = filtered
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, maxEvents);

    setFilteredEvents(filtered);
  }, [allEvents, selectedFilter, selectedSeverity, maxEvents]);

  const getEventConfig = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'scan':
        return { icon: Activity, color: '#00FF94', label: 'Security Scan' };
      case 'threat':
        return { icon: AlertTriangle, color: '#FF4444', label: 'Threat Detection' };
      case 'encryption':
        return { icon: Lock, color: '#00D4FF', label: 'Encryption' };
      case 'access':
        return { icon: Eye, color: '#FFB800', label: 'Access Control' };
      case 'network':
        return { icon: Network, color: '#9D4EDD', label: 'Network Security' };
      case 'ai':
        return { icon: Brain, color: '#FF6B35', label: 'AI Analysis' };
      case 'compliance':
        return { icon: Shield, color: '#00FF94', label: 'Compliance' };
      default:
        return { icon: Info, color: '#FFFFFF60', label: 'System' };
    }
  };

  const getSeverityConfig = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical':
        return { color: '#FF4444', label: 'CRITICAL' };
      case 'high':
        return { color: '#FF6B35', label: 'HIGH' };
      case 'medium':
        return { color: '#FFB800', label: 'MEDIUM' };
      case 'low':
        return { color: '#00FF94', label: 'LOW' };
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const TimelineEvent = ({ event, index }: { event: SecurityEvent; index: number }) => {
    const eventConfig = getEventConfig(event.type);
    const severityConfig = getSeverityConfig(event.severity);
    const IconComponent = eventConfig.icon;
    
    const animationDelay = index * 100;
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    useEffect(() => {
      opacity.value = withDelay(animationDelay, withTiming(1, { duration: 500 }));
      translateY.value = withDelay(animationDelay, withTiming(0, { duration: 500 }));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    }));

    return (
      <Animated.View style={[styles.timelineEvent, animatedStyle]}>
        <View style={styles.timelineLeft}>
          <View style={[styles.eventIcon, { backgroundColor: `${eventConfig.color}20`, borderColor: eventConfig.color }]}>
            <IconComponent size={16} color={eventConfig.color} />
          </View>
          <View style={[styles.timelineLine, index === filteredEvents.length - 1 && styles.timelineLineEnd]} />
        </View>

        <BlurView intensity={20} style={styles.eventCard}>
          <View style={styles.eventHeader}>
            <View style={styles.eventTitleContainer}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <View style={[styles.severityBadge, { backgroundColor: severityConfig.color }]}>
                <Text style={styles.severityText}>{severityConfig.label}</Text>
              </View>
            </View>
            <View style={styles.eventMeta}>
              <Text style={styles.eventType}>{eventConfig.label}</Text>
              <Text style={styles.eventTime}>{formatTimeAgo(event.timestamp)}</Text>
            </View>
          </View>

          <Text style={styles.eventDescription}>{event.description}</Text>

          {event.details && (
            <View style={styles.eventDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Source:</Text>
                <Text style={styles.detailValue}>{event.details.source}</Text>
              </View>
              {event.details.action && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Action:</Text>
                  <Text style={styles.detailValue}>{event.details.action}</Text>
                </View>
              )}
              {event.details.result && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Result:</Text>
                  <Text style={[styles.detailValue, { color: event.resolved ? '#00FF94' : '#FFB800' }]}>
                    {event.details.result}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.eventFooter}>
            <View style={styles.statusContainer}>
              {event.resolved ? (
                <CheckCircle size={14} color="#00FF94" />
              ) : (
                <XCircle size={14} color="#FF4444" />
              )}
              <Text style={[styles.statusText, { color: event.resolved ? '#00FF94' : '#FF4444' }]}>
                {event.resolved ? 'Resolved' : 'Active'}
              </Text>
            </View>
            <Text style={styles.eventTimestamp}>
              {new Date(event.timestamp).toLocaleString()}
            </Text>
          </View>
        </BlurView>
      </Animated.View>
    );
  };

  const FilterButton = ({ 
    label, 
    value, 
    isSelected, 
    onPress 
  }: { 
    label: string; 
    value: string; 
    isSelected: boolean; 
    onPress: () => void; 
  }) => (
    <TouchableOpacity
      style={[styles.filterButton, isSelected && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterButtonText, isSelected && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {showFilters && (
        <View style={styles.filtersContainer}>
          <BlurView intensity={20} style={styles.filtersCard}>
            <View style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <Filter size={16} color="#FFFFFF80" />
                <Text style={styles.filterTitle}>Event Type</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                <FilterButton
                  label="All"
                  value="all"
                  isSelected={selectedFilter === 'all'}
                  onPress={() => setSelectedFilter('all')}
                />
                <FilterButton
                  label="Threats"
                  value="threat"
                  isSelected={selectedFilter === 'threat'}
                  onPress={() => setSelectedFilter('threat')}
                />
                <FilterButton
                  label="AI"
                  value="ai"
                  isSelected={selectedFilter === 'ai'}
                  onPress={() => setSelectedFilter('ai')}
                />
                <FilterButton
                  label="Encryption"
                  value="encryption"
                  isSelected={selectedFilter === 'encryption'}
                  onPress={() => setSelectedFilter('encryption')}
                />
                <FilterButton
                  label="Access"
                  value="access"
                  isSelected={selectedFilter === 'access'}
                  onPress={() => setSelectedFilter('access')}
                />
              </ScrollView>
            </View>

            <View style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <TrendingUp size={16} color="#FFFFFF80" />
                <Text style={styles.filterTitle}>Severity</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                <FilterButton
                  label="All"
                  value="all"
                  isSelected={selectedSeverity === 'all'}
                  onPress={() => setSelectedSeverity('all')}
                />
                <FilterButton
                  label="Critical"
                  value="critical"
                  isSelected={selectedSeverity === 'critical'}
                  onPress={() => setSelectedSeverity('critical')}
                />
                <FilterButton
                  label="High"
                  value="high"
                  isSelected={selectedSeverity === 'high'}
                  onPress={() => setSelectedSeverity('high')}
                />
                <FilterButton
                  label="Medium"
                  value="medium"
                  isSelected={selectedSeverity === 'medium'}
                  onPress={() => setSelectedSeverity('medium')}
                />
                <FilterButton
                  label="Low"
                  value="low"
                  isSelected={selectedSeverity === 'low'}
                  onPress={() => setSelectedSeverity('low')}
                />
              </ScrollView>
            </View>
          </BlurView>
        </View>
      )}

      <View style={styles.timelineHeader}>
        <Clock size={20} color="#00FF94" />
        <Text style={styles.timelineTitle}>Security Timeline</Text>
        <Text style={styles.eventCount}>
          {filteredEvents.length} events
        </Text>
      </View>

      <ScrollView style={styles.timelineContainer} showsVerticalScrollIndicator={false}>
        {filteredEvents.map((event, index) => (
          <TimelineEvent key={event.id} event={event} index={index} />
        ))}

        {filteredEvents.length === 0 && (
          <BlurView intensity={20} style={styles.emptyState}>
            <Clock size={48} color="#FFFFFF40" />
            <Text style={styles.emptyTitle}>No Events Found</Text>
            <Text style={styles.emptySubtitle}>
              No security events match your current filters
            </Text>
          </BlurView>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filtersCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterSection: {
    marginBottom: 12,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF80',
    marginLeft: 8,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(0, 255, 148, 0.2)',
    borderColor: '#00FF94',
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF60',
  },
  filterButtonTextActive: {
    color: '#00FF94',
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timelineTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  eventCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
  },
  timelineContainer: {
    flex: 1,
  },
  timelineEvent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  eventIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 8,
  },
  timelineLineEnd: {
    backgroundColor: 'transparent',
  },
  eventCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  eventHeader: {
    marginBottom: 12,
  },
  eventTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  eventMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventType: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
  },
  eventTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
  },
  eventDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF80',
    lineHeight: 20,
    marginBottom: 12,
  },
  eventDetails: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
  },
  detailValue: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF80',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
  },
  eventTimestamp: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF40',
  },
  emptyState: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
    textAlign: 'center',
  },
});