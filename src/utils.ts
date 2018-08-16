export function applyParamsMetadataDecorator(
  paramsMetadata: any[],
  args: any[],
  fn: (key: string, def?: string) => string,
): any[] {
  if (paramsMetadata.length && args.length) {
    // Override the original parameter value
    // with the expected property of the value even a deep property.
    for (const param of paramsMetadata) {
      if (typeof args[param.parameterIndex] === 'object') {
        if (!param.configKey) {
          args[param.parameterIndex] = args[param.parameterIndex];
          continue;
        }
        // get the value from config here !
        // a better way ?
        args[param.parameterIndex] = fn(param.configKey, param.fallback);
      }
    }
  }
  return args;
}
