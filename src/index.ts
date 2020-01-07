class Container<V, R> {
  readonly _array: Array<Item<V, R>>;
  readonly _map: (value: V) => R;
  readonly _reduce: (value1: R, value2: R) => R;

  constructor(config: { map(value: V): R; reduce(value1: R, value2: R): R }) {
    this._array = [];
    this._map = config.map;
    this._reduce = config.reduce;
  }

  insert(value: V): Item<V, R> {
    const mapped = this._map(value);
    const item: Item<V, R> = {
      value: value,
      update: update,
      delete: delete_,
      _mapped: mapped,
      _reduced: mapped,
      _index: this._array.length,
      _owner: this
    };
    reduce(this, this._array.push(item) - 1);
    return item;
  }

  reduce(): undefined | R;
  reduce<D>(default_: D): D | R;
  reduce<D>(default_?: D): undefined | D | R {
    return this._array.length === 0 ? default_ : this._array[0]._reduced;
  }
}

interface Item<V, R> {
  value: V;
  update: typeof update;
  delete: typeof delete_;
  _mapped: R;
  _reduced: R;
  _index: number;
  _owner?: Container<V, R>;
}

function update<V, R>(this: Item<V, R>, value: V): boolean {
  const owner = this._owner;
  if (!owner) {
    return false;
  }
  this.value = value;
  this._mapped = owner._map(value);
  reduce(owner, this._index);
  return true;
}

function delete_<V, R>(this: Item<V, R>): boolean {
  const owner = this._owner;
  if (!owner) {
    return false;
  }
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

const reduce = <V, R>(owner: Container<V, R>, index: number): void => {
  const array = owner._array;

  for (let idx = index; idx >= 0; idx = parentOf(idx)) {
    let reduced = array[idx]._mapped;

    const left = idx * 2 + 1;
    if (left < array.length) {
      reduced = owner._reduce(reduced, array[left]._reduced);

      const right = left + 1;
      if (right < array.length) {
        reduced = owner._reduce(reduced, array[right]._reduced);
      }
    }

    array[idx]._reduced = reduced;
  }
};

const parentOf = (index: number) => (index > 0 ? (index - 1) >>> 1 : -1);

export interface IncrementalistItem<V, R> {
  readonly value: V;
  update(value: V): boolean;
  delete(): boolean;
}
export interface Incrementalist<V, R> {
  insert(value: V): IncrementalistItem<V, R>;
  reduce(): undefined | R;
  reduce<D>(default_: D): D | R;
}
export const Incrementalist = Container as {
  new <V, R>(config: {
    map(value: V): R;
    reduce(a: R, b: R): R;
  }): Incrementalist<V, R>;
};
