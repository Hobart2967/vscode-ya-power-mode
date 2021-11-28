export class AsyncObject<T> {
  //#region Private Fields
  private _valueSet: T = null as any;
  private _resolveValue: (value: T | PromiseLike<T>) => void = null as any;
  //#endregion

  //#region Properties
  private _value: Promise<T>;
  public get value(): Promise<T> {
    return this._value;
  }

  public get hasValue(): boolean {
    return !!this._valueSet;
  }
  //#endregion

  //#region Ctor
  public constructor() {
    this._value = new Promise(resolve =>
      this._resolveValue = resolve);
  }
  //#endregion

  //#region Public Methods
  public setValue(value: T): void {
    if (!!this._valueSet && this._valueSet !== value) {
      throw new Error('Cannot re-apply a value to a resolved AsyncObject');
    }

    this._valueSet = value;
    this._resolveValue(value);
  }
  //#endregion
}