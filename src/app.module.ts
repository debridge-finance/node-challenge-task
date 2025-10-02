import { Module } from "@nestjs/common";
import { ToolsModule } from "./tools/tools.module";
import { CoreModule } from "./core/core.module";

@Module({
  imports: [{ module: ToolsModule, global: true }, CoreModule],
})
export class AppModule {}
