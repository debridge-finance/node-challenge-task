import { Injectable } from "@nestjs/common";
import { TokenMetadata } from "../entities/token-metadata.entity";
import { TokenMetadataRepository } from "../repository/token-metadata.repository";

@Injectable()
export class TokenMetaPlaceholderService {
  private cachedPlaceholder: TokenMetadata | null = null;

  constructor(private readonly repository: TokenMetadataRepository) {}

  async getOrCreate(): Promise<TokenMetadata> {
    if (this.cachedPlaceholder) {
      return this.cachedPlaceholder;
    }

    const unknownSymbol = "UNKNOWN";
    const unknownName = "Unknown";

    let metadata = await this.repository.findOne({
      symbol: unknownSymbol,
      name: unknownName,
    });

    if (!metadata) {
      metadata = this.repository.create({
        symbol: unknownSymbol,
        name: unknownName,
      });
      await this.repository.save(metadata);
    }

    this.cachedPlaceholder = metadata;
    return metadata;
  }
}
