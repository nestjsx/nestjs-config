import 'reflect-metadata';
import { CONFIG_PARAMS } from '../constants';

export const ConfigParam = (
  configKey: string,
  fallback: string | undefined = undefined,
): ParameterDecorator => (target, propertyKey, parameterIndex) => {
  // Pull existing parameters for this method or create an empty array
  const existingParameters: any[] =
    Reflect.getMetadata(CONFIG_PARAMS, target, propertyKey) || [];
  // Add this parameter
  existingParameters.push({ parameterIndex, propertyKey, configKey, fallback });
  // Update the required parameters for this method
  Reflect.defineMetadata(CONFIG_PARAMS, existingParameters, target);
  return target;
};
export default ConfigParam;
