import { BehaviorSubject } from 'rxjs';
import { AsyncObject } from '../../shared/models/async-object';

export function ViewProperty(): MethodDecorator {
  return function (target, propertyKey, descriptor) {
    const originalSetFunction = descriptor.set;

    if (originalSetFunction) {
      descriptor.set = (value: any) => {
        const valueSubject = new BehaviorSubject<any>(descriptor.value);

        const bindingResolver: AsyncObject<BehaviorSubject<any>> = (target as any)._context[propertyKey];
        if (!bindingResolver) {
          const bindingResolver = new AsyncObject<BehaviorSubject<any>>();

          (target as any)._context[propertyKey] = bindingResolver;
        }

        if (!bindingResolver.hasValue) {
          bindingResolver.setValue(valueSubject);
        }

        const currentValue = descriptor.value;

        originalSetFunction.apply(target, value);

        if (currentValue !== descriptor.value) {
          valueSubject.next(value);
        }
      };
    }
  }
}