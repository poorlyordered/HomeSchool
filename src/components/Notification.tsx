import { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface NotificationProps {
  type: "success" | "error" | "info";
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Notification({
  type,
  message,
  onClose,
  duration = 5000,
}: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div
        className={`rounded-lg shadow-lg p-4 ${
          type === "success"
            ? "bg-green-50 text-green-800"
            : type === "info"
              ? "bg-blue-50 text-blue-800"
              : "bg-red-50 text-red-800"
        }`}
      >
        <div className="flex items-center gap-3">
          {type === "success" ? (
            <CheckCircle className="h-5 w-5 text-green-400" />
          ) : type === "info" ? (
            <CheckCircle className="h-5 w-5 text-blue-400" />
          ) : (
            <XCircle className="h-5 w-5 text-red-400" />
          )}
          <p className="text-sm font-medium">{message}</p>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
