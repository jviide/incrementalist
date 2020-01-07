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

    it("should return a IncrementalistItem instance", () => {
      const inc = createSummer();
      const node = inc.insert(1);
      expect(node).to.be.instanceof(IncrementalistItem);
    });
  });

  describe("#reduced()", () => {
    it("should return undefined for an empty instance", () => {
      const inc = createSummer();
      expect(inc.reduced()).to.be.undefined;
    });

    it("should return the given default for an empty instance", () => {
      const inc = createSummer();
      expect(inc.reduced(1)).to.equal(1);
    });

    it("should return the reduced value for a non-empty instance", () => {
      const inc = createSummer();

      let sum = 0;
      for (let i = 0; i < 1024; i++) {
        inc.insert(i);
        sum += i;
      }

      expect(inc.reduced()).to.equal(sum);
    });
  });
});
