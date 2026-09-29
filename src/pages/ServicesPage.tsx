import React from 'react';
import { Sun, Battery, Lightbulb, Zap, Home, Building, MessageCircle } from 'lucide-react';

const ServicesPage: React.FC = () => {
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
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Battery,
      title: 'Solar Backup Systems',
      description: 'Reliable backup power ensuring uninterrupted electricity during outages',
      features: ['24/7 emergency power supply', 'Advanced battery storage', 'Intelligent hybrid systems', 'Remote monitoring capability'],
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Lightbulb,
      title: 'Solar Lighting',
      description: 'Energy-efficient LED lighting for streets, gardens, and security applications',
      features: ['Advanced LED technology', 'Motion sensor activation', 'Remote control operation', 'All-weather durability'],
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: Zap,
      title: 'Solar Water Heating',
      description: 'Efficient hot water systems reducing electricity costs by up to 70%',
      features: ['Flat plate & vacuum tube collectors', 'Heat pump integration', 'Commercial-grade systems', 'Maintenance-free operation'],
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Home,
      title: 'Residential Solutions',
      description: 'Customized solar solutions designed specifically for your home\'s energy needs',
      features: ['Free home energy assessment', 'Custom system design', 'Flexible financing options', 'Professional installation & support'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Building,
      title: 'Commercial Solutions',
      description: 'Large-scale solar installations maximizing business energy savings and ROI',
      features: ['Industrial-grade systems', 'Comprehensive energy audits', 'Detailed ROI analysis', '24/7 maintenance support'],
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive solar energy solutions from initial assessment to complete installation and ongoing support
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`bg-gradient-to-r ${service.color} rounded-full p-4 w-16 h-16 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleOrderClick(service.title)}
                  className={`w-full bg-gradient-to-r ${service.color} text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2`}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Request Free Quote</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Premium Solar Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
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
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center hover:from-blue-50 hover:to-blue-100 hover:border-blue-200 border-2 border-transparent transition-all duration-300 transform hover:scale-105"
              >
                <p className="text-sm font-medium text-gray-900">{product}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;