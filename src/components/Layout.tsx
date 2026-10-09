import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Boxes,
  ClipboardList,
  CloudOff,
  GraduationCap,
  LayoutDashboard,
  Users,
  X,
} from "lucide-react";
import { clearToast } from "../features/ui/uiSlice";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useOfflineStatus } from "../hooks/useOfflineStatus";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/equipment", label: "Equipment", icon: Boxes },
  { path: "/students", label: "Students", icon: Users },
  { path: "/checkouts", label: "Checkouts", icon: ClipboardList },
];

const pageTitles: Record<string, [string, string]> = {
  "/": ["Dashboard", "A clear view of your equipment library."],
  "/equipment": ["Equipment", "Manage every item available across campus."],
  "/students": ["Students", "Manage registered student borrowers."],
  "/checkouts": ["Checkouts", "Lend, return, and review equipment activity."],
};

export default function Layout() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { toast } = useAppSelector((state) => state.ui);
  const offline = useOfflineStatus();

  const [title, description] = pageTitles[location.pathname] ?? pageTitles["/"];

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => dispatch(clearToast()), 3500);
    return () => clearTimeout(timer);
  }, [dispatch, toast]);

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col bg-campus-900 px-5 py-7 text-slate-200 shadow-xl">
        <div className="flex items-center gap-3 border-b border-white/10 px-2 pb-7">
          <div className="grid size-10 place-items-center rounded bg-campus-200 text-campus-900">
            <GraduationCap size={22} />
          </div>
          <div>
            <strong className="block text-lg font-extrabold text-white">
              CampusKit
            </strong>
            <span className="mt-1 block text-xs text-slate-400">
              Equipment services
            </span>
          </div>
        </div>

        <nav className="pt-6" aria-label="Main navigation">
          <span className="mb-3 block px-3 text-xs font-bold uppercase tracking-widest text-slate-500">
            Workspace
          </span>
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              className={({ isActive }) =>
                `mb-1 flex h-11 w-full items-center gap-3 rounded-sm px-3 text-sm font-semibold no-underline transition-colors ${isActive ? "bg-campus-600 text-white shadow-sm ring-1 ring-inset ring-campus-200/20" : "text-slate-400 hover:bg-white/5 hover:text-white"}`
              }
            >
              <Icon size={19} strokeWidth={2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="ml-64 min-h-screen">
        <header className="flex h-24 items-center gap-4 border-b border-slate-200 bg-white/90 px-9 backdrop-blur">
          <div>
            <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="m-0 text-sm text-slate-500">{description}</p>
          </div>
        </header>
        {offline && (
          <div
            className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-9 py-2.5 text-xs font-semibold text-amber-800"
            role="status"
          >
            <CloudOff size={15} />
            <span>
              The demo database is offline, so you&apos;re seeing sample data.
              Some actions are paused.
            </span>
          </div>
        )}
        <div className="mx-auto max-w-370 px-9 py-8">
          <Outlet />
        </div>
      </main>

      {toast && (
        <div
          className="fixed bottom-6 right-6 z-toast flex min-w-64 max-w-sm items-center justify-between gap-4 rounded-sm border border-white/15 bg-campus-700 px-4 py-3 text-xs text-white shadow-xl"
          role="status"
        >
          <span>{toast.message}</span>
          <button
            className="grid place-items-center border-0 bg-transparent p-0 text-white"
            onClick={() => dispatch(clearToast())}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
