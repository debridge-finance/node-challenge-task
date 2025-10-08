import { GetTokenPriceDto } from '../dto/token.dto';

export abstract class PriceService {
  abstract getRandomPriceForToken(tokenData: GetTokenPriceDto): Promise<number>;
}
