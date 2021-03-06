import React, { Component } from "react";
import { connect } from "react-redux";
import { GiftedChat } from "react-native-gifted-chat";
import Dialog from "react-native-dialog";
import StyleSheet from "react-native";

import {
  clearMessages,
  sendMessage,
  setMatchId,
  reconnectToWebSocket,
} from "../actions/conversation.actions";
import { Header, Body, Title, Left, Button, Icon } from "native-base";

class Conversation extends Component {
  static navigationOptions = {
    header: null,
  }

  constructor(props) {
    super(props);

    const { match_id } = this.props.navigation.state.params;
    this.props.setMatchId(match_id);

    this.state = {
      showDialog: false,
      matcher: match_id
    }

    this.delayTimeout;
  }

  componentDidUpdate = prevProps => {
    // Throttles the first show dialog so that the reconnect
    // dialog doesn't suddenly appear and disappear (flash) on loading
    // this screen.
    const lastShowDialogRequest = !prevProps.connectedToWebSocket;
    const showDialogRequest = !this.props.connectedToWebSocket;
    if (!this.state.showDialog && showDialogRequest) {
      this.delayTimeout = setTimeout(() => {
        this.setState({
          showDialog: true,
        });
      }, 3000);
    } else if (lastShowDialogRequest && !showDialogRequest) {
      clearTimeout(this.delayTimeout);
      this.setState({
        showDialog: false,
      });
    }
  }

  shouldShowDialog = () => {
  }

  onSend = messages => {
    const { user_id } = this.props;
    const { to_id, match_id } = this.props.navigation.state.params;
    console.log(messages);
    const message = messages[0];
    this.props.sendMessage({
      match_id,
      from_id: user_id,
      to_id,
      message_body: message.text,
    });
  };

  handleReconnect = () => {
    this.props.reconnectToWebSocket();
  };

  handleBackPress = () => {
    this.props.navigation.goBack();
  }

  deleteRow() {
   this.handle()
   this.props.clearMessages()
    this.handleBackPress();
  }

  handle() {
    console.log("handling")

    var list = [];

    const { manifest } = Expo.Constants;
    const api = (typeof manifest.packagerOpts === `object`) && manifest.packagerOpts.dev
      ? manifest.debuggerHost.split(`:`).shift().concat(`:8000`)
      : `api.example.com`;
    console.log(api);
    // TODO: change to actual userid
    fetch('http://' + api + '/user/message/all/' + this.state.matcher, {
      method: 'DELETE'
    })
      .then((response) => response.json())
      .then((responseJson) => {
        //TO DO: add mentors name and skills in array
        console.log(responseJson)
        console.log("deleted")
      })
      .catch((error) => {
        console.log("error is: " + error);
      });
  }

  render() {
    const {
      user_id,
      first_name,
      last_name,
      messages,
    } = this.props;
    const { otherUser } = this.props.navigation.state.params;
    const currUserName = `${first_name} ${last_name}`;
    const otherUserName = `${otherUser.first_name} ${otherUser.last_name}`;

    const giftedChatMessages = messages.map(message => ({
      _id: message.message_id,
      text: message.message_body,
      createdAt: message.timestamp,
      user: {
        _id: message.from_id,
        name: message.from_id === user_id ? currUserName : otherUserName,
        avatar: otherUser.profile_pic_URL,
      },
    }));

    return (
      <React.Fragment>
        <Header>
          <Left>
            <Button transparent onPress={this.handleBackPress}>
              <Icon name="md-arrow-round-back" />
            </Button>
          </Left>
          <Body>
            <Title>{otherUserName}</Title>
          </Body>
          <Button transparent onPress={_ => this.deleteRow()}>
                <Icon name="trash" />
          </Button>}
        </Header>
        <Dialog.Container visible={this.state.showDialog}>
          <Dialog.Title>Disconnected</Dialog.Title>
          <Dialog.Button label="Reconnect" onPress={this.handleReconnect} />
        </Dialog.Container>
        <GiftedChat
          messages={giftedChatMessages}
          onSend={this.onSend}
          user={{
            _id: user_id,
          }}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  ...state.user,
  messages: state.conversation.messages,
  connectedToWebSocket: state.conversation.connectedToWebSocket,
});

export default connect(
  mapStateToProps,
  {
    clearMessages,
    sendMessage,
    setMatchId,
    reconnectToWebSocket,
  }
)(Conversation);