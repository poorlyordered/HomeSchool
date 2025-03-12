import { GuardianDashboard as NewGuardianDashboard } from "./guardian/GuardianDashboard";
import type { User } from "../types";

interface GuardianDashboardProps {
  user: User;
}

export function GuardianDashboard({ user }: GuardianDashboardProps) {
  return <NewGuardianDashboard user={user} />;
}
