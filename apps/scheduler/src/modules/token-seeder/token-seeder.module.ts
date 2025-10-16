import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '../../models/token.entity';
import { Chain } from '../../models/chain.entity';
import { Logo } from '../../models/logo.entity';
import { TokenSeederService } from './token-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Token, Chain, Logo])],
  providers: [TokenSeederService],
})
export class TokenSeederModule {}
