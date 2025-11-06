import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Cpu,
  Users,
  BookOpen,
  Printer,
  Cog,
  Wrench,
  Settings,
  PlayCircle,
  HelpCircle,
} from "lucide-react";

const documentationSections = [
  {
    title: "Prerequisites",
    path: "/documentation/prerequisites",
    icon: BookOpen,
  },
  { title: "3D Print", path: "/documentation/3d-print", icon: Printer },
  { title: "Servos Setup", path: "/documentation/servos-setup", icon: Cog },
  {
    title: "LeLamp Assembly",
    path: "/documentation/lelamp-assembly",
    icon: Wrench,
  },
  {
    title: "LeLamp Setup",
    path: "/documentation/lelamp-setup",
    icon: Settings,
  },
  {
    title: "LeLamp Control",
    path: "/documentation/lelamp-control",
    icon: PlayCircle,
  },
  {
    title: "Common Issues",
    path: "/documentation/common-issues",
    icon: HelpCircle,
  },
];

export const NavigationSidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-60 border-r border-border bg-sidebar flex flex-col">
      {/* Logos */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <a
            href="https://mechaverse.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <img
              src="/mechaverse.png"
              alt="Mechaverse"
              className="h-8 w-auto"
            />
          </a>
          <span className="text-muted-foreground text-lg font-light select-none">
            ×
          </span>
          <a
            href="https://www.humancomputerlab.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <img
              src="/hcl.png"
              alt="Human Computer Lab"
              className="h-8 w-auto"
            />
          </a>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 space-y-1">
        {/* Home */}
        <Link
          to="/"
          className={cn(
            "group flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all relative hover:bg-gray-50",
            isActive("/")
              ? "bg-orange-50 text-gray-900 border-l-4 border-l-orange-500 ml-0 pl-2 font-semibold"
              : "ml-1"
          )}
        >
          <Home
            className={cn(
              "h-4 w-4 transition-all",
              isActive("/")
                ? "text-orange-600 stroke-[2.5]"
                : "text-sidebar-foreground stroke-[2] group-hover:stroke-[2.4]"
            )}
          />
          <span className="transition-colors group-hover:text-gray-900">
            Home
          </span>
        </Link>

        {/* Documentation Section */}
        <div className="space-y-1 pt-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <span className="text-sm font-semibold text-gray-600">
              Documentation
            </span>
          </div>

          {documentationSections.map((section) => {
            const Icon = section.icon;
            const active = isActive(section.path);

            return (
              <Link
                key={section.path}
                to={section.path}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all relative hover:bg-gray-50",
                  active
                    ? "bg-orange-50 text-gray-900 border-l-4 border-l-orange-500 ml-0 pl-2 font-semibold"
                    : "ml-1"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-all",
                    active
                      ? "text-orange-600 stroke-[2.5]"
                      : "text-sidebar-foreground stroke-[2] group-hover:stroke-[2.4]"
                  )}
                />
                <span className="transition-colors group-hover:text-gray-900">
                  {section.title}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3 px-3 py-2">
          <span className="text-sm font-semibold text-gray-600">Workflows</span>
        </div>

        {/* Workflow info */}
        <Link
          to="/workflow-info"
          className={cn(
            "group flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all relative hover:bg-gray-50 mt-2",
            isActive("/workflow-info")
              ? "bg-orange-50 text-gray-900 border-l-4 border-l-orange-500 ml-0 pl-2 font-semibold"
              : "ml-1"
          )}
        >
          <Cpu
            className={cn(
              "h-4 w-4 transition-all",
              isActive("/workflow-info")
                ? "text-orange-600 stroke-[2.5]"
                : "text-sidebar-foreground stroke-[2] group-hover:stroke-[2.4]"
            )}
          />
          <span className="transition-colors group-hover:text-gray-900">
            What are workflows?
          </span>
        </Link>

        {/* Community */}
        <Link
          to="/community"
          className={cn(
            "group flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all relative hover:bg-gray-50",
            isActive("/community")
              ? "bg-orange-50 text-gray-900 border-l-4 border-l-orange-500 ml-0 pl-2 font-semibold"
              : "ml-1"
          )}
        >
          <Users
            className={cn(
              "h-4 w-4 transition-all",
              isActive("/community")
                ? "text-orange-600 stroke-[2.5]"
                : "text-sidebar-foreground stroke-[2] group-hover:stroke-[2.4]"
            )}
          />
          <span className="transition-colors group-hover:text-gray-900">
            Community
          </span>
        </Link>
      </div>
    </aside>
  );
};
