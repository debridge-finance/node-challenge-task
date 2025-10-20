import { Injectable } from "@nestjs/common";
import { ItemLogo } from "../entities/item-logo.entity";
import { ItemLogoRepository } from "../repository/item-logo.repository";
import { UNKNOWN_TOKEN_METADATA } from "../../../common/libs/constants/unknown-items.const";

@Injectable()
export class LogoPlaceholderService {
  private cachedPlaceholder: ItemLogo | null = null;

  constructor(private readonly repository: ItemLogoRepository) {}

  async getOrCreate(): Promise<ItemLogo> {
    if (this.cachedPlaceholder) {
      return this.cachedPlaceholder;
    }

    const placeholderPath = UNKNOWN_TOKEN_METADATA.logo;

    let logo = await this.repository.findOne({
      big_relative_path: placeholderPath,
    });

    if (!logo) {
      logo = this.repository.create({
        big_relative_path: placeholderPath,
        small_relative_path: placeholderPath,
        thumb_relative_path: placeholderPath,
      });
      await this.repository.save(logo);
    }

    this.cachedPlaceholder = logo;

    return logo;
  }
}
