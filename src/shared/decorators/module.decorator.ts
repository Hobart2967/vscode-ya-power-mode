import { injectable } from 'inversify';
import { Provider } from '../models/composition/provider.interface';
import { Type } from '../models/composition/type.interface';

export function Module(moduleDef: { providers: Array<Provider> }): (constructor: Type<any>) => void {
  return ((constructor: Type<any>) => {
    (constructor as any as { providers: Array<Provider> }).providers = moduleDef.providers;
    injectable()(constructor);
  });
}