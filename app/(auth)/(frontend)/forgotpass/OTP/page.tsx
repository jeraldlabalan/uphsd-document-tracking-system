"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import styles from "../forgotPassStyles.module.css";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function OtpPage() {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();

  const handleChange = (index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const updatedOtp = [...otp];
      updatedOtp[index] = value;
      setOtp(updatedOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleBackspace = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const trimmedOtp = otp.map((d) => d.trim());
    const isValid = trimmedOtp.every((digit) => /^\d$/.test(digit));

    if (!isValid || trimmedOtp.length !== 6) {
      toast.error("Please enter all 6 valid digits.");
      return;
    }

    const code = trimmedOtp.join("");
    const token = localStorage.getItem("forgotpassToken");

    if (!token) {
      toast.error("Session expired. Please request a new OTP.");
      router.push("/forgotpass");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/user/forgotpass/OTP", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: code, token }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("OTP Verified!");
        router.push("/forgotpass/newPass");
      } else {
        toast.error(data.error || "Invalid OTP. Try again.");
      }

    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
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
            <p>Welcome Perpetualite</p>
            <h2>University of Perpetual Help System DALTA</h2>
            <p>Las Piñas</p>
            <button className={styles.mottoBtn}>
              Character Building is Nation Building
            </button>
          </div>

          <div className={styles.rightPanel}>
            <h2 className={styles.Title}>Enter Verification Code</h2>
            <p className={styles.description}>
              {"We've sent a 6-digit OTP to your email."}
            </p>

            <form>
              <div className={styles.inputGroup}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleBackspace(i, e)}
                    className={styles.otpInput}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
            </form>

            {/* Button is outside the form */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={styles.signInBtn}
            >
              {isLoading ? "Verifying..." : "Submit OTP"}
            </button>

            <a href="/login" className={styles.forgotLink}>
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
