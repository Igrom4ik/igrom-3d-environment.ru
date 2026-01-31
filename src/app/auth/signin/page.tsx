"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", { redirect: false, email, password, token });
    if (result?.error) setError("Неверный логин или пароль");
    else router.push("/admin");
  };

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto" }}>
      <h1>Admin Login</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <input type="text" placeholder="2FA код" value={token} onChange={e => setToken(e.target.value)} />
        {error && <p style={{color:"red"}}>{error}</p>}
        <button type="submit">Войти</button>
      </form>
    </div>
  );
}
