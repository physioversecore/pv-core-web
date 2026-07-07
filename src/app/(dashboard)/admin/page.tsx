"use client";

import { Statistics, PendingApplications, PlatformEarnings, RecentBookings } from "./components";

export default function AdminOverview() {
  return (
    <div>
      <Statistics />
      <PendingApplications />
      <div className="grid lg:grid-cols-2 gap-5">
        <PlatformEarnings />
        <RecentBookings />
      </div>
    </div>
  );
}
