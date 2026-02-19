import { useState } from "react";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import RightPanel from "./rightpanel";
import type { LayoutProps } from "@/types/interfaces/layout/layout.interfaces";

function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleRightPanel = () => {
    setIsRightPanelOpen(!isRightPanelOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-slate-200">
      {/* Navbar */}
      <Navbar
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        onToggleRightPanel={toggleRightPanel}
        isRightPanelOpen={isRightPanelOpen}
      />

      {/* Main Content Area */}
      <div className="flex pt-16 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar isOpen={isSidebarOpen} />

        {/* Main Content */}
        <main
          className="flex-1 overflow-y-auto transition-all duration-300"
          style={{
            height: "calc(100vh - 4rem)",
            backgroundColor: "var(--bg-primary)",
          }}
        >
          <div className="p-6">{children}</div>
        </main>

        {/* Right Panel */}
        <RightPanel isOpen={isRightPanelOpen} />
      </div>
    </div>
  );
}

export default Layout;
