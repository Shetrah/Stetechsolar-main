import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, MessageCircle, X } from 'lucide-react';
export const navigation = [['/', 'Home'], ['/about', 'About'], ['/services', 'Services'], ['/projects', 'Projects'], ['/products', 'Products'], ['/gallery', 'Gallery'], ['/contact', 'Contacts']];
export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  return <header className="site-header"><div className="site-container header-inner">
    <Link to="/" className="brand" aria-label="STETECH Solar Technology home"><img src="/stetech solar.png" alt="" /><span><strong>STETECH</strong><small>SOLAR TECHNOLOGY</small></span></Link>
    <nav className="desktop-nav" aria-label="Main navigation">{navigation.map(([path, label]) => <NavLink end={path === '/'} key={path} to={path}>{label}</NavLink>)}</nav>
    <a href="https://wa.me/254717656407" className="header-call" aria-label="Chat with STETECH on WhatsApp" title="Chat on WhatsApp" target="_blank" rel="noreferrer"><MessageCircle size={21} /></a>
    <button className="menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </div>{open && <nav id="mobile-navigation" className="mobile-nav animate-fade-in-up" aria-label="Mobile navigation">{navigation.map(([path, label]) => <NavLink end={path === '/'} key={path} to={path}>{label}</NavLink>)}</nav>}</header>;
}
