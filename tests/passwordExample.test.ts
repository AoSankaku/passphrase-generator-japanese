import { describe, expect, it } from "bun:test";
import {
  calculateCharacterEntropy,
  calculateMaleNameBirthdayEntropy,
  createBirthday,
  pickRandomItem,
} from "../src/lib/passwordExample";

describe("calculateCharacterEntropy", () => {
  it("calculates a lowercase alphanumeric password with a 36-character alphabet", () => {
    const password = "taro19900412";

    expect(calculateCharacterEntropy(password, 36)).toBeCloseTo(
      password.length * Math.log2(36),
    );
  });

  it("returns zero when the password or alphabet has no uncertainty", () => {
    expect(calculateCharacterEntropy("", 36)).toBe(0);
    expect(calculateCharacterEntropy("aaaa", 1)).toBe(0);
  });
});

describe("pickRandomItem", () => {
  it("selects the first and last items at the random boundaries", () => {
    const items = ["akira", "taro", "yuto"];

    expect(pickRandomItem(items, () => 0)).toBe("akira");
    expect(pickRandomItem(items, () => 0.999999)).toBe("yuto");
  });

  it("rejects an empty name list", () => {
    expect(() => pickRandomItem([])).toThrow(
      "Cannot select an item from an empty list.",
    );
  });
});

describe("createBirthday", () => {
  it("returns a valid zero-padded YYYYMMDD birthday", () => {
    expect(createBirthday(() => 0)).toBe("19600101");
    expect(createBirthday(() => 0.999999)).toBe("20051231");
  });
});

describe("calculateMaleNameBirthdayEntropy", () => {
  it("uses the number of male names and valid birthdays as the guess space", () => {
    const validBirthdayCount = 16_802;

    expect(calculateMaleNameBirthdayEntropy(4)).toBeCloseTo(
      Math.log2(4 * validBirthdayCount),
    );
  });

  it("returns zero when there are no candidate names", () => {
    expect(calculateMaleNameBirthdayEntropy(0)).toBe(0);
  });
});
