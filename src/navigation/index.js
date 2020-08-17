import {
  createAppContainer,
  createDrawerNavigator,
  createStackNavigator,
} from 'react-navigation';
import ListScreen from '../screens/ListScreen';
import EditScreen from '../screens/EditScreen';
import RecordScreen from '../screens/RecordScreen';
import PlayerScreen from '../screens/PlayerScreen';
import ConfigScreen from '../screens/ConfigScreen';

const videoNavigator = createStackNavigator(
  {
    List: {
      screen: ListScreen,
      navigationOptions: ({navigation}) => ({
        title: 'List',
      }),
    },
    Edit: {
      screen: EditScreen,
      navigationOptions: ({navigation}) => ({
        title: 'Edit',
      }),
    },
    Record: {
      screen: RecordScreen,
      navigationOptions: ({navigation}) => ({
        title: 'Record',
      }),
    },
    Player: {
      screen: PlayerScreen,
      navigationOptions: ({navigation}) => ({
        header: null,
      }),
    },
  },
  {
    initialRouteName: 'List',
  },
);

const ConfigNavigator = createStackNavigator(
  {
    Config: {
      screen: ConfigScreen,
    },
  },
  {
    initialRouteName: 'Config',
  },
);

const AppNavigator = createDrawerNavigator(
  {
    Gallery: videoNavigator,
    Config: ConfigNavigator,
  },
  {
    initialRouteName: 'Gallery',
  },
);

export default createAppContainer(AppNavigator);
