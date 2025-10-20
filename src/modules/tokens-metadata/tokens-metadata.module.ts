import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TokenMetadata } from "./entities/token-metadata.entity";
import { TokenMetadataRepository } from "./repository/token-metadata.repository";
import { TokenMetaPlaceholderService } from "./services/token-meta-placeholder.service";

@Module({
  imports: [TypeOrmModule.forFeature([TokenMetadata])],
  providers: [TokenMetadataRepository, TokenMetaPlaceholderService],
  exports: [TokenMetadataRepository, TokenMetaPlaceholderService],
})
export class TokensMetadataModule {}
