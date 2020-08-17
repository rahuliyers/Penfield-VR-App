import React from 'react';
import {
  StatusBar,
  Button,
  TouchableOpacity,
  Text,
  FlatList,
  Image,
  Platform,
  View,
  Vibration,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import IconM from 'react-native-vector-icons/MaterialCommunityIcons';
import Orientation from 'react-native-orientation';
import ModalSelector from 'react-native-modal-selector';
import Geolocation from '../utils/Geolocation';
import Weather from '../utils/Weather';
import Database from '../utils/Database';
import Permission from '../utils/Permission';
import Storage from '../utils/Storage';
import ShareVideo from '../utils/ShareVideo';
import {AutoCompleteTags} from '../components/AutoCompleteTags';

Number.prototype.padLeft = function(base, chr) {
  var len = String(base || 10).length - String(this).length + 1;
  return len > 0 ? new Array(len).join(chr || '0') + this : this;
};

export default class List extends React.Component {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      title: 'List',
      headerLeft: (
        <Icon
          style={{padding: 15}}
          name="bars"
          size={25}
          color="#000"
          onPress={navigation.toggleDrawer}
        />
      ),
      headerRight: (
        <IconM
          style={{padding: 15}}
          name="export-variant"
          size={25}
          color="#000"
          onPress={params.showModal}
        />
      ),
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      location: {},
      weather: {},
      memories: [],
      tags: [],
      tagsSelected: [],
      query: '',
      sort: 'desc',
      isEditing: false,
      itemSelected: null,
      exportModal: false,
    };
    this.db = new Database();
  }

  async componentDidMount() {
    if (Platform.OS === 'ios') {
      Orientation.lockToPortrait();
    }
    this.checkPermissionLocation();
    this.loadMemory();
    this.props.navigation.setParams({
      showModal: this.showModal,
    });
  }

  loadMemory = () => {
    const crudMemories = this.db.getMemories();
    const memories = Object.keys(crudMemories).map(key => crudMemories[key]);
    const tags = this.db.getTags();
    const proccesed = Object.keys(tags).map(key => tags[key].text);
    proccesed.push('All');
    this.setState({
      memories,
      isEditing: false,
      itemSelected: null,
      tags: proccesed,
    });
  };

  checkPermissionMemory = async () => {
    if (Platform.OS === 'ios') {
      const storage = await Permission.checkPermission('PHOTO_LIBRARY');
      if (!storage) {
        await Permission.requestPermission('PHOTO_LIBRARY');
      }
    } else {
      const write = await Permission.checkPermission('WRITE_EXTERNAL_STORAGE');
      if (!write) {
        await Permission.requestPermission('WRITE_EXTERNAL_STORAGE');
      }
      const read = await Permission.checkPermission('READ_EXTERNAL_STORAGE');
      if (!read) {
        await Permission.requestPermission('READ_EXTERNAL_STORAGE');
      }
    }
    Storage.initFolderApp();
  };

  checkPermissionLocation = async () => {
    const permission =
      Platform.OS === 'ios' ? 'LOCATION_ALWAYS' : 'ACCESS_FINE_LOCATION';
    const result = await Permission.checkPermission(permission);
    if (!result) {
      const location = await Permission.requestPermission(permission);
      if (location || Platform.OS === 'ios') {
        this.getLocation();
      }
    } else {
      this.getLocation();
    }
    this.checkPermissionMemory();
  };

  getLocation = async () => {
    const loc = await Geolocation.getLocation();
    const {latitude, longitude} = loc.coords;
    const weather = await Weather.getWeather(latitude, longitude);
    this.setState({weather, location: {latitude, longitude}});
  };

  showModal = () => {
    this.setState({exportModal: true, itemSelected: null, isEditing: false});
  };

  onCancel = () => {
    this.setState({isEditing: false, itemSelected: null});
  };

  onDelete = () => {
    Alert.alert(
      'Alert',
      'Delete video?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {text: 'OK', onPress: this.deleteItem},
      ],
      {cancelable: false},
    );
  };

  deleteItem = () => {
    try {
      const {itemSelected} = this.state;
      Storage.deleteFile(`file://${itemSelected.video_path}`);
      Storage.deleteFile(itemSelected.thumbnail_path);
      this.db.deleteMemory(itemSelected.id);
      this.loadMemory();
    } catch (error) {
      console.log('error', error);
    }
  };

  onEdit = () => {
    const {itemSelected} = this.state;
    const {
      navigation: {navigate},
    } = this.props;
    navigate('Edit', {item: itemSelected, reload: this.loadMemory});
  };

  onExportVideo = () => {
    if (this.state.itemSelected) {
      ShareVideo.share(this.state.itemSelected.video_path);
    }
  };

  onExportAll = format => {
    if (this.state.itemSelected) {
      ShareVideo.shareBlob(this.state.itemSelected, format);
    } else {
      ShareVideo.shareBlob(this.state.memories, format);
    }
  };

  keyExtractor = (item, index) => item.id;

  onPressItem = item => {
    if (this.state.isEditing) {
      this.onCancel();
    } else {
      this.props.navigation.navigate('Player', {item});
    }
  };

  onLongPressItem = item => {
    if (this.state.isEditing) {
      this.onCancel();
    } else {
      this.setState({isEditing: true, itemSelected: item}, () =>
        Vibration.vibrate(100),
      );
    }
  };

  parseDate = datetime => {
    const date = new Date(datetime);
    const dateF = [
      (date.getMonth() + 1).padLeft(),
      date.getDate().padLeft(),
      date.getFullYear(),
    ].join('/');
    const time = [
      date.getHours().padLeft(),
      date.getMinutes().padLeft(),
      date.getSeconds().padLeft(),
    ].join(':');
    return `${dateF} ${time}`;
  };

  renderItem = ({item}) => (
    <TouchableOpacity
      style={{flexDirection: 'row', marginBottom: 10}}
      onLongPress={() => this.onLongPressItem(item)}
      onPress={() => this.onPressItem(item)}>
      <Image
        source={{uri: item.thumbnail_path}}
        resizeMode="cover"
        style={{width: '33%', height: 'auto'}}
      />
      <View style={{width: '67%', padding: 10}}>
        {/* <Text>Video path: {item.video_path}</Text>
        <Text>Thumbnail path: {item.thumbnail_path}</Text> */}
        <Text>Date: {this.parseDate(item.createdAt)}</Text>
        {item.latitude ? <Text>Latitude: {item.latitude}</Text> : null}
        {item.longitude ? <Text>Longitude: {item.longitude}</Text> : null}
        {item.units ? <Text>Units: {item.units}</Text> : null}
        {item.temp ? <Text>Temperature: {item.temp}</Text> : null}
        {item.pressure ? <Text>Pressure: {item.pressure}</Text> : null}
        {item.humidity ? <Text>Humidity: {item.humidity}</Text> : null}
        {item.state ? <Text>State: {item.state}</Text> : null}
        {item.city ? <Text>City: {item.city}</Text> : null}
        {item.contry ? <Text>Country: {item.contry}</Text> : null}
        {Object.keys(item.tags).length ? (
          <View>
            <Text>Tags:</Text>
            <View style={{paddingLeft: 5, flexDirection: 'row'}}>
              {Object.keys(item.tags).map(e => (
                <Text style={{backgroundColor: '#ddd', marginRight: 5}}>{item.tags[e]}</Text>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  search = (selecteds = []) => {
    if (selecteds.length) {
      const filter = this.state.memories.filter(e => {
        const tags = Object.keys(e.tags).map(t => e.tags[t]);
        const filtered = tags.filter(f => {
          for (let index = 0; index < selecteds.length; index++) {
            const element = selecteds[index];
            if (f.toLocaleLowerCase().includes(element.toLocaleLowerCase())) {
              return f;
            }
          }
        });
        if (filtered.length) {
          return e;
        }
      });
      this.setState({memories: filter});
    } else {
      const crudMemories = this.db.getMemories();
      const memories = Object.keys(crudMemories).map(key => crudMemories[key]);
      this.setState({memories});
    }
  };

  sort = () => {
    this.setState(prevState => {
      if (prevState.sort === 'asc') {
        const memories = prevState.memories.sort(
          (a, b) => a.createdAt - b.createdAt,
        );
        return {sort: 'desc', memories};
      } else {
        const memories = prevState.memories.sort(
          (a, b) => b.createdAt - a.createdAt,
        );
        return {sort: 'asc', memories};
      }
    });
  };

  renderEdit = isEditing =>
    isEditing && (
      <View
        style={{
          width: '100%',
          height: 50,
          backgroundColor: '#329AF0',
          flexDirection: 'row',
        }}>
        <View style={{width: '50%', justifyContent: 'flex-start'}}>
          <TouchableOpacity onPress={this.onCancel}>
            <Icon name="times" color="#fff" size={25} style={{padding: 10}} />
          </TouchableOpacity>
        </View>
        <View
          style={{
            width: '50%',
            flexDirection: 'row',
            justifyContent: 'flex-end',
          }}>
          <TouchableOpacity onPress={this.onDelete}>
            <Icon
              name="trash-alt"
              color="#fff"
              size={25}
              style={{padding: 10}}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={this.onEdit}>
            <Icon name="edit" color="#fff" size={25} style={{padding: 10}} />
          </TouchableOpacity>
          <TouchableOpacity onPress={this.onExportVideo}>
            <Icon
              name="file-video"
              color="#fff"
              size={25}
              style={{padding: 10}}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.setState({exportModal: true})}>
            <Icon
              name="file-code"
              color="#fff"
              size={25}
              style={{padding: 10}}
            />
          </TouchableOpacity>
        </View>
      </View>
    );

  render() {
    const {
      navigation: {navigate},
    } = this.props;
    const {sort, tags, tagsSelected, isEditing, memories} = this.state;
    const data = [
      {key: null, section: true, label: 'Export formats'},
      {key: 'xml', label: 'XML'},
      {key: 'json', label: 'JSON'},
    ];
    return (
      <View style={{flex: 1}}>
        <StatusBar barStyle="dark-content" />
        {this.renderEdit(isEditing)}
        <View style={{flexDirection: 'row'}}>
          <View style={{width: '90%', paddingLeft: 5}}>
            <AutoCompleteTags
              placeholder="Search by tags"
              data={tags}
              onChange={this.search}
            />
          </View>
          <Icon
            style={{padding: 15}}
            name={sort === 'asc' ? 'sort-up' : 'sort-down'}
            size={15}
            color="#000"
            onPress={this.sort}
          />
        </View>
        <View style={{flex: 1, padding: 5}}>
          <FlatList
            data={memories}
            extraData={this.state}
            keyExtractor={this.keyExtractor}
            renderItem={this.renderItem}
          />
        </View>
        <ModalSelector
          data={data}
          style={{width: 0, height: 0}}
          visible={this.state.exportModal}
          selectStyle={{borderColor: 'transparent'}}
          onModalClose={() => this.setState({exportModal: false})}
          onChange={option => this.onExportAll(option.key)}
        />
        <Button
          onPress={() => navigate('Record', {reload: this.loadMemory})}
          title="To Record"
        />
      </View>
    );
  }
}
