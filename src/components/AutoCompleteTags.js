import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import _ from 'lodash';

const styles = StyleSheet.create({
  body: {
    zIndex: 2,
  },
  combo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    padding: 5,
    paddingLeft: 0,
    borderBottomColor: 'lightgray',
    borderBottomWidth: 1,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 5,
  },
  itemSelected: {
    backgroundColor: '#ddd',
    flexDirection: 'row',
    padding: 5,
  },
  scrollView: {
    borderColor: 'lightgray',
    backgroundColor: '#FFF',
    borderWidth: 1,
    height: 130,
    marginTop: 10,
  },
});

export class AutoCompleteTags extends Component {
  constructor(props) {
    super(props);
    this.state = {
      itemsSelected: [],
      results: [],
      open: false,
      text: '',
    };
    this.onChangeTextDelayed = _.debounce(this.search, 500);
  }

  onOpen = () => {
    const {open} = this.state;
    this.refSelect.measure((fx, fy, width, height, px, py) => {
      this.setState({
        position: {
          left: px + fx,
          top: py + fy + height - 5,
          width,
        },
      });
    });
    this.setState({open: !open});
  };

  renderItems = (data, active) => {
    const {itemsSelected} = this.state;
    return data.map(item => {
      const find = itemsSelected.find(e => e === item);
      if (find === -1) return;
      return (
        <TouchableWithoutFeedback
          style={{height: 40, width: '100%'}}
          key={item}
          onPress={() => {
            this.onSelectedItem(item);
          }}>
          <View style={styles.item}>
            <Text>{item}</Text>
          </View>
        </TouchableWithoutFeedback>
      );
    });
  };

  renderItemsSelecteds = data => {
    return data.map(item => {
      return (
        <TouchableWithoutFeedback
          style={{width: 'auto', height: 'auto'}}
          key={item}
          onPress={() => {
            this.onDeleteItem(item);
          }}>
          <Text style={styles.itemSelected}>{item}</Text>
        </TouchableWithoutFeedback>
      );
    });
  };

  onDeleteItem = item => {
    const {itemsSelected} = this.state;
    const {onChange} = this.props;
    const find = itemsSelected.findIndex(e => e === item);
    if (find !== -1) {
      itemsSelected.splice(find, 1);
      this.setState({itemsSelected, text: ''});
      onChange(itemsSelected);
    }
  };

  onSelectedItem = item => {
    const {itemsSelected} = this.state;
    const {onChange} = this.props;
    let selected = [...itemsSelected, item];
    const find = itemsSelected.findIndex(e => e === item);
    if (find !== -1) {
      itemsSelected.splice(find, 1);
      selected = itemsSelected;
    }
    this.setState({itemsSelected: selected, text: '', open: false});
    onChange(selected);
  };

  search = () => {
    const {text, itemsSelected} = this.state;
    if (text === '') return;
    const {data} = this.props;
    const finded = data.filter(e => {
      if (
        e.toLocaleLowerCase().includes(text.toLocaleLowerCase()) &&
        !itemsSelected.includes(e)
      ) {
        return e;
      }
    });
    if (finded && finded.length) {
      this.setState({results: finded}, this.onOpen);
    }
  };

  render() {
    const {results, open, position, text, itemsSelected} = this.state;
    const {placeholder, onChange, onCustomTagCreated} = this.props;
    return (
      <View ref={ref => (this.refSelect = ref)} style={styles.body}>
        <ScrollView
          style={{flexWrap: 'wrap'}}
          contentContainerStyle={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
          }}>
          {this.renderItemsSelecteds(itemsSelected)}
        </ScrollView>
        <View style={styles.combo}>
          <TextInput
            ref={ref => (this.input = ref)}
            value={text}
            defaultValue={text}
            returnKeyType="done"
            style={{height: 35, width: '100%'}}
            placeholder={placeholder}
            onChangeText={text => {
              if (onCustomTagCreated) {
                if (text.charAt(text.length - 1) === ' ') {
                  this.setState(
                    {
                      itemsSelected: [...itemsSelected, text.trim()],
                      text: '',
                    },
                    () => onChange([...itemsSelected, text.trim()]),
                  );
                  return;
                }
              }

              this.setState({text}, this.onChangeTextDelayed);
            }}
            onBlur={() => {
              if (onCustomTagCreated) {
                if (text !== '') {
                  this.setState(
                    {
                      itemsSelected: [...itemsSelected, text.trim()],
                      text: '',
                    },
                    () => onChange([...itemsSelected, text.trim()]),
                  );
                }
              }
            }}
            onKeyPress={({nativeEvent}) => {
              if (
                nativeEvent.key === 'Backspace' &&
                text.trim() === '' &&
                itemsSelected.length
              ) {
                itemsSelected.pop();
                this.setState({itemsSelected}, () => onChange(itemsSelected));
              }
            }}
          />
        </View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={open}
          onDismiss={() => this.setState({open: false})}>
          <TouchableWithoutFeedback onPress={this.onOpen}>
            <View style={{flex: 1}}>
              <View style={[styles.scrollView, position]}>
                <ScrollView>{this.renderItems(results)}</ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    );
  }
}
