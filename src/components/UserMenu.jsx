import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import {
  ChevronDown, LayoutDashboard, Users, Building2, Wallet,
  ArrowLeftRight, CreditCard, UserCog, LogOut, Settings, ShieldCheck
} from "lucide-react";
import { logout } from "../store/authSlice";
import { getInitials } from "../utils/formatters";

export default function UserMenu() {
  const user = useSelector((state) => state.auth.user);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!user) return null;

  const basePath = user.cooperativeId ? `/c/${user.cooperativeId}` : "";

  const links = (() => {
    if (user.role === "admin") {
      return [
        { label: "Dashboard", icon: LayoutDashboard, to: "/admin/dashboard" },
        { label: "Cooperatives", icon: Building2, to: "/admin/cooperatives" },
        { label: "Platform Users", icon: Users, to: "/admin/users" },
      ];
    }
    if (user.role === "manager") {
      return [
        { label: "Dashboard", icon: LayoutDashboard, to: `${basePath}/dashboard` },
        { label: "Customers", icon: Users, to: `${basePath}/customers` },
        { label: "Accounts", icon: Wallet, to: `${basePath}/accounts` },
        { label: "Transactions", icon: ArrowLeftRight, to: `${basePath}/transactions` },
        { label: "Loans", icon: CreditCard, to: `${basePath}/loans` },
        { label: "Settings", icon: Settings, to: `${basePath}/settings` },
      ];
    }
    return [
      { label: "My Dashboard", icon: LayoutDashboard, to: "/member/dashboard" },
      { label: "My Accounts", icon: Wallet, to: "/member/accounts" },
      { label: "Transactions", icon: ArrowLeftRight, to: "/member/transactions" },
      { label: "Loans", icon: CreditCard, to: "/member/loans" },
      { label: "Profile", icon: UserCog, to: "/member/profile" },
    ];
  })();

  const handleLogout = () => {
    dispatch(logout());
    setOpen(false);
    navigate("/");
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-3 rounded-xl border border-teal-200 bg-white py-1.5 pl-1.5 pr-3 transition-all duration-300 hover:border-teal-400 hover:shadow-md"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-sm font-bold text-white">
          {getInitials(user.name)}
        </div>
        <div className="hidden text-left md:block">
          <p className="max-w-[140px] truncate text-sm font-semibold leading-tight text-gray-800">
            {user.name}
          </p>
          <p className="text-xs capitalize leading-tight text-teal-600">
            {user.role}
          </p>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-72 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl animate-fade-in">
          {/* User card */}
          <div className="border-b border-gray-100 bg-gradient-to-br from-teal-500 to-emerald-500 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-base font-bold ring-2 ring-white/40">
                {getInitials(user.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{user.name}</p>
                <p className="truncate text-xs text-teal-100">{user.email}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs capitalize text-teal-100">
                  <ShieldCheck size={12} /> {user.role}
                </p>
              </div>
            </div>
          </div>

          {/* Links */}
          <nav className="max-h-80 overflow-y-auto p-2">
            <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              My Account
            </p>
            {links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-teal-50 hover:text-teal-700"
              >
                <link.icon size={17} className="text-teal-500" />
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div className="border-t border-gray-100 p-2">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors duration-150 hover:bg-red-50"
            >
              <LogOut size={17} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
