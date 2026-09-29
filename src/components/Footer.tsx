import React from 'react';
import { Link } from 'react-router-dom';
import {Phone, Mail, MapPin, MessageCircle, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  const handleWhatsAppClick = () => {
    window.open('https://wa.me/254717656407?text=Hello%20STETECH%20Solar%20Technology,%0A%0AI%20would%20like%20to%20learn%20more%20about%20your%20solar%20solutions%20and%20how%20they%20can%20help%20me%20save%20on%20electricity%20costs.%0A%0APlease%20provide%20information%20about:%0A%E2%80%A2%20Available%20solar%20solutions%0A%E2%80%A2%20Pricing%20and%20financing%20options%0A%E2%80%A2%20Installation%20process%0A%E2%80%A2%20Warranty%20coverage%0A%0AThank%20you!', '_blank');
  };

  const handlePhoneClick = () => {
    window.location.href = 'tel:+254717656407';
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:stetechsolartechnology@gmail.com?subject=Solar%20Energy%20Inquiry&body=Hello%20STETECH%20SOLAR%20TECHNOLOGY,%0A%0AI%20am%20interested%20in%20your%20solar%20solutions%20and%20would%20like%20to%20request%20more%20information.%0A%0APlease%20contact%20me%20at%20your%20earliest%20convenience.%0A%0AThank%20you!';
  };

  const handleWebsiteClick = () => {
    window.open('https://www.stetechsolartechnology.co.ke', '_blank');
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative">
                <img 
                  src="/stetech solar.png" 
                  alt="STETECH Solar Technology" 
                  className="h-8 w-8 object-contain"
                />
                <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold">STETECH</h3>
                <p className="text-sm text-gray-400">SOLAR TECHNOLOGY</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Kenya's premier solar energy solutions provider since 2012, delivering sustainable and affordable clean energy solutions with over 500 successful installations.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleWhatsAppClick}
                className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-all duration-300 transform hover:scale-110"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Products</Link></li>
              <li><Link to="/projects" className="hover:text-white transition-colors">Projects</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Solar PV Solutions</li>
              <li>Solar Water Heating</li>
              <li>Solar Lighting Systems</li>
              <li>Solar Backup Solutions</li>
              <li>Commercial Solar</li>
              <li>Residential Solar</li>
              <li>Solar CCTV camera Solutions</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <div>
                  <p>Uhuru Market Business Complex</p>
                  <p>Block R41, Nyerere Road</p>
                  <p>Kisumu, Kenya</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <div>
                  <button
                    onClick={handlePhoneClick}
                    className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer block"
                  >
                    +254 717 656 407 (Primary)
                  </button>
                  <button
                    onClick={() => window.open('tel:+254752539063', '_self')}
                    className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer block"
                  >
                    +254 752 539 063
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <button
                  onClick={handleEmailClick}
                  className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  stetechsolartechnology@gmail.com
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4 flex-shrink-0" />
                <button
                  onClick={handleWebsiteClick}
                  className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  www.stetechsolartechnology.co.ke
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <p className="text-gray-400">
                &copy; 2024 STETECH Solar Technology. All rights reserved.
              </p>
            </div>
            <div className="md:text-right">
              <p className="text-gray-400">
                "Partnering for a greener future" | Powering Lives Across Kenya
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Designed By: Shetrahgrafix | www.shetrahgrafix.co.ke
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;