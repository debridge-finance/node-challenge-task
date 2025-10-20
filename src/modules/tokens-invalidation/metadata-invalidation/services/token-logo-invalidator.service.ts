import { Injectable, Logger } from "@nestjs/common";
import { UniversalInvalidatingTokenMetadata } from "../../../../common/libs/types/universal-token.types";
import { ItemLogo } from "../../../item-logo/entities/item-logo.entity";
import { ItemLogoRepository } from "../../../item-logo/repository/item-logo.repository";
import { UNKNOWN_TOKEN_METADATA } from "../../../../common/libs/constants/unknown-items.const";

@Injectable()
export class TokenLogoInvalidatorService {
  private readonly logger = new Logger(TokenLogoInvalidatorService.name);

  constructor(private readonly itemLogoRepository: ItemLogoRepository) {}

  async invalidate(
    tokens: UniversalInvalidatingTokenMetadata[],
    placeholderLogo: ItemLogo
  ) {
    const logoMap = new Map<string, ItemLogo>();
    logoMap.set(UNKNOWN_TOKEN_METADATA.logo, placeholderLogo);

    const uniqueLogoURIs = [
      ...new Set(
        tokens.filter((t) => t.logo.bigPath).map((t) => t.logo.bigPath)
      ),
    ];

    if (!uniqueLogoURIs.length) {
      return logoMap;
    }
    const existingLogos = await this.itemLogoRepository.findByPaths(
      uniqueLogoURIs
    );

    existingLogos.forEach((logo) => {
      logoMap.set(logo.big_relative_path, logo);
    });

    const logosToCreate = uniqueLogoURIs.filter((uri) => !logoMap.has(uri));

    if (logosToCreate.length > 0) {
      const newLogos = await this.itemLogoRepository.save(
        logosToCreate.map((uri) =>
          this.itemLogoRepository.create({
            big_relative_path: uri,
            small_relative_path: uri,
            thumb_relative_path: uri,
          })
        )
      );
      newLogos.forEach((logo) => {
        logoMap.set(logo.big_relative_path, logo);
      });
    }

    return logoMap;
  }
}
