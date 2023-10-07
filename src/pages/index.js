import React from 'react';
import Head from 'next/head';
import styles from '@/styles/Home.module.css';

import { useState, useEffect, useRef } from 'react';

import Members from '@/components/Members';
import Messages from '@/components/Messages';
import Input from '@/components/Input';
import TypingIndicator from '@/components/TypingIndicator';
import NameInputDialog from '@/components/NameInputDialog';

function randomName() {
  const adjectives = [
    'autumn', 'hidden', 'bitter', 'misty', 'silent', 'empty', 'dry', 'dark',
    'summer', 'icy', 'delicate', 'quiet', 'white', 'cool', 'spring', 'winter',
    'patient', 'twilight', 'dawn', 'crimson', 'wispy', 'weathered', 'blue',
    'billowing', 'broken', 'cold', 'damp', 'falling', 'frosty', 'green', 'long',
    'late', 'lingering', 'bold', 'little', 'morning', 'muddy', 'old', 'red',
    'rough', 'still', 'small', 'sparkling', 'shy', 'wandering',
    'withered', 'wild', 'black', 'young', 'holy', 'solitary', 'fragrant',
    'aged', 'snowy', 'proud', 'floral', 'restless', 'divine', 'polished',
    'ancient', 'purple', 'lively', 'nameless'
  ];
  const nouns = [
    'waterfall', 'river', 'breeze', 'moon', 'rain', 'wind', 'sea', 'morning',
    'snow', 'lake', 'sunset', 'pine', 'shadow', 'leaf', 'dawn', 'glitter',
    'forest', 'hill', 'cloud', 'meadow', 'sun', 'glade', 'bird', 'brook',
    'butterfly', 'bush', 'dew', 'dust', 'field', 'fire', 'flower', 'firefly',
    'feather', 'grass', 'haze', 'mountain', 'night', 'pond', 'darkness',
    'snowflake', 'silence', 'sound', 'sky', 'shape', 'surf', 'thunder',
    'violet', 'water', 'wildflower', 'wave', 'water', 'resonance', 'sun',
    'wood', 'dream', 'cherry', 'tree', 'fog', 'frost', 'voice', 'paper', 'frog',
    'smoke', 'star'
  ];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return adjective + noun;
}

function randomColor() {
  return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16);
}

let drone = null;

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [me, setMe] = useState({
    username: randomName(),
    color: randomColor(),
  });

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
      connectToScaledrone(clientData);
    } else {
      
    }
  }

  function connectToScaledrone() {
    drone = new window.Scaledrone('CP97dMHyjwQ5jh5c', {
      data: meRef.current,
    });
    drone.on('open', error => {
      if (error) {
        return console.error(error);
      }
      meRef.current.id = drone.clientId;
      setMe(meRef.current);
    });

    const messagesRoom = drone.subscribe('observable-messages', {
      historyCount: 100,
    });
    const typingRoom = drone.subscribe('observable-typing');

    messagesRoom.on('history_message', message => {
      const {data} = message;
      if (typeof data === 'object' && typeof data.typing === 'boolean') {
        return; //todo: should move typing messages to separate room
      }
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
    if (drone === null) {
      connectToScaledrone();
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

  return (
    <>
      <Head>
        <title>Scaledrone Chat App</title>
        <meta name='description' content='Your brand-new chat app!' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <script type='text/javascript' src='http://localhost:8080/scaledrone.min.js' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className={styles.app}>
        <NameInputDialog onSubmit={}/>
        <div className={styles.appContent}>
          <Members members={members} me={me}/>
          <Messages messages={messages} me={me}/>
          <Input
            onSendMessage={onSendMessage}
            onChangeTypingState={onChangeTypingState}
          />
          <TypingIndicator members={members.filter(m => m.typing && m.id !== me.id)}/>
          <a className={styles.upsell} href='https://www.scaledrone.com/blog/tutorial-build-a-reactjs-chat-app/'>Real-time React chat using Scaledrone. See full tutorial →</a>
        </div>
      </main>
    </>
  );
}
