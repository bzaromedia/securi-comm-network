import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  AlertTriangle,
  Shield,
  Info,
  CheckCircle,
  X,
  Zap,
  Clock,
  Eye,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export interface SecurityNotification {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: number;
  action?: {
    label: string;
    onPress: () => void;
  };
  autoDismiss?: boolean;
  duration?: number;
}

interface SecurityNotificationsProps {
  notifications: SecurityNotification[];
  onDismiss: (id: string) => void;
  onAction: (id: string, action: () => void) => void;
}

export function SecurityNotifications({ 
  notifications, 
  onDismiss, 
  onAction 
}: SecurityNotificationsProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<SecurityNotification[]>([]);
  const [animatedValues, setAnimatedValues] = useState<Map<string, Animated.Value>>(new Map());

  useEffect(() => {
    // Add new notifications with animation
    notifications.forEach(notification => {
      if (!visibleNotifications.find(n => n.id === notification.id)) {
        const animValue = new Animated.Value(0);
        setAnimatedValues(prev => new Map(prev.set(notification.id, animValue)));
        
        setVisibleNotifications(prev => [...prev, notification]);
        
        // Slide in animation
        Animated.spring(animValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();

        // Auto dismiss if specified
        if (notification.autoDismiss !== false) {
          const duration = notification.duration || 5000;
          setTimeout(() => {
            dismissNotification(notification.id);
          }, duration);
        }
      }
    });
  }, [notifications]);

  const dismissNotification = (id: string) => {
    const animValue = animatedValues.get(id);
    if (animValue) {
      Animated.timing(animValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setVisibleNotifications(prev => prev.filter(n => n.id !== id));
        setAnimatedValues(prev => {
          const newMap = new Map(prev);
          newMap.delete(id);
          return newMap;
        });
        onDismiss(id);
      });
    }
  };

  const getNotificationConfig = (type: SecurityNotification['type']) => {
    switch (type) {
      case 'critical':
        return {
          icon: AlertTriangle,
          color: '#FF4444',
          backgroundColor: 'rgba(255, 68, 68, 0.1)',
          borderColor: '#FF4444',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: '#FFB800',
          backgroundColor: 'rgba(255, 184, 0, 0.1)',
          borderColor: '#FFB800',
        };
      case 'info':
        return {
          icon: Info,
          color: '#00D4FF',
          backgroundColor: 'rgba(0, 212, 255, 0.1)',
          borderColor: '#00D4FF',
        };
      case 'success':
        return {
          icon: CheckCircle,
          color: '#00FF94',
          backgroundColor: 'rgba(0, 255, 148, 0.1)',
          borderColor: '#00FF94',
        };
    }
  };

  const NotificationItem = ({ notification }: { notification: SecurityNotification }) => {
    const config = getNotificationConfig(notification.type);
    const IconComponent = config.icon;
    const animValue = animatedValues.get(notification.id) || new Animated.Value(0);

    const animatedStyle = {
      transform: [
        {
          translateX: animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [width, 0],
          }),
        },
        {
          scale: animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
          }),
        },
      ],
      opacity: animValue,
    };

    return (
      <Animated.View style={[styles.notificationContainer, animatedStyle]}>
        <BlurView intensity={20} style={[
          styles.notification,
          {
            backgroundColor: config.backgroundColor,
            borderColor: config.borderColor,
          }
        ]}>
          <View style={styles.notificationContent}>
            <View style={styles.notificationHeader}>
              <IconComponent size={20} color={config.color} />
              <Text style={[styles.notificationTitle, { color: config.color }]}>
                {notification.title}
              </Text>
              <TouchableOpacity
                style={styles.dismissButton}
                onPress={() => dismissNotification(notification.id)}
              >
                <X size={16} color="#FFFFFF60" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.notificationMessage}>
              {notification.message}
            </Text>
            
            <View style={styles.notificationFooter}>
              <View style={styles.timestampContainer}>
                <Clock size={12} color="#FFFFFF40" />
                <Text style={styles.timestamp}>
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </Text>
              </View>
              
              {notification.action && (
                <TouchableOpacity
                  style={[styles.actionButton, { borderColor: config.color }]}
                  onPress={() => onAction(notification.id, notification.action!.onPress)}
                >
                  <Text style={[styles.actionButtonText, { color: config.color }]}>
                    {notification.action.label}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </BlurView>
      </Animated.View>
    );
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {visibleNotifications.map(notification => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </View>
  );
}

// Hook for managing notifications
export function useSecurityNotifications() {
  const [notifications, setNotifications] = useState<SecurityNotification[]>([]);

  const addNotification = (notification: Omit<SecurityNotification, 'id' | 'timestamp'>) => {
    const newNotification: SecurityNotification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Predefined notification creators
  const showCriticalAlert = (title: string, message: string, action?: SecurityNotification['action']) => {
    addNotification({
      type: 'critical',
      title,
      message,
      action,
      autoDismiss: false,
    });
  };

  const showWarning = (title: string, message: string, action?: SecurityNotification['action']) => {
    addNotification({
      type: 'warning',
      title,
      message,
      action,
      duration: 8000,
    });
  };

  const showInfo = (title: string, message: string) => {
    addNotification({
      type: 'info',
      title,
      message,
      duration: 5000,
    });
  };

  const showSuccess = (title: string, message: string) => {
    addNotification({
      type: 'success',
      title,
      message,
      duration: 3000,
    });
  };

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAll,
    showCriticalAlert,
    showWarning,
    showInfo,
    showSuccess,
  };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  notificationContainer: {
    marginBottom: 12,
  },
  notification: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginLeft: 8,
  },
  dismissButton: {
    padding: 4,
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF80',
    lineHeight: 20,
    marginBottom: 12,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF40',
    marginLeft: 4,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
});