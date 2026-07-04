"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "General enquiry", message: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }
    toast.success("Message sent — we'll reply within 1 business day.");
    setForm({ name: "", email: "", phone: "", subject: "General enquiry", message: "" });
  };

  return (
    <PageShell
      eyebrow="Contact us"
      title="We're here to help."
      subtitle="Have a question about booking, billing, or partnering with us? Send us a message and our care team will respond within one business day."
    >
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 grid lg:grid-cols-[1.2fr_1fr] gap-8">
          <Reveal>
            <form onSubmit={submit} className="card-soft p-6 lg:p-8 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="eyebrow block mb-1.5">Your name</span>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-border bg-white" placeholder="Ram Sharma" />
                </label>
                <label className="block">
                  <span className="eyebrow block mb-1.5">Email</span>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-border bg-white" placeholder="you@example.com" />
                </label>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="eyebrow block mb-1.5">Phone (optional)</span>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-border bg-white" placeholder="+977 98\u2026" />
                </label>
                <label className="block">
                  <span className="eyebrow block mb-1.5">Subject</span>
                  <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-border bg-white">
                    <option>General enquiry</option>
                    <option>Booking help</option>
                    <option>Billing / refund</option>
                    <option>Partnership</option>
                    <option>Therapist application</option>
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="eyebrow block mb-1.5">Message</span>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} className="w-full px-3 py-2.5 rounded-xl border border-border bg-white" placeholder="How can we help?" />
              </label>
              <button type="submit" className="btn-primary">Send message</button>
            </form>
          </Reveal>

          <Reveal delay={120}>
            <div className="space-y-4">
              <div className="card-soft p-5 flex gap-3">
                <span className="w-10 h-10 rounded-xl grid place-items-center text-pine" style={{ background: "#D1E8DF" }}><Mail size={18} /></span>
                <div>
                  <div className="eyebrow mb-0.5">Email</div>
                  <div className="font-medium">care@sahayatriphysio.com</div>
                  <div className="text-xs text-slate">We reply within 1 business day</div>
                </div>
              </div>
              <div className="card-soft p-5 flex gap-3">
                <span className="w-10 h-10 rounded-xl grid place-items-center text-pine" style={{ background: "#D1E8DF" }}><Phone size={18} /></span>
                <div>
                  <div className="eyebrow mb-0.5">Phone</div>
                  <div className="font-medium">+977 1 555 0199</div>
                  <div className="text-xs text-slate">Emergency physio hotline: +977-1-555-0100</div>
                </div>
              </div>
              <div className="card-soft p-5 flex gap-3">
                <span className="w-10 h-10 rounded-xl grid place-items-center text-pine" style={{ background: "#D1E8DF" }}><MapPin size={18} /></span>
                <div>
                  <div className="eyebrow mb-0.5">Office</div>
                  <div className="font-medium">Jhamsikhel, Lalitpur</div>
                  <div className="text-xs text-slate">Kathmandu Valley, Nepal</div>
                </div>
              </div>
              <div className="card-soft p-5 flex gap-3">
                <span className="w-10 h-10 rounded-xl grid place-items-center text-pine" style={{ background: "#D1E8DF" }}><Clock size={18} /></span>
                <div>
                  <div className="eyebrow mb-0.5">Support hours</div>
                  <div className="font-medium">Sun \u2013 Fri \u00b7 8am \u2013 8pm</div>
                  <div className="text-xs text-slate">Hotline available 24/7</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
