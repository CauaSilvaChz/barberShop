"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import AdminNav from "@/components/admin/AdminNav";
import { getAdminToken } from "@/utils/auth";

// O localStorage só existe no navegador. No servidor o valor é "null" (ainda não sabemos),
// e no navegador é true/false. useSyncExternalStore evita erro de hidratação.
const noopSubscribe = () => () => {};

/**
 * Protege todas as páginas /admin/*, exceto o login.
 * Sem token salvo, o barbeiro é redirecionado para /admin/login.
 * (A API também valida o token em cada requisição.)
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  const hasToken = useSyncExternalStore(
    noopSubscribe,
    () => Boolean(getAdminToken()),
    () => null,
  );

  useEffect(() => {
    if (!isLoginPage && hasToken === false) {
      router.replace("/admin/login");
    }
  }, [isLoginPage, hasToken, router]);

  if (isLoginPage) return <>{children}</>;

  if (!hasToken) {
    return <p className="p-8 text-center text-stone-500">Carregando...</p>;
  }

  return (
    <>
      <AdminNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
