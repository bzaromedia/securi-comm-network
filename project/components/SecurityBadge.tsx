/**
 * SecuriComm Security Badge Component
 * 
 * Displays the current security status with a visual badge.
 * Shows different colors and icons based on the security score.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SecurityLevel } from '@/contexts/SecurityContext';

// Props interface
export interface SecurityBadgeProps {
  securityScore: number; // 0-100
  securityLevel: SecurityLevel;
  onPress?: () => void;
}

// Security badge component
const SecurityBadge = ({
  securityScore,
  securityLevel,
  onPress,
}: SecurityBadgeProps) => {
  // Get badge properties based on security score
  const getBadgeProps = () => {
    if (securityScore >= 90) {
      return {
        color: '#34C759',
        icon: 'shield-checkmark',
        text: 'Excellent',
      };
    } else if (securityScore >= 75) {
      return {
        color: '#30D158',
        icon: 'shield',
        text: 'Good',
      };
    } else if (securityScore >= 50) {
      return {
        color: '#FFD60A',
        icon: 'shield-half',
        text: 'Fair',
      };
    } else if (securityScore >= 25) {
      return {
        color: '#FF9F0A',
        icon: 'shield-half',
        text: 'Poor',
      };
    } else {
      return {
        color: '#FF3B30',
        icon: 'shield-outline',
        text: 'Critical',
      };
    }
  };
  
  const { color, icon, text } = getBadgeProps();
  
  // Get security level text
  const getSecurityLevelText = () => {
    switch (securityLevel) {
      case SecurityLevel.MAXIMUM:
        return 'Maximum Security';
      case SecurityLevel.HIGH:
        return 'High Security';
      case SecurityLevel.MEDIUM:
        return 'Standard Security';
      case SecurityLevel.BASIC:
        return 'Basic Security';
      default:
        return 'Unknown';
    }
  };
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.scoreContainer}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={[styles.scoreText, { color }]}>{securityScore}</Text>
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.statusText}>{text}</Text>
        <Text style={styles.levelText}>{getSecurityLevelText()}</Text>
      </View>
      
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
      </View>
    </TouchableOpacity>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
  },
  detailsContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  levelText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  arrowContainer: {
    marginLeft: 8,
  },
});

export default SecurityBadge;
