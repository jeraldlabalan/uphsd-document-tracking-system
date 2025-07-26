"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import styles from "../../forgotpass/forgotPassStyles.module.css";
import toast, { Toaster } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignUpOtpPage() {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

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
    const code = trimmedOtp.join("");
    const isValid = trimmedOtp.every((digit) => /^\d$/.test(digit));

    if (!isValid || trimmedOtp.length !== 6) {
      toast.error("Please enter all 6 valid digits.");
      return;
    }

    // 🔑 Get the JWT you saved from sign up
    const token = localStorage.getItem("signup_token");
    if (!token) {
      toast.error("Session expired. Please sign up again.");
      return;
    }

    setIsLoading(true);
    console.log("📦 OTP PAGE TOKEN:", token);

    try {
      const res = await fetch("/api/user/signup/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, enteredOtp: code }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("OTP Verified!");
        router.push("/login");
      } else {
        toast.error(data.message || "Invalid OTP. Try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
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
            <p>Welcome, Perpetualites!</p>
            <h1>University of Perpetual Help System DALTA</h1>
            <p>Las Piñas</p>
            <button className={styles.mottoBtn}>
              Character Building is Nation Building
            </button>
          </div>

          <div className={styles.rightPanel}>
            <h2 className={styles.Title}>Enter Verification Code</h2>
            <p className={styles.description}>
              {"We've sent a 6-digit OTP to your email (${email})."}
            </p>

            <form>
              <div className={styles.inputGroup}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
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

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={styles.signInBtn}
            >
              {isLoading ? "Verifying..." : "Submit OTP"}
            </button>

            <a href="/signup" className={styles.forgotLink}>
              Back to Sign Up
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
