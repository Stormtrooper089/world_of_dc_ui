import { useMemo, useState } from "react";
import {
  BarChart3,
  BookOpenCheck,
  Gavel,
  Landmark,
  LayoutDashboard,
  LogOut,
  NotebookPen,
  ShieldCheck,
  SquareActivity,
  Store,
  Trash2,
  UserCircle,
  Users,
} from "lucide-react";
import { UserRole } from "../../constants/enums";
import { useAuth } from "../../contexts/AuthContext";

import Approvals from "../../pages/AdminApproveOfficers";
import AuctionDashboard from "../../pages/AuctionDashboard";
import TicketDashboard from "../../pages/ComplaintTracker";
import GovernanceDashboard from "../../pages/GovernanceDashboard";
import Profile from "../../pages/Profile";
import PropertyTaxDashboard from "../../pages/PropertyTaxDashboard";
import ServiceRegistryDashboard from "../../pages/ServiceRegistryDashboard";
import SquadManagementPage from "../../pages/SquadManagementPage";
import TaskBoard from "../../pages/TaskBoard";
import TrackingDashboard from "../../pages/TrackingDashboard";
import TradeLicenseDashboard from "../../pages/TradeLicenseDashboard";
import WastePickupDashboard from "../../pages/WastePickupDashboard";

const NavItem = ({
  icon: Icon,
  label,
  description,
  isActive,
  onClick,
  badge,
}: any) => (
  <button
    onClick={onClick}
    className={`group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
      isActive
        ? "border-blue-100 bg-blue-600 text-white shadow-sm"
        : "border-transparent text-slate-600 hover:border-blue-100 hover:bg-blue-50 hover:text-blue-800"
    }`}
    title={label}
  >
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
        isActive
          ? "bg-white/15 text-white"
          : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-700"
      }`}
    >
      <Icon className="h-4 w-4" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-bold">{label}</span>
      {description && (
        <span
          className={`block truncate text-xs ${
            isActive ? "text-blue-50" : "text-slate-400"
          }`}
        >
          {description}
        </span>
      )}
    </span>
    {badge > 0 && (
      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500 ring-2 ring-white" />
    )}
  </button>
);

const NavSection = ({ title, items, activeView, setActiveView }: any) => (
  <section className="space-y-1.5">
    <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
      {title}
    </p>
    {items.map((item: any) => (
      <NavItem
        key={item.view}
        icon={item.icon}
        label={item.label}
        description={item.description}
        isActive={activeView === item.view}
        badge={item.badge}
        onClick={() => setActiveView(item.view)}
      />
    ))}
  </section>
);

export default function AppShell() {
  const [activeView, setActiveView] = useState("CONSOLE");
  const { user, logout } = useAuth();

  const isAdmin =
    user?.role === UserRole.DISTRICT_COMMISSIONER ||
    user?.role === UserRole.SMC_COMMISSIONER ||
    user?.role === "ADMIN";

  const navSections = useMemo(() => {
    const sections = [
      {
        title: "Operations",
        items: [
          {
            view: "CONSOLE",
            icon: LayoutDashboard,
            label: "Complaint Board",
            description: "Citizen grievances",
          },
          {
            view: "TASK_BOARD",
            icon: NotebookPen,
            label: "Task Board",
            description: "Assigned work",
          },
          {
            view: "GOVERNANCE",
            icon: BarChart3,
            label: "Governance Dashboard",
            description: "SLA and pendency",
          },
          {
            view: "SERVICE_REGISTRY",
            icon: BookOpenCheck,
            label: "Service Registry",
            description: "Services, SLA and documents",
          },
        ],
      },
      {
        title: "Field & Sanitation",
        items: [
          {
            view: "WASTE_PICKUP",
            icon: Trash2,
            label: "Solid Waste",
            description: "Pickup requests",
          },
          {
            view: "TRACKING",
            icon: SquareActivity,
            label: "Squad Tracking",
            description: "Attendance and GPS",
          },
          {
            view: "SQUAD_MANAGEMENT",
            icon: Users,
            label: "Squad Management",
            description: "Teams and staff",
          },
        ],
      },
      {
        title: "Revenue Services",
        items: [
          {
            view: "PROPERTY_TAX",
            icon: Landmark,
            label: "Property Tax",
            description: "Holdings and dues",
          },
          {
            view: "TRADE_LICENSE",
            icon: Store,
            label: "Trade License",
            description: "Business services",
          },
          {
            view: "AUCTIONS",
            icon: Gavel,
            label: "Auctions",
            description: "Municipal resources",
          },
        ],
      },
    ];

    if (isAdmin) {
      sections.push({
        title: "Administration",
        items: [
          {
            view: "APPROVALS",
            icon: ShieldCheck,
            label: "Officer Approvals",
            description: "Access control",
          },
        ],
      });
    }

    return sections;
  }, [isAdmin]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <nav className="z-50 hidden w-[276px] shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="border-b border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-lg font-bold text-white shadow-lg shadow-blue-100">
              SMC
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-950">
                SMC Admin Console
              </p>
              <p className="truncate text-xs text-slate-500">
                Complaints, field and revenue
              </p>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {navSections.map((section) => (
            <NavSection
              key={section.title}
              title={section.title}
              items={section.items}
              activeView={activeView}
              setActiveView={setActiveView}
            />
          ))}
        </div>

        <div className="border-t border-slate-100 bg-white p-3">
          <NavItem
            icon={UserCircle}
            label="Profile"
            description={user?.name || user?.email || "Officer account"}
            isActive={activeView === "PROFILE"}
            onClick={() => setActiveView("PROFILE")}
          />
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to logout?")) logout();
            }}
            className="mt-2 flex w-full items-center gap-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-left text-red-700 transition-colors hover:bg-red-100"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-red-600">
              <LogOut className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold">Sign Out</span>
              <span className="block text-xs text-red-500">
                End current session
              </span>
            </span>
          </button>
        </div>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <select
            value={activeView}
            onChange={(event) => setActiveView(event.target.value)}
            className="min-h-[42px] min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500"
          >
            {navSections.flatMap((section) =>
              section.items.map((item) => (
                <option key={item.view} value={item.view}>
                  {section.title} - {item.label}
                </option>
              ))
            )}
            <option value="PROFILE">Account - Profile</option>
          </select>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Are you sure you want to logout?")) logout();
            }}
            aria-label="Sign out"
            title="Sign out"
            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-md border border-red-100 bg-red-50 text-red-700 transition-colors hover:bg-red-100"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        <div className="relative flex flex-1 flex-col overflow-hidden">
          {activeView === "CONSOLE" && <TicketDashboard />}
          {activeView === "APPROVALS" && <Approvals />}
          {activeView === "TASK_BOARD" && <TaskBoard />}
          {activeView === "TRACKING" && <TrackingDashboard />}
          {activeView === "GOVERNANCE" && <GovernanceDashboard />}
          {activeView === "SERVICE_REGISTRY" && <ServiceRegistryDashboard />}
          {activeView === "WASTE_PICKUP" && <WastePickupDashboard />}
          {activeView === "PROPERTY_TAX" && <PropertyTaxDashboard />}
          {activeView === "TRADE_LICENSE" && <TradeLicenseDashboard />}
          {activeView === "AUCTIONS" && <AuctionDashboard />}
          {activeView === "SQUAD_MANAGEMENT" && <SquadManagementPage />}
          {activeView === "PROFILE" && <Profile />}
        </div>
      </div>
    </div>
  );
}
