1.0.1
=====

First fixes to just make the app start

- `kafka-producer.service.ts` 
    Added missing await on `producer.send()` call

- `src/app.module.ts`
   Fixed migrations filename pattern: ignore non-migrations files, specificly `run-migrations`

- `token.entity.ts` & `utils/entity.ts`
    Added transformer to `price` field for proper handling numberic values

1.1.0
=====

Made problems more obvious: 
- made 10000 random tokens generated
- properly handled shutdown signals
- shutdown on unhadled errors/rejections
- added artifical delay on kafka service destroy
- added check on double updates handling

Now application logs error messages 
- on Ctrl-C: `Error sending message: The producer is disconnected` because kafka service gets destroyed while it is still in use
- on just waiting about 10 seconds: `Price update service is already running` because update loop takes more time than update interval

Changes details:

- `src/main.ts`
  * Enabled shutdown hooks for proper stopping the app on signals
  * Added stopping the app on unhandled errors/rejections
  * Used app.init instead of app.listen because webserver is not needed in the app
  
- `token-price-update.service.ts`
  Crash the app if multiple copies of update handler are running in the same time

- `utils/random.ts`
  Generation of random values for various types

- `token.seeder.ts`
  Now it creates specified amount of random tokens

- `app.module.ts` and `data/seed.ts`
  10000 tokens requested from seed
 
- `kafka-producer.service.ts`
  Just some delay on destroy to make the problem visible

1.2.0
=====

Fix of module destroy order:
- updated nest.js to version 11 as it supports proper init/destroy order
- split services to 3 dependent modules: app -> price -> kafka to make kafka destroyed only after prices
- chanded price update service destroy to wait for loop end 

Now application does not log any errors on Ctrl-C or just on wait, but it just continues updating prices because there are too many tokens to process in a loop, and the loop is not stopped on destroy. It will be fixed later.

Changes details:
  
- `package.json`
  Updated nest.js to version 11

- `kafka.module.ts` and `price.module.ts`
  Created new module defiitions

- `app.module.ts`, `kafka-producer.service.ts`, `mock-price.service.ts`
  Updated paths and dependencies

- `token-price-update.service.ts`
  * Changed setInterval to setTimeout to prevent race in case when single update loop takes too long
  * Made updatingPrices variable awaitable for proper destroy
  * onModuleDestroy() and stop() are async now


1.3.0
=====

Made updates processig parallel for better performance. Now updates are processed much faster and Ctrl-C also works well.

Changes details:

- `token-price-update.service.ts`
  * updateTokenPrice is called for all loaded tokens in parallel with Promise.all
  * saving to database is done also for all tokens at once
  * tokens are loaded in batches, so parallelism is under control
  * batches ordered by id, next batch starts on the last id of previous one
  * loop break is introduced on destroy

1.4.0
=====

More performance improvements: don't load unused columns from database. Also there is duplicate chain_id column because of denormalization. It could be removed safely.

- `token-price-update.service.ts`
  * use TokenFields list in `select` option of `tokenRepository.find`
  * use TokenPartial type instead of Token to correctly represent partial Token object

- `mock-price.service`
  Most likely real token price calculation will not require all token fields. So I only kept id, chainId and address. 

- `token.entity.ts`, `token.schema.ts`, `1684654321000-InitialMigration.ts`, `token.seeder.ts` and others
  Removed duplicate chain_Id field


