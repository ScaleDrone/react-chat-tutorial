import {useEffect, useRef} from "react";
import React from "react";

export default function Messages({messages, me}) {
  const bottomRef = useRef(null);
  useEffect(() => {
    if (bottomRef && bottomRef.current) {
      bottomRef.current.scrollIntoView({behavior: 'smooth'});
    }
  });
  return (
    <ul className="Messages-list">
      {messages.map(m => Message(m, me))}
      <div ref={bottomRef}></div>
    </ul>
  );
}

function Message({member, data, id}, me) {
  const {username, color} = member.clientData;
  const messageFromMe = member.id === me.id;
  const className = messageFromMe ?
    "Messages-message currentMember" : "Messages-message";
  return (
    <li key={id} className={className}>
      <span
        className="avatar"
        style={{backgroundColor: color}}
      />
      <div className="Message-content">
        <div className="username">
          {username}
        </div>
        <div className="text">{data}</div>
      </div>
    </li>
  );
}