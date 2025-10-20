import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Kafka, Producer, Admin } from "kafkajs";
import { AppEnvs } from "../../../config/app-envs.schema";

@Injectable()
export class KafkaConnectionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConnectionService.name);
  private kafka: Kafka;
  private producer: Producer;
  private admin: Admin;

  constructor(private readonly configService: ConfigService<AppEnvs>) {}

  async onModuleInit(): Promise<void> {
    const brokers = this.configService.get("KAFKA_BROKERS", { infer: true });
    const clientId = this.configService.get("KAFKA_CLIENT_ID", { infer: true });
    const initialRetryTime = this.configService.get("KAFKA_RETRY_INITIAL_TIME", { infer: true });
    const retries = this.configService.get("KAFKA_RETRY_MAX_RETRIES", { infer: true });

    this.kafka = new Kafka({
      clientId,
      brokers: brokers.split(","),
      retry: {
        initialRetryTime,
        retries,
      },
    });

    this.producer = this.kafka.producer();
    this.admin = this.kafka.admin();
    await this.connect();
    await this.waitForBrokerReady();
  }

  getProducer(): Producer {
    if (!this.producer) {
      throw new Error("Kafka producer is not initialized");
    }
    return this.producer;
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.producer.disconnect();
      await this.admin.disconnect();
      this.logger.log("Disconnected from Kafka");
    } catch (error) {
      this.logger.error("Error disconnecting from Kafka", error.stack);
    }
  }

  private async connect(): Promise<void> {
    await this.producer.connect();
    await this.admin.connect();
    this.logger.log("Connected to Kafka");
  }

  async ensureTopicExists(topic: string): Promise<void> {
    try {
      const topics = await this.admin.listTopics();
      
      if (!topics.includes(topic)) {
        this.logger.log(`Creating topic: ${topic}`);
        await this.admin.createTopics({
          topics: [{
            topic,
            numPartitions: 1,
            replicationFactor: 1,
          }],
        });
        this.logger.log(`Topic created: ${topic}`);
      }

      // Wait for topic metadata to be available and leader elected
      await this.waitForTopicReady(topic);
    } catch (error) {
      this.logger.error(`Error ensuring topic exists: ${error.message}`);
      throw error;
    }
  }

  private async waitForBrokerReady(): Promise<void> {
    const maxRetries = 30;
    const retryDelay = 1000;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const cluster = await this.admin.describeCluster();
        if (cluster.brokers.length > 0) {
          this.logger.log("Kafka broker is ready");
          return;
        }
      } catch (error) {
        this.logger.warn(`Waiting for Kafka broker to be ready... (attempt ${i + 1}/${maxRetries})`);
      }
      await this.sleep(retryDelay);
    }

    throw new Error("Kafka broker did not become ready in time");
  }

  private async waitForTopicReady(topic: string): Promise<void> {
    const maxRetries = 30;
    const retryDelay = 500;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const metadata = await this.admin.fetchTopicMetadata({ topics: [topic] });
        const topicMetadata = metadata.topics.find(t => t.name === topic);
        
        if (topicMetadata && topicMetadata.partitions.length > 0) {
          const hasLeader = topicMetadata.partitions.every(p => p.leader !== -1);
          if (hasLeader) {
            this.logger.log(`Topic ${topic} is ready with leader elected`);
            return;
          }
        }
      } catch (error) {
        this.logger.warn(`Waiting for topic ${topic} leader election... (attempt ${i + 1}/${maxRetries})`);
      }
      await this.sleep(retryDelay);
    }

    throw new Error(`Topic ${topic} did not become ready in time`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
