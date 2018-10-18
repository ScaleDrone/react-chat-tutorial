import {Component} from "react"
import React from "react"

class Messages extends Component {
  render() {
    const renderedMessages = this.props.messages.map(this.renderMessage)
    return (
      <ul className={"Messages-list"}>
        {renderedMessages}
      </ul>
    )
  }

  renderMessage = (message) => {
    const isCurrentMember = message.member.id === this.props.memberID
    const className = isCurrentMember ?
      "Messages-message currentMember" : "Messages-message"
    return (
      <li className={className}>
      <span
        className={"avatar"}
        style={{backgroundColor: message.member.color}}
      />
        <div className={"Message-content"}>
        <span className={"username"}>
          {message.member.username}
        </span>
          <p>
            {message.text}
          </p>
        </div>
      </li>
    )
  }
}

export default Messages