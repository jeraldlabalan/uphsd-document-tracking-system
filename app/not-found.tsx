import Link from "next/link";
import styles from "./styles/notFound.module.css";

export default function NotFound() {
  return (
    <div className={styles.background}>
      <div className={styles.overlay}>
        <div className={styles.columns}>
          <div className={styles.left}>
            <h1 className={styles.code}>404</h1>
          </div>
          <div className={styles.divider}></div>
          <div className={styles.right}>
            <p className={styles.text}>PAGE</p>
            <p className={styles.text}>NOT FOUND</p>
          </div>
        </div>
        <Link href="/" className={styles.Btn}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
