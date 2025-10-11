1.0.1
=====

First fixes to just make the app start

- `kafka-producer.service.ts` 
    Added missing await on `producer.send()` call

- `src/app.module.ts`
   Fixed migrations filename pattern: ignore non-migrations files, specificly `run-migrations`

- `token.entity.ts` & `utils/entity.ts`
    Added transformer to `price` field for proper handling numberic values

