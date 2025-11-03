interface SidebarProps {
  isLoading?: boolean;
}

export const Sidebar = ({ isLoading = false }: SidebarProps) => {
  return (
    <div className="w-[250px] sidebar-panel flex flex-col p-6">
      <div className="flex flex-col items-start gap-6">
        {/* LeLamp Text */}
        <h1 className="text-sm tracking-wide text-muted-foreground">
          LeLamp Studio
        </h1>

        {/* Robot Status */}
        <div className="mt-0 flex flex-col gap-3">
          <div className="text-xs text-muted-foreground">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                Loading robot...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Robot ready
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
