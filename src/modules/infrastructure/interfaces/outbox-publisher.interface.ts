export interface IOutboxPublisher {
  flush(limit?: number): Promise<void>;
}
