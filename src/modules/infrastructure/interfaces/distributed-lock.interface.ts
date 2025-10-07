export interface IDistributedLock {
  acquireLock(key: string, ttl: number, retryDelay?: number, maxRetries?: number): Promise<boolean>;
  releaseLock(key: string): Promise<boolean>;
  isLockOwner(key: string): Promise<boolean>;
  refreshLock(key: string, ttl: number): Promise<boolean>;
}
