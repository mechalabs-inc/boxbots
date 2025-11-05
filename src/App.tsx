import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NavigationSidebar } from "@/components/NavigationSidebar";
import Home from "./pages/Home";
import Studio from "./pages/Studio";
import Community from "./pages/Community";
import NotFound from "./pages/NotFound";
import Prerequisites from "./pages/documentation/Prerequisites";
import ThreeDPrint from "./pages/documentation/ThreeDPrint";
import ServosSetup from "./pages/documentation/ServosSetup";
import LeLampAssembly from "./pages/documentation/LeLampAssembly";
import LeLampSetup from "./pages/documentation/LeLampSetup";
import LeLampControl from "./pages/documentation/LeLampControl";
import CommonIssues from "./pages/documentation/CommonIssues";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex h-screen w-full overflow-hidden">
          <NavigationSidebar />
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/studio" element={<Studio />} />
              <Route path="/community" element={<Community />} />
              <Route
                path="/documentation/prerequisites"
                element={<Prerequisites />}
              />
              <Route path="/documentation/3d-print" element={<ThreeDPrint />} />
              <Route
                path="/documentation/servos-setup"
                element={<ServosSetup />}
              />
              <Route
                path="/documentation/lelamp-assembly"
                element={<LeLampAssembly />}
              />
              <Route
                path="/documentation/lelamp-setup"
                element={<LeLampSetup />}
              />
              <Route
                path="/documentation/lelamp-control"
                element={<LeLampControl />}
              />
              <Route
                path="/documentation/common-issues"
                element={<CommonIssues />}
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
