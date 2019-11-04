import IPData from './ipdata';

const API_KEY = 'test';

describe('constructor()', () => {
  it('should throw an error if an apiKey is not provided', () => {
    // @ts-ignore
    expect(() => new IPData()).toThrowError('An API key is required.');
  });

  it('should set the apiKey', () => {
    const ipdata = new IPData(API_KEY);
    expect(ipdata.apiKey).toEqual(API_KEY);
  });

  it('should turn on the cache by default', () => {
    const ipdata = new IPData(API_KEY);
    expect(ipdata.useCache).toEqual(true);
  });

  it('should turn off the cache', () => {
    const ipdata = new IPData(API_KEY, false);
    expect(ipdata.useCache).toEqual(false);
  });
})

describe('lookup()', () => {
  const ipdata = new IPData(API_KEY, false);
  const IP = '1.1.1.1';

  it('should throw an error if the ip is invalid', async () => {
    const badIP = '1.1.11';
    await expect(ipdata.lookup(badIP)).rejects.toThrowError(`${badIP} is an invalid IP address.`);
  });

  it('should return default information when no ip is provided', async () => {
    const info = await ipdata.lookup();
    expect(info).toHaveProperty('ip');
    expect(info).toHaveProperty('status');
  });

  it('should return default information when null is provided', async () => {
    const info = await ipdata.lookup(null);
    expect(info).toHaveProperty('ip');
    expect(info).toHaveProperty('status');
  });

  it('should return default information when undefined is provided', async () => {
    const info = await ipdata.lookup(undefined);
    expect(info).toHaveProperty('ip');
    expect(info).toHaveProperty('status');
  });

  it('should set an ip in the uri', async () => {
    const info = await ipdata.lookup(IP);
    expect(info).toHaveProperty('ip', IP);
    expect(info).toHaveProperty('status');
  });

  it('should throw an error if a selectField and fields is provided', async () => {
    await expect(ipdata.lookup(null, 'field', ['field'])).rejects.toThrowError(
      'The selectField and fields parameters cannot be used at the same time.',
    );
  });

  describe('selectField', () => {
    it('should throw an error for an invlaid field ', async () => {
      const field = 'field';
      await expect(ipdata.lookup(null, field)).rejects.toThrowError(`${field} is not a valid field.`);
    });

    it('should return a response with only the field', async () => {
      const field = 'is_eu';
      const info = await ipdata.lookup(null, field);
      expect(info).toHaveProperty('select_field', false);
      expect(info).toHaveProperty('status');
    });
  });

  describe('fields', () => {
    it('should throw an error for an invlaid field ', async () => {
      const field = 'field';
      const fields = [field];
      await expect(ipdata.lookup(null, null, fields)).rejects.toThrowError(`${field} is not a valid field.`);
    });

    it('should return a response with only the field', async () => {
      const field1 = 'ip';
      const field2 = 'is_eu';
      const fields = [field1, field2];
      const info = await ipdata.lookup(IP, null, fields);
      expect(info).toHaveProperty(field1, IP);
      expect(info).toHaveProperty(field2, false);
      expect(info).toHaveProperty('status');
    });
  });
});

describe('lookupBulk()', () => {
  const ipdata = new IPData(API_KEY, false);
  const IP1 = '1.1.1.1';
  const IP2 = '8.8.8.8';

  it('should throw an error if less than 2 ips are provided', async () => {
    const ips = [IP1];
    await expect(ipdata.lookupBulk(ips)).rejects.toThrowError(
      'Bulk Lookup requires more than 1 IP Address in the payload.',
    );
  });

  it('should throw an error if an ip is invalid', async () => {
    const badIP = '1.1.11';
    const ips = [badIP, IP2];
    await expect(ipdata.lookupBulk(ips)).rejects.toThrowError(`${badIP} is an invalid IP address.`);
  });

  it('should return info for the ips', async () => {
    const info = await ipdata.lookupBulk([IP1, IP2]);
    expect(info).toHaveProperty('responses');
    expect(info).toHaveProperty('status');
    expect(info.responses[0]).toHaveProperty('ip', IP1);
    expect(info.responses[1]).toHaveProperty('ip', IP2);
  });

  describe('fields', () => {
    it('should throw an error for an invlaid field ', async () => {
      const field = 'field';
      const fields = [field];
      await expect(ipdata.lookupBulk([IP1, IP2], fields)).rejects.toThrowError(`${field} is not a valid field.`);
    });

    it('should return a response with only the field', async () => {
      const field1 = 'ip';
      const field2 = 'is_eu';
      const fields = [field1, field2];
      const info = await ipdata.lookupBulk([IP1, IP2], fields);
      expect(info).toHaveProperty('responses');
      expect(info).toHaveProperty('status');
      expect(info.responses[0]).toHaveProperty(field1, IP1);
      expect(info.responses[0]).toHaveProperty(field2, false);
      expect(info.responses[1]).toHaveProperty(field1, IP2);
      expect(info.responses[1]).toHaveProperty(field2, false);
    });
  });
});
