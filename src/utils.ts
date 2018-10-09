import { ConfigService } from "./module";

export function applyParamsMetadataDecorator(
  paramsMetadata: any[],
  args: any[],
  fn: (key: string, def?: string) => string,
): any[] {
  if (paramsMetadata.length) {
    // Override the original parameter value
    // with the expected property of the value even a deep property.
    for (const param of paramsMetadata) {
      if (Object.keys(param).includes('configKey')) {
        const i = param.parameterIndex;
        if (args[i] instanceof ConfigService || args[i] === ConfigService) {
          // if parameter is a ConfigService instance or ConfigService cass itself
          // then retrieve required config param from this instance
          args[param.parameterIndex] = args[i].get(param.configKey, param.fallback);
        } else if (args[i] === undefined) {
          // populate undefined argument with the config parameter value
          args[param.parameterIndex] = fn(param.configKey, param.fallback);
        } else if (args[i] === null) {
          /**
           * nestjs router populates missing parameters with nulls by default
           * so we need to populate nullable argument with the config parameter value too.
           * @link https://github.com/nestjs/nest/blob/master/packages/core/router/router-execution-context.ts#L117
           * @link https://github.com/nestjs/nest/issues/1182
           */
          args[param.parameterIndex] = fn(param.configKey, param.fallback);
        }
      }
    }
  }
  return args;
}
