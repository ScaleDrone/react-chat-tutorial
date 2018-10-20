import {Component} from "react";
import React from "react";

class Input extends Component {
  state = {
    text: ""
  }

  onChange = e => {
    this.setState({text: e.target.value});
  }

  onSubmit = e => {
    e.preventDefault();
    this.setState({text: ""});
    this.props.onSendMessage(this.state.text);
  }

  render() {
    return (
      <div className={"Input"}>
        <form onSubmit={this.onSubmit}>
          <input
            onChange={this.onChange}
            value={this.state.text}
            type={"text"}
          />
          <button>Send</button>
        </form>
      </div>
    );
  }
}

export default Input;