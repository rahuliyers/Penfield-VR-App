import React from 'react';
import {StyleSheet, View, StatusBar, Platform} from 'react-native';
import {withNavigation} from 'react-navigation';
import {ViroVRSceneNavigator, ViroScene, ViroVideo, ViroCamera} from 'react-viro';
import Orientation from 'react-native-orientation';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: 'black',
  },
});

class PlayerScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    if (Platform.OS === 'ios') {
      Orientation.lockToLandscapeRight();
    }
  }

  componentWillUnmount() {
    if (Platform.OS === 'ios') {
      Orientation.lockToPortrait();
    }
  }

  render() {
    const item = this.props.navigation.getParam('item', {});
    const {video_path, direction} = item;
    const file = Platform.select({
      android: `file://${video_path}`,
      ios: video_path,
    });
    let rotation = 0;
    switch (direction) {
      case 1:
        rotation = 90;
        break;
      case 2:
        rotation = 270;
        break;
      case 3:
        rotation = 0;
        break;
      case 4:
        rotation = 180;
        break;
    }
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ViroVRSceneNavigator
          apiKey={'52096231-2499-4469-B50F-476D4DE0E814'}
          vrModeEnabled={true}
          onExitViro={() => {
            this.props.navigation.goBack();
          }}
          initialScene={{
            scene: () => (
              <ViroScene reticleEnabled={true}>
                <ViroCamera
                   position={[0, 0, 0]}
                   rotation={[0, 0, rotation]}
                   active={true}
                 />
                <ViroVideo
                  source={{uri: file}}
                  volume={1.0}
                  position={[0, 0, -8]}
                  scale={[16, 9, 1]}
                  loop={true}
                  paused={false}
                />
              </ViroScene>
            ),
          }}
        />
      </View>
    );
  }
}

export default withNavigation(PlayerScreen);
