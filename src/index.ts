class Inc<V, R> {
  _array: Array<IncItem<V, R>>;
  _map: (value: V) => R;
  _reduce: (value1: R, value2: R) => R;

  constructor(config: { map(value: V): R; reduce(value1: R, value2: R): R }) {
    this._array = [];
    this._map = config.map;
    this._reduce = config.reduce;
  }

  insert(value: V): IncItem<V, R> {
    const Item = new IncItem(this, this._array.length, value);
    this._array.push(Item);
    reduce(this, Item._index);
    return Item;
  }

  reduced(): undefined | R;
  reduced<D>(default_: D): D | R;
  reduced<D>(default_?: D): undefined | D | R {
    return this._array.length === 0 ? default_ : this._array[0]._reduced;
  }
}

class IncItem<V, R> {
  value: V;
  _mapped: R;
  _reduced: R;
  _index: number;
  _owner?: Inc<V, R>;

  constructor(owner: Inc<V, R>, index: number, value: V) {
    const mapped = owner._map(value);

    this._owner = owner;
    this._index = index;
    this.value = value;
    this._mapped = mapped;
    this._reduced = mapped;
  }

  update(value: V): boolean {
    if (!this._owner) {
      return false;
    }
    const mapped = this._owner._map(value);
    this.value = value;
    this._mapped = mapped;
    reduce(this._owner, this._index);
    return true;
  }

  delete(): boolean {
    if (!this._owner) {
      return false;
    }
    const owner = this._owner;
    const last = owner._array.pop()!;
    reduce(owner, parentOf(last._index));

    if (last !== this) {
      owner._array[this._index] = last;
      last._index = this._index;
      reduce(owner, this._index);
    }

    this._owner = undefined;
    return true;
  }
}

const reduce = <V, R>(owner: Inc<V, R>, index: number): void => {
  const array = owner._array;
  const length = array.length;

  for (let idx = index; idx >= 0; idx = parentOf(idx)) {
    let reduced = array[idx]._mapped;

    const left = idx * 2 + 1;
    if (left < length) {
      reduced = owner._reduce(reduced, array[left]._reduced);

      const right = left + 1;
      if (right < length) {
        reduced = owner._reduce(reduced, array[right]._reduced);
      }
    }

    array[idx]._reduced = reduced;
  }
};

const parentOf = (index: number): number =>
  index <= 0 ? -1 : (index - 1) >>> 1;

export interface IncrementalistItem<V, R> {
  readonly value: V;
  update(value: V): boolean;
  delete(): boolean;
}
export const IncrementalistItem = IncItem;
export interface Incrementalist<V, R> {
  insert(value: V): IncrementalistItem<V, R>;
  reduced(): undefined | R;
  reduced<D>(default_: D): D | R;
}
export const Incrementalist = Inc as {
  new <V, R>(config: {
    map(value: V): R;
    reduce(a: R, b: R): R;
  }): Incrementalist<V, R>;
};
