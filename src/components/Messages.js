import {useEffect, useRef} from 'react';
import React from 'react';
import styles from '@/styles/Home.module.css';
import Avatar from './Avatar';

export default function Messages({messages, me}) {
  const bottomRef = useRef(null);
  useEffect(() => {
    if (bottomRef && bottomRef.current) {
      bottomRef.current.scrollIntoView({behavior: 'smooth'});
    }
  });
  return (
    <ul className={styles.messagesList}>
      {messages.map(m => Message(m, me))}
      <div ref={bottomRef}></div>
    </ul>
  );
}

function Message({member, data, id}, me) {
  const {username, color, uid} = member.clientData;
  const messageFromMe = uid === me.uid;
  const className = messageFromMe ?
    `${styles.messagesMessage} ${styles.currentMember}` : styles.messagesMessage;
  return (
    <li key={id} className={className}>
      <Avatar username={username} color={color} style={{margin: '0 10px -10px'}}/>
      <div className={styles.messageContent}>
        <div className={styles.username}>
          {username}
        </div>
        <div className={styles.text}>{data}</div>
      </div>
    </li>
  );
}