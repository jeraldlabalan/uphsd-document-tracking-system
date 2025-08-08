import { useState, useRef, useEffect } from "react";
import styles from "./CustomSelect.module.css";

interface CustomSelectProps {
  options: string[];
  value?: string | null;
  placeholder?: string;
  onChange: (val: string) => void;
}

// EXAMPLE USE OF THIS COMPONENT
// page.tsx
// const departments = ["Engineering", "IT", "Finance", "HR", "Marketing"]; - options
// const [dept, setDept] = useState(""); - values (dept) setDept (selected value)

// <CustomSelect options={departments} value={dept} onChange={setDept} />

const CustomSelect = ({
  options,
  value,
  placeholder = "Select",
  onChange,
}: CustomSelectProps) => {

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = value ?? placeholder;

  const toggleOpen = () => setOpen((o) => !o);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className={styles.wrapper} ref={ref}>
      <div className={`${styles.display} ${open ? styles.active : ""}`} onClick={toggleOpen}>
        {selected}
        <span className={`${styles.arrow} ${open ? styles.open : ""}`}>
          <svg
            width="12"
            height="7"
            viewBox="0 0 12 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.19309 6.75194L0.983398 1.9257L2.71995 0.316895L6.19309 3.53444L9.66614 0.316895L11.4027 1.9257L6.19309 6.75194Z"
              fill="black"
            />
          </svg>
        </span>
      </div>

      <ul className={`${styles.dropdown} ${open ? styles.open : ""}`}>
        {options.map((opt) => (
          <li key={opt} onClick={() => handleSelect(opt)}>
            {opt}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CustomSelect;
