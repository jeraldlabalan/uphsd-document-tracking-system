"use client";

import { useState } from "react";
import Image from "next/image";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call your API route here
    alert("Logging in...");
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/bg-perps.jpg" // ✅ Put your image in /public folder
          alt="Background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-red-900 opacity-60" />
      </div>

      {/* Logo + Title side by side */}
<div className="absolute top-4 left-4 flex items-center gap-4">
  <Image
    src="/logo.png" // ✅ Your logo in /public
    alt="Logo"
    width={60}
    height={60}
    className="flex-shrink-0"
  />
  <h2 className="text-yellow-400 font-bold leading-tight text-sm sm:text-base md:text-lg">
    UNIVERSITY OF <br />
    PERPETUAL HELP <br />
    SYSTEM DALTA
  </h2>
</div>


      {/* Login Card */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white rounded-lg p-8 shadow-md w-full max-w-md border-5 border-yellow-400"
      >
        <h1 className="text-3xl font-extrabold text-center mb-6" style={{ color: "#7f1416" }}>
  Log In
</h1>

        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4 px-4 py-3 border bg-gray-200 border-black-600 text-black rounded-full focus:outline-none"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-2 px-4 py-3 bg-gray-200 border-black-600 text-black rounded-full focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex justify-between text-gray-500 text-sm mb-4">
          <label className="flex items-center gap-1">
            <input type="checkbox" className="accent-red-800" /> Remember Me
          </label>
          <a href="#" className="hover:underline">
            Forgot Password?
          </a>
        </div>

        <button
  type="submit"
  className="
    w-full 
    py-3 
    rounded-full 
    transition-colors 
    duration-300
    bg-[#7f1416] 
    text-white 
    hover:bg-[#fccb0a] 
    hover:text-[#7f1416]
  "
>
  Log In
</button>

      </form>
    </main>
  );
}
