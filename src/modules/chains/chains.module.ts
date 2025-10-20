import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Chain } from "./entities/chain.entity";
import { ChainRepository } from "./repository/chain.repository";

@Module({
  imports: [TypeOrmModule.forFeature([Chain])],
  providers: [ChainRepository],
  exports: [ChainRepository],
})
export class ChainsModule {}
