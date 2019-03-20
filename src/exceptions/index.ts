export class UnkownConfigProvider extends Error {
  constructor(token: string) {
    super(`nestjs-config Cannot find provider with token [${token}]`);
  }
}
