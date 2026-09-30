import { ArrowRight, BatteryCharging, CheckCircle2, Droplets, Headphones, Leaf, Lightbulb, Play, ShieldCheck, Sun, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { initialProducts } from '../data/products';
const solutions = [
  { title: 'Solar panels', category: 'Solar Panels', icon: Sun, text: 'Put the sun to work.' },
  { title: 'Inverters', category: 'Solar Inverters', icon: Zap, text: 'Power you can depend on.' },
  { title: 'Solar batteries', category: 'Solar Batteries', icon: BatteryCharging, text: 'Save energy for later.' },
  { title: 'Water pumping', category: 'Solar DC Pumps', icon: Droplets, text: 'Water, powered by sunshine.' },
  { title: 'Solar lighting', category: 'Solar Floodlight and Streetlights', icon: Lightbulb, text: 'Brighter nights. Less cost.' },
];
export default function LandingPage() {
  return <main><section className="solar-hero">
    <img className="hero-photo" src="/solar-hero.png" alt="Black African solar technician working on a rooftop solar installation" fetchPriority="high" /><div className="hero-shade" />
    <div className="site-container hero-content"><p className="eyebrow light">CLEAN. RENEWABLE. YOURS.</p><h1>Solar energy<br />for a <em>brighter<br />tomorrow.</em></h1><p className="hero-description">Power your home, business or farm with reliable solar solutions. Designed for your needs. Installed by a team that cares.</p><div className="hero-actions"><Link to="/contact" className="button button-lime">Get a free quote <ArrowRight size={19} /></Link><Link to="/gallery" className="button button-glass"><Play size={17} fill="currentColor" /> See our work</Link></div><p className="hero-location">Based in Kisumu. Powering lives across Kenya.</p></div><div className="hero-note"><Sun size={23} /><span>GOOD ENERGY.<br /><strong>Every day.</strong></span></div>
    </section><section className="benefits-strip"><div className="site-container benefits-grid">{[
      { icon: Leaf, title: 'Cleaner energy', text: 'A lighter footprint.' }, { icon: Zap, title: 'Lower power bills', text: 'Make more of the sun.' }, { icon: ShieldCheck, title: 'Built to last', text: 'Quality you can count on.' }, { icon: Headphones, title: 'Local support', text: 'Here when you need us.' },
    ].map(({ icon: Icon, title, text }) => <div className="benefit" key={title}><Icon /><div><h3>{title}</h3><p>{text}</p></div></div>)}</div></section>
    <section className="section-space solutions-section"><div className="site-container"><div className="section-heading"><div><p className="eyebrow">OUR SOLAR SOLUTIONS</p><h2>Small switch. Brighter possibilities.</h2><p>Everything you need to start your solar journey.</p></div><Link to="/services" className="text-link">Explore our services <ArrowRight size={18} /></Link></div><div className="solutions-grid">{solutions.map(({ title, category, icon: Icon, text }) => {
      const product = initialProducts.find(p => p.category === category);
      return <Link key={title} to={`/products?category=${encodeURIComponent(category)}`} className="solution-card"><div className="solution-image">{product && <img src={product.image} alt={title} loading="lazy" />}<span><Icon size={23} /></span></div><div className="solution-copy"><h3>{title}</h3><p>{text}</p><ArrowRight size={18} /></div></Link>;
    })}</div></div></section>
    <section className="why-section"><div className="site-container why-grid"><div className="why-photo"><img src="/maranda/1.jpg" alt="STETECH solar installation at Maranda" loading="lazy" /><Link to="/projects" className="photo-caption"><span>REAL PROJECTS. REAL IMPACT.</span>Explore our installations <ArrowRight size={19} /></Link></div><div className="why-copy"><p className="eyebrow">THE STETECH DIFFERENCE</p><h2>Your sunshine.<br />Our expertise.</h2><p>From the first conversation to the final connection, we make going solar simple. Our Kisumu-based team supplies, installs and supports systems for homes, businesses and institutions.</p><ul>{['The right system for your energy needs', 'Professional installation, start to finish', 'Clear advice and straightforward pricing', 'A local team for after-sales support'].map(text => <li key={text}><CheckCircle2 size={19} />{text}</li>)}</ul><Link to="/about" className="text-link">Get to know STETECH <ArrowRight size={18} /></Link></div></div></section>
    <section className="solar-cta"><div className="site-container"><div><p className="eyebrow light">LET’S MAKE THE SWITCH</p><h2>A brighter home<br />starts with a conversation.</h2></div><Link to="/contact" className="button button-lime">Find your solar solution <ArrowRight size={19} /></Link></div></section></main>;
}
