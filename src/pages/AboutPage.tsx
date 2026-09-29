import React from 'react';
import { Users, Award, Globe, Target, Shield, Lightbulb, Heart } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About STETECH Solar Technology
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            "Partnering for a greener future" - Kenya's trusted solar energy solutions provider since 2012
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Who We Are</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              STETECH Solar Technology is a regionally recognized leading solar energy solutions provider, 
              specializing in high efficiency PV module comprehensive EPC solutions. We are 100% Kenyan owned 
              and have over 12 years of experience in developing solar solutions, project management, innovation, 
              and finance options.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We have successfully completed 500+ installations ranging from residential homes 
              to utility-scale projects up to 10 MW. Every project is delivered through the highest 
              standards of performance, quality, and customer service excellence.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                Since 2012
              </div>
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                100% Kenyan Owned
              </div>
              <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
                Up to 10MW Projects
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <img 
              src="https://images.pexels.com/photos/2800832/pexels-photo-2800832.jpeg?auto=compress&cs=tinysrgb&w=600" 
              alt="Solar Installation" 
              className="w-full h-64 object-cover rounded-xl mb-6"
            />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Success Story</h3>
            <p className="text-gray-600">15kWp Solar Installation - MountainView Estate, Kangemi, Nairobi</p>
          </div>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            {
              icon: Award,
              title: 'Integrity',
              description: 'Transparent business practices building long-term trusted partnerships with every client',
              color: 'from-blue-500 to-blue-600'
            },
            {
              icon: Target,
              title: 'Innovation',
              description: 'Pioneering cutting-edge solar and energy storage technology solutions',
              color: 'from-green-500 to-green-600'
            },
            {
              icon: Globe,
              title: 'Sustainability',
              description: 'Delivering environmentally sustainable solutions that protect our planet\'s future',
              color: 'from-yellow-500 to-yellow-600'
            },
            {
              icon: Shield,
              title: 'Safety',
              description: 'Maintaining the highest safety standards and accountability in every installation',
              color: 'from-red-500 to-red-600'
            }
          ].map((value, index) => {
            const IconComponent = value.icon;
            return (
              <div
                key={index}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className={`bg-gradient-to-r ${value.color} rounded-full p-4 w-16 h-16 mx-auto mb-4 transform hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            );
          })}
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-8 transform hover:scale-105 transition-transform duration-300">
            <Heart className="h-12 w-12 text-blue-200 mb-4" />
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-blue-100 leading-relaxed">
              To make solar energy affordable and accessible to everyone by maintaining competitive costs 
              and passing maximum savings directly to our valued customers across Kenya.
            </p>
          </div>
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl p-8 transform hover:scale-105 transition-transform duration-300">
            <Lightbulb className="h-12 w-12 text-green-200 mb-4" />
            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
            <p className="text-green-100 leading-relaxed">
              To lead Kenya's transition to sustainable energy by making solar power the primary energy 
              source for homes and businesses, promoting energy independence while actively combating climate change.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in-up">
              <div className="text-4xl font-bold text-yellow-400 mb-2">500+</div>
              <div className="text-gray-300">Projects Completed</div>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl font-bold text-blue-400 mb-2">10MW+</div>
              <div className="text-gray-300">Total Capacity</div>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="text-4xl font-bold text-green-400 mb-2">12+</div>
              <div className="text-gray-300">Years Experience</div>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="text-4xl font-bold text-red-400 mb-2">100%</div>
              <div className="text-gray-300">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;