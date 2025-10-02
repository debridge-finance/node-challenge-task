import { Global, Module} from "@nestjs/common";
import {KafkaProducerService} from "./services";
import {createKafkaProducer, kafkaOptions} from "./connection";

@Module({
  exports: [KafkaProducerService],
  providers: [
    {
      provide: KafkaProducerService,
      inject: [],
      useFactory: async () => {
        let producer = await createKafkaProducer(kafkaOptions())
        return new KafkaProducerService(producer)
      },
    },
  ]
})
export class KafkaModule {
}