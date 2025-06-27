/**
 * SecuriComm Threat Meter Component
 * 
 * Displays the current threat level with a visual meter.
 * Shows different colors and icons based on the threat level.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SecurityLevel } from '@/contexts/SecurityContext';

// Props interface
export interface ThreatMeterProps {
  threatLevel: number; // 0-100
  securityLevel: SecurityLevel;
}

// Threat meter component
const ThreatMeter = ({ threatLevel, securityLevel }: ThreatMeterProps) => {
  // Get threat level properties
  const getThreatProps = () => {
    if (threatLevel >= 80) {
      return {
        color: '#FF3B30',
        icon: 'warning',
        text: 'Critical',
      };
    } else if (threatLevel >= 60) {
      return {
        color: '#FF9500',
        icon: 'alert-circle',
        text: 'High',
      };
    } else if (threatLevel >= 40) {
      return {
        color: '#FFCC00',
        icon: 'alert',
        text: 'Moderate',
      };
    } else if (threatLevel >= 20) {
      return {
        color: '#34C759',
        icon: 'information-circle',
        text: 'Low',
      };
    } else {
      return {
        color: '#30D158',
        icon: 'checkmark-circle',
        text: 'Minimal',
      };
    }
  };
  
  const { color, icon, text } = getThreatProps();
  
  // Calculate meter segments
  const getSegments = () => {
    const segments = [];
    const totalSegments = 5;
    
    // Calculate active segments
    const activeSegments = Math.ceil((threatLevel / 100) * totalSegments);
    
    for (let i = 0; i < totalSegments; i++) {
      const isActive = i < activeSegments;
      
      // Determine segment color
      let segmentColor;
      
      if (isActive) {
        if (i === 0) segmentColor = '#30D158'; // Green
        if (i === 1) segmentColor = '#34C759'; // Light Green
        if (i === 2) segmentColor = '#FFCC00'; // Yellow
        if (i === 3) segmentColor = '#FF9500'; // Orange
        if (i === 4) segmentColor = '#FF3B30'; // Red
      } else {
        segmentColor = '#E5E5EA'; // Inactive color
      }
      
      segments.push(
        <View
          key={i}
          style={[
            styles.segment,
            {
              backgroundColor: segmentColor,
              height: 8 + i * 3, // Increasing height for each segment
            },
          ]}
        />
      );
    }
    
    return segments;
  };
  
  // Get security level impact text
  const getSecurityImpact = () => {
    if (threatLevel >= 60) {
      switch (securityLevel) {
        case SecurityLevel.MAXIMUM:
          return 'Protected';
        case SecurityLevel.HIGH:
          return 'At Risk';
        default:
          return 'Vulnerable';
      }
    } else if (threatLevel >= 30) {
      switch (securityLevel) {
        case SecurityLevel.MAXIMUM:
        case SecurityLevel.HIGH:
          return 'Protected';
        case SecurityLevel.MEDIUM:
          return 'Monitored';
        default:
          return 'At Risk';
      }
    } else {
      return 'Secure';
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Ionicons name={icon} size={18} color={color} />
        <Text style={[styles.headerText, { color }]}>
          {text} Threat Level: {threatLevel}%
        </Text>
      </View>
      
      <View style={styles.meterContainer}>
        {getSegments()}
      </View>
      
      <View style={styles.impactContainer}>
        <Text style={styles.impactLabel}>Impact:</Text>
        <Text
          style={[
            styles.impactText,
            {
              color:
                getSecurityImpact() === 'Protected' || getSecurityImpact() === 'Secure'
                  ? '#34C759'
                  : getSecurityImpact() === 'Monitored'
                  ? '#FFCC00'
                  : getSecurityImpact() === 'At Risk'
                  ? '#FF9500'
                  : '#FF3B30',
            },
          ]}
        >
          {getSecurityImpact()}
        </Text>
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginLeft: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  meterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 20,
    marginBottom: 8,
  },
  segment: {
    width: '18%',
    borderRadius: 4,
  },
  impactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  impactLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginRight: 4,
  },
  impactText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ThreatMeter;
