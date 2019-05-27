import { createProvider } from './../utils';
import { TOKEN_PREFIX } from './../constants';

describe('createProvider', () => {
  it('Can return a provider', () => {
    const provider = createProvider({}, 'path.ts');

    expect(provider.provide).toEqual(`${TOKEN_PREFIX}path`);
  });
});
