"use client";

import { useState } from "react";
import { toast } from "sonner";

const FAQ = [
  { q: "How are therapists verified?", a: "All physiotherapists must upload their NMC license and certification. Our team reviews and approves within 24 hours." },
  { q: "What are the cancellation policies?", a: "You can cancel up to 6 hours before your session for a full refund." },
  { q: "Which areas do you cover?", a: "Kathmandu, Lalitpur, Bhaktapur, Pokhara, Chitwan, and Biratnagar." },
  { q: "How are payments handled?", a: "We accept eSewa, Khalti, and cash on visit." },
];

export default function Help() {
  const [open, setOpen] = useState<number | null>(0);
  const [msg, setMsg] = useState("");

  return (
    <div>
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <div className="card-soft p-5">
          <p className="eyebrow mb-3">FAQ</p>
          <div className="divide-y divide-border">
            {FAQ.map((f, i) => (
              <div key={i} className="py-3">
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left flex justify-between items-center font-medium">
                  {f.q}<span className="text-slate">{open === i ? "−" : "+"}</span>
                </button>
                {open === i && <p className="text-sm text-slate mt-2">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <div className="card-soft p-5">
            <p className="eyebrow mb-2">Emergency physio hotline</p>
            <div className="font-display text-2xl text-pine">+977-1-555-0100</div>
            <p className="text-xs text-slate mt-1">24/7 urgent support</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); toast.success("Message sent"); setMsg(""); }} className="card-soft p-5">
            <p className="eyebrow mb-3">Contact support</p>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} placeholder="How can we help?" className="w-full px-3 py-2.5 rounded-xl border border-border bg-white" />
            <button type="submit" className="btn-pine w-full mt-3">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}
