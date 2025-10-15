const multicallBatchSize = process.env.MULTICALL_BATCH_SIZE
  ? parseInt(process.env.MULTICALL_BATCH_SIZE)
  : 50;

export const contractsConfig = {
  multicallBatchSize,
};
