export default class Tag {
  static schema = {
    name: 'Tag',
    primaryKey: 'text',
    properties: {
      text: 'string',
    },
  };
}
