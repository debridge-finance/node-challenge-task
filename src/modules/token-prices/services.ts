import { TokenPriceUpdateMessage } from '../../models/schemas';

export interface PriceService {
  fetchLatestForToken(
    tokenAddress: Buffer,
    chainDeId: string,
    chainName: string,
  ): Promise<string>
}

export interface Notifier {
  notifyPriceChange(msg: TokenPriceUpdateMessage): Promise<boolean>
}
