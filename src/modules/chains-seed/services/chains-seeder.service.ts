import { Injectable, Logger } from "@nestjs/common";
import { ChainRepository } from "../../chains/repository/chain.repository";
import { CHAINS_SEED } from "../libs/constants/chain-seed.const";
import { ChainSlugs } from "../../chains/libs/constants/chain-slugs.const";

@Injectable()
export class ChainsSeederService {
  private readonly logger = new Logger(ChainsSeederService.name);

  constructor(private readonly chainRepository: ChainRepository) {}

  async seedChains(): Promise<void> {
    this.logger.log("Starting chains seeding...");

    for (const [slug, chainMeta] of Object.entries(CHAINS_SEED)) {
      const existingChain = await this.chainRepository.findByChainSlug(
        slug as ChainSlugs
      );

      if (existingChain) {
        this.logger.log(
          `Chain ${chainMeta.name} (${slug}) already exists, skipping...`
        );
        continue;
      }

      const chain = this.chainRepository.create({
        blockchain_id: chainMeta.blockchain_id,
        name: chainMeta.name,
        slug: chainMeta.slug,
        is_enabled: true,
      });

      await this.chainRepository.save(chain);
      this.logger.log(`Chain ${chainMeta.name} (${slug}) seeded successfully`);
    }

    this.logger.log("Chains seeding completed");
  }
}
