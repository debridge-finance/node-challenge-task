export enum Environment {
  DEVELOPMENT = "development",
  PRODUCTION = "production",
  TEST = "test",
  STAGING = "staging",
}

export enum DatabaseType {
  POSTGRES = "postgres",
  MYSQL = "mysql",
  SQLITE = "sqlite",
  MONGODB = "mongodb",
}

export enum MessageBrokerType {
  KAFKA = "kafka",
  RABBITMQ = "rabbitmq",
  REDIS = "redis",
  ZEROMQ = "zeromq",
}

export enum TokenStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  DELETED = "deleted",
}

export enum TokenType {
  NATIVE = "native",
  ERC20 = "erc20",
  ERC721 = "erc721",
  ERC1155 = "erc1155",
  BEP20 = "bep20",
}
