/**
 * useNotifications – convenience re-export so callers can import from
 * the `@/hooks` barrel rather than reaching into the context folder.
 *
 * Usage:
 *   import { useNotifications } from "@/hooks";
 *   const { notifyEvent, notifications, unreadCount } = useNotifications();
 */
export { useNotifications } from "@/context";
