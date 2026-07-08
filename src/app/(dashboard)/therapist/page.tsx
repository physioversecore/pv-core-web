"use client";

import { WelcomeHeader, Statistics, TodaySessions, UploadReport, RecentlyUploaded, PublicProfile, ReferColleague } from "./components";

export default function TherapistOverview() {
  return (
    <>
      <WelcomeHeader />
      <Statistics />
      <TodaySessions />
      <UploadReport />
      <RecentlyUploaded />
      <PublicProfile />
      <ReferColleague />
    </>
  );
}
