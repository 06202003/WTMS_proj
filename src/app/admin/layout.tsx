"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, FileCheck, LayoutDashboard, Settings, LogOut, Menu, Utensils, QrCode } from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Tournament", href: "/admin/tournaments", icon: Trophy },
    { name: "Master Category", href: "/admin/categories", icon: Settings },
    { name: "Registration Approval", href: "/admin/approvals", icon: FileCheck },
    { name: "Participant list", href: "/admin/export", icon: Settings },
    { name: "Master Branch", href: "/admin/branches", icon: LayoutDashboard },
    { name: "Master Meals", href: "/admin/meals", icon: Utensils },
    { name: "Check in", href: "/admin/checkin", icon: FileCheck },
    { name: "Scan Meals", href: "/admin/meals/scan", icon: QrCode },
    { name: "Brackets", href: "/admin/brackets", icon: Trophy },
  ];

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-[#003A60] text-sky-50 w-64 flex-shrink-0 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full fixed h-full z-40'}`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white tracking-tight">WTMS<span className="text-blue-400">Admin</span></h2>
        </div>
        
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-blue-500/20 text-blue-300 font-semibold' : 'hover:bg-white/5 text-sky-100/70 hover:text-white'}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0 mt-auto">
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center w-full px-4 py-3 rounded-xl text-sky-100/70 hover:bg-white/5 hover:text-red-300 transition-all"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-900">Main Admin</p>
              <p className="text-xs text-slate-500">Super Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              AU
            </div>
          </div>
        </header>
        
        <main className="p-6 md:p-8 flex-1 overflow-auto custom-scrollbar-light">
          {children}
        </main>
      </div>
    </div>
  );
}
