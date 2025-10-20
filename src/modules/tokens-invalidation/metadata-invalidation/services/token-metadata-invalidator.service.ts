import { Injectable, Logger } from "@nestjs/common";
import { UniversalInvalidatingTokenMetadata } from "../../../../common/libs/types/universal-token.types";
import { TokenMetadata } from "../../../tokens-metadata/entities/token-metadata.entity";
import { TokenMetadataRepository } from "../../../tokens-metadata/repository/token-metadata.repository";
import { DeBridgeTokenMetaValidated } from "../../libs/types/debridge-processing-tokens.types";
import { buildNameSymbolKey } from "../../libs/helpers/build-name-symbol-key.helper";
import { validateDeBridgeTokenMeta } from "../../libs/helpers/validate-token-meta.helper";

@Injectable()
export class TokenMetadataInvalidatorService {
  private readonly logger = new Logger(TokenMetadataInvalidatorService.name);

  constructor(
    private readonly tokenMetadataRepository: TokenMetadataRepository
  ) {}

  async invalidate(
    tokens: UniversalInvalidatingTokenMetadata[]
  ): Promise<Map<string, TokenMetadata>> {
    const metadataToProcess = this.filterValidMetadata(tokens);

    const metadataMap = new Map<string, TokenMetadata>();

    if (!metadataToProcess.length) {
      return metadataMap;
    }

    await this.findExistingMetaAndFill(metadataMap, metadataToProcess);
    await this.createMissingMetaAndFill(metadataMap, metadataToProcess);

    return metadataMap;
  }

  private filterValidMetadata(
    tokens: UniversalInvalidatingTokenMetadata[]
  ): DeBridgeTokenMetaValidated[] {
    const metadataToProcess: DeBridgeTokenMetaValidated[] = [];
    const metadataNameSymbolKeys = new Set<string>();

    for (const token of tokens) {
      const validatedToken = validateDeBridgeTokenMeta(token);

      const key = buildNameSymbolKey(
        validatedToken.name,
        validatedToken.symbol
      );

      if (!metadataNameSymbolKeys.has(key)) {
        metadataNameSymbolKeys.add(key);
        metadataToProcess.push(validatedToken);
      }
    }

    return metadataToProcess;
  }

  private async findExistingMetaAndFill(
    metadataMap: Map<string, TokenMetadata>,
    metadataToProcess: DeBridgeTokenMetaValidated[]
  ): Promise<void> {
    const nameSymbolPairs = metadataToProcess.map((m) => ({
      name: m.name,
      symbol: m.symbol,
    }));

    const existingMetadata =
      await this.tokenMetadataRepository.findByNameSymbolPairs(nameSymbolPairs);
    for (const metadata of existingMetadata) {
      metadataMap.set(`${metadata.name}:${metadata.symbol}`, metadata);
    }
  }

  private async createMissingMetaAndFill(
    metadataMap: Map<string, TokenMetadata>,
    metadataToProcess: DeBridgeTokenMetaValidated[]
  ): Promise<void> {
    const toCreate = metadataToProcess.filter(
      (m) => !metadataMap.has(buildNameSymbolKey(m.name, m.symbol)) && m.isValid
    );

    if (toCreate.length > 0) {
      const newMetadata = await this.tokenMetadataRepository.save(
        toCreate.map((m) =>
          this.tokenMetadataRepository.create({
            name: m.name,
            symbol: m.symbol,
          })
        )
      );
      newMetadata.forEach((m) => {
        metadataMap.set(buildNameSymbolKey(m.name, m.symbol), m);
      });
    }
  }
}
