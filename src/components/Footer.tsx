import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { navigation } from './Header';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container">
        <div className="footer-grid">
          <div>
            <h3 className="text-xl">STETECH Solar Technology</h3>

            <p>
              Kenya&apos;s premium solar energy solutions provider since
              2012, delivering sustainable and affordable clean energy
              solutions with over 500+ successful installations.
            </p>

            <a
              className="footer-contact"
              href="https://wa.me/254717656407"
              target="_blank"
              rel="noopener noreferrer"
            >
              Let’s talk solar on WhatsApp →
            </a>
          </div>

          <div>
            <h3>Explore</h3>

            <nav className="footer-links" aria-label="Footer navigation">
              {navigation.map(([path, label]) => (
                <Link key={path} to={path}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3>Find us in Kisumu</h3>

            <p className="footer-contact">
              <MapPin size={16} aria-hidden="true" />
              <span>
                Uhuru Market Business Complex
                <br />
                Block R41, Nyerere Road
              </span>
            </p>

            <a className="footer-contact" href="tel:+254717656407">
              <Phone size={16} aria-hidden="true" />
              +254 717 656 407
            </a>

            <a className="footer-contact" href="tel:+254752539063">
              <Phone size={16} aria-hidden="true" />
              +254 752 539 063
            </a>

            <a
              className="footer-contact"
              href="mailto:stetechsolartechnology@gmail.com"
            >
              <Mail size={16} aria-hidden="true" />
              stetechsolartechnology@gmail.com
            </a>
          </div>
        </div>

        {/* Map of the exact business listing supplied */}
        <div style={{ marginTop: '28px' }}>
          <h3 style={{ marginBottom: '12px' }}>Our Location</h3>

          <iframe
            title="STETECH Solar Technology – K Ltd location"
            src="https://www.google.com/maps?cid=498413841767180906&output=embed"
            width="100%"
            height="320"
            style={{
              display: 'block',
              border: 0,
              borderRadius: '12px',
            }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          <a
            className="footer-contact"
            href="https://maps.app.goo.gl/Pr1AFG4NVVh1dQUZA?g_st=ac"
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginTop: '12px' }}
          >
            <MapPin size={16} aria-hidden="true" />
            Get directions on Google Maps →
          </a>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} STETECH Solar Technology.
            All rights reserved.
          </p>

          <p>
            Designed by{' '}
            <a
              href="https://www.nexxacrafts.co.ke"
              target="_blank"
              rel="noopener noreferrer"
            >
              NexxaCrafts
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}