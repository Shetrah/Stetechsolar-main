import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    location: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Hello STETECH Solar Technology,

I would like to request a comprehensive quote for a solar installation project.

Contact Details:
• Name: ${formData.name}
• Email: ${formData.email}
• Phone: ${formData.phone}
• Location: ${formData.location}

Project Details:
• Project Type: ${formData.projectType}
• Additional Requirements: ${formData.message}

Please contact me at your earliest convenience to discuss:
• Detailed project specifications
• Installation timeline
• Comprehensive pricing
• Financing options
• Warranty information

I look forward to working with your expert team.

Best regards,
${formData.name}`;

    window.open(`https://wa.me/254717656407?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleDirectWhatsApp = () => {
    window.open('https://wa.me/254717656407?text=Hello%20STETECH%20Solar%20Technology,%0A%0AI%20would%20like%20to%20discuss%20a%20solar%20project%20for%20my%20property.%0A%0APlease%20provide%20me%20with:%0A%E2%80%A2%20Service%20information%0A%E2%80%A2%20Pricing%20details%0A%E2%80%A2%20Installation%20process%0A%E2%80%A2%20Financing%20options%0A%0AI%20would%20appreciate%20scheduling%20a%20free%20consultation.%0A%0AThank%20you!', '_blank');
  };

  const handlePhoneClick = () => {
    window.open('tel:+254717656407', '_self');
  };

  const handleEmailClick = () => {
    window.open('mailto:stetechsolartechnology@gmail.com?subject=Solar%20Energy%20Inquiry&body=Hello%20STETECH%20Solar%20Technology,%0A%0AI%20am%20interested%20in%20your%20solar%20solutions%20and%20would%20like%20to%20request%20more%20information.%0A%0APlease%20contact%20me%20at%20your%20earliest%20convenience.%0A%0AThank%20you!', '_self');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-fade-in-up">Get Your Free Solar Quote Today</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Ready to start saving on electricity bills? Contact us today for a personalized consultation and comprehensive free quote
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Your Free Quote</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Type *
                  </label>
                  <select
                    id="projectType"
                    name="projectType"
                    required
                    value={formData.projectType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="">Select your project type</option>
                    <option value="Residential Solar">Residential Solar</option>
                    <option value="Commercial Solar">Commercial Solar</option>
                    <option value="Solar Water Heating">Solar Water Heating</option>
                    <option value="Solar Lighting">Solar Lighting</option>
                    <option value="Solar Backup">Solar Backup</option>
                    <option value="Solar Water Pumping">Solar Water Pumping</option>
                    <option value="Custom Solution">Custom Solution</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your location"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  placeholder="Tell us about your specific energy needs, current electricity bills, or any special requirements..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Send Free Quote Request via WhatsApp</span>
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 rounded-full p-3">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Address</h3>
                    <p className="text-gray-600">
                      Uhuru Market Business Complex<br />
                      Block R41<br />
                      Nyerere Road, Kisumu, Kenya
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Phone</h3>
                    <div className="space-y-1">
                      <button
                        onClick={handlePhoneClick}
                        className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer block"
                      >
                        +254 717 656 407 (Primary)
                      </button>
                      <button
                        onClick={() => window.open('tel:+254752539063', '_self')}
                        className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer block"
                      >
                        +254 752 539 063
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-100 rounded-full p-3">
                    <Mail className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <button
                      onClick={handleEmailClick}
                      className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                    >
                      stetechsolartechnology@gmail.com
                    </button>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 rounded-full p-3">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Business Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 8:00 AM - 6:00 PM<br />
                      Saturday: 8:00 AM - 4:00 PM<br />
                      Sunday: Emergency calls only
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <h2 className="text-xl font-bold mb-4">Need Immediate Expert Assistance?</h2>
              <p className="mb-6">
                Connect instantly with our certified solar experts on WhatsApp for immediate support, technical advice, and rapid quotes.
              </p>
              <button
                onClick={handleDirectWhatsApp}
                className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Chat with Solar Expert Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;