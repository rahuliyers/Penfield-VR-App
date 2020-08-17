import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import {Platform} from 'react-native';
const jsontoxml = require('jsontoxml');
const Buffer = require('buffer/').Buffer;

const ShareVideo = {
  shareVideoWithAndroid: async fileUrl => {
    const data = await RNFetchBlob.fs.readFile(fileUrl, 'base64');
    const IMAGE = 'data:video/mp4;base64,' + data;
    await Share.open({url: IMAGE});
  },
  shareVideoWithIOS: async fileUrl => {
    await Share.open({
      type: 'video/mp4',
      url: fileUrl,
    });
  },
  share: async fileUrl => {
    if (Platform.OS === 'android') {
      return ShareVideo.shareVideoWithAndroid(fileUrl);
    } else {
      return ShareVideo.shareVideoWithIOS(fileUrl);
    }
  },
  shareBlob: async (data, format = 'json') => {
    let blob = null;
    if (format === 'xml') {
      const xml = jsontoxml(data);
      const objJsonB64 = Buffer.from(xml).toString('base64');
      blob = 'data:text/xml;base64,' + objJsonB64;
    } else if (format === 'json') {
      const objJsonStr = JSON.stringify(data);
      const objJsonB64 = Buffer.from(objJsonStr).toString('base64');
      blob = 'data:text/plain;base64,' + objJsonB64;
    }
    await Share.open({url: blob, type: `text/${format}`});
  },
};

export default ShareVideo;
