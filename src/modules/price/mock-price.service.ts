import { Injectable, Inject } from "@nestjs/common";
import { getRandomFloat, getRandomInt } from "../../utils/random";
import priceConfig, { PriceConfig } from "../../config/price.config";

@Injectable()
export class MockPriceService {
  constructor(
    @Inject(priceConfig.KEY)
    private config: PriceConfig
  ) {}

  // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
  async getRandomPriceForToken(_: {
    id: string;
    address: Buffer;
    chainId: string;
  }): Promise<number> {
    // Simulate API call delay
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, getRandomInt(this.config.minUpdateDelayMs, this.config.maxUpdateDelayMs));
    });

    return getRandomFloat(this.config.maxPrice);
  }
}
