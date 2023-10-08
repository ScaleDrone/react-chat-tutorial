import React from 'react';
import styles from '@/styles/Avatar.module.css';
import tinycolor from 'tinycolor2';

export default function Avatar({username, color, small, style = {}}) {
  const tc = tinycolor(color);
  const isLight = tc.isLight();
  const fontColor = isLight ? tc.darken(40).toString() : 'white';
  return (
    <div
      className={`${styles['avatar']} ${small ? styles['avatar--small'] : ''}`}
      style={{
        backgroundColor: color,
        color: fontColor,
        ...style,
      }}
    >{username.slice(0, 1).toUpperCase()}</div>
  );
}