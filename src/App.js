import React, { Component } from 'react';
import './App.css';
import Messages from "./Messages";
import Input from "./Input";
import Members from './Members';
import TypingIndicator from './TypingIndicator';

function randomName() {
  const adjectives = [
    "autumn", "hidden", "bitter", "misty", "silent", "empty", "dry", "dark",
    "summer", "icy", "delicate", "quiet", "white", "cool", "spring", "winter",
    "patient", "twilight", "dawn", "crimson", "wispy", "weathered", "blue",
    "billowing", "broken", "cold", "damp", "falling", "frosty", "green", "long",
    "late", "lingering", "bold", "little", "morning", "muddy", "old", "red",
    "rough", "still", "small", "sparkling", "throbbing", "shy", "wandering",
    "withered", "wild", "black", "young", "holy", "solitary", "fragrant",
    "aged", "snowy", "proud", "floral", "restless", "divine", "polished",
    "ancient", "purple", "lively", "nameless"
  ];
  const nouns = [
    "waterfall", "river", "breeze", "moon", "rain", "wind", "sea", "morning",
    "snow", "lake", "sunset", "pine", "shadow", "leaf", "dawn", "glitter",
    "forest", "hill", "cloud", "meadow", "sun", "glade", "bird", "brook",
    "butterfly", "bush", "dew", "dust", "field", "fire", "flower", "firefly",
    "feather", "grass", "haze", "mountain", "night", "pond", "darkness",
    "snowflake", "silence", "sound", "sky", "shape", "surf", "thunder",
    "violet", "water", "wildflower", "wave", "water", "resonance", "sun",
    "wood", "dream", "cherry", "tree", "fog", "frost", "voice", "paper", "frog",
    "smoke", "star"
  ];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return adjective + noun;
}

function randomColor() {
  return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16);
}

class App extends Component {
  state = {
    messages: [],
    members: [],
    me: {
      username: randomName(),
      color: randomColor(),
    }
  }

  constructor() {
    super();
    this.drone = new window.Scaledrone("2BTUVPCEfgPxCuFz", {
      data: this.state.me
    });
    this.drone.on('open', error => {
      if (error) {
        return console.error(error);
      }
      const me = {...this.state.me};
      me.id = this.drone.clientId;
      this.setState({me});
    });
    const room = this.drone.subscribe("observable-room");
    room.on('message', message => {
      const {data, member} = message;
      if (typeof data === 'object' && typeof data.typing === 'boolean') {
        const members = [...this.state.members];
        const m = members.find(m => m.id === member.id);
        m.typing = data.typing;
        this.setState({members});
      } else {
        const messages = [...this.state.messages];
        messages.push(message);
        this.setState({messages});  
      }
    });
    room.on('members', members => {
      this.setState({members});
    });
    room.on('member_join', member => {
      const {members} = this.state;
      this.setState({members: [...members, member]});
    });
    room.on('member_leave', ({id}) => {
      const members = [...this.state.members];
      const index = members.findIndex(m => m.id === id);
      members.splice(index, 1);
      this.setState({members});
    });
  }

  render() {
    const {members, messages, me} = this.state;
    return (
      <div className="App">
        <div className="App-content">
          <Members members={members} me={me}/>
          <Messages messages={messages} me={me}/>
          <TypingIndicator members={members.filter(m => m.typing && m.id !== me.id)}/>
          <Input
            onSendMessage={this.onSendMessage}
            onChangeTypingState={this.onChangeTypingState}
          />
          <a className="upsell" href="https://www.scaledrone.com/blog/tutorial-build-a-reactjs-chat-app/">Real-time React chat using Scaledrone. See full tutorial →</a>
        </div>
      </div>
    );
  }

  onSendMessage = (message) => {
    this.drone.publish({
      room: "observable-room",
      message
    });
  }

  onChangeTypingState = isTyping => {
    this.drone.publish({
      room: "observable-room",
      message: {typing: isTyping},
    });
  }
}

export default App;
