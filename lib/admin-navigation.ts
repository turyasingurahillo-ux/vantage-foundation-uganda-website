import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Inbox,
  CircleDollarSign,
  BookOpen,
  Image,
  Users,
  Shield,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

export const adminNavGroups: AdminNavGroup[] = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Work",
    items: [
      { href: "/admin/messages", label: "Messages", icon: Inbox },
      { href: "/admin/donations", label: "Donations", icon: CircleDollarSign },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/stories", label: "Stories", icon: BookOpen },
      { href: "/admin/media", label: "Media", icon: Image },
    ],
  },
  {
    title: "Governance",
    items: [
      { href: "/admin/admins", label: "Admins", icon: Users },
      { href: "/admin/audit", label: "Audit log", icon: Shield },
    ],
  },
];
