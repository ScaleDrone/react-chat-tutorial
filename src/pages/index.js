import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import Script from 'next/script';

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  return (
    <>
      <Head>
        <title>Scaledrone Chat App</title>
        <meta name='description' content='Your brand-new chat app!' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className={styles.app}>
        <div className={styles.appContent}>
        </div>
      </main>
    </>
  )
}
