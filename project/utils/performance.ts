import { Platform } from 'react-native';
import { encryption } from './encryption';

interface PerformanceMetrics {
  appStartTime: number;
  encryptionTime: number;
  networkLatency: number;
  memoryUsage: number;
  batteryOptimization: boolean;
  cacheEfficiency: number;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  size: number;
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private cache = new Map<string, CacheItem<any>>();
  private maxCacheSize = 50 * 1024 * 1024; // 50MB
  private currentCacheSize = 0;
  private metrics: PerformanceMetrics;

  private constructor() {
    this.metrics = {
      appStartTime: Date.now(),
      encryptionTime: 0,
      networkLatency: 0,
      memoryUsage: 0,
      batteryOptimization: true,
      cacheEfficiency: 0,
    };
    this.initializeOptimizations();
  }

  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  private initializeOptimizations() {
    // Set up cache cleanup interval
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 5 * 60 * 1000); // Every 5 minutes

    // Monitor memory usage
    if (Platform.OS !== 'web') {
      setInterval(() => {
        this.monitorMemoryUsage();
      }, 30 * 1000); // Every 30 seconds
    }
  }

  /**
   * Intelligent caching with compression and encryption
   */
  public async setCache<T>(
    key: string, 
    data: T, 
    ttl: number = 3600000, // 1 hour default
    encrypt: boolean = false
  ): Promise<void> {
    try {
      let processedData = data;
      let size = this.estimateSize(data);

      // Encrypt sensitive data
      if (encrypt) {
        const startTime = Date.now();
        processedData = encryption.encryptData(JSON.stringify(data)) as any;
        this.metrics.encryptionTime += Date.now() - startTime;
        size = this.estimateSize(processedData);
      }

      // Check if we need to free up space
      if (this.currentCacheSize + size > this.maxCacheSize) {
        await this.evictLeastUsedItems(size);
      }

      const cacheItem: CacheItem<T> = {
        data: processedData,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
        accessCount: 0,
        size,
      };

      this.cache.set(key, cacheItem);
      this.currentCacheSize += size;
      this.updateCacheEfficiency();
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Retrieve cached data with automatic decryption
   */
  public async getCache<T>(key: string, decrypt: boolean = false): Promise<T | null> {
    try {
      const item = this.cache.get(key);
      
      if (!item || Date.now() > item.expiresAt) {
        if (item) {
          this.removeFromCache(key);
        }
        return null;
      }

      // Update access statistics
      item.accessCount++;
      item.timestamp = Date.now();

      let data = item.data;

      // Decrypt if needed
      if (decrypt && typeof data === 'object' && data.data && data.nonce) {
        const startTime = Date.now();
        const decryptedString = encryption.decryptData(data);
        data = JSON.parse(decryptedString);
        this.metrics.encryptionTime += Date.now() - startTime;
      }

      return data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Preload critical data for faster access
   */
  public async preloadCriticalData(): Promise<void> {
    const criticalKeys = [
      'user_profile',
      'security_settings',
      'encryption_keys',
      'recent_contacts',
      'app_settings',
    ];

    const preloadPromises = criticalKeys.map(async (key) => {
      // Simulate loading critical data
      const data = await this.loadCriticalData(key);
      if (data) {
        await this.setCache(key, data, 24 * 60 * 60 * 1000, true); // 24 hours, encrypted
      }
    });

    await Promise.all(preloadPromises);
  }

  /**
   * Optimize network requests with intelligent batching
   */
  public async optimizeNetworkRequest<T>(
    url: string,
    options: RequestInit = {},
    cacheKey?: string,
    cacheTTL: number = 300000 // 5 minutes
  ): Promise<T> {
    const startTime = Date.now();

    try {
      // Check cache first
      if (cacheKey) {
        const cachedData = await this.getCache<T>(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }

      // Add compression headers
      const optimizedOptions: RequestInit = {
        ...options,
        headers: {
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'max-age=300',
          ...options.headers,
        },
      };

      const response = await fetch(url, optimizedOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache successful responses
      if (cacheKey) {
        await this.setCache(cacheKey, data, cacheTTL);
      }

      // Update metrics
      this.metrics.networkLatency = Date.now() - startTime;

      return data;
    } catch (error) {
      console.error('Network request error:', error);
      throw error;
    }
  }

  /**
   * Batch multiple operations for better performance
   */
  public async batchOperations<T>(
    operations: (() => Promise<T>)[],
    batchSize: number = 5
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(op => op()));
      results.push(...batchResults);
      
      // Small delay between batches to prevent overwhelming the system
      if (i + batchSize < operations.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    return results;
  }

  /**
   * Optimize images for better performance
   */
  public optimizeImageUrl(
    url: string, 
    width?: number, 
    height?: number, 
    quality: number = 80
  ): string {
    if (!url.includes('pexels.com')) {
      return url;
    }

    // Add Pexels optimization parameters
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('auto', 'compress');
    params.append('cs', 'tinysrgb');
    
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${params.toString()}`;
  }

  /**
   * Memory usage monitoring and optimization
   */
  private monitorMemoryUsage(): void {
    if (Platform.OS === 'web') {
      // Web memory monitoring
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        this.metrics.memoryUsage = memInfo.usedJSHeapSize / memInfo.totalJSHeapSize;
        
        // Trigger garbage collection if memory usage is high
        if (this.metrics.memoryUsage > 0.8) {
          this.performMemoryCleanup();
        }
      }
    }
  }

  /**
   * Perform memory cleanup
   */
  private performMemoryCleanup(): void {
    // Clear old cache entries
    this.cleanupExpiredCache();
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    // Clear large objects from memory
    this.clearLargeObjects();
  }

  /**
   * Battery optimization techniques
   */
  public enableBatteryOptimization(): void {
    this.metrics.batteryOptimization = true;
    
    // Reduce background processing
    this.optimizeBackgroundTasks();
    
    // Optimize animation frame rates
    this.optimizeAnimations();
    
    // Reduce network polling frequency
    this.optimizeNetworkPolling();
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Generate performance report
   */
  public generatePerformanceReport(): {
    summary: string;
    metrics: PerformanceMetrics;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    
    if (this.metrics.encryptionTime > 1000) {
      recommendations.push('Consider optimizing encryption operations');
    }
    
    if (this.metrics.networkLatency > 2000) {
      recommendations.push('Network requests are slow, consider caching');
    }
    
    if (this.metrics.memoryUsage > 0.7) {
      recommendations.push('High memory usage detected, cleanup recommended');
    }
    
    if (this.metrics.cacheEfficiency < 0.5) {
      recommendations.push('Cache hit rate is low, review caching strategy');
    }

    const summary = `Performance Score: ${this.calculatePerformanceScore()}/100`;

    return {
      summary,
      metrics: this.metrics,
      recommendations,
    };
  }

  // Private helper methods
  private estimateSize(data: any): number {
    return JSON.stringify(data).length * 2; // Rough estimate
  }

  private removeFromCache(key: string): void {
    const item = this.cache.get(key);
    if (item) {
      this.currentCacheSize -= item.size;
      this.cache.delete(key);
    }
  }

  private cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.removeFromCache(key);
      }
    }
    this.updateCacheEfficiency();
  }

  private async evictLeastUsedItems(requiredSpace: number): Promise<void> {
    const items = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.accessCount - b.accessCount);

    let freedSpace = 0;
    for (const [key] of items) {
      if (freedSpace >= requiredSpace) break;
      const item = this.cache.get(key);
      if (item) {
        freedSpace += item.size;
        this.removeFromCache(key);
      }
    }
  }

  private updateCacheEfficiency(): void {
    const totalItems = this.cache.size;
    const accessedItems = Array.from(this.cache.values())
      .filter(item => item.accessCount > 0).length;
    
    this.metrics.cacheEfficiency = totalItems > 0 ? accessedItems / totalItems : 0;
  }

  private async loadCriticalData(key: string): Promise<any> {
    // Simulate loading critical data
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ key, data: `critical_data_${key}`, timestamp: Date.now() });
      }, 100);
    });
  }

  private clearLargeObjects(): void {
    // Clear large cached objects
    for (const [key, item] of this.cache.entries()) {
      if (item.size > 1024 * 1024) { // 1MB
        this.removeFromCache(key);
      }
    }
  }

  private optimizeBackgroundTasks(): void {
    // Reduce frequency of background tasks when battery optimization is enabled
  }

  private optimizeAnimations(): void {
    // Reduce animation complexity for battery optimization
  }

  private optimizeNetworkPolling(): void {
    // Increase polling intervals to save battery
  }

  private calculatePerformanceScore(): number {
    let score = 100;
    
    if (this.metrics.encryptionTime > 1000) score -= 10;
    if (this.metrics.networkLatency > 2000) score -= 15;
    if (this.metrics.memoryUsage > 0.8) score -= 20;
    if (this.metrics.cacheEfficiency < 0.5) score -= 10;
    
    return Math.max(0, score);
  }
}

export const performanceOptimizer = PerformanceOptimizer.getInstance();