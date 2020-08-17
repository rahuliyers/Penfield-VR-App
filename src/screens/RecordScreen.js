import * as React from 'react';
import {
  View,
  Button,
  Text,
  Alert,
  Modal,
  TextInput,
  Platform,
  StyleSheet,
  DeviceEventEmitter,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import RNThumbnail from 'react-native-thumbnail';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import RNPickerSelect from 'react-native-picker-select';
import Beacons from 'react-native-beacons-manager';
import Storage from '../utils/Storage';
import Permission from '../utils/Permission';
import ShareVideo from '../utils/ShareVideo';
import Database from '../utils/Database';
import Geolocation from '../utils/Geolocation';
import Weather from '../utils/Weather';
import Base from '../utils/Base';
import {AutoCompleteTags} from '../components/AutoCompleteTags';

const styles = StyleSheet.create({
  input: {
    borderBottomColor: '#ddd',
    borderBottomWidth: 0.5,
    color: '#000',
  },
  inputContainer: {
    paddingTop: 10,
    paddingBottom: 10,
  },
});

export default class RecordScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: '',
      units: 'Metric',
      modalVisible: false,
      recording: false,
      file: null,
      thumbnail: null,
      camera: false,
      typeCamera: RNCamera.Constants.Type.back,
      torch: RNCamera.Constants.FlashMode.off,
      tagsSelected: [],
      tags: [],
      temp: '',
      tempBase: '',
      pressure: '',
      humidity: '',
      latitude: '',
      longitude: '',
      state: '',
      country: '',
      city: '',
      direction: 1,
    };
    this.db = new Database();
  }

  componentDidMount() {
    this.getMic();
    this.loadData();
  }

  componentWillUnmount() {
    DeviceEventEmitter.removeListener('regionDidEnter');
    DeviceEventEmitter.removeListener('regionDidExit');
    if (this.config && this.config.uuid) {
      const {uuid, major, minor} = this.config;
      const region = {
        identifier: 'Estimotes',
        uuid,
      };
      if (major) {
        region.major = major;
      }
      if (minor) {
        region.minor = minor;
      }
      Beacons.stopRangingBeaconsInRegion(region);
    }
  }

  initScanner = async () => {
    if (this.config && this.config.uuid) {
      const {uuid, major, minor} = this.config;
      const region = {
        identifier: 'Estimotes',
        uuid,
      };
      if (Platform.OS === 'ios') {
        try {
          Beacons.requestAlwaysAuthorization();
          Beacons.startMonitoringForRegion(region);
          Beacons.startRangingBeaconsInRegion(region);
          Beacons.startUpdatingLocation();
        } catch (err) {
          console.log(`Beacons ranging not started, error: ${err}`);
        }
      } else if (Platform.OS === 'android') {
        try {
          if (major) {
            region.major = major;
          }
          if (minor) {
            region.minor = minor;
          }
          Beacons.detectIBeacons();
          await Beacons.startMonitoringForRegion(region);
          await Beacons.startRangingBeaconsInRegion(region);
        } catch (err) {
          console.log(`Beacons ranging not started, error: ${err}`);
        }
      }
      if (Platform.OS === 'ios') {
        DeviceEventEmitter.addListener('beaconsDidRange', data => {
          const find = data.beacons.find(e => {
            return e.uuid === uuid && e.major === +major && e.minor === +minor;
          });
          if (!this.beacon && find) {
            this.beacon = true;
            this.startRecord(true);
          } else if (this.beacon && this.state.recording && !find) {
            this.beacon = false;
            this.stopRecord();
          }
        });
      } else if (Platform.OS === 'android') {
        DeviceEventEmitter.addListener('regionDidEnter', data => {
          this.beacon = true;
          this.startRecord(true);
        });
        DeviceEventEmitter.addListener('regionDidExit', data => {
          this.beacon = false;
          this.stopRecord();
        });
      }
    }
  };

  loadData = async () => {
    const config = this.db.getConfig();
    if (config.id) {
      this.config = config;
    }
    const tags = this.db.getTags();
    const proccesed = Object.keys(tags).map(key => tags[key].text);
    try {
      const loc = await Geolocation.getLocation();
      const {latitude, longitude} = loc.coords;
      const weather = await Weather.getWeather(latitude, longitude);
      const {temp, pressure, humidity} = weather;
      this.setState({
        temp: `${temp}`,
        tempBase: `${temp}`,
        pressure: `${pressure}`,
        humidity: `${humidity}`,
        latitude: `${latitude}`,
        longitude: `${longitude}`,
        tags: proccesed,
      });
    } catch (error) {
      console.log('error', error);
    }
    this.setState({tags: proccesed});
  };

  getMic = async () => {
    const permission = Platform.OS === 'ios' ? 'MICROPHONE' : 'RECORD_AUDIO';
    const result = await Permission.checkPermission(permission);
    if (!result) {
      const mic = await Permission.requestPermission(permission);
      if (mic) this.setState({camera: true});
    } else {
      this.setState({camera: true});
    }
    this.initScanner();
  };

  getCamera = async () => {
    const result = await Permission.checkPermission('CAMERA');
    if (!result) {
      const camera = Permission.requestPermission('CAMERA');
      if (camera) this.getMic();
    } else {
      this.getMic();
    }
  };

  startRecord = async () => {
    if (this.camera) {
      if (!this.state.recording) {
        await this.setState({recording: true});
        const path = `${Storage.path}/cameraApp/${Base.uuidv4()}.video.mp4`;
        const options = {
          quality: 0.5,
          base64: true,
          width: 300,
          height: 150,
          path,
        };
        if (this.config && this.config.urlStart) {
          Base.get(this.config.urlStart);
        }
        const record = await this.camera.recordAsync(options);
        const thumbnail = await RNThumbnail.get(path);
        await this.setState({
          id: Base.uuidv4(),
          modalVisible: true,
          thumbnail,
          file: path,
          direction: record.videoOrientation,
        });
      }
    }
  };

  shareVideo = () => {
    ShareVideo.share(this.state.file);
  };

  stopRecord = async () => {
    if (this.state.recording) {
      await this.setState(
        {
          id: '',
          units: 'Metric',
          modalVisible: false,
          recording: false,
          file: null,
          thumbnail: null,
          tagsSelected: [],
          temp: '',
          tempBase: '',
          pressure: '',
          humidity: '',
          latitude: '',
          longitude: '',
          state: '',
          country: '',
          city: '',
          direction: 1,
        },
        this.loadData,
      );
      if (this.config && this.config.urlStop) {
        Base.get(this.config.urlStop);
      }
      this.camera.stopRecording();
    }
  };

  switchCamera = async () => {
    await this.setState({torch: RNCamera.Constants.FlashMode.off});
    if (this.state.typeCamera === RNCamera.Constants.Type.front) {
      await this.setState({typeCamera: RNCamera.Constants.Type.back});
    } else {
      await this.setState({typeCamera: RNCamera.Constants.Type.front});
    }
  };

  switchTorch = async () => {
    if (this.state.torch === RNCamera.Constants.FlashMode.off) {
      await this.setState({torch: RNCamera.Constants.FlashMode.torch});
    } else {
      await this.setState({torch: RNCamera.Constants.FlashMode.off});
    }
  };

  validateNumbers = () => {
    const {temp, pressure, humidity, latitude, longitude} = this.state;
    if (isNaN(latitude))
      return {success: false, error: 'Value latitude is invalid number'};
    if (isNaN(longitude))
      return {success: false, error: 'Value longitude is invalid number'};
    if (isNaN(pressure))
      return {success: false, error: 'Value pressure is invalid number'};
    if (isNaN(humidity))
      return {success: false, error: 'Value humidity is invalid number'};
    if (isNaN(temp))
      return {success: false, error: 'Value temp is invalid number'};
    return {success: true};
  };

  saveVideo = () => {
    const isValid = this.validateNumbers();
    if (!isValid.success) {
      Alert.alert('Alert', isValid.error);
      return;
    }
    const {
      id,
      tagsSelected,
      file,
      thumbnail,
      temp,
      pressure,
      humidity,
      latitude,
      longitude,
      units,
      state,
      country,
      city,
      direction,
    } = this.state;
    const time = new Date().getTime();
    const data = {
      id,
      tags: tagsSelected,
      video_path: file || '',
      thumbnail_path: thumbnail.path || '',
      units: units || '',
      temp: +(temp || 0),
      pressure: +(pressure || 0),
      humidity: +(humidity || 0),
      latitude: +(latitude || 0),
      longitude: +(longitude || 0),
      state: state || '',
      country: country || '',
      city: city || '',
      direction: direction || 1,
      createdAt: time,
    };
    this.db.addMemory(data);
    tagsSelected.forEach(i => {
      this.db.addTag(i);
    });
    this.setState({modalVisible: false});
    const reload = this.props.navigation.getParam('reload', {});
    reload();
  };

  convertMetricTemp = units => {
    const {temp, tempBase} = this.state;
    if (units) {
      var calc = '';
      if (units === 'Metric') {
        if (temp != tempBase) {
          calc = (temp - 32) * (5 / 9);
        } else {
          calc = temp;
        }
      } else if (units === 'Imperial') {
        calc = temp * (9 / 5) + 32;
      }
      this.setState({units, temp: `${calc}`});
    } else {
      this.setState({units, temp: tempBase});
    }
  };

  render() {
    const {
      recording,
      camera,
      typeCamera,
      torch,
      modalVisible,
      tagsSelected,
      tags,
      temp,
      pressure,
      humidity,
      latitude,
      longitude,
      units,
      state,
      country,
      city,
    } = this.state;
    return (
      <View>
        {camera ? (
          <View>
            <Modal
              animationType="slide"
              transparent={false}
              visible={modalVisible}
              onRequestClose={() => this.setState({modalVisible: false})}>
              <KeyboardAwareScrollView style={{flex: 1, padding: 10}}>
                <View style={styles.inputContainer}>
                  <Text>Latitude</Text>
                  <TextInput
                    ref={ref => (this.inputLatitude = ref)}
                    style={styles.input}
                    value={latitude}
                    keyboardType="numeric"
                    onSubmitEditing={() => this.inputLongitude.focus()}
                    placeholder="Latitude"
                    onChangeText={latitude => this.setState({latitude})}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text>Longitude</Text>
                  <TextInput
                    ref={ref => (this.inputLongitude = ref)}
                    style={styles.input}
                    value={longitude}
                    keyboardType="numeric"
                    onSubmitEditing={() => this.inputPressure.focus()}
                    placeholder="Longitude"
                    onChangeText={longitude => this.setState({longitude})}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text>Pressure</Text>
                  <TextInput
                    ref={ref => (this.inputPressure = ref)}
                    style={styles.input}
                    value={pressure}
                    keyboardType="numeric"
                    onSubmitEditing={() => this.inputHumidity.focus()}
                    placeholder="Pressure"
                    onChangeText={pressure => this.setState({pressure})}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text>Humidity</Text>
                  <TextInput
                    ref={ref => (this.inputHumidity = ref)}
                    style={styles.input}
                    value={humidity}
                    keyboardType="numeric"
                    onSubmitEditing={() => this.inputTemp.focus()}
                    placeholder="Humidity"
                    onChangeText={humidity => this.setState({humidity})}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text>Temperature</Text>
                  <TextInput
                    ref={ref => (this.inputTemp = ref)}
                    style={styles.input}
                    value={temp}
                    keyboardType="numeric"
                    onSubmitEditing={() => this.inputLatitude.focus()}
                    placeholder="Temperature"
                    onChangeText={temp => this.setState({temp})}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text>Units</Text>
                  <RNPickerSelect
                    value={units}
                    onValueChange={this.convertMetricTemp}
                    items={[
                      {label: 'Metric', value: 'Metric'},
                      {label: 'Imperial', value: 'Imperial'},
                    ]}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text>Tags</Text>
                  <AutoCompleteTags
                    placeholder="Add tags"
                    data={tags}
                    onCustomTagCreated
                    onChange={tagsSelected => this.setState({tagsSelected})}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text>Country</Text>
                  <TextInput
                    ref={ref => (this.inputCountry = ref)}
                    style={styles.input}
                    value={country}
                    onSubmitEditing={() => this.inputState.focus()}
                    placeholder="Country"
                    onChangeText={country => this.setState({country})}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text>State</Text>
                  <TextInput
                    ref={ref => (this.inputState = ref)}
                    style={styles.input}
                    value={state}
                    onSubmitEditing={() => this.inputCity.focus()}
                    placeholder="State"
                    onChangeText={state => this.setState({state})}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text>City</Text>
                  <TextInput
                    ref={ref => (this.inputCity = ref)}
                    style={styles.input}
                    value={city}
                    placeholder="City"
                    onChangeText={city => this.setState({city})}
                  />
                </View>
                <View style={{marginTop: 20, marginBottom: 20}}>
                  <Button title="Save" onPress={this.saveVideo} />
                  <Button title="Share" onPress={this.shareVideo} />
                  <Button
                    title="Cancel"
                    onPress={() => this.setState({modalVisible: false})}
                  />
                </View>
              </KeyboardAwareScrollView>
            </Modal>
            <RNCamera
              ref={ref => (this.camera = ref)}
              androidCameraPermissionOptions={{
                title: 'Permission to use camera',
                message: 'We need your permission to use your camera',
                buttonPositive: 'Ok',
                buttonNegative: 'Cancel',
              }}
              androidRecordAudioPermissionOptions={{
                title: 'Permission to use audio recording',
                message: 'We need your permission to use your audio',
                buttonPositive: 'Ok',
                buttonNegative: 'Cancel',
              }}
              captureAudio
              flashMode={torch}
              style={{width: '100%', height: '100%'}}
              type={typeCamera}
            />
            <View style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
              {recording ? (
                <Button
                  title="Stop"
                  onPress={() => {
                    this.stopRecord();
                  }}
                />
              ) : (
                <Button title="Start" onPress={this.startRecord} />
              )}
              <Button
                title="Switch Camera"
                disabled={recording}
                onPress={this.switchCamera}
              />
              <Button title="Torch" onPress={this.switchTorch} />
            </View>
          </View>
        ) : (
          <Text>Camera permissions not granted</Text>
        )}
      </View>
    );
  }
}
