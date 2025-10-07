import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Token } from "./entities/token.entity";
import { TokenPrice } from "./entities/token-price.entity";
import { PriceFeed } from "./entities/price-feed.entity";
import { PriceUpdateService } from "./services/price-update.service";
import { TokenPriceRepository } from "./repositories/token-price.repository";
import { MockPriceService } from "./services/mock-price.service";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { SharedModule } from "../../shared/shared.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Token, TokenPrice, PriceFeed]),
    InfrastructureModule,
    SharedModule,
  ],
  providers: [
    PriceUpdateService,
    MockPriceService,
    TokenPriceRepository,

    {
      provide: "ITokenPriceRepository",
      useClass: TokenPriceRepository,
    },
  ],
  exports: [PriceUpdateService, "ITokenPriceRepository"],
})
export class TokenPriceModule {}
