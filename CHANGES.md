# Project changes by maktd

1. Hardcoded or ad-hoc configuration parameters were moved to a central config file, `src/config.ts`.
   The application is small enough to keep all configs in one file, making it easy to see
   what can be configured. For now, I decided to stick with environment variables, as it
   is the standard choice and no other requirements were provided. Also, `.dev.env` was
   created in the root directory with predefined variables to simplify development bootstrap.

2. The `src/test` directory was merged with the `test` directory. There is no point in
   having two separate directories for non-unit tests. E2E and integration tests can live
   in subdirectories, and they will likely share some test-specific code. Unit tests, as
   usual, stay next to the code.

3. `src/README.md` was moved to `DESCRIPTION.md`. Not strictly required, but I think
   `src` is for source code. It was a little confusing to see a README with a description
   of how to launch the application.

4. The HTTP adapter was removed because the application, by its description, does not
   need to listen on an HTTP port. It's always beneficial to remove network exposures if
   possible:

   - Remove dependencies
   - Remove potential attack surface
   - Remove developer confusion and wasted time

5. The bootstrap function was moved to a separate file and exported. This can be useful
   in integration and E2E tests. Also, export the application from the main file for the
   same reason.

6. Structured logging support was added via the Pino library. Pino is the standard choice
   for structured logging on Node.js. Structured logging is a must-have nowadays. Log
   aggregation systems, and any system dealing with logs, work much better with a
   structured approach.

7. Make tsconfig complie options more strict.
   Stricter options helps catch potenatial issues and bugs

8. change typeorm settings, add env options for tuning but most importanlty disable
   migrations auto run. In general migrations managment is highly depends on how
   you work with database, deploy your application, do backups ..etc. It may be ok
   to keep migrations auto run if you have strong enough protections measures to not lose
   you data. But in general it is saffer to run migrations in fully observerved
   controlleble manner, after all the data is probably the most important thing

9. remove custom migration runner bacause standard typeorm cli is doing the same thing

10. move db seeding to test dir. The main reason is that seeding is not related to runtime code.

11. database schema refactoring. Probably this is the biggest change.
    I create chain, logos and prices table to increase data normalization and reduce dublication.
    Some important notes:

    - i do now forgot that foreign key contraints exists, but i do not use them here,
      the reason behind it is that foreign keys constraints make db schema refactoring
      more challenging, later they can be added separately if there is strong need for it.
    - **I migrate data to the new tables in the same migration where tables is created.
      This is a little bit cheety, but i choose to keep it simple and clean.
      BUT, this decision make it impossible to deploy new version of this service without the downtime
      So in real world service we have to do this differently:**

      1. create new tables, do not touch data
      2. make service to write data both to old and new tables
      3. run migration which will copy old data to new tables
      4. make service read data from new tables
      5. delete old unused fields from original table

      **So this is 2 deployments and i can not represent this in one pull request**

    - Initial service logic do not store historical prices, so i keep it the same way,
      but still price table separation is usefull: It will be much easier to refactor service for historical prices support,
      in my experince i learn that if you do not need historical data now, i will need it later.
      In terms of db - we will need to drop 1 contraint

12. Refactor and partially reimplement business logic. I want to leave here some notes

    - typeorm is awesome library, but it is so heavy and well requires to be everywhere.
      If you ask me, i prefer much lightweigh approch:
      quarybuilder or even db driver wrapper with repositories classes providing required methods
      - it is easy to mock
      - it is actually easy to abstract transaction, you will need to create some general Quarying interface and make repositories
        accept it, then you make simple transactor abstraction which give you Quarying (connection under the hood)
        and simple commit, reject methods, maybe some extra helpers like with (callback style transactions)
        This works great for sql, and if you change sql to sql you will only need repos, not bisuness logic
        I will not do this here, because i suppose typeorm suppoosed to stay untouched). But because of typeorm
        mocking for testing will be hard, it will be easier to test with sqlite then to mock)
      - again because of typeorm i skip abstracting repositories, so yeah our business service depends on infra lib,
        which not very good
      - every other i/o services have been abstracted away

13. Not a change but some note: in description it's says that service publish to kafka before saving to db
    I keep it like that, but it will be more robust to indroduce cdc (like debezium) to capture db changes,
    this will be break the rule publish before save but make system in general more robust.
    Of course if it is not a single place where such things happens

14. for simplicity I do not implement destributed price update scheduling, so this service must be singleton for now
    in real world we will need to implement
    - scheduler locking or leader election mechanism
    - mechinim of task description across instances via some transport with round robin support
