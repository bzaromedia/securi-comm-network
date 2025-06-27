import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  Brain,
  Shield,
  Activity,
  AlertTriangle,
  Eye,
  Zap,
  Network,
  Cpu,
  Globe,
  TrendingUp,
  Target,
  Radar,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { useSecurity } from '@/contexts/SecurityContext';

const { width } = Dimensions.get('window');

interface ThreatNode {
  id: string;
  type: 'network' | 'behavior' | 'device' | 'external';
  severity: number;
  position: { x: number; y: number };
  timestamp: number;
}

interface SecurityMetric {
  label: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
  icon: any;
}

export function AISecurityEngine() {
  const { threatDetection, aiSecurityScan } = useSecurity();
  const [threatNodes, setThreatNodes] = useState<ThreatNode[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>([]);

  const scanAnimation = useSharedValue(0);
  const radarRotation = useSharedValue(0);
  const pulseAnimation = useSharedValue(1);

  useEffect(() => {
    // Initialize security metrics
    updateSecurityMetrics();
    
    // Start continuous scanning animation
    radarRotation.value = withRepeat(
      withTiming(360, { duration: 4000 }),
      -1,
      false
    );

    // Generate initial threat nodes
    generateThreatNodes();

    // Set up periodic updates
    const interval = setInterval(() => {
      updateThreatNodes();
      updateSecurityMetrics();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (threatDetection.level > 5) {
      pulseAnimation.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 300 }),
          withTiming(1, { duration: 300 })
        ),
        -1,
        false
      );
    } else {
      pulseAnimation.value = withTiming(1, { duration: 300 });
    }
  }, [threatDetection.level]);

  const updateSecurityMetrics = () => {
    const metrics: SecurityMetric[] = [
      {
        label: 'AI Confidence',
        value: threatDetection.confidence || 95,
        trend: 'stable',
        color: '#00FF94',
        icon: Brain,
      },
      {
        label: 'Network Security',
        value: Math.max(0, 100 - (threatDetection.factors?.networkAnomaly || 0) * 20),
        trend: threatDetection.factors?.networkAnomaly > 1 ? 'down' : 'stable',
        color: '#00D4FF',
        icon: Network,
      },
      {
        label: 'Behavior Analysis',
        value: Math.max(0, 100 - (threatDetection.factors?.behaviorPattern || 0) * 30),
        trend: threatDetection.factors?.behaviorPattern > 1 ? 'down' : 'up',
        color: '#9D4EDD',
        icon: Activity,
      },
      {
        label: 'Device Integrity',
        value: Math.max(0, 100 - (threatDetection.factors?.deviceIntegrity || 0) * 25),
        trend: 'stable',
        color: '#FFB800',
        icon: Shield,
      },
    ];
    setSecurityMetrics(metrics);
  };

  const generateThreatNodes = () => {
    const nodes: ThreatNode[] = [];
    const types: ThreatNode['type'][] = ['network', 'behavior', 'device', 'external'];
    
    for (let i = 0; i < 8; i++) {
      nodes.push({
        id: `threat_${i}`,
        type: types[Math.floor(Math.random() * types.length)],
        severity: Math.random() * 10,
        position: {
          x: Math.random() * (width - 100) + 50,
          y: Math.random() * 200 + 50,
        },
        timestamp: Date.now() - Math.random() * 300000,
      });
    }
    setThreatNodes(nodes);
  };

  const updateThreatNodes = () => {
    setThreatNodes(prev => 
      prev.map(node => ({
        ...node,
        severity: Math.max(0, node.severity + (Math.random() - 0.5) * 2),
        position: {
          x: Math.max(20, Math.min(width - 20, node.position.x + (Math.random() - 0.5) * 20)),
          y: Math.max(20, Math.min(180, node.position.y + (Math.random() - 0.5) * 10)),
        },
      }))
    );
  };

  const performDeepScan = async () => {
    setIsScanning(true);
    scanAnimation.value = withTiming(1, { duration: 500 });
    
    try {
      await aiSecurityScan();
      generateThreatNodes();
    } finally {
      setTimeout(() => {
        setIsScanning(false);
        scanAnimation.value = withTiming(0, { duration: 500 });
      }, 2000);
    }
  };

  const animatedScanStyle = useAnimatedStyle(() => ({
    opacity: scanAnimation.value,
    transform: [{ scale: scanAnimation.value }],
  }));

  const animatedRadarStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${radarRotation.value}deg` }],
  }));

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  const getThreatColor = (severity: number) => {
    if (severity > 7) return '#FF4444';
    if (severity > 4) return '#FFB800';
    return '#00FF94';
  };

  const getThreatIcon = (type: ThreatNode['type']) => {
    switch (type) {
      case 'network': return Network;
      case 'behavior': return Activity;
      case 'device': return Cpu;
      case 'external': return Globe;
    }
  };

  const SecurityMetricCard = ({ metric }: { metric: SecurityMetric }) => {
    const IconComponent = metric.icon;
    const TrendIcon = metric.trend === 'up' ? TrendingUp : 
                     metric.trend === 'down' ? AlertTriangle : Target;

    return (
      <BlurView intensity={20} style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <IconComponent size={16} color={metric.color} />
          <Text style={styles.metricLabel}>{metric.label}</Text>
          <TrendIcon size={12} color={metric.trend === 'down' ? '#FF4444' : '#00FF94'} />
        </View>
        <Text style={[styles.metricValue, { color: metric.color }]}>
          {metric.value.toFixed(0)}%
        </Text>
        <View style={styles.metricBar}>
          <View 
            style={[
              styles.metricBarFill,
              { 
                width: `${metric.value}%`,
                backgroundColor: metric.color,
              }
            ]} 
          />
        </View>
      </BlurView>
    );
  };

  const ThreatNodeComponent = ({ node }: { node: ThreatNode }) => {
    const IconComponent = getThreatIcon(node.type);
    const color = getThreatColor(node.severity);

    return (
      <Animated.View
        style={[
          styles.threatNode,
          {
            left: node.position.x,
            top: node.position.y,
            borderColor: color,
            backgroundColor: `${color}20`,
          },
          animatedPulseStyle,
        ]}
      >
        <IconComponent size={12} color={color} />
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Animated.View style={animatedPulseStyle}>
            <Brain size={24} color="#9D4EDD" />
          </Animated.View>
          <Text style={styles.title}>AI Security Engine</Text>
        </View>
        <TouchableOpacity 
          style={[styles.scanButton, isScanning && styles.scanButtonActive]}
          onPress={performDeepScan}
          disabled={isScanning}
        >
          <Radar size={16} color={isScanning ? '#000000' : '#9D4EDD'} />
          <Text style={[styles.scanButtonText, isScanning && styles.scanButtonTextActive]}>
            {isScanning ? 'Scanning...' : 'Deep Scan'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Threat Visualization */}
      <BlurView intensity={20} style={styles.threatMap}>
        <View style={styles.threatMapHeader}>
          <Eye size={16} color="#00FF94" />
          <Text style={styles.threatMapTitle}>Real-time Threat Map</Text>
          <Text style={styles.threatCount}>
            {threatNodes.filter(n => n.severity > 5).length} Active Threats
          </Text>
        </View>

        <View style={styles.threatVisualization}>
          {/* Radar Sweep */}
          <Animated.View style={[styles.radarSweep, animatedRadarStyle]} />
          
          {/* Scanning Overlay */}
          <Animated.View style={[styles.scanOverlay, animatedScanStyle]}>
            <Text style={styles.scanText}>AI DEEP SCAN IN PROGRESS</Text>
          </Animated.View>

          {/* Threat Nodes */}
          {threatNodes.map(node => (
            <ThreatNodeComponent key={node.id} node={node} />
          ))}

          {/* Center Hub */}
          <View style={styles.centerHub}>
            <Shield size={20} color="#00FF94" />
          </View>
        </View>
      </BlurView>

      {/* Security Metrics */}
      <View style={styles.metricsContainer}>
        <Text style={styles.metricsTitle}>Security Analytics</Text>
        <View style={styles.metricsGrid}>
          {securityMetrics.map((metric, index) => (
            <SecurityMetricCard key={index} metric={metric} />
          ))}
        </View>
      </View>

      {/* AI Insights */}
      <BlurView intensity={20} style={styles.insightsContainer}>
        <View style={styles.insightsHeader}>
          <Zap size={16} color="#FFB800" />
          <Text style={styles.insightsTitle}>AI Insights</Text>
        </View>
        <View style={styles.insightsList}>
          <View style={styles.insightItem}>
            <View style={[styles.insightDot, { backgroundColor: '#00FF94' }]} />
            <Text style={styles.insightText}>
              Behavioral patterns within normal parameters
            </Text>
          </View>
          <View style={styles.insightItem}>
            <View style={[styles.insightDot, { backgroundColor: '#FFB800' }]} />
            <Text style={styles.insightText}>
              Network anomaly detected at {new Date().toLocaleTimeString()}
            </Text>
          </View>
          <View style={styles.insightItem}>
            <View style={[styles.insightDot, { backgroundColor: '#9D4EDD' }]} />
            <Text style={styles.insightText}>
              AI confidence level: {threatDetection.confidence}% (Excellent)
            </Text>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(157, 78, 221, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#9D4EDD',
  },
  scanButtonActive: {
    backgroundColor: '#9D4EDD',
  },
  scanButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#9D4EDD',
    marginLeft: 6,
  },
  scanButtonTextActive: {
    color: '#000000',
  },
  threatMap: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  threatMapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  threatMapTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  threatCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FF4444',
  },
  threatVisualization: {
    height: 200,
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  radarSweep: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 2,
    height: 80,
    backgroundColor: '#00FF94',
    marginLeft: -1,
    marginTop: -40,
    opacity: 0.6,
  },
  scanOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(157, 78, 221, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#9D4EDD',
    textAlign: 'center',
  },
  threatNode: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerHub: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 255, 148, 0.2)',
    borderWidth: 2,
    borderColor: '#00FF94',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -20,
    marginTop: -20,
  },
  metricsContainer: {
    marginBottom: 20,
  },
  metricsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF80',
    flex: 1,
    marginLeft: 6,
  },
  metricValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  metricBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  insightsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  insightsList: {
    gap: 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  insightText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF80',
    flex: 1,
  },
});