import { ArrowRight, BatteryCharging, Droplets, Lightbulb, Sun, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { initialProducts } from '../data/products';

const services = [
	{ icon: Sun, title: 'Solar power systems', category: 'Solar Panels', text: 'We design tailored solar systems to meet your unique energy needs and budget.', items: ['Energy needs assessment', 'System design and equipment supply', 'Installation and commissioning'] },
	{ icon: BatteryCharging, title: 'Battery backup', category: 'Solar Batteries', text: 'Our certified technicians ensure safe, efficient and professional solar installations.', items: ['Battery and inverter selection', 'Hybrid and off-grid systems', 'Compatibility and capacity guidance'] },
	{ icon: Droplets, title: 'Solar water solutions', category: 'Solar DC Pumps', text: 'Put sunshine to work for your water needs.', items: ['Solar water pumping', 'Water heating solutions', 'Sizing for your site and usage'] },
	{ icon: Lightbulb, title: 'Lighting & security', category: 'Solar Floodlight and Streetlights', text: 'Practical lighting and security for outdoor spaces.', items: ['Solar floodlights and streetlights', 'Solar-powered security cameras', 'Installation and setup'] },
	{ icon: Wrench, title: 'Maintenance & support', category: 'Solar Inverters', text: 'Keep your solar equipment working at its best.', items: ['System checks and troubleshooting', 'Repairs and equipment upgrades', 'After-sales guidance'] },
];

export default function ServicesPage() {
	return <main>
		<section className="page-heading"><div className="site-container"><p className="eyebrow">OUR SERVICES</p><h1>Built around your energy needs.</h1><p>From a single solar light to a complete installation, we help you choose, install and look after your system.</p></div></section>
		<section className="site-container section-space"><div className="services-grid">{services.map(({ icon: Icon, title, category, text, items }, index) => {
			const image = initialProducts.find((product) => product.category === category)?.image;
			return <article key={title} className="service-card group">
				<div className="service-card-image">{image && <img src={image} alt={title} loading="lazy" />}<span className="service-icon"><Icon size={23} /></span></div>
				<div className="service-card-copy"><p className="service-number">0{index + 1}</p><h2>{title}</h2><p className="service-description">{text}</p><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul><a className="text-link" href={`https://wa.me/254717656407?text=${encodeURIComponent(`Hello STETECH, I would like a quote for ${title.toLowerCase()}.`)}`} target="_blank" rel="noreferrer">Enquire about this service <ArrowRight size={17} /></a></div>
			</article>;
		})}</div><div className="mt-12 flex flex-wrap items-center justify-between gap-5 rounded-xl bg-emerald-900 p-8 text-white"><div><h2 className="text-2xl font-bold">Not sure where to start?</h2><p className="mt-2 text-emerald-100">Tell us what you want to power. We’ll help with the next step.</p></div><Link className="button button-lime" to="/contact">Let’s talk <ArrowRight size={18} /></Link></div></section>
	</main>;
}
