import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Messages from "./Messages"
import Input from "./Input"

const randomName = () => {
  const adjectives = ["autumn", "hidden", "bitter", "misty", "silent", "empty", "dry", "dark", "summer", "icy", "delicate", "quiet", "white", "cool", "spring", "winter", "patient", "twilight", "dawn", "crimson", "wispy", "weathered", "blue", "billowing", "broken", "cold", "damp", "falling", "frosty", "green", "long", "late", "lingering", "bold", "little", "morning", "muddy", "old", "red", "rough", "still", "small", "sparkling", "throbbing", "shy", "wandering", "withered", "wild", "black", "young", "holy", "solitary", "fragrant", "aged", "snowy", "proud", "floral", "restless", "divine", "polished", "ancient", "purple", "lively", "nameless"]
  const nouns = ["waterfall", "river", "breeze", "moon", "rain", "wind", "sea", "morning", "snow", "lake", "sunset", "pine", "shadow", "leaf", "dawn", "glitter", "forest", "hill", "cloud", "meadow", "sun", "glade", "bird", "brook", "butterfly", "bush", "dew", "dust", "field", "fire", "flower", "firefly", "feather", "grass", "haze", "mountain", "night", "pond", "darkness", "snowflake", "silence", "sound", "sky", "shape", "surf", "thunder", "violet", "water", "wildflower", "wave", "water", "resonance", "sun", "wood", "dream", "cherry", "tree", "fog", "frost", "voice", "paper", "frog", "smoke", "star"]
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  return adjective + noun
}

const randomColor = () => {
  return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16)
}

const randomID = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

class App extends Component {

  state = {
    messages: [],
    member: {
      username: randomName(),
      color: randomColor(),
      id: randomID()
    }
  }

  constructor() {
    super()
    this.drone = new window.Scaledrone("YOUR-CHANNEL-ID", {
      data: this.state.member
    })
    const room = this.drone.subscribe("observable-room")
    room.on('open', error => {
      if (error) {
        return console.error(error)
      }
      console.log("Connected!")
    })
    room.on('data', (data, member) => {
      const messages = this.state.messages
      messages.push({
        member: member.clientData,
        text: data
      })
      this.setState({messages: messages})
    })
  }

  render() {
    return (
      <div className="App">
        <div className={"App-header"}>
          <h1>My Chat App</h1>
        </div>
        <Messages
          messages={this.state.messages}
          memberID={this.state.member.id}
        />
        <Input
          onSendMessage={this.onSendMessage}
        />
      </div>
    )
  }

  onSendMessage = (message) => {
    this.drone.publish({
      room: "observable-room",
      message: message
    })
  }

}

export default App;
