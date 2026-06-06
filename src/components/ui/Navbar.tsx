"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ email: data.user.email ?? "" });
        setIsAdmin(data.user.app_metadata?.role === "admin");
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ? { email: session.user.email ?? "" } : null);
      setIsAdmin(session?.user?.app_metadata?.role === "admin");
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className="bg-white dark:bg-gray-900 border-b
                       border-gray-100 dark:border-gray-800
                       sticky top-0 z-40"
    >
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex
                      items-center justify-between"
      >
        <Logo />

        <nav className="hidden md:flex items-center gap-6">
          {[
            { label: "Emergency", href: "/search?specialty=emergency" },
            { label: "Maternity", href: "/search?specialty=maternity" },
            { label: "General", href: "/search?specialty=general" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm text-gray-500 dark:text-gray-400
                  hover:text-brand-900 dark:hover:text-white
                  transition-colors font-medium"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="text-sm font-medium border
                                 border-brand-200 dark:border-brand-700
                                 text-brand-700 dark:text-brand-400
                                 hover:bg-brand-50 dark:hover:bg-brand-900/20
                                 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Admin
                </Link>
              )}
              <span
                className="text-xs text-gray-400 max-w-[120px]
                               truncate hidden lg:block"
              >
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-xs text-gray-500 dark:text-gray-400
                           hover:text-gray-700 dark:hover:text-white
                           font-medium transition-colors border
                           border-gray-200 dark:border-gray-700
                           px-3 py-1.5 rounded-lg"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm text-gray-600 dark:text-gray-400
                               hover:text-brand-900 dark:hover:text-white
                               font-medium transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm bg-brand-700 text-white px-4 py-2
                               rounded-lg hover:bg-brand-800
                               transition-colors font-medium"
              >
                Sign up
              </Link>
            </div>
          )}

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden w-8 h-8 flex items-center justify-center
                       rounded-lg border border-gray-200 dark:border-gray-700
                       text-gray-500 dark:text-gray-400"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          className="md:hidden border-t border-gray-100
                        dark:border-gray-800 bg-white dark:bg-gray-900
                        px-4 py-3 space-y-1"
        >
          {[
            { label: "General", href: "/search?specialty=general" },
            { label: "Emergency", href: "/search?specialty=emergency" },
            { label: "Maternity", href: "/search?specialty=maternity" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium
                             text-gray-700 dark:text-gray-300
                             hover:bg-gray-50 dark:hover:bg-gray-800
                             transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <div
            className="border-t border-gray-100 dark:border-gray-800
                          pt-2 mt-2 space-y-1"
          >
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm
                                   font-medium text-brand-700
                                   dark:text-brand-400 hover:bg-brand-50
                                   dark:hover:bg-brand-900/20
                                   transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 rounded-lg
                             text-sm font-medium text-gray-700
                             dark:text-gray-300 hover:bg-gray-50
                             dark:hover:bg-gray-800 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm
                                 font-medium text-gray-700 dark:text-gray-300
                                 hover:bg-gray-50 dark:hover:bg-gray-800
                                 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm
                                 font-medium text-brand-700
                                 dark:text-brand-400 hover:bg-brand-50
                                 dark:hover:bg-brand-900/20 transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
