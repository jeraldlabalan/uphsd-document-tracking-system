import Image from "next/image";
import styles from "./styles/styles.module.css";
import Header from "@/components/shared/header"; 

export default function Home() {
  return (
    <div>
      <Header /> 
      <div
          className={`${styles.parallaxSection} ${styles.parallax1}`}>
          <p className={styles.text1}>UNIVERSITY  OF PERPETUAL  HELP SYSTEM DALTA</p>
          <p className={styles.text2}>Digital Document Management</p>

  
        </div>
      <h1>Welcome to the Document Tracking System</h1>
      <p>This is a simple document tracking system built with Next.js.</p>
    </div>
  );
}
