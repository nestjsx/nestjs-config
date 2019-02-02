import * as path from 'path';
import { ConfigService } from '../../../module';

describe('issue 64 crashed when value is null', function() {
  describe('value has null', function() {
    let config: ConfigService;
    beforeAll(async () => {
      config = await ConfigService.load(path.join(__dirname, 'config', 'demo.ts'));
    });

    it('config should be object', () => {
      expect(config.get('demo')).toBeTruthy();
    });

    it('value1 should be null', () => {
      expect(config.get('demo.value1')).toEqual(null);
    });

    it('value2 should be OK', () => {
      expect(config.get('demo.value2')).toEqual('OK');
    });
  });

  describe('value has not null', function() {
    let config: ConfigService;
    beforeAll(async () => {
      config = await ConfigService.load(path.join(__dirname, 'config', 'demo2.ts'));
    });

    it('config should be object', () => {
      expect(config.get('demo2')).toBeTruthy();
    });

    it('value1 should be undefined', () => {
      expect(config.get('demo2.value1')).toEqual(undefined);
    });

    it('value2 should be OK', () => {
      expect(config.get('demo2.value2')).toEqual('OK');
    });
  });

});
