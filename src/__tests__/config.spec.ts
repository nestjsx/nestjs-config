import { Config } from './../config';

describe('Config object', () => {
  it('Can instance with object', () => {
    const config = new Config({
      test: true,
      string: 'hello',
    });

    expect(config.test).toBeTruthy();
    expect(config.string).toEqual('hello');
  });

  it('Can use get', () => {
    const config = new Config({
      first: {
        second: {
          third: {
            forth: {
              fith: true,
            },
          },
        },
      },
    });

    expect(config.get<boolean>('first.second.third.forth.fith')).toBeTruthy();
    expect(config.get<object>('first.second.third.forth')).toEqual({
      fith: true,
    });
  });

  it('Can use get with default', () => {
    const config = new Config({
      first: {
        second: {
          third: {
            forth: {
              fith: false,
            },
          },
        },
      },
    });

    expect(
      config.get<boolean>('first.second.third.forth.fith.sizth', true),
    ).toBeTruthy();
    expect(
      config.get<object>('first.second.third.forth.fith.sixth.seventh', {
        eighth: true,
      }),
    ).toEqual({ eighth: true });
  });
});
