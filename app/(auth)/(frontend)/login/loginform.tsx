"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./loginStyles.module.css";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import AOS from "aos";
import "aos/dist/aos.css";

type FormKeys = "Email" | "Password";

type FormData = {
  email: string;
  password: string;
};

export default function Login() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [isEmailValid, setIsEmailValid] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name as FormKeys]: value,
    }));

    if (name === "email") {
      setIsEmailValid(value.toLowerCase().endsWith("@cvsu.edu.ph"));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.email.toLowerCase().endsWith("@cvsu.edu.ph")) {
      toast.error("Email must be a valid @cvsu.edu.ph address.");
      return;
    }

    if (!formData.password) {
      toast.error("Password is required.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include", // ✅ send & receive cookies
      });

      let data;
      try {
        data = await res.json();
      } catch {
        toast.error("Invalid server response");
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        toast.error(data.message || "Login failed");
        setIsLoading(false);
        return;
      }

      setIsLoading(false); // ✅ Reset before navigation

      // Check if user has complete profile
      if (!data.hasCompleteProfile) {
        toast.error("Please complete your profile first");
        if (data.role === "Admin") {
          await new Promise((r) => setTimeout(r, 100)); // slight delay
          router.push("/admin/settings");
        } else if (data.role === "Employee") {
          await new Promise((r) => setTimeout(r, 100)); // slight delay
          router.push("/employee2/settings");
        }
      } else {
        toast.success("Login successful!");
        if (data.role === "Admin") {
          await new Promise((r) => setTimeout(r, 100)); // slight delay
          router.push("/admin/dashboard");
        } else if (data.role === "Employee") {
          await new Promise((r) => setTimeout(r, 100)); // slight delay
          router.push("/employee2/dashboard");
        } else {
          router.push("/");
        }
      }
    } catch (error) {
      toast.error("Something went wrong." + error);
      setIsLoading(false);
    }
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className={styles.background}>
        <div data-aos="fade-up" className={styles.card}>
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
            <h2 className={styles.loginTitle}>Log In</h2>
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

              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                value={formData.password}
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
            </form>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleSubmit}
              className={styles.signInBtn}
            >
              {isLoading ? "Logging In..." : "Log In"}
            </button>

            <a href="/forgotpass" className={styles.forgotLink}>
              Forgot Password?
            </a>

            <p className={styles.signupPrompt}>
              Don’t have an account?{" "}
              <a href="/signup" className={styles.signupLink}>
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
