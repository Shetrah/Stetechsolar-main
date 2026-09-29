import React, { useMemo } from "react";
import { ArrowRight, BadgeCheck, BatteryCharging, Droplets, MapPin, ShieldCheck, Sparkles, Sun, Wrench, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { getProducts, getProductPrice } from "../data/productStore";

const LandingPage: React.FC = () => {
  const products = useMemo(() => getProducts(), []);
  const featured = products.filter((p) => p.active !== false).slice(0, 8);

  return (
    <main className="overflow-hidden bg-white">
      <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-slate-950 text-white">
        <img src="/solar-accessories/background-1.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/80 to-emerald-950/70" />
        <div className="absolute -right-32 top-20 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid w-full items-center gap-14 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-200 backdrop-blur">
                <Sparkles className="h-4 w-4" /> Smart solar. Real-world power.
              </div>
              <h1 className="max-w-4xl text-5xl font-black tracking-[-.04em] sm:text-6xl lg:text-7xl">
                Solar Energy for your Home <span className="text-emerald-400">Schools & Business.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                STETECH Solar Technology supplies quality solar equipment and delivers practical energy solutions for homes, businesses, farms and institutions within kenya, and across  east african countries.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/products" className="rounded-2xl bg-emerald-500 px-6 py-4 text-center font-black text-slate-950 shadow-2xl shadow-emerald-500/20 transition hover:-translate-y-1 hover:bg-emerald-400">
                  Explore products <ArrowRight className="ml-2 inline h-5 w-5" />
                </Link>
                <Link to="/contact" className="rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-center font-black backdrop-blur transition hover:bg-white/15">
                  Get a solar consultation
                </Link>
              </div>
              <div className="mt-9 grid max-w-xl grid-cols-3 gap-5 border-t border-white/10 pt-7">
                <div><p className="text-2xl font-black">148+</p><p className="text-xs text-slate-400">Products</p></div>
                <div><p className="text-2xl font-black">8</p><p className="text-xs text-slate-400">Product categories</p></div>
                <div><p className="text-2xl font-black">24/7</p><p className="text-xs text-slate-400">WhatsApp enquiries</p></div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -inset-5 rounded-[2.5rem] bg-emerald-400/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/10 p-3 shadow-2xl backdrop-blur-xl">
                <div className="relative overflow-hidden rounded-[2rem] bg-slate-900">
                  <img src="/solar-accessories/background-3.jpg" alt="Solar installation" className="h-[520px] w-full object-cover" />
                  <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/10 bg-slate-950/75 p-5 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-emerald-500 p-2 text-slate-950"><Zap className="h-5 w-5" /></div>
                      <div><p className="font-black">From equipment to installation</p><p className="text-sm text-slate-300">One team for your solar journey.</p></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              [BadgeCheck, "Quality-focused sourcing", "Choose from a broad catalogue of solar equipment with clear product information and pricing."],
              [ShieldCheck, "Solutions that fit", "From a single accessory to complete solar systems, we help you select equipment for your application."],
              [Wrench, "Practical support", "Need help deciding? Talk to our team before ordering and get guidance based on your project."],
            ].map(([Icon, title, body]) => (
              <div key={String(title)} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="mb-5 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-600"><Icon className="h-6 w-6" /></div>
                <h3 className="text-lg font-black text-slate-950">{String(title)}</h3>
                <p className="mt-2 leading-6 text-slate-500">{String(body)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[.2em] text-emerald-600">Shop with confidence</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Popular solar equipment</h2>
              <p className="mt-2 max-w-2xl text-slate-500">Clear prices, product details and a simple WhatsApp checkout.</p>
            </div>
            <Link to="/products" className="font-black text-emerald-600 hover:text-emerald-700">View full catalogue <ArrowRight className="ml-1 inline h-4 w-4" /></Link>
          </div>
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <Link to="/products" key={product.id} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="aspect-[4/3] bg-slate-50 p-5"><img src={product.image} alt={product.name} className="h-full w-full object-contain transition duration-500 group-hover:scale-105" /></div>
                <div className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">{product.category}</p>
                  <h3 className="mt-2 min-h-12 font-extrabold leading-6 text-slate-900">{product.name}</h3>
                  <p className="mt-3 text-lg font-black text-slate-950">{getProductPrice(product)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[.2em] text-emerald-400">Built for real needs</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">One catalogue. Many ways to power life.</h2>
              <p className="mt-5 max-w-xl leading-7 text-slate-300">Explore products for electricity generation, storage, water pumping, lighting, security and the components that bring a solar installation together.</p>
              <Link to="/products" className="mt-7 inline-flex rounded-2xl bg-white px-5 py-3.5 font-black text-slate-950 hover:bg-emerald-100">See all products <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                [Sun, "Solar Panels", "Generate clean power"],
                [BatteryCharging, "Solar Batteries", "Store energy"],
                [Droplets, "DC Pumps", "Move water efficiently"],
                [Zap, "Inverters", "Manage your power"],
              ].map(([Icon, title, body]) => (
                <Link to="/products" key={String(title)} className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10">
                  <Icon className="h-7 w-7 text-emerald-400" />
                  <h3 className="mt-7 font-black">{String(title)}</h3>
                  <p className="mt-1 text-sm text-slate-400">{String(body)}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-emerald-500 py-16 text-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div><p className="text-sm font-black uppercase tracking-widest">Ready when you are</p><h2 className="mt-1 text-3xl font-black">Find your equipment and send your order on WhatsApp.</h2></div>
          <Link to="/products" className="shrink-0 rounded-2xl bg-slate-950 px-6 py-4 text-center font-black text-white transition hover:bg-slate-800">Start shopping <ArrowRight className="ml-2 inline h-4 w-4" /></Link>
        </div>
      </section>

      <section className="bg-white py-8">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 text-sm text-slate-500 sm:px-6 lg:px-8"><MapPin className="h-4 w-4 text-emerald-500" /> Serving customers and solar projects across Kenya.</div>
      </section>
    </main>
  );
};

export default LandingPage;
