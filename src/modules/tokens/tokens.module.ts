import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Token } from "./entities/token.entity";
import { TokenRepository } from "./repository/token.repository";

@Module({
  imports: [TypeOrmModule.forFeature([Token])],
  providers: [TokenRepository],
  exports: [TokenRepository],
})
export class TokensModule {}
