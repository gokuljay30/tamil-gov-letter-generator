"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (signInError) {
      setError("மின்னஞ்சல் அல்லது கடவுச்சொல் தவறாக உள்ளது.");
      setLoading(false);
      return;
    }
    const next = searchParams.get("next");
    router.replace(next?.startsWith("/") ? next : "/letters");
    router.refresh();
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={login}>
        <h1>தமிழ் அரசு கடிதம்</h1>
        <p>உங்கள் கணக்கில் உள்நுழையவும்.</p>
        <label className="field">
          <span className="field__label">மின்னஞ்சல்</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">கடவுச்சொல்</span>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button className="button button-primary full-button" disabled={loading}>
          {loading ? "உள்நுழைகிறது…" : "உள்நுழை"}
        </button>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="auth-page">ஏற்றுகிறது…</main>}>
      <LoginForm />
    </Suspense>
  );
}
