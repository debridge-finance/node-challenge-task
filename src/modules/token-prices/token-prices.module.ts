import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TokenPrices } from "./entity/token-prices.entity";
import { TokenPricesRepository } from "./repository/token-prices.repository";

@Module({
  imports: [TypeOrmModule.forFeature([TokenPrices])],
  providers: [TokenPricesRepository],
  exports: [TokenPricesRepository],
})
export class TokenPricesModule {}
