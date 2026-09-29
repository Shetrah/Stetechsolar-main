import React from 'react';
import { Sun, Battery, Lightbulb, Zap, Home, Building, MessageCircle } from 'lucide-react';

const Services: React.FC = () => {
  const handleOrderClick = (service: string) => {
    const message = `Hello STETECH Solar Technology,

I am interested in your ${service} service and would like to request a free consultation.

Please provide me with:
• Detailed pricing information
• Installation timeline
• Technical specifications
• Warranty details
• Financing options available

I would appreciate scheduling a site assessment at your earliest convenience.

Thank you for your time.`;
    window.open(`https://wa.me/254717656407?text=${encodeURIComponent(message)}`, '_blank');
  };

  const services = [
    {
      icon: Sun,
      title: 'Solar PV Solutions',
      description: 'Complete solar panel systems delivering clean energy for homes and businesses',
      features: ['High-efficiency solar modules', '25+ year manufacturer warranty', 'Grid-tied & hybrid systems', 'Off-grid solutions available'],
      color: 'bg-yellow-500'
    },
    {
      icon: Battery,
      title: 'Solar Backup Systems',
      description: 'Reliable backup power ensuring uninterrupted electricity during outages',
      features: ['24/7 emergency power supply', 'Advanced battery storage', 'Intelligent hybrid systems', 'Remote monitoring capability'],
      color: 'bg-blue-500'
    },
    {
      icon: Lightbulb,
      title: 'Solar Lighting',
      description: 'Energy-efficient LED lighting for streets, gardens, and security applications',
      features: ['Advanced LED technology', 'Motion sensor activation', 'Remote control operation', 'All-weather durability'],
      color: 'bg-green-500'
    },
    {
      icon: Zap,
      title: 'Solar Water Heating',
      description: 'Efficient hot water systems reducing electricity costs by up to 70%',
      features: ['Flat plate & vacuum tube collectors', 'Heat pump integration', 'Commercial-grade systems', 'Maintenance-free operation'],
      color: 'bg-orange-500'
    },
    {
      icon: Home,
      title: 'Residential Solutions',
      description: 'Customized solar solutions designed specifically for your home\'s energy needs',
      features: ['Free home energy assessment', 'Custom system design', 'Flexible financing options', 'Professional installation & support'],
      color: 'bg-purple-500'
    },
    {
      icon: Building,
      title: 'Commercial Solutions',
      description: 'Large-scale solar installations maximizing business energy savings and ROI',
      features: ['Industrial-grade systems', 'Comprehensive energy audits', 'Detailed ROI analysis', '24/7 maintenance support'],
      color: 'bg-indigo-500'
    }
  ];

  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive solar energy solutions from initial assessment to complete installation and ongoing support
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className={`${service.color} rounded-full p-3 w-12 h-12 mb-4`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleOrderClick(service.title)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 shadow-md"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Request Free Quote</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Products Section */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Premium Solar Products</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              'Premium Solar Panels',
              'Solar Inverters',
              'Charge Controllers',
              'Lithium Solar Batteries',
              'Mounting Structures',
              'Solar Water Heaters',
              'Solar Water Pumps',
              'Energy Storage Systems',
              'Solar CCTV Cameras',
              'Professional Accessories',
              'Electrical Accessories',
              'LED Solar Lighting'
            ].map((product, index) => (
              <div key={index} className="bg-gray-100 rounded-lg p-4 text-center hover:bg-blue-50 hover:border-blue-200 border-2 border-transparent transition-all duration-300">
                <p className="text-sm font-medium text-gray-900">{product}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;