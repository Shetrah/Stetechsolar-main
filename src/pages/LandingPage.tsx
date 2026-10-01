import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  BatteryCharging,
  CheckCircle2,
  Droplets,
  ExternalLink,
  Headphones,
  Leaf,
  Lightbulb,
  Play,
  ShieldCheck,
  Sun,
  X,
  Zap,
} from 'lucide-react';

const VIDEO_ID = 'HbJBgEQ-Fiw';

const YOUTUBE_CHANNEL =
  'https://youtube.com/@stetechsolartechnology?si=3Ztd5IjjR9go-TI2';

const solutions = [
  {
    title: 'Solar panels',
    category: 'Solar Panels',
    image: '/solutions/solar power systems.jpg',
    icon: Sun,
    text: 'Put the sun to work.',
  },
  {
    title: 'Inverters',
    category: 'Solar Inverters',
    image: '/solutions/Inverters.jpg',
    icon: Zap,
    text: 'Power you can depend on.',
  },
  {
    title: 'Solar batteries',
    category: 'Solar Batteries',
    image: '/solutions/Solar batteries.jpg',
    icon: BatteryCharging,
    text: 'Save energy for later.',
  },
  {
    title: 'Water pumping',
    category: 'Solar DC Pumps',
    image: '/solutions/Water pumping.jpg',
    icon: Droplets,
    text: 'Water, powered by sunshine.',
  },
  {
    title: 'Solar lighting',
    category: 'Solar Floodlight and Streetlights',
    image: '/services/Lighting & security.jpeg',
    icon: Lightbulb,
    text: 'Brighter nights. Less cost.',
  },
];

const benefits = [
  {
    icon: Leaf,
    title: 'Cleaner energy',
    text: 'A lighter footprint.',
  },
  {
    icon: Zap,
    title: 'Lower power bills',
    text: 'Make more of the sun.',
  },
  {
    icon: ShieldCheck,
    title: 'Built to last',
    text: 'Quality you can count on.',
  },
  {
    icon: Headphones,
    title: 'Local support',
    text: 'Here when you need us.',
  },
];

const advantages = [
  'The right system for your energy needs',
  'Professional installation, start to finish',
  'Clear advice and straightforward pricing',
  'A local team for after-sales support',
];

export default function LandingPage() {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (!showVideo) {
      document.body.style.overflow = '';
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowVideo(false);
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [showVideo]);

  return (
    <>
      <main>
        {/* HERO */}
        <section className="solar-hero">
          <img
            className="hero-photo"
            src="/solar-hero.png"
            alt="Black African solar technician working on a rooftop solar installation"
          />

          <div className="hero-shade" />

          <div className="site-container hero-content">
            <p className="eyebrow light">CLEAN | RENEWABLE | SUSTAINABLE</p>

            <h1>
              Solar Energy
              <br />
              for a brighter <br /> <em>tommorrow.</em>
            </h1>

            <p className="hero-description">
              STETECH SOLAR TECHNOLOGY -K provides high-quality solar solutions for homes, businesses and industries. Harness the power of the sun and enjoy clean, reliable and affordable energy.
            </p>

            <div className="hero-actions">
              <a href="/contact" className="button button-lime">
                Get a free quote
                <ArrowRight size={19} />
              </a>

              <button
                type="button"
                className="button button-glass"
                onClick={() => setShowVideo(true)}
                aria-haspopup="dialog"
                aria-expanded={showVideo}
              >
                <Play size={17} fill="currentColor" />
                Watch our work
              </button>
            </div>

            <div className="hero-proof" aria-label="STETECH experience">
              <span><strong>500+</strong> successful installations</span>
              <span><strong>Since 2012</strong> serving Kenya</span>
              <span><strong>100%</strong> customer satisfaction</span>
            
            </div>
          </div>

          <div className="hero-note">
            <Sun size={23} />

            <span>
              POWERING KENYA.
              <br />
              <strong>Made for real life.</strong>
            </span>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="benefits-strip">
          <div className="site-container benefits-grid">
            {benefits.map(({ icon: Icon, title, text }) => (
              <div className="benefit" key={title}>
                <Icon />

                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SOLUTIONS */}
        <section className="section-space solutions-section">
          <div className="site-container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">OUR SOLAR SOLUTIONS</p>

                <h2>Small switch. Brighter possibilities.</h2>

                <p>
                  Everything you need to start your solar journey.
                </p>
              </div>

              <a href="/services" className="text-link">
                Explore our services
                <ArrowRight size={18} />
              </a>
            </div>

            <div className="solutions-grid">
              {solutions.map(({ title, category, image, icon: Icon, text }) => (
                    <a
                      key={title}
                      href={`/products?category=${encodeURIComponent(
                        category
                      )}`}
                      className="solution-card"
                    >
                      <div className="solution-image">
                        <img src={image} alt={title} loading="lazy" />

                        <span>
                          <Icon size={23} />
                        </span>
                      </div>

                      <div className="solution-copy">
                        <h3>{title}</h3>

                        <p>{text}</p>

                        <ArrowRight size={18} />
                      </div>
                    </a>
              ))}
            </div>
          </div>
        </section>

        {/* WHY STETECH */}
        <section className="why-section">
          <div className="site-container why-grid">
            <div className="why-photo">
              <img
                src="/maranda/1.jpg"
                alt="STETECH solar installation at Maranda"
                loading="lazy"
              />

              <a href="/projects" className="photo-caption">
                <span>REAL PROJECTS. REAL IMPACT.</span>

                Explore our installations
                <ArrowRight size={19} />
              </a>
            </div>

            <div className="why-copy">
              <p className="eyebrow">THE STETECH DIFFERENCE</p>

              <h2>
                Your sunshine.
                <br />
                Our expertise.
              </h2>

              <p>
                Kenya's premium solar energy solutions provider since 2012,
                delivering sustainable and affordable clean energy solutions
                with over 500+ Successful Installations.
              </p>

              <p>
                From the first conversation to the final connection,
                we make going solar simple. Our Kisumu-based team
                supplies, installs and supports systems for homes,
                businesses and institutions.
              </p>

              <ul>
                {advantages.map((text) => (
                  <li key={text}>
                    <CheckCircle2 size={19} />
                    {text}
                  </li>
                ))}
              </ul>

              <a href="/about" className="text-link">
                Get to know STETECH
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="solar-cta">
          <div className="site-container">
            <div>
              <p className="eyebrow light">
                LET’S MAKE THE SWITCH
              </p>

              <h2>
                A brighter home
                <br />
                starts with a conversation.
              </h2>
            </div>

            <a href="/contact" className="button button-lime">
              Find your solar solution
              <ArrowRight size={19} />
            </a>
          </div>
        </section>
      </main>

      {/* VIDEO MODAL */}
      {showVideo && (
        <div
          className="video-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="solar-video-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowVideo(false);
            }
          }}
        >
          <div className="video-modal-content">
            {/* HEADER */}
            <div className="video-modal-header">
              <div className="video-modal-heading">
                <div className="video-modal-icon">
                  <Play size={18} fill="currentColor" />
                </div>

                <div>
                  <p className="eyebrow">
                    STETECH SOLAR TECHNOLOGY
                  </p>

                  <h2 id="solar-video-title">
                    Watch our work
                  </h2>
                </div>
              </div>

              <button
                type="button"
                className="video-modal-close"
                onClick={() => setShowVideo(false)}
                aria-label="Close video"
              >
                <X size={23} />
              </button>
            </div>

            {/* YOUTUBE PLAYER */}
            <div className="video-frame">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&playsinline=1`}
                title="20KW 3PHASE SOLAR PV INSTALLATION DONE @ MTWAPA, KILIFI COUNTY"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* VIDEO FOOTER */}
            <div className="video-modal-footer">
              <div className="video-modal-description">
                <strong>
                  20KW 3PHASE SOLAR PV INSTALLATION
                </strong>

                <span>MTWAPA, KILIFI COUNTY</span>
              </div>

              <div className="video-modal-links">
                <a
                  href={`https://www.youtube.com/watch?v=${VIDEO_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="video-channel-link"
                >
                  Watch on YouTube
                  <ExternalLink size={16} />
                </a>

                <a
                  href={YOUTUBE_CHANNEL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="video-channel-link"
                >
                  Visit our channel
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}