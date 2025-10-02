import { Module } from "@nestjs/common";
import { KafkaModule } from "./kafka/module";
import { DbNodule } from "./db/module";

@Module({
  imports: [
    { module: KafkaModule, global: true },
    { module: DbNodule, global: true },
  ],
})
export class ToolsModule {}
