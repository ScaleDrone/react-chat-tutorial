import React from 'react';
import Head from 'next/head';
import styles from '@/styles/Home.module.css';

import { useState, useEffect, useRef } from 'react';

import Members from '@/components/Members';
import Messages from '@/components/Messages';
import Input from '@/components/Input';
import TypingIndicator from '@/components/TypingIndicator';
import NameInputDialog from '@/components/NameInputDialog';

function randomColor() {
  return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16);
}
function guidGenerator() {
  var S4 = function() {
     return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

let drone = null;

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [me, setMe] = useState();

  const membersRef = useRef();
  membersRef.current = members;
  const meRef = useRef();
  meRef.current = me;

  function startApp() {
    const session = localStorage.getItem('chat-session');
    let clientData;
    try {
      clientData = JSON.parse(session);      
    } catch (error) {}

    if (clientData) {
      setMe(clientData);
      connectToScaledrone(clientData);
    } else {
      // username gets asked from render
    }
  }

  function onNameSubmitted(name) {
    if (!name) {
      return;
    }
    const me = {
      username: name,
      uid: guidGenerator(),
      color: randomColor(),
    };
    localStorage.setItem('chat-session', JSON.stringify(me));
    setMe(me);
    connectToScaledrone(me);
  }

  function connectToScaledrone(clientData) {
    drone = new window.Scaledrone('CP97dMHyjwQ5jh5c', {
      data: clientData,
    });
    drone.on('open', error => {
      if (error) {
        return console.error(error);
      }
      // TODO: Save to server if not already
      meRef.current.id = drone.clientId;
      setMe(meRef.current);
    });

    const messagesRoom = drone.subscribe('observable-messages', {
      historyCount: 100,
    });
    const typingRoom = drone.subscribe('observable-typing');

    messagesRoom.on('history_message', message => {
      setMessages(m => ([...m, message]));
    });
    messagesRoom.on('message', message => setMessages(m => ([...m, message])));
    typingRoom.on('message', message => {
      const {data, member} = message;
      const newMembers = [...membersRef.current];
      const index = newMembers.findIndex(m => m.id === member.id);
      newMembers[index].typing = data.typing;
      setMembers(newMembers);
    });
    messagesRoom.on('members', members => {
      setMembers(members);
    });
    messagesRoom.on('member_join', member => {
      setMembers([...membersRef.current, member]);
    });
    messagesRoom.on('member_leave', ({id}) => {
      const index = membersRef.current.findIndex(m => m.id === id);
      const newMembers = [...membersRef.current];
      newMembers.splice(index, 1);
      setMembers(newMembers);
    });
  }

  useEffect(() => {
    if (!drone) {
      startApp();
    }
  }, []);

  function onSendMessage(message) {
    if (!message) {
      return;
    }
    drone.publish({
      room: 'observable-messages',
      message
    });
  }

  function onChangeTypingState(isTyping) {
    drone.publish({
      room: 'observable-typing',
      message: {typing: isTyping}
    });
  }

  const showNameInputDialog = !me;

  return (
    <>
      <Head>
        <title>Scaledrone Chat App</title>
        <meta name='description' content='Your brand-new chat app!' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <script type='text/javascript' src='https://cdn.scaledrone.com/scaledrone.min.js' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className={styles.app}>
        {showNameInputDialog ? <NameInputDialog onSubmit={onNameSubmitted}/> : null}
        <div className={styles.appContent}>
          <Members members={members} me={me}/>
          <Messages messages={messages} me={me}/>
          <Input
            onSendMessage={onSendMessage}
            onChangeTypingState={onChangeTypingState}
            autoFocus={!showNameInputDialog}
          />
          <TypingIndicator members={members.filter(m => m.typing && m.id !== me.id)}/>
          <a className={styles.upsell} href='https://www.scaledrone.com/blog/tutorial-build-a-reactjs-chat-app/'>Real-time React chat using Scaledrone. See full tutorial →</a>
        </div>
      </main>
    </>
  );
}
