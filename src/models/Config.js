export default class Config {
  static schema = {
    name: 'Config',
    primaryKey: 'id',
    properties: {
      id: 'string',
      urlStart: 'string',
      urlStop: 'string',
      uuid: 'string',
      major: 'int',
      minor: 'int',
    },
  };
}
