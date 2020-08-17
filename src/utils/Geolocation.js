import Geolocation from 'react-native-geolocation-service';

export default {
  getLocation: () => {
    return new Promise((resolve, reject) => {
      if (true) {
        Geolocation.getCurrentPosition(
          position => {
            resolve(position);
          },
          error => {
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          },
        );
      }
    });
  },
};
