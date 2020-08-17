import {Alert, Platform} from 'react-native';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';

async function checkPermission(permission) {
  try {
    const parsePermission = Platform.select({
      ios: PERMISSIONS.IOS[permission],
      android: PERMISSIONS.ANDROID[permission],
    });
    if (parsePermission) {
      const result = await check(parsePermission);
      return result === 'granted';
    }
  } catch (error) {
    Alert.alert('Alert', 'Error checking permissions');
  }
}
async function requestPermission(permission) {
  try {
    const parsePermission = Platform.select({
      ios: PERMISSIONS.IOS[permission],
      android: PERMISSIONS.ANDROID[permission],
    });
    if (parsePermission) {
      const result = await request(parsePermission);
      return result === 'granted';
    }
  } catch (error) {
    Alert.alert('Alert', 'Error requesting permissions');
  }
}

export default {
  checkPermission,
  requestPermission,
};
