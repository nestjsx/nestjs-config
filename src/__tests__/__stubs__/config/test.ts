export default class TestConfigClass {
  public port: number = process.env.PORT ? parseInt(process.env.PORT) : 0;
};
