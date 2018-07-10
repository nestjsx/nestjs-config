/**
 * @param {string} propertyName
 * @returns {<T extends {new(...args: any[]): {}}>(constructor: T) => {new(...args: any[]): {}; prototype: {}}}
 * @constructor
 */
export const ProxyProperty = (propertyName: string) =>
  function classDecorator<T extends { new (...args: any[]): {} }>(
    constructor: T,
  ) {
    return class extends constructor {
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
  };
