export const mockPrice = () => ({
  minDelay: parseInt(process.env.MOCK_PRICE_MIN_DELAY || '50', 10),
  maxDelay: parseInt(process.env.MOCK_PRICE_MAX_DELAY || '200', 10),
  enableDelay: process.env.MOCK_PRICE_ENABLE_DELAY === 'true',
});