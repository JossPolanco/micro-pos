import { Globe, LogOut, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";

// USER MENU COMPONENT FOR TOP NAVIGATION BAR WITH LANGUAGE SWITCHER
export function UserMenu() {
  const { user, logout } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const currentLang = i18n.language?.startsWith("en") ? "en" : "es";

  const toggleLanguage = () => {
    i18n.changeLanguage(currentLang === "es" ? "en" : "es");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-sm rounded-xl gap-2 px-2.5"
      >
        <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">
          <User size={15} />
        </div>
        <span className="hidden sm:inline text-xs font-bold">
          {user?.nickname ?? "pepito23"}
        </span>
      </div>

      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-2xl z-50 w-48 p-2 shadow-xl border border-base-200 mt-3 space-y-1"
      >
        <li>
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center justify-between text-xs font-semibold rounded-xl py-2"
          >
            <span className="flex items-center gap-2">
              <Globe size={14} className="text-primary" />
              <span>Idioma / Language</span>
            </span>
            <span className="badge badge-xs badge-primary font-mono uppercase">
              {currentLang}
            </span>
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-semibold text-error rounded-xl py-2"
          >
            <LogOut size={14} />
            <span>Cerrar sesión</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
