export default class Memory {
  static schema = {
    name: 'Memory',
    primaryKey: 'id',
    properties: {
      id: 'string',
      tags: 'string[]',
      video_path: 'string',
      thumbnail_path: 'string',
      createdAt: 'int',
      units: 'string',
      state: 'string',
      city: 'string',
      country: 'string',
      temp: 'float',
      pressure: 'int',
      humidity: 'int',
      latitude: 'double',
      longitude: 'double',
      direction: 'int',
    },
  };
}
