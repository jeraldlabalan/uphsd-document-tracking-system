"use client";

import Image from "next/image";
import styles from  "./loginStyles.module.css";

export default function Login() {
  return (
    <div className={styles.background}>
      <div className={styles.card}>
     
        <div className={styles.leftPanel}>
          <Image
            src="/logo.png"
            alt="Logo"
            width={100}
            height={100}
            className={styles.logo}
          />
          <h2>University of Perpetual Help System DALTA</h2>
        
          <p>Las Piñas</p>
          <button className={styles.mottoBtn}>Character Building is Nation Building</button>
          <p>Welcome</p>
        </div>

     
        <div className={styles.rightPanel}>
          <h2 className={styles.loginTitle}>Log In</h2>
          <input type="email" placeholder="Email" className={styles.input} />
          <input type="password" placeholder="Password" className={styles.input} />
          <button className={styles.signInBtn}>Sign In</button>
          <a href="#" className={styles.forgotLink}>Forgot Password?</a>
        </div>
      </div>
    </div>
  );
}
