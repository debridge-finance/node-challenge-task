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

- `utils/random.ts`
  Generation of random values for various types

- `token.seeder.ts`
  Now it creates specified amount of random tokens
