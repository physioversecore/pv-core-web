import { useLang } from "@/context/i18n";

export function RecentBookings() {
  const { t } = useLang();
  return (
    <div className="card-soft p-5">
      <h3 className="font-display text-lg mb-3">{t("admin_dashboard.recentBookings")}</h3>
      <ul className="text-sm space-y-2 text-text-light">
        <li>· Ramesh A. booked Dr. Aarati S. — 2 min ago</li>
        <li>· Sita L. rebooked Dr. Bibek T. — 14 min ago</li>
        <li>· Hari P. cancelled session — 1 hr ago</li>
      </ul>
    </div>
  );
}
