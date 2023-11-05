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

const dummyData = { // used for design view
  "messages": [
    {"data":"I'm so excited for the new season of Stranger Things!","timestamp":1696530893,"id":"0KJKIzfteu","clientId":"URxwbYrpxI","member":{"clientData":{"username":"Frank","color":"#8ED1FC","uid":"c3e0e4ea-98ed-e447-d53d-8b9e195d6b76"},"clientId":"URxwbYrpxI"}},
    {"data":"Me too! I can't wait to see what happens next","timestamp":1696530896,"id":"JjSkqMS6Cv","clientId":"WHsgoVBx23","member":{"clientData":{"username":"Hannah","color":"#F78DA7","uid":"8f2a475f-7694-8a81-e50f-23a462100a0d"},"clientId":"WHsgoVBx23"}},
    {"data":"I haven't even started the last season yet. I'm so behind..","timestamp":1696618504,"id":"omEfWXMwyk","clientId":"URxwbYrpxI","member":{"clientData":{"username":"Frank","color":"#8ED1FC","uid":"c3e0e4ea-98ed-e447-d53d-8b9e195d6b76"},"clientId":"URxwbYrpxI"}},
    {"data":"You should catch up! It's so good","timestamp":1696618514,"id":"12d1dawd2","clientId":"5TUuHbM8Mk","member":{"clientData":{"username":"Bob","color":"#ddfdb6","uid":"b3e0e4ea-98ed-e447-d53d-8b9e195d6b76"},"clientId":"5TUuHbM8Mk"}},
    {"data":"Yeah, you're missing out!","timestamp":1696618514,"id":"cFoVqNkhTo","clientId":"WHsgoVBx23","member":{"clientData":{"username":"Hannah","color":"#F78DA7","uid":"8f2a475f-7694-8a81-e50f-23a462100a0d"},"clientId":"WHsgoVBx23"}},
    {"data":"I know, I know. I'll try to watch it soon","timestamp":1696618515,"id":"d1d12d1d","clientId":"5TUuHbM8Mk","member":{"clientData":{"username":"Bob","color":"#ddfdb6","uid":"b3e0e4ea-98ed-e447-d53d-8b9e195d6b76"},"clientId":"5TUuHbM8Mk"}}
  ],
  "members": [
    {"id":"5TUuHbM8Mk","clientData":{"username":"Bob","uid":"b3e0e4ea-98ed-e447-d53d-8b9e195d6b76","color":"#ddfdb6"}},
    {"id":"WHsgoVBx23","clientData":{"username":"Hannah","uid":"8f2a475f-7694-8a81-e50f-23a462100a0d","color":"#F78DA7"}},
    {"id":"URxwbYrpxI","clientData":{"username":"Frank","uid":"c3e0e4ea-98ed-e447-d53d-8b9e195d6b76","color":"#8ED1FC"}}
  ],
  "me":{"username":"Bob","uid":"b3e0e4ea-98ed-e447-d53d-8b9e195d6b76","color":"#ddfdb6","id":"5TUuHbM8Mk"}
};

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
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [me, setMe] = useState();
  const [isDummy, setIsDummy] = useState(false);

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
    const query = new URLSearchParams(window.location.search);
    const color = query.get('color');
    if (color) {
      setColor(color);
    }
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

  // this is used for the chat creation process (embedded as iframe)
  function startDummyApp() {
    const {messages, members, me} = dummyData;
    setMe(me);
    setMembers(members);
    setMessages(messages);

    window.addEventListener('message', ({data}) => {
      const {color, bubble} = data;
      if (color) {
        setColor(color);
      }
    });
    const style = document.createElement('style');
    style.innerHTML = "* {transition: background-color .3s, color .3s;}";
    document.getElementsByTagName("head")[0].appendChild(style);
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
    const query = new URLSearchParams(window.location.search);
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
    const query = new URLSearchParams(window.location.search);
    if (query.get('dummy') === 'yes') {
      setIsDummy(true);
      startDummyApp();
    } else if (!drone) {
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
        <title>Chat</title>
        <meta name='description' content='Your brand-new chat app!' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <script type='text/javascript' src='https://cdn.scaledrone.com/scaledrone.min.js' />
        <link rel='icon' href='/favicon.svg' />
      </Head>
      <main className={`${styles['app']} ${isDummy ? styles['app--dummy'] : ''}`}>
        {showNameInputDialog ? <NameInputDialog onSubmit={onNameSubmitted}/> : null}
        <div className={styles.appContent}>
          <Members members={users} me={me}/>
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
