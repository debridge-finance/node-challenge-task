import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TokenPriceEntity } from "./entities";
import {
  PriceUpdateService,
  MockPriceService,
  PriceNotificationService,
} from "./services";

@Module({
  imports: [TypeOrmModule.forFeature([TokenPriceEntity])],
  providers: [PriceUpdateService, MockPriceService, PriceNotificationService],
})
export class PricesModule {}
