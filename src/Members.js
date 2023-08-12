import React from "react";

export default function Members({members, me}) {
  return (
    <div className="Members">
      <div className="Members-count">
        {members.length} user{members.length === 1 ? '' : 's'} online
      </div>
      <div className="Members-list">
        {members.map(m => Member(m, m.id === me.id))}
      </div>
    </div>);
}

function Member({id, clientData}, isMe) {
  const {username, color} = clientData;
  return (
    <div key={id} className="Member">
      <div className="avatar" style={{backgroundColor: color}}/>
      <div className="username">{username} {isMe ? ' (you)' : ''}</div>
    </div>
  );
}