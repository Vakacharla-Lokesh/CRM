import React, { useEffect, useState } from "react";

function ConnectivityLED() {
  const [connectivity, setConnectivity] = useState({
    ws: false,
    sse: false,
    longPoll: false,
    shortPoll: false,
  });

  // Simulate checking connection status
  useEffect(() => {
    const checkConnectivity = () => {
      // This will be connected to real WebSocket/SSE checks in Phase 4
      setConnectivity({
        ws: Math.random() > 0.5,
        sse: Math.random() > 0.3,
        longPoll: true,
        shortPoll: true,
      });
    };

    checkConnectivity();
    const interval = setInterval(checkConnectivity, 5000);

    return () => clearInterval(interval);
  }, []);

  const Protocol = ({ name, status, tooltip }) => (
    <div
      className="flex items-center gap-2 text-xs"
      title={tooltip}
    >
      <span
        className={`w-2 h-2 rounded-full animate-pulse ${
          status ? "bg-green-500" : "bg-gray-400"
        }`}
      />
      <span className="text-gray-600 dark:text-gray-400">{name}</span>
    </div>
  );

  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
      <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase">
        Connection Status
      </h3>
      <div className="space-y-2">
        <Protocol
          name="WebSocket"
          status={connectivity.ws}
          tooltip="Real-time interaction feed"
        />
        <Protocol
          name="SSE"
          status={connectivity.sse}
          tooltip="ROI metrics stream"
        />
        <Protocol
          name="Long Poll"
          status={connectivity.longPoll}
          tooltip="Data export handshake"
        />
        <Protocol
          name="Short Poll"
          status={connectivity.shortPoll}
          tooltip="System health check"
        />
      </div>
    </div>
  );
}

export default ConnectivityLED;
