import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Chain } from "../entities/chain.entity";
import { ChainSlugs } from "../libs/constants/chain-slugs.const";

@Injectable()
export class ChainRepository {
  constructor(
    @InjectRepository(Chain)
    private readonly chainRepository: Repository<Chain>
  ) {}

  async findByChainSlug(slug: ChainSlugs): Promise<Chain | null> {
    return this.chainRepository.findOneBy({ slug });
  }

  create(chainData: Partial<Chain>): Chain {
    return this.chainRepository.create(chainData);
  }

  async save(chain: Chain): Promise<Chain> {
    return this.chainRepository.save(chain);
  }
}
