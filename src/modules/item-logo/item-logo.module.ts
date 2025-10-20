import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ItemLogo } from "./entities/item-logo.entity";
import { ItemLogoRepository } from "./repository/item-logo.repository";
import { LogoPlaceholderService } from "./services/logo-placeholder.service";

@Module({
  imports: [TypeOrmModule.forFeature([ItemLogo])],
  providers: [ItemLogoRepository, LogoPlaceholderService],
  exports: [ItemLogoRepository, LogoPlaceholderService],
})
export class ItemLogoModule {}
