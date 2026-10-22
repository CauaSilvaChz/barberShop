"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import ErrorMessage from "@/components/ErrorMessage";
import { login } from "@/services/adminService";
import { saveAdminToken } from "@/utils/auth";
import { SHOP_NAME } from "@/utils/constants";
import { getErrorMessage } from "@/utils/errors";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!email || !password) {
      setError("Informe e-mail e senha.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { token } = await login(email, password);
      saveAdminToken(token);
      router.push("/admin");
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="card w-full max-w-sm">
        <h1 className="text-xl font-bold">Área do barbeiro</h1>
        <p className="mb-6 text-sm text-stone-500">{SHOP_NAME}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="label">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              className="input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <ErrorMessage message={error} />

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <Link href="/" className="mt-6 block text-center text-sm text-stone-500 hover:underline">
          Voltar ao site
        </Link>
      </div>
    </main>
  );
}
