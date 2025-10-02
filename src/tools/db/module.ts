import {Module} from "@nestjs/common";
import {dbConnectOptions} from "./connection";
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...dbConnectOptions(),
    })
  ],
  exports: [TypeOrmModule],
})
export class DbNodule {

}