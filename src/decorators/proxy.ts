/**
 * @param {string} propertyName
 * @returns {<T extends {new(...args: any[]): {}}>(constructor: T) => {new(...args: any[]): {}; prototype: {}}}
 * @constructor
 */
export const ProxyProperty = (propertyName: string) =>
  function classDecorator<T extends { new (...args: any[]): {} }>(
    constructor: T,
  ) {
    const decorated = class extends constructor {
      constructor(...args: any[]) {
        super(...args);

        return new Proxy(this, {
          get: (target, prop): any => {
            if (target[prop] !== undefined) {
              return target[prop];
            } else if (target[propertyName].hasOwnProperty(prop)) {
              return target[propertyName][prop];
            }
          },
        });
      }
    };
    /**
     * fix for node 12.16.0 issue: https://github.com/microsoft/TypeScript/issues/37157
     * */
    Object.defineProperty(decorated, 'name', { value: constructor.name });
    return decorated;
  };
