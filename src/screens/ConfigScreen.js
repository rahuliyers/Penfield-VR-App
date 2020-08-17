import React from 'react';
import {View, Button, Text, TextInput, StyleSheet, Alert} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Database from '../utils/Database';
import Base from '../utils/Base';

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

export default class ConfigScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      title: 'Config',
      headerLeft: (
        <Icon
          style={{padding: 15}}
          name="bars"
          size={25}
          color="#000"
          onPress={navigation.toggleDrawer}
        />
      ),
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      id: null,
      urlStart: '',
      urlStop: '',
      uuid: '',
      major: '',
      minor: '',
    };
    this.db = new Database();
  }

  componentDidMount() {
    this.preload();
  }

  preload = () => {
    const config = this.db.getConfig();
    if (config.id) {
      this.setState({
        urlStart: config.urlStart,
        urlStop: config.urlStop,
        uuid: config.uuid,
        major: config.major.toString(),
        minor: config.minor.toString(),
        id: config.id,
      });
    }
  };

  saveConfig = () => {
    const {id, urlStart, urlStop, uuid, major, minor} = this.state;
    if (urlStart.trim() !== '' && !Base.validURL(urlStart)) {
      Alert.alert('Alert', 'URL Start invalid');
      return;
    }
    if (urlStop.trim() !== '' && !Base.validURL(urlStop)) {
      Alert.alert('Alert', 'URL Stop invalid');
      return;
    }
    if (id) {
      this.db.addConfig(
        {id, urlStart, urlStop, uuid, major: +major, minor: +minor},
        true,
      );
    } else {
      const newId = Base.uuidv4();
      this.db.addConfig({
        id: newId,
        urlStart,
        urlStop,
        uuid,
        major: +major,
        minor: +minor,
      });
      this.preload();
    }
    Alert.alert('Alert', 'Data saved');
  };

  render() {
    const {uuid, major, minor, urlStart, urlStop} = this.state;
    return (
      <View style={{flex: 1}}>
        <KeyboardAwareScrollView style={{flex: 1, padding: 20}}>
          <View style={styles.inputContainer}>
            <Text>URL Start</Text>
            <TextInput
              style={styles.input}
              value={urlStart}
              onSubmitEditing={() => this.inputStop.focus()}
              returnKeyType="done"
              placeholder="URL Start"
              onChangeText={urlStart => this.setState({urlStart})}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text>URL Stop</Text>
            <TextInput
              ref={ref => (this.inputStop = ref)}
              style={styles.input}
              value={urlStop}
              onSubmitEditing={() => this.inputUUID.focus()}
              returnKeyType="done"
              placeholder="URL Stop"
              onChangeText={urlStop => this.setState({urlStop})}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text>UUID</Text>
            <TextInput
              ref={ref => (this.inputUUID = ref)}
              style={styles.input}
              value={uuid}
              onSubmitEditing={() => this.inputMajor.focus()}
              placeholder="UUID"
              onChangeText={uuid => this.setState({uuid})}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text>Major</Text>
            <TextInput
              ref={ref => (this.inputMajor = ref)}
              style={styles.input}
              value={major}
              onSubmitEditing={() => this.inputMinor.focus()}
              placeholder="0"
              onChangeText={major => this.setState({major})}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text>minor</Text>
            <TextInput
              ref={ref => (this.inputMinor = ref)}
              style={styles.input}
              value={minor}
              onSubmitEditing={this.saveConfig}
              placeholder="0"
              onChangeText={minor => this.setState({minor})}
            />
          </View>
          <View style={{marginTop: 20, marginBottom: 20}}>
            <Button title="Save" onPress={this.saveConfig} />
          </View>
        </KeyboardAwareScrollView>
      </View>
    );
  }
}
