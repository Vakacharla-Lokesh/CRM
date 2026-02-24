import { useState } from "react";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import type { LayoutProps } from "@/types/interfaces/layout/layout.interfaces";

function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleRightPanel = () => {
    setIsRightPanelOpen(!isRightPanelOpen);
  };

  return (
    <div className="min-h-screen text-gray-900 dark:text-slate-200">
      <Navbar
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        onToggleRightPanel={toggleRightPanel}
        isRightPanelOpen={isRightPanelOpen}
        isUserMenuOpen={isUserMenuOpen}
        setIsUserMenuOpen={setIsUserMenuOpen}
      />

      <div className="flex pt-16 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} />

        <main
          className="flex-1 overflow-y-auto transition-all duration-300"
          style={{
            height: "calc(100vh - 4rem)",
            backgroundColor: "var(--bg-primary)",
          }}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
