"use client";

import { useState } from "react";
import { Plus, X, FileText, UserPlus, Package, BookOpen } from "lucide-react";
import Link from "next/link";

interface FABProps {
  currentPage?: string;
}

export default function FloatingActionButton({ currentPage = "dashboard" }: FABProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { 
      icon: FileText, 
      label: "New Invoice", 
      href: "/dashboard/invoices",
      color: "bg-blue-500",
      show: currentPage !== "invoices"
    },
    { 
      icon: UserPlus, 
      label: "Add Customer", 
      href: "/dashboard/customers",
      color: "bg-purple-500",
      show: currentPage !== "customers"
    },
    { 
      icon: Package, 
      label: "Add Product", 
      href: "/dashboard/products",
      color: "bg-emerald-500",
      show: currentPage !== "products"
    },
  ];

  const visibleItems = menuItems.filter(item => item.show);

  return (
    <div className="fixed bottom-6 right-6 z-40 md:hidden">
      {/* Menu Items */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 flex flex-col-reverse gap-2 items-end">
          {visibleItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 group"
            >
              <span className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {item.label}
              </span>
              <div className={`${item.color} p-3 rounded-full shadow-lg text-white hover:scale-110 transition-transform`}>
                <item.icon size={20} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-xl transition-all duration-300 ${
          isOpen 
            ? "bg-slate-600 rotate-90" 
            : "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)]"
        } text-white`}
      >
        {isOpen ? <X size={24} /> : <Plus size={24} />}
      </button>
    </div>
  );
}
