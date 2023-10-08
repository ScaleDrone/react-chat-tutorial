import React from 'react';
import styles from '@/styles/Home.module.css';
import Avatar from './Avatar';

export default function Members({members, me}) {
  return (
    <div className={styles.members}>
      <div className={styles.membersCount}>
        {members.length} user{members.length === 1 ? '' : 's'} online
      </div>
      <div className={styles.membersList}>
        {members.map(m => Member(m, m.clientData.uid === me.uid))}
      </div>
    </div>);
}

function Member({id, clientData}, isMe) {
  const {username, color} = clientData;
  return (
    <div key={id} className={styles.member}>
      <Avatar username={username} color={color} small={true} style={{marginRight: 5}}/>
      <div className={styles.username}>{username} {isMe ? ' (you)' : ''}</div>
    </div>
  );
}