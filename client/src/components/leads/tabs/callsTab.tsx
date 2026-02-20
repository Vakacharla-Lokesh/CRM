import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Phone } from "lucide-react";
import { useCallData } from "@/hooks";
import type { CallType, CallStatus } from "@/types";

interface CallsTabProps {
  leadId: string;
}

/**
 * CallsTab Component
 * Manage call logs for a lead
 * Features:
 * - Log new incoming/outgoing calls
 * - Track call status and duration
 * - Add call notes
 * - View call history
 * - Delete call logs
 */
function CallsTab({ leadId }: CallsTabProps) {
  const { calls, loading, error, createCall, deleteCall } = useCallData(leadId);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    callType: "outgoing" as CallType,
    status: "completed" as CallStatus,
    duration: "",
    notes: "",
  });

  const handleAddCall = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsAdding(true);

      // Validate duration if provided
      if (formData.duration && isNaN(Number(formData.duration))) {
        throw new Error("Duration must be a valid number");
      }

      await createCall({
        callType: formData.callType,
        status: formData.status,
        duration: formData.duration ? Number(formData.duration) : undefined,
        callNotes: formData.notes,
      });

      // Reset form
      setFormData({
        callType: "outgoing",
        status: "completed",
        duration: "",
        notes: "",
      });
    } catch (err) {
      console.error("Error adding call:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteCall = async (callId: string) => {
    if (!window.confirm("Are you sure you want to delete this call?")) {
      return;
    }

    try {
      await deleteCall(callId);
    } catch (err) {
      console.error("Error deleting call:", err);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      missed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      "no-answer":
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      voicemail:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    };
    return colors[status] || colors.completed;
  };

  const getCallTypeColor = (type: string) => {
    return type === "incoming"
      ? "text-green-600 dark:text-green-400"
      : "text-blue-600 dark:text-blue-400";
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Log Call Form */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Log New Call
        </h3>
        <form
          onSubmit={handleAddCall}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Call Type */}
            <div className="space-y-2">
              <Label htmlFor="callType">Call Type *</Label>
              <Select
                value={formData.callType}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    callType: value as CallType,
                  })
                }
              >
                <SelectTrigger
                  id="callType"
                  disabled={isAdding}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="incoming">Incoming</SelectItem>
                  <SelectItem value="outgoing">Outgoing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as CallStatus,
                  })
                }
              >
                <SelectTrigger
                  id="status"
                  disabled={isAdding}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="missed">Missed</SelectItem>
                  <SelectItem value="no-answer">No Answer</SelectItem>
                  <SelectItem value="voicemail">Voicemail</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="1000"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                placeholder="Call duration in minutes"
                disabled={isAdding}
                className="border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Call Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Add any notes about the call"
              rows={4}
              disabled={isAdding}
              className="border-gray-300 dark:border-gray-600 resize-none"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isAdding}
              className="gap-2"
            >
              <Phone className="w-4 h-4" />
              {isAdding ? "Logging..." : "Log Call"}
            </Button>
          </div>
        </form>
      </div>

      {/* Calls List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Call History ({calls.length})
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400">
                Loading calls...
              </p>
            </div>
          </div>
        ) : calls.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              No calls logged yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {calls.map((call) => (
              <div
                key={call._id}
                className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone
                        className={`w-4 h-4 ${getCallTypeColor(call.callType)}`}
                      />
                      <span className="font-semibold text-gray-900 dark:text-white capitalize">
                        {call.callType} Call
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(call.status)}`}
                      >
                        {call.status === "no-answer"
                          ? "No Answer"
                          : call.status}
                      </span>
                    </div>

                    {call.duration && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Duration:{" "}
                        <span className="font-medium">
                          {call.duration} minutes
                        </span>
                      </p>
                    )}

                    {call.callNotes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 whitespace-pre-wrap wrap-break-word">
                        {call.callNotes}
                      </p>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(call.createdAt).toLocaleDateString()} at{" "}
                      {new Date(call.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCall(call._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CallsTab;
