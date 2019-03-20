import { TOKEN_PREFIX } from './../constants';

export function configToken(token: string): string {
  return `${TOKEN_PREFIX}${token}`;
}
