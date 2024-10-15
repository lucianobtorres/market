export interface IDictionary<T> {
  [Key: number]: T;
}

export class Dictionary<T> implements IDictionary<T>{
  [Key: number]: T;

  _keys: number[] = [];
  _values: T[] = [];

  add(key: number, value: T) {
    this[key] = value;
    this._keys.push(key);
    this._values.push(value);
  }

  remove(key: number) {
    const valores = this[key];
    let index = (this._keys.findIndex(x => x === key));
    if (index === -1) return false;

    this._keys.splice(index, 1);

    index = (this._values.findIndex(x => x === valores));
    if (index === -1) return false;

    this._values.splice(index, 1);
    return true;
  }

  keys(): number[] {
    return this._keys;
  }

  values(): T[] {
    return this._values;
  }

  containsKey(key: number) {
    if (typeof this[key] === undefined) {
      return false;
    }

    return this._keys.some(x => key === x);
  }
}
