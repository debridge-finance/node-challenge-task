import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {TokenEntity, TokenLogoEntity} from "./entities";

@Module({
  imports: [TypeOrmModule.forFeature([TokenEntity, TokenLogoEntity])],
})
export class TokensModule {}