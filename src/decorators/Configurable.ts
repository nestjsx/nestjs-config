import 'reflect-metadata';
import { CONFIG_CONFIGURABLE, CONFIG_PARAM, CONFIG_PARAMS } from '../constants';
import { applyParamsMetadataDecorator } from '../utils';
import { ConfigService } from '../module';

export const Configurable = (): MethodDecorator => {
  return (
    target: Object,
    key: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;
    descriptor.value = (...args: any[]) => {
      const paramsMetadata = (
        Reflect.getMetadata(CONFIG_PARAMS, target) || []
      ).filter(p => {
        return p.propertyKey === key;
      });
      return originalMethod.apply(
        this,
        applyParamsMetadataDecorator(
          paramsMetadata,
          args,
          ConfigService.getEnv,
        ),
      );
    };

    Reflect.defineMetadata(
      CONFIG_CONFIGURABLE,
      Reflect.getMetadata(CONFIG_PARAMS, target) || [],
      descriptor.value,
    );
    return descriptor;
  };
};
export default Configurable;
