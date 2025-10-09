import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { Kafka, Consumer, KafkaMessage } from 'kafkajs';
import { TokenPriceUpdateService } from '../../modules/tokens/token-price-update.service';
import { MockPriceService } from '../../modules/tokens/mock-price.service';
import { TokenPriceUpdateMessage } from '../../modules/tokens/schema/token-price-update-message';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import {Token} from "../../modules/tokens/token.entity";
import {KafkaProducerService} from "../../modules/kafka/kafka-producer.service";
import {TokenModule} from "../../modules/tokens/token.module";


describe('TokenPriceUpdateService', () => {
    let tokenRepository: Repository<Token>;
    let tokenPriceUpdateService: TokenPriceUpdateService;

    let moduleRef: TestingModule;

    beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    type: 'postgres',
                    host: 'localhost',
                    port: 5432,
                    username: 'postgres',
                    password: 'postgres',
                    database: 'tokens',
                    entities: [Token],
                    synchronize: true,
                }),
                TypeOrmModule.forFeature([Token]),
                TokenModule, // импортируем модуль для сервисов
            ],
        })
            .overrideProvider(KafkaProducerService)
            .useValue({
                sendPriceUpdateMessage: jest.fn().mockResolvedValue(undefined),
            })
            .compile();

        tokenRepository = moduleRef.get<Repository<Token>>(getRepositoryToken(Token));
        tokenPriceUpdateService = moduleRef.get<TokenPriceUpdateService>(TokenPriceUpdateService);
    });

    it('should update token prices', async () => {
        // Пример использования tokenRepository и сервиса
        const token = new Token();
        token.address = Buffer.from([0x01, 0x02, 0x03]);
        token.symbol = 'TEST';
        token.name = 'Test Token';
        token.decimals = 18;
        token.isNative = false;
        token.chain_id = '11111111-1111-1111-1111-111111111111';
        token.isProtected = false;
        token.priority = 1;
        token.timestamp = new Date();
        // token.chain_Id = '11111111-1111-1111-1111-111111111111';
        // token.chain_DeId = 1;
        // token.chain_Name = 'Test Chain';
        // token.chain_IsEnabled = true;
        token.logo_id = '22222222-2222-2222-2222-222222222222';
        // token.logo_TokenId = '33333333-3333-3333-3333-333333333333';
        // token.logo_BigRelativePath = '/test.png';
        // token.logo_SmallRelativePath = '/test_small.png';
        // token.logo_ThumbRelativePath = '/test_thumb.png';
        token.price = 100;
        token.lastPriceUpdate = new Date();

        await tokenRepository.save(token);
        tokenPriceUpdateService.start();

        // Wait for price updates to occur
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Stop the service
        tokenPriceUpdateService.stop();

        const updatedToken = await tokenRepository.findOne({ where: { id: token.id } });
        expect(updatedToken).toBeDefined();
        expect(updatedToken.price).not.toEqual(100);
    });
});
