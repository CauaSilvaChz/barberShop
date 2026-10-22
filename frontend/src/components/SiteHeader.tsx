import Link from "next/link";
import { SHOP_NAME } from "@/utils/constants";

export default function SiteHeader() {
  return (
    <header className="bg-stone-900 text-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold">
          ✂ {SHOP_NAME}
        </Link>
        <nav className="flex gap-4 text-sm text-stone-300">
          <Link href="/agendar" className="hover:text-white">
            Agendar
          </Link>
          <Link href="/meus-agendamentos" className="hover:text-white">
            Meus agendamentos
          </Link>
        </nav>
      </div>
    </header>
  );
}
