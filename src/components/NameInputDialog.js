import { useState } from 'react'
import styles from '@/styles/Dialog.module.css';

export default function NameInputDialog({onSubmit}) {
  const [isOpen, setIsOpen] = useState(true);
  const [value, setValue] = useState('');

  function onChange(e) {
    setValue(e.target.value);
  }

  return (
    <div className={styles.backdrop}>
      <form onSubmit={() => onSubmit(value)} className={styles.dialog} open={isOpen} onClose={() => setIsOpen(false)}>
        <div className={styles.dialogTitle}>Enter your name</div>
        <p className={styles.dialogText}>To begin chatting, tell us your display name:</p>
        <input autoFocus className={`input ${styles.input}`} type="text" onChange={e => onChange(e)}></input>
        <button className={styles.button}>Start chatting</button>
     </form>
    </div>
  )
}
