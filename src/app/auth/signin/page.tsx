"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Try to sign in
    // If show2FA is false, we send only email/pass. 
    // If backend sees valid pass but needs 2FA, it throws '2fa_required'.
    const result = await signIn("credentials", { 
      redirect: false, 
      email, 
      password, 
      token: show2FA ? token : undefined 
    });

    if (result?.error) {
      if (result.code === "2fa_required" || result.error === "2fa_required") {
        setShow2FA(true);
      } else {
        // Fallback: sometimes the error string itself contains the code
        // or next-auth masks it as "Configuration" or "CredentialsSignin"
        if (result.error.toLowerCase().includes("2fa")) {
           setShow2FA(true);
        } else {
           setError("Неверный логин, пароль или код 2FA");
        }
      }
    } else {
      router.push("/admin");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto" }}>
      <h1>Admin Login</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
          disabled={show2FA} // Lock email/pass when asking for 2FA
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
          disabled={show2FA}
        />
        
        {show2FA && (
          <input 
            type="text" 
            placeholder="2FA код" 
            value={token} 
            onChange={e => setToken(e.target.value)} 
            autoFocus
          />
        )}
        
        {error && <p style={{color:"red"}}>{error}</p>}
        <button type="submit">{show2FA ? "Подтвердить" : "Войти"}</button>
      </form>
    </div>
  );
}
