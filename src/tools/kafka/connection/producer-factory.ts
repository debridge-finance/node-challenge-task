import {Kafka, KafkaConfig, Producer} from "kafkajs";

export async function createKafkaProducer(config: KafkaConfig): Promise<Producer> {
  if(!config) throw new Error("KafkaConfig is undefined")

  const kafka = new Kafka(config);

  let producer = kafka.producer();
  await producer.connect()
  return producer
}