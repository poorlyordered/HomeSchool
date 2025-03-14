import { Notification } from "../Notification";

interface NotificationState {
  show: boolean;
  type: "success" | "error" | "info";
  message: string;
}

interface NotificationManagerProps {
  notification: NotificationState;
  onClose: () => void;
}

export function NotificationManager({
  notification,
  onClose,
}: NotificationManagerProps) {
  if (!notification.show) return null;

  return (
    <Notification
      type={notification.type}
      message={notification.message}
      onClose={onClose}
    />
  );
}
