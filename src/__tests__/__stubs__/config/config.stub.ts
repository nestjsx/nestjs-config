export default {
  port: 2000,
  isProductionPort() {
    return this.get(['config.stub', 'port']) === 2000;
  }
};
