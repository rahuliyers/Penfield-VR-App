import {Platform} from 'react-native';
import * as RNFS from 'react-native-fs';

const path =
  Platform.OS === 'ios'
    ? RNFS.LibraryDirectoryPath
    : RNFS.ExternalStorageDirectoryPath;

export default {
  path,
  async initFolderApp() {
    try {
      var exists = await RNFS.exists(`${path}/cameraApp`);
      if (!exists) {
        await RNFS.mkdir(`${path}/cameraApp`);
      }
    } catch (error) {
      console.log('initFolderApp', error);
    }
  },
  async saveFileToFolder(uri) {
    try {
      if (uri) {
        await RNFS.copyFile(uri, `${path}/cameraApp/`);
      }
    } catch (error) {
      console.log('saveFileToFolder', error);
    }
  },
  async deleteFile(uri) {
    try {
      if (uri) {
        await RNFS.unlink(uri);
      }
    } catch (error) {
      console.log('deleteFile', error);
    }
  },
  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },
};
