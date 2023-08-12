import React from "react";

export default function({members}) {
  const names = members.map(m => m.clientData.username);
  if (names.length === 0) {
    return <div className="typing-indicator"></div>;
  }
  if (names.length === 1) {
    return <div className="typing-indicator">{names[0]} is typing</div>;
  }
  const string = names.slice(0, -1).join(', ') + ' and ' + names.slice(-1);
  return <div className="typing-indicator">{string} are typing</div>;
}