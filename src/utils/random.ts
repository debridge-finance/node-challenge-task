export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomUuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getRandomAddress(): Buffer {
  return Buffer.from([...Array(20)].map(() => getRandomInt(0, 255)));
}

export function getRandomString(): string {
  return Math.random().toString(36).slice(2);
}

export function getRandomFloat(max: number): number {
  const basePrice = getRandomInt(1, max);
  const randomFactor = Math.random();

  return basePrice * randomFactor;
}
