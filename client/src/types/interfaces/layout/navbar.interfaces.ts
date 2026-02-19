export interface ConnectivityStatus {
  ws: boolean;
  sse: boolean;
  longPoll: boolean;
  shortPoll: boolean;
}

export interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onToggleRightPanel: () => void;
  isRightPanelOpen: boolean;
}
