import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, MessageCircle, X } from "lucide-react";

const Header: React.FC = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const nav = [
    ["/", "Home"], ["/about", "About"], ["/services", "Services"], ["/products", "Products"], ["/projects", "Projects"], ["/contact", "Contact"],
  ];
  const whatsapp = () => window.open("https://wa.me/254717656407?text=Hello%20STETECH%20Solar%20Technology,%20I%20would%20like%20to%20make%20an%20inquiry.", "_blank", "noopener,noreferrer");

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/88 backdrop-blur-2xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-[0_8px_25px_rgba(15,23,42,.08)] ring-1 ring-slate-100"><img src="/stetech solar.png" alt="STETECH Solar Technology" className="h-10 w-10 object-contain transition duration-300 group-hover:scale-105" /></span>
          <div className="leading-none"><p className="text-lg font-black tracking-tight text-slate-950">STETECH</p><p className="mt-1 text-[9px] font-black tracking-[.2em] text-emerald-600">SOLAR TECHNOLOGY</p></div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map(([path, label]) => {
            const active = path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
            return <Link key={path} to={path} className={`relative rounded-xl px-3.5 py-2.5 text-sm font-bold transition ${active ? "text-emerald-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"}`}><span>{label}</span>{active && <span className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-emerald-500" />}</Link>;
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/admin" className="rounded-xl px-2 py-2 text-xs font-bold text-slate-400 transition hover:bg-slate-50 hover:text-slate-700">Admin</Link>
          <button onClick={whatsapp} className="inline-flex items-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-emerald-600"><MessageCircle className="mr-2 h-4 w-4" /> WhatsApp</button>
        </div>

        <button className="rounded-xl p-2 lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"}>{open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
      </div>
      {open && <div className="border-t border-slate-100 bg-white px-4 py-4 shadow-xl lg:hidden"><nav className="grid gap-1">{nav.map(([path, label]) => <Link key={path} to={path} onClick={() => setOpen(false)} className={`rounded-xl px-4 py-3 font-bold ${location.pathname === path ? "bg-emerald-50 text-emerald-700" : "text-slate-600"}`}>{label}</Link>)}<Link to="/admin" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 font-bold text-slate-400">Admin</Link><button onClick={whatsapp} className="mt-2 inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 font-black text-slate-950"><MessageCircle className="mr-2 h-4 w-4" /> Chat on WhatsApp</button></nav></div>}
    </header>
  );
};

export default Header;
