const BIRTHDAY_START = Date.UTC(1960, 0, 1);
const BIRTHDAY_END = Date.UTC(2005, 11, 31);
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const BIRTHDAY_CHOICE_COUNT =
  Math.floor((BIRTHDAY_END - BIRTHDAY_START) / MILLISECONDS_PER_DAY) + 1;

export const calculateCharacterEntropy = (
  password: string,
  charsetSize: number,
): number => {
  if (password.length === 0 || charsetSize <= 1) {
    return 0;
  }

  return password.length * Math.log2(charsetSize);
};

export const pickRandomItem = <T>(
  items: readonly T[],
  random: () => number = Math.random,
): T => {
  if (items.length === 0) {
    throw new Error("Cannot select an item from an empty list.");
  }

  return items[Math.floor(random() * items.length)];
};

export const calculateMaleNameBirthdayEntropy = (
  maleNameCount: number,
): number => {
  if (maleNameCount <= 0) {
    return 0;
  }

  return Math.log2(maleNameCount) + Math.log2(BIRTHDAY_CHOICE_COUNT);
};

export const createBirthday = (
  random: () => number = Math.random,
): string => {
  const timestamp =
    BIRTHDAY_START +
    Math.floor(random() * BIRTHDAY_CHOICE_COUNT) * MILLISECONDS_PER_DAY;

  return new Date(timestamp).toISOString().slice(0, 10).replace(/-/g, "");
};
