import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Eye,
  Mail,
  Link2,
  Check,
  Ban,
  Circle,
  Pause,
} from "lucide-react";
import type {
  ColorKey,
  EventType,
  FeedEvent,
} from "@/types/interfaces/common/liveFeed.interfaces";

function LiveFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate real-time events
    const generateEvent = (): FeedEvent => {
      const eventTypes: EventType[] = [
        { type: "lead_created", icon: <Plus size={16} />, color: "green" },
        { type: "lead_opened", icon: <Eye size={16} />, color: "blue" },
        { type: "email_sent", icon: <Mail size={16} />, color: "purple" },
        { type: "link_clicked", icon: <Link2 size={16} />, color: "orange" },
        { type: "form_submitted", icon: <Check size={16} />, color: "teal" },
        { type: "unsubscribed", icon: <Ban size={16} />, color: "red" },
      ];

      const leads = [
        "John Doe",
        "Jane Smith",
        "Mike Johnson",
        "Sarah Connor",
        "Alex Chen",
      ];

      const eventType =
        eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const lead = leads[Math.floor(Math.random() * leads.length)];

      return {
        id: Date.now(),
        type: eventType.type,
        icon: eventType.icon,
        color: eventType.color,
        message: `${lead} - ${eventType.type.replace(/_/g, " ")}`,
        timestamp: new Date(),
      };
    };

    if (!isLiveMode) return;

    const interval = setInterval(() => {
      setEvents((prev) => {
        const newEvents = [generateEvent(), ...prev];
        // Keep only last 50 events
        return newEvents.slice(0, 50);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLiveMode]);

  // Auto-scroll to latest events
  useEffect(() => {
    if (feedRef.current && isLiveMode) {
      feedRef.current.scrollTop = 0;
    }
  }, [events, isLiveMode]);

  const colorClasses: Record<ColorKey, string> = {
    green:
      "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700",
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700",
    purple:
      "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700",
    orange:
      "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700",
    teal: "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700",
    red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700",
  };

  const textColorClasses: Record<ColorKey, string> = {
    green: "text-green-700 dark:text-green-400",
    blue: "text-blue-700 dark:text-blue-400",
    purple: "text-purple-700 dark:text-purple-400",
    orange: "text-orange-700 dark:text-orange-400",
    teal: "text-teal-700 dark:text-teal-400",
    red: "text-red-700 dark:text-red-400",
  };

  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
          Live Interaction Feed
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLiveMode(!isLiveMode)}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded font-semibold transition-colors ${
              isLiveMode
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
            }`}
          >
            {isLiveMode ? (
              <Circle
                size={12}
                className="fill-red-500 text-red-500"
              />
            ) : (
              <Pause size={12} />
            )}
            {isLiveMode ? " Live" : " Paused"}
          </button>
          <button
            onClick={() => setEvents([])}
            className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-semibold"
            title="Clear events"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Feed Container */}
      <div
        ref={feedRef}
        className="flex-1 overflow-y-auto space-y-2 max-h-64"
        style={{ scrollBehavior: "smooth" }}
      >
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            <p className="text-sm text-center">
              {isLiveMode ? "Waiting for events..." : "Feed paused"}
            </p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className={`p-2 rounded border-l-2 text-sm transition-all animate-fadeIn ${
                colorClasses[event.color]
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-gray-700 dark:text-gray-300 shrink-0">
                  {event.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-semibold ${textColorClasses[event.color]} truncate`}
                  >
                    {event.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {event.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Event Counter */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-white">
            {events.length}
          </span>{" "}
          events in feed
        </p>
      </div>

      {/* Add CSS animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default LiveFeed;
