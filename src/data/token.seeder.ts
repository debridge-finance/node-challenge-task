import { Injectable, Logger } from "@nestjs/common";
import { Repository, EntityManager } from "typeorm";
import { Token } from "../modules/token-price/entities/token.entity";
import { Logo } from "../modules/token-price/entities/logo.entity";
import { PriceFeed } from "../modules/token-price/entities/price-feed.entity";
import { TokenPrice } from "../modules/token-price/entities/token-price.entity";
import {
  TokenSymbol,
  BlockchainNetwork,
  TokenType,
  TokenStatus,
  PriceFeedType,
  PriceFeedStatus,
} from "../shared/enums";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class TokenSeeder {
  private readonly logger = new Logger(TokenSeeder.name);

  constructor(private readonly tokenRepository: Repository<Token>) {}

  async seed(): Promise<void> {
    this.logger.log("Starting database seeding...");

    try {
      // Выполняем все операции в одной транзакции для консистентности
      await this.tokenRepository.manager.transaction(async (transactionalEntityManager) => {
        const logos = await this.seedLogosInTransaction(transactionalEntityManager);
        this.logger.log(`Created ${logos.length} logos`);

        const priceFeeds = await this.seedPriceFeedsInTransaction(transactionalEntityManager);
        this.logger.log(`Created ${priceFeeds.length} price feeds`);

        const tokens = await this.seedTokensInTransaction(
          transactionalEntityManager,
          logos,
          priceFeeds
        );
        this.logger.log(`Created ${tokens.length} tokens`);

        await this.seedTokenPricesInTransaction(transactionalEntityManager, tokens);
        this.logger.log("Created initial token prices");
      });

      this.logger.log("Database seeding completed successfully!");
    } catch (error) {
      this.logger.error("Error during seeding:", error);
      throw error;
    }
  }

  private async seedLogosInTransaction(manager: EntityManager): Promise<Logo[]> {
    const logosData = [
      {
        id: uuidv4(),
        url: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
        alt: "Bitcoin Logo",
        width: 32,
        height: 32,
      },
      {
        id: uuidv4(),
        url: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
        alt: "Ethereum Logo",
        width: 32,
        height: 32,
      },
      {
        id: uuidv4(),
        url: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
        alt: "USDC Logo",
        width: 32,
        height: 32,
      },
      {
        id: uuidv4(),
        url: "https://cryptologos.cc/logos/tether-usdt-logo.png",
        alt: "USDT Logo",
        width: 32,
        height: 32,
      },
      {
        id: uuidv4(),
        url: "https://cryptologos.cc/logos/solana-sol-logo.png",
        alt: "Solana Logo",
        width: 32,
        height: 32,
      },
    ];

    const logos = logosData.map((data) => manager.create(Logo, data));
    return await manager.save(Logo, logos);
  }

  private async seedPriceFeedsInTransaction(manager: EntityManager): Promise<PriceFeed[]> {
    const priceFeedsData = [
      {
        id: uuidv4(),
        name: "CoinGecko",
        description: "CoinGecko API for cryptocurrency prices",
        type: PriceFeedType.COINGECKO,
        status: PriceFeedStatus.ACTIVE,
        priority: 1,
      },
      {
        id: uuidv4(),
        name: "CoinMarketCap",
        description: "CoinMarketCap API for cryptocurrency prices",
        type: PriceFeedType.COINMARKETCAP,
        status: PriceFeedStatus.ACTIVE,
        priority: 2,
      },
      {
        id: uuidv4(),
        name: "Binance API",
        description: "Binance API for cryptocurrency prices",
        type: PriceFeedType.BINANCE,
        status: PriceFeedStatus.ACTIVE,
        priority: 3,
      },
      {
        id: uuidv4(),
        name: "CryptoCompare",
        description: "CryptoCompare API for cryptocurrency prices",
        type: PriceFeedType.CRYPTOCOMPARE,
        status: PriceFeedStatus.INACTIVE,
        priority: 4,
      },
    ];

    const priceFeeds = priceFeedsData.map((data) => manager.create(PriceFeed, data));
    return await manager.save(PriceFeed, priceFeeds);
  }

  private async seedTokensInTransaction(
    manager: EntityManager,
    logos: Logo[],
    priceFeeds: PriceFeed[]
  ): Promise<Token[]> {
    const tokensData = [
      // Bitcoin
      {
        address: Buffer.from("0x0000000000000000000000000000000000000000", "utf8"),
        chainId: BlockchainNetwork.ETHEREUM,
        symbol: TokenSymbol.BTC,
        name: "Bitcoin",
        decimals: 8,
        type: TokenType.NATIVE,
        status: TokenStatus.ACTIVE,
        lastUpdateAuthor: "system",
        priority: 1,
        logoId: logos[0]?.id || "",
        priceFeedId: priceFeeds[0]?.id || "",
        symbolIndex: TokenSymbol.BTC,
      },
      // Ethereum
      {
        address: Buffer.from("0x0000000000000000000000000000000000000000", "utf8"),
        chainId: BlockchainNetwork.ETHEREUM,
        symbol: TokenSymbol.ETH,
        name: "Ethereum",
        decimals: 18,
        type: TokenType.NATIVE,
        status: TokenStatus.ACTIVE,
        lastUpdateAuthor: "system",
        priority: 2,
        logoId: logos[1]?.id || "",
        priceFeedId: priceFeeds[0]?.id || "",
        symbolIndex: TokenSymbol.ETH,
      },
      // USDC на Ethereum
      {
        address: Buffer.from("0xA0b86a33E6441b8C4C8C0C4C0C4C0C4C0C4C0C4C", "utf8"),
        chainId: BlockchainNetwork.ETHEREUM,
        symbol: TokenSymbol.USDC,
        name: "USD Coin",
        decimals: 6,
        type: TokenType.ERC20,
        status: TokenStatus.ACTIVE,
        lastUpdateAuthor: "system",
        priority: 3,
        logoId: logos[2]?.id || "",
        priceFeedId: priceFeeds[1]?.id || "",
        symbolIndex: TokenSymbol.USDC,
      },
      // USDC на Polygon
      {
        address: Buffer.from("0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", "utf8"),
        chainId: BlockchainNetwork.POLYGON,
        symbol: TokenSymbol.USDC,
        name: "USD Coin",
        decimals: 6,
        type: TokenType.ERC20,
        status: TokenStatus.ACTIVE,
        lastUpdateAuthor: "system",
        priority: 4,
        logoId: logos[2]?.id || "",
        priceFeedId: priceFeeds[1]?.id || "",
        symbolIndex: TokenSymbol.USDC,
      },
      // USDT
      {
        address: Buffer.from("0xdAC17F958D2ee523a2206206994597C13D831ec7", "utf8"),
        chainId: BlockchainNetwork.ETHEREUM,
        symbol: TokenSymbol.USDT,
        name: "Tether USD",
        decimals: 6,
        type: TokenType.ERC20,
        status: TokenStatus.ACTIVE,
        lastUpdateAuthor: "system",
        priority: 5,
        logoId: logos[3]?.id || "",
        priceFeedId: priceFeeds[2]?.id || "",
        symbolIndex: TokenSymbol.USDT,
      },
      // Solana
      {
        address: Buffer.from("So11111111111111111111111111111111111111112", "utf8"),
        chainId: BlockchainNetwork.SOLANA,
        symbol: TokenSymbol.SOL,
        name: "Solana",
        decimals: 9,
        type: TokenType.NATIVE,
        status: TokenStatus.ACTIVE,
        lastUpdateAuthor: "system",
        priority: 6,
        logoId: logos[4]?.id || "",
        priceFeedId: priceFeeds[2]?.id || "",
        symbolIndex: TokenSymbol.SOL,
      },
      // Неактивный токен
      {
        address: Buffer.from("0x1234567890123456789012345678901234567890", "utf8"),
        chainId: BlockchainNetwork.ETHEREUM,
        symbol: "OLD",
        name: "Old Token",
        decimals: 18,
        type: TokenType.ERC20,
        status: TokenStatus.INACTIVE,
        lastUpdateAuthor: "system",
        priority: 7,
        logoId: logos[0]?.id || "",
        priceFeedId: priceFeeds[3]?.id || "",
        symbolIndex: "OLD",
      },
    ];

    const tokens = tokensData.map((data) => manager.create(Token, data));
    return await manager.save(Token, tokens);
  }

  private async seedTokenPricesInTransaction(
    manager: EntityManager,
    tokens: Token[]
  ): Promise<void> {
    const basePrices: Partial<Record<TokenSymbol, number>> = {
      [TokenSymbol.BTC]: 45000,
      [TokenSymbol.ETH]: 3000,
      [TokenSymbol.USDC]: 1,
      [TokenSymbol.USDT]: 1,
      [TokenSymbol.SOL]: 100,
    };

    const tokenPrices = [];

    for (const token of tokens) {
      const basePrice = basePrices[token.symbol as TokenSymbol] || 1;
      const price = basePrice + (Math.random() - 0.5) * basePrice * 0.1;

      const tokenPrice = manager.create(TokenPrice, {
        token: token,
        price: Math.round(price * 1e8).toString(), // Конвертируем в строку для numeric
      });

      tokenPrices.push(tokenPrice);
    }

    await manager.save(TokenPrice, tokenPrices);
  }
}
