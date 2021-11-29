import { Container } from 'inversify';
import { DetailedProvider, Provider } from '../models/composition/provider.interface';
import { Type } from '../models/composition/type.interface';

function bindProvider(container: Container, provider: Provider): void {
  const detailedProvider = (provider as DetailedProvider);
  if (detailedProvider.provide) {
    const bind = container.bind(detailedProvider.provide);
    if (detailedProvider.useValue !== null && detailedProvider.useValue !== undefined) {
      bind.toConstantValue(detailedProvider.useValue);
    } else {
      bind.to(detailedProvider.useClass as Type<any>);
    }

    return;
  }
  container.bind(provider as Type<any>).toSelf();
}

export function bootstrap<T>(moduleType: Type<T>, options?: { providers: Provider[] }, container?: Container): Container {
  const module = (moduleType as any as { providers: Provider[] });
  const { providers } = module;

  const containerToUse = container || new Container();
  if (!container) {
    containerToUse
      .bind(Container)
      .toConstantValue(containerToUse);
  }

  providers
    .forEach((provider: Provider) => bindProvider(containerToUse, provider));

  containerToUse
    .bind(moduleType)
    .toSelf();

  if (options && options.providers) {
    options.providers.forEach(provider => bindProvider(containerToUse, provider));
  }

  return containerToUse;
}