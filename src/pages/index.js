import React from 'react';
import Head from 'next/head';
import styles from '@/styles/Home.module.css';
import uniqBy from 'lodash/uniqBy';

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
function isValidColor(color) {
  return /^[0-9A-F]{6}$/i.test(color);
}
function setColor(color) {
  if (isValidColor(color)) {
    document.documentElement.style.setProperty('--theme-main-color', '#' + color);
  }
}

let drone = null;

export default function Home() {
  let query;
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [me, setMe] = useState();

  const membersRef = useRef();
  membersRef.current = members;
  const meRef = useRef();
  meRef.current = me;

  useEffect(() => {
    if (window.parent) {
      window.parent.postMessage('loaded', "*");
    }
  }, []);

  useEffect(() => {
    query = new URLSearchParams(window.location.search);
    const color = query.get('color');
    if (color) {
      setColor(color);
    }
  }, []);

  useEffect(() => {
    // this is used for the chat creation process (embedded as iframe)
    window.addEventListener('message', ({data}) => {
      const {color, bubble} = data;
      if (color) {
        setColor(color);
      }
    });
    const style = document.createElement('style');
    style.innerHTML = "* {transition: background-color .3s, color .3s;}";
    document.getElementsByTagName("head")[0].appendChild(style);
  }, []);

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
    const id = query.get('id');
    if (!id) {
      console.error("No ID defined, don't know which chat to connect to");
      console.error("ID should be passed to the chat URL like so ?id=YOUR_CHAT_ID");
      throw Error('No ID defined');
    }
    drone = new window.Scaledrone(id, {
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
  const users = uniqBy(members, m => m.clientData.uid);

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
          <Users members={users} me={me}/>
          <Messages messages={messages} me={me}/>
          <Input
            onSendMessage={onSendMessage}
            onChangeTypingState={onChangeTypingState}
            autoFocus={!showNameInputDialog}
          />
          <TypingIndicator members={members.filter(m => m.typing && m.id !== me.id)}/>
          <a className={styles.upsell} target='_blank' href='https://chatacular.com/'>Create your own free chat room using Chatacular →</a>
        </div>
      </main>
    </>
  );
}
