/**
 * SecuriComm Encryption Indicator Component
 * 
 * Displays the current encryption status with a visual indicator.
 * Shows different colors and icons based on the encryption level.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SecurityLevel } from '@/contexts/SecurityContext';

// Props interface
export interface EncryptionIndicatorProps {
  encryptionLevel: SecurityLevel;
  isActive: boolean;
  lastEncrypted?: string;
}

// Encryption indicator component
const EncryptionIndicator = ({
  encryptionLevel,
  isActive,
  lastEncrypted,
}: EncryptionIndicatorProps) => {
  // Get indicator properties based on encryption level
  const getIndicatorProps = () => {
    if (!isActive) {
      return {
        color: '#FF3B30',
        icon: 'lock-open',
        text: 'Not Encrypted',
      };
    }
    
    switch (encryptionLevel) {
      case SecurityLevel.MAXIMUM:
        return {
          color: '#34C759',
          icon: 'shield-checkmark',
          text: 'Maximum Encryption',
        };
      case SecurityLevel.HIGH:
        return {
          color: '#30D158',
          icon: 'lock-closed',
          text: 'High Encryption',
        };
      case SecurityLevel.MEDIUM:
        return {
          color: '#FFD60A',
          icon: 'lock-closed',
          text: 'Standard Encryption',
        };
      case SecurityLevel.BASIC:
        return {
          color: '#FF9F0A',
          icon: 'lock-closed',
          text: 'Basic Encryption',
        };
      default:
        return {
          color: '#8E8E93',
          icon: 'lock-closed',
          text: 'Unknown',
        };
    }
  };
  
  const { color, icon, text } = getIndicatorProps();
  
  // Format last encrypted time
  const formatLastEncrypted = () => {
    if (!lastEncrypted) {
      return 'Never';
    }
    
    try {
      const date = new Date(lastEncrypted);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Unknown';
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Ionicons name={icon} size={18} color={color} />
        <Text style={[styles.headerText, { color }]}>{text}</Text>
      </View>
      
      {lastEncrypted && (
        <Text style={styles.timestampText}>
          Last encrypted: {formatLastEncrypted()}
        </Text>
      )}
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Ionicons
            name={isActive ? 'checkmark-circle' : 'close-circle'}
            size={14}
            color={isActive ? '#34C759' : '#FF3B30'}
          />
          <Text style={styles.detailText}>End-to-End</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons
            name={
              encryptionLevel === SecurityLevel.MAXIMUM ||
              encryptionLevel === SecurityLevel.HIGH
                ? 'checkmark-circle'
                : 'alert-circle'
            }
            size={14}
            color={
              encryptionLevel === SecurityLevel.MAXIMUM ||
              encryptionLevel === SecurityLevel.HIGH
                ? '#34C759'
                : '#FFD60A'
            }
          />
          <Text style={styles.detailText}>Zero Knowledge</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons
            name={
              encryptionLevel === SecurityLevel.MAXIMUM
                ? 'checkmark-circle'
                : 'alert-circle'
            }
            size={14}
            color={
              encryptionLevel === SecurityLevel.MAXIMUM ? '#34C759' : '#FFD60A'
            }
          />
          <Text style={styles.detailText}>Perfect Forward Secrecy</Text>
        </View>
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  timestampText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
  },
  detailsContainer: {
    marginTop: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#3C3C43',
    marginLeft: 6,
  },
});

export default EncryptionIndicator;
