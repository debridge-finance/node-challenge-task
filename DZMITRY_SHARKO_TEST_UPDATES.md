1. Implemented pnpm package manager
2. Updated package versions, fixed vulnerabilities
3. Implemented Config Service, .env (it's possible to use Secret Manager instead)
4. Refactored token.seeder.ts, token.schema.ts, token-price-update-message.ts
5. Optimized the database structure
6. Optimized the docker-compose.yml
7. Refactored data-source.ts, main.ts


Possible architecture improvements:
Use @DynamicColumns or separate table for normalized fields: chain_id, chain_deid, chain_name.

TODO:
Fix the unit tests.
