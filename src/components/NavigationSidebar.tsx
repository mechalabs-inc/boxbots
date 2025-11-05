import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";
import { ChevronDown, ChevronRight } from "lucide-react";

const documentationSections = [
  { title: "0. Prerequisites", path: "/documentation/prerequisites" },
  { title: "1. 3D Print", path: "/documentation/3d-print" },
  { title: "2. Servos Setup", path: "/documentation/servos-setup" },
  { title: "3. LeLamp Assembly", path: "/documentation/lelamp-assembly" },
  { title: "4. LeLamp Setup", path: "/documentation/lelamp-setup" },
  { title: "5. LeLamp Control", path: "/documentation/lelamp-control" },
  { title: "6. Common Issues", path: "/documentation/common-issues" },
];

export const NavigationSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDocumentationPath = location.pathname.startsWith("/documentation");
  const [isDocumentationExpanded, setIsDocumentationExpanded] =
    useState(isDocumentationPath);

  useEffect(() => {
    if (isDocumentationPath) {
      setIsDocumentationExpanded(true);
    }
  }, [isDocumentationPath]);

  const isHome = location.pathname === "/";
  const isDocumentation = isDocumentationPath;
  const isStudio = location.pathname === "/studio";
  const isCommunity = location.pathname === "/community";

  return (
    <div className="w-[200px] sidebar-panel flex flex-col p-6 border-r border-border">
      <div className="flex flex-col gap-2">
        {/* Logos */}
        <div className="flex items-center gap-2 mb-4">
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

        {/* Navigation Tabs */}
        <nav className="flex flex-col gap-1">
          <button
            onClick={() => navigate("/")}
            className={cn(
              "w-full text-left px-4 py-2.5 text-sm font-medium rounded-md transition-all",
              isHome
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            Home
          </button>
          <Separator />

          <div className="flex flex-col">
            <button
              onClick={() =>
                setIsDocumentationExpanded(!isDocumentationExpanded)
              }
              className={cn(
                "w-full text-left px-4 py-2.5 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                isDocumentation
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Documentation
              {isDocumentationExpanded ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )}
            </button>
            {isDocumentationExpanded && (
              <div className="ml-4 mt-1 flex flex-col gap-1">
                {documentationSections.map((section) => {
                  const isActive = location.pathname === section.path;
                  return (
                    <button
                      key={section.path}
                      onClick={() => navigate(section.path)}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm rounded-md transition-all",
                        isActive
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {section.title}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/studio")}
            className={cn(
              "w-full text-left px-4 py-2.5 text-sm font-medium rounded-md transition-all",
              isStudio
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            Studio
          </button>
          <button
            onClick={() => navigate("/community")}
            className={cn(
              "w-full text-left px-4 py-2.5 text-sm font-medium rounded-md transition-all",
              isCommunity
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            Community
          </button>
        </nav>
      </div>
    </div>
  );
};
