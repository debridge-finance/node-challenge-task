import { Module } from "@nestjs/common";
import { ChainsSeederService } from "./services/chains-seeder.service";
import { ChainsModule } from "../chains/chains.module";

@Module({
  imports: [ChainsModule],
  providers: [ChainsSeederService],
  exports: [ChainsSeederService],
})
export class ChainsSeedModule {}
