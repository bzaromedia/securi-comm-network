import React, { useEffect, useRef } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  cancelAnimation,
} from 'react-native-reanimated';

interface AnimatedShieldProps {
  isActive: boolean;
  threatLevel: number;
  size?: number;
  color?: string;
}

export function OptimizedAnimatedShield({ 
  isActive, 
  threatLevel, 
  size = 24, 
  color = '#00FF94' 
}: AnimatedShieldProps) {
  const pulseAnimation = useSharedValue(1);
  const rotateAnimation = useSharedValue(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (isActive && threatLevel > 5) {
      pulseAnimation.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );
    } else {
      pulseAnimation.value = withTiming(1, { duration: 500 });
    }

    if (isActive) {
      rotateAnimation.value = withRepeat(
        withTiming(360, { duration: 8000 }),
        -1,
        false
      );
    }

    return () => {
      isMountedRef.current = false;
      // Cancel animations to prevent memory leaks
      cancelAnimation(pulseAnimation);
      cancelAnimation(rotateAnimation);
    };
  }, [isActive, threatLevel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cancelAnimation(pulseAnimation);
      cancelAnimation(rotateAnimation);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulseAnimation.value },
      { rotate: `${rotateAnimation.value}deg` }
    ],
  }), []);

  return (
    <Animated.View style={[animatedStyle, { width: size, height: size }]}>
      {/* Shield icon content */}
    </Animated.View>
  );
}

// Hook for managing multiple animations efficiently
export function useOptimizedAnimations(isActive: boolean) {
  const animations = useRef(new Map<string, any>()).current;
  
  const createAnimation = (key: string, config: any) => {
    if (animations.has(key)) {
      cancelAnimation(animations.get(key));
    }
    
    const animation = useSharedValue(config.initialValue || 0);
    animations.set(key, animation);
    
    if (isActive) {
      animation.value = withRepeat(
        withTiming(config.toValue, { duration: config.duration }),
        config.repeat || -1,
        config.reverse || false
      );
    }
    
    return animation;
  };
  
  const cleanupAnimations = () => {
    animations.forEach(animation => cancelAnimation(animation));
    animations.clear();
  };
  
  useEffect(() => {
    return cleanupAnimations;
  }, []);
  
  return { createAnimation, cleanupAnimations };
}