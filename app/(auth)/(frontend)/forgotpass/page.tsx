"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./forgotPassStyles.module.css";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

type FormData = {
  email: string;
};

export default function ForgotPass() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({ email: "" });
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "email") {
      setIsEmailValid(value.toLowerCase().endsWith("@cvsu.edu.ph"));
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.toLowerCase().endsWith("@cvsu.edu.ph")) {
      toast.error("Email must be a valid @cvsu.edu.ph address.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/user/forgotpass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("forgotpassToken", data.token);
        toast.success("OTP sent to your email!");
        router.push("/forgotpass/OTP");
      } else {
        toast.error(data.error || "Failed to send OTP");
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
            <p>Welcome, Perpetualites!</p>
            <h1>University of Perpetual Help System DALTA</h1>
            <p>Las Piñas</p>
            <button className={styles.mottoBtn}>
              Character Building is Nation Building
            </button>
          </div>

          <div className={styles.rightPanel}>
            <h2 className={styles.Title}>Forgot Password</h2>
            <p className={styles.description}>
              Enter your email address to receive a verification code.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                name="email"
                type="email"
                placeholder="Email"
                onChange={handleChange}
                value={formData.email}
                className={styles.input}
                required
              />

              {!isEmailValid && formData.email && (
                <div className={styles.errorBox}>
                  <p className={styles.errorText}>
                    Email must end with @cvsu.edu.ph
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={styles.signInBtn}
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>

            <a href="/login" className={styles.forgotLink}>
              Back to Log In
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
