import * as React from 'react';
import {View, Button, Text, TextInput, StyleSheet, Alert} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import RNPickerSelect from 'react-native-picker-select';
import {AutoCompleteTags} from '../components/AutoCompleteTags';
import ShareVideo from '../utils/ShareVideo';
import Database from '../utils/Database';

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

export default class EditScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: '',
      units: 'Metric',
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
    this.loadData();
  }

  validateNumbers = () => {
    const {temp, pressure, humidity, latitude, longitude} = this.state;
    if (isNaN(latitude)) return {success: false, error: 'Value latitude is invalid number'};
    if (isNaN(longitude)) return {success: false, error: 'Value longitude is invalid number'};
    if (isNaN(pressure)) return {success: false, error: 'Value pressure is invalid number'};
    if (isNaN(humidity)) return {success: false, error: 'Value humidity is invalid number'};
    if (isNaN(temp)) return {success: false, error: 'Value temp is invalid number'};
    return {success: true};
  };

  loadData = async () => {
    const allTags = this.db.getTags();
    const proccesed = Object.keys(allTags).map(key => allTags[key].text);
    const item = this.props.navigation.getParam('item', {});
    const {
      id,
      temp,
      pressure,
      humidity,
      latitude,
      longitude,
      state,
      country,
      city,
      tags,
    } = item;
    this.setState({
      id,
      tagsSelected: tags,
      tags: proccesed,
      temp: `${temp}`,
      tempBase: `${temp}`,
      pressure: `${pressure}`,
      humidity: `${humidity}`,
      latitude: `${latitude}`,
      longitude: `${longitude}`,
      state,
      country,
      city,
    });
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
    const data = {
      id,
      tags: tagsSelected,
      units: units || '',
      temp: +(temp || 0),
      pressure: +(pressure || 0),
      humidity: +(humidity || 0),
      latitude: +(latitude || 0),
      longitude: +(longitude || 0),
      state: state || '',
      country: country || '',
      city: city || '',
    };
    this.db.addMemory(data, true);
    tagsSelected.forEach(i => {
      this.db.addTag(i);
    });
    this.setState({modalVisible: false});
    const reload = this.props.navigation.getParam('reload', {});
    reload();
    this.props.navigation.goBack();
  };

  shareVideo = () => {
    ShareVideo.share(this.state.file);
  };

  convertMetricTemp = units => {
    const {temp, tempBase} = this.state;
    if (units && temp != '') {
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
      this.setState({units, temp: ''});
    }
  };

  render() {
    const {
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
      <View style={{flex: 1}}>
        <KeyboardAwareScrollView style={{flex: 1, padding: 20}}>
          <View style={styles.inputContainer}>
            <Text>Latitude</Text>
            <TextInput
              ref={ref => (this.inputLatitude = ref)}
              autoFocus={true}
              style={styles.input}
              value={latitude}
              keyboardType="numeric"
              returnKeyType="done"
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
              returnKeyType="done"
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
              returnKeyType="done"
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
              returnKeyType="done"
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
              returnKeyType="done"
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
              placeholder="Edit tags"
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
          </View>
        </KeyboardAwareScrollView>
      </View>
    );
  }
}
