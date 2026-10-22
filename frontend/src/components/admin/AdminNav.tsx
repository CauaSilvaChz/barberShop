"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/services/adminService";
import { clearAdminToken } from "@/utils/auth";
import { SHOP_NAME } from "@/utils/constants";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/appointments", label: "Agendamentos" },
  { href: "/admin/blocked-times", label: "Bloqueios" },
  { href: "/admin/services", label: "Serviços" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      // Mesmo se a API falhar, remove o token local.
      clearAdminToken();
      router.push("/admin/login");
    }
  }

  return (
    <header className="bg-stone-900 text-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link href="/admin" className="font-bold">
          ✂ {SHOP_NAME} <span className="font-normal text-stone-400">· Admin</span>
        </Link>
        <button type="button" onClick={handleLogout} className="text-sm text-stone-300 hover:text-white">
          Sair
        </button>
      </div>

      <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-2">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm ${
              pathname === link.href ? "bg-amber-600 text-white" : "text-stone-300 hover:bg-stone-800"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
