import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '../../models/token.entity';
import { Chain } from '../../models/chain.entity';
import { Logo } from '../../models/logo.entity';
import { TokenSeeder } from './token.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([Token, Chain, Logo])],
  providers: [TokenSeeder],
})
export class TokenModule {}
