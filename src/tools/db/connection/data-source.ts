import {DataSource} from "typeorm";
import {dbConnectOptions} from "./db-options";

const dataSource = new DataSource(dbConnectOptions())
export default dataSource;