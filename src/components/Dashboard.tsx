import { GuardianDashboard } from "./GuardianDashboard";
import { StudentDashboard } from "./StudentDashboard";
import type { User } from "../types";

interface DashboardProps {
  user: User;
}

export function Dashboard({ user }: DashboardProps) {
  if (!user.profile) {
    return null;
  }

  return user.profile.role === "guardian" ? (
    <GuardianDashboard user={user} />
  ) : (
    <StudentDashboard user={user} />
  );
}
