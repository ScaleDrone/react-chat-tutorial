import { useState } from 'react'
import styles from '@/styles/Dialog.module.css';

export default function NameInputDialog() {
  let [isOpen, setIsOpen] = useState(true)

  return (
    <div className={styles.backdrop}>
      <form onSubmit={e => onSubmit(e)} className={styles.dialog} open={isOpen} onClose={() => setIsOpen(false)}>
        <div className={styles.dialogTitle}>Enter your name</div>
        <p className={styles.dialogText}>To begin chatting, tell us your display name:</p>
        <input autoFocus className={`input ${styles.input}`} type="text"></input>
        <button className={styles.button}>Start chatting</button>
     </form>
    </div>
  )
}
