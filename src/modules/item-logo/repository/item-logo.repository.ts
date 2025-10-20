import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, In, Repository } from "typeorm";
import { ItemLogo } from "../entities/item-logo.entity";

@Injectable()
export class ItemLogoRepository {
  constructor(
    @InjectRepository(ItemLogo)
    private readonly repository: Repository<ItemLogo>
  ) {}

  async findById(id: number): Promise<ItemLogo | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findOne(where: FindOptionsWhere<ItemLogo>): Promise<ItemLogo | null> {
    return this.repository.findOne({ where });
  }

  async findMany(where: FindOptionsWhere<ItemLogo>): Promise<ItemLogo[]> {
    return this.repository.find({ where });
  }

  async findByPaths(paths: string[]): Promise<ItemLogo[]> {
    if (!paths.length) {
      return [];
    }

    return this.repository.find({
      where: { big_relative_path: In(paths) },
    });
  }

  create(data: Partial<ItemLogo>): ItemLogo {
    return this.repository.create(data);
  }

  async save(logo: ItemLogo): Promise<ItemLogo>;
  async save(logos: ItemLogo[]): Promise<ItemLogo[]>;
  async save(
    logoOrLogos: ItemLogo | ItemLogo[]
  ): Promise<ItemLogo | ItemLogo[]> {
    return this.repository.save(logoOrLogos as any);
  }

  createQueryBuilder(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }
}
