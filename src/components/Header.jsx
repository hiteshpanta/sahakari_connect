import React from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { Landmark, LogIn, UserPlus } from "lucide-react";
import UserMenu from "./UserMenu";

export default function Header() {
  const user = useSelector((state) => state.auth.user);

  return (
    <header className="sticky top-0 z-50 border-b border-teal-100 bg-white/80 backdrop-blur-lg shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <NavLink to="/" className="group flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg transition-transform duration-300 group-hover:scale-105">
            <Landmark className="h-6 w-6 text-white" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-800">
              Aama Cooperatives
            </h1>
            <p className="text-xs text-teal-600">
              Secure • Trusted • Modern
            </p>
          </div>
        </NavLink>

        {/* Right Side */}
        {user ? (
          <UserMenu />
        ) : (
          <div className="flex items-center gap-3">
            <NavLink to="/login">
              <button className="flex items-center gap-2 rounded-xl border border-teal-200 px-5 py-2.5 font-medium text-teal-700 transition-all duration-300 hover:border-teal-500 hover:bg-teal-50">
                <LogIn size={18} />
                Login
              </button>
            </NavLink>

            <NavLink to="/register">
              <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-2.5 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
                <UserPlus size={18} />
                Sign Up
              </button>
            </NavLink>
          </div>
        )}
      </div>
    </header>
  );
}
