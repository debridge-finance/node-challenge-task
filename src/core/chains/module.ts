import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ChainEntity} from "./entities";

@Module({
  imports: [TypeOrmModule.forFeature([ChainEntity])]
})
export class ChainModule {}