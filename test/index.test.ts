import { Incrementalist, IncrementalistItem } from "../src/index";
import { expect } from "chai";

function createSummer() {
  return new Incrementalist({
    map(value: number): number {
      return value;
    },
    reduce(a: number, b: number): number {
      return a + b;
    }
  });
}

describe("Incrementalist", () => {
  describe("#insert(value)", () => {
    it("should return an node with property 'value' set to the given value", () => {
      const inc = createSummer();
      const node = inc.insert(1);
      expect(node).to.have.property("value", 1);
    });

    it("should return an object implementing IncrementalistItem", () => {
      const inc = createSummer();
      const node: IncrementalistItem<number, number> = inc.insert(1);
    });
  });

  describe("#reduce()", () => {
    it("should return undefined for an empty instance", () => {
      const inc = createSummer();
      expect(inc.reduce()).to.be.undefined;
    });

    it("should return the given default for an empty instance", () => {
      const inc = createSummer();
      expect(inc.reduce(1)).to.equal(1);
    });

    it("should return the reduced value for a non-empty instance", () => {
      const inc = createSummer();

      let sum = 0;
      for (let i = 0; i < 1024; i++) {
        inc.insert(i);
        sum += i;
      }

      expect(inc.reduce()).to.equal(sum);
    });
  });
});
