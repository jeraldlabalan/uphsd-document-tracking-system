"use client";

import { useState } from "react";
import styles from "./header.module.css";
import { X, Search } from "lucide-react";

export default function SearchBar() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleSearch = () => setIsVisible(!isVisible);
  const closeSearch = () => setIsVisible(false);

  return (
    <>
    {isVisible && (
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search..."
            className={styles.searchInput}
          />
          <button className={styles.closeButton} onClick={closeSearch}>
            <X size={20} />
          </button>
        </div>
      )}
      <button onClick={toggleSearch} className={styles.toggleButton}>
  {isVisible ? <X size={20} /> : <Search size={20} />}
</button>


      
    </>
  );
}
