/**
 * SecuriComm WebSocket Service
 * 
 * Provides WebSocket functionality for real-time communication.
 * Handles connection, reconnection, and event handling.
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { secureStorage, StorageKeys } from './storage';

// WebSocket options interface
interface WebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  timeout?: number;
}

// Default WebSocket options
const defaultOptions: WebSocketOptions = {
  url: process.env.EXPO_PUBLIC_API_URL || 'https://api.securicomm.app',
  autoConnect: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
};

/**
 * WebSocket hook
 */
export const useWebSocket = (options: WebSocketOptions = {}) => {
  // Merge options with defaults
  const mergedOptions = { ...defaultOptions, ...options };
  
  // WebSocket state
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Reconnection state
  const reconnectAttempts = useRef<number>(0);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Connect to WebSocket
  const connect = useCallback(async () => {
    try {
      // Check if already connecting
      if (isConnecting) {
        return;
      }
      
      setIsConnecting(true);
      setError(null);
      
      // Get authentication token
      const token = await secureStorage.getItem(StorageKeys.AUTH_TOKEN);
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Create socket instance
      const socketInstance = io(mergedOptions.url as string, {
        autoConnect: false,
        reconnection: false,
        timeout: mergedOptions.timeout,
        query: {
          token,
        },
      });
      
      // Set up event handlers
      socketInstance.on('connect', () => {
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttempts.current = 0;
        console.log('WebSocket connected');
      });
      
      socketInstance.on('disconnect', (reason) => {
        setIsConnected(false);
        console.log(`WebSocket disconnected: ${reason}`);
        
        // Attempt to reconnect
        if (
          reason !== 'io client disconnect' &&
          reason !== 'io server disconnect'
        ) {
          reconnect();
        }
      });
      
      socketInstance.on('connect_error', (err) => {
        setIsConnecting(false);
        setError(err);
        console.error('WebSocket connection error:', err);
        
        // Attempt to reconnect
        reconnect();
      });
      
      // Connect to socket
      socketInstance.connect();
      
      // Set socket instance
      setSocket(socketInstance);
    } catch (err) {
      setIsConnecting(false);
      setError(err instanceof Error ? err : new Error('Failed to connect'));
      console.error('WebSocket connect error:', err);
      
      // Attempt to reconnect
      reconnect();
    }
  }, [isConnecting, mergedOptions.url, mergedOptions.timeout]);
  
  // Reconnect to WebSocket
  const reconnect = useCallback(() => {
    // Clear existing timer
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    
    // Check if max reconnection attempts reached
    if (
      reconnectAttempts.current >= (mergedOptions.reconnectionAttempts || 5)
    ) {
      console.error(
        `WebSocket reconnection failed after ${reconnectAttempts.current} attempts`
      );
      return;
    }
    
    // Increment reconnection attempts
    reconnectAttempts.current += 1;
    
    // Calculate delay with exponential backoff
    const delay = Math.min(
      mergedOptions.reconnectionDelay! * Math.pow(2, reconnectAttempts.current),
      mergedOptions.reconnectionDelayMax!
    );
    
    console.log(
      `WebSocket reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`
    );
    
    // Set reconnection timer
    reconnectTimer.current = setTimeout(() => {
      connect();
    }, delay);
  }, [
    connect,
    mergedOptions.reconnectionAttempts,
    mergedOptions.reconnectionDelay,
    mergedOptions.reconnectionDelayMax,
  ]);
  
  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setIsConnected(false);
      setSocket(null);
    }
    
    // Clear reconnection timer
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    
    reconnectAttempts.current = 0;
  }, [socket]);
  
  // Send event to WebSocket
  const sendEvent = useCallback(
    (event: string, data: any) => {
      if (socket && isConnected) {
        socket.emit(event, data);
      } else {
        console.warn('WebSocket not connected, cannot send event:', event);
      }
    },
    [socket, isConnected]
  );
  
  // Connect on mount if autoConnect is true
  useEffect(() => {
    if (mergedOptions.autoConnect) {
      connect();
    }
    
    // Disconnect on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect, mergedOptions.autoConnect]);
  
  return {
    socket,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    sendEvent,
  };
};
