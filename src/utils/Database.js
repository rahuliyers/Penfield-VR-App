const Realm = require('realm');

import Tag from '../models/Tag';
import Memory from '../models/Memory';
import Config from '../models/Config';

export default class Database {
  constructor() {
    this.realm = new Realm({schema: [Tag, Memory, Config]});
  }

  addTag(tag) {
    this.realm.write(() => {
      const id = this.realm.objectForPrimaryKey('Tag', tag);
      if (id) {
        this.realm.create('Tag', {text: tag}, true);
      } else {
        this.realm.create('Tag', {text: tag});
      }
    });
  }

  getTags() {
    return this.realm.objects('Tag');
  }

  addConfig(config, update = false) {
    this.realm.write(() => {
      this.realm.create('Config', config, update);
    });
  }

  getConfig() {
    const config = this.realm.objects('Config');
    if (config && config['0']) {
      return config['0'];
    }
    return {};
  }

  addMemory(memory, update = false) {
    this.realm.write(() => {
      this.realm.create('Memory', memory, update);
    });
  }

  getMemories() {
    return this.realm.objects('Memory');
  }

  deleteMemory(video) {
    const id = this.realm.objectForPrimaryKey('Memory', video);
    this.realm.write(() => {
      this.realm.delete(id);
    });
  }
}
