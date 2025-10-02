## Problems
1. Simple, layered project structure isn't working well on large projects
2. denormalized data models
3. kafka connection initialization in constructor
4. `TokenPriceUpdateService` doesn't have shared lock. In the current implementation it requires "singleton" server, which is rare in modern projects
5. manual implementation of `@UpdateDateColumn` and `@CreateDateColumn`
6. migrations arn't transactional

## What is Done
1. old code is moved to `src-old`
2. new project structure in `src` (description in `src/README.md`)
3. Database migrations are now generated automatically from `core/**/*.entity.ts` files
4. normalization of data models
5. simple shared lock implementation for `TokenPriceUpdateService` (not without flaws though)
6. added `migrationsTransactionMode: "all"`

## What Isn't Done
1. full implementation of `TokenPriceUpdateService` new version. Need to add `cron-jobs` for distributes services
2. integration tests for `TokenPriceUpdateService`
3. postgres lock timeout error handler for `TokenPriceUpdateService`
4. review of schema validations in `zod` (I do not use this library)
4. CI