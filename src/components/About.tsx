import React from 'react';
import { Users, Award, Globe, Target } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            About STETECH Solar Technology
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            "Partnering for a greener future" - Kenya's trusted solar energy solutions provider since 2012
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Who We Are</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              STETECH SOLAR TECHNOLOGY -K is one of the leading provider of energy solutions since
              2012. We are dedicated to delivering sustainable and reliable clean energy solutions
              across Kenya and it's neighbouring Eastern African countries.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
             We take pride in our 10+ years commitment to innovation, quality, durability, efficiency,
             timely service delivering, and above all, ensuring our ccustomers' satifaction. We offer a
             wide range of products, services and solutions tailored to meet the diverse energy needs of our customers.
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
          <div className="bg-white rounded-lg shadow-xl p-8">
            <img 
              src="https://images.pexels.com/photos/2800832/pexels-photo-2800832.jpeg?auto=compress&cs=tinysrgb&w=600" 
              alt="Solar Installation" 
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Recent Success Story</h4>
            <p className="text-gray-600">15kWp Solar Installation - MountainView Estate, Kangemi, Nairobi</p>
          </div>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <Award className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Integrity</h4>
            <p className="text-gray-600 text-sm">Transparent business practices building long-term trusted partnerships with every client</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Innovation</h4>
            <p className="text-gray-600 text-sm">Pioneering cutting-edge solar and energy storage technology solutions</p>
          </div>
          <div className="text-center">
            <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <Globe className="h-8 w-8 text-yellow-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Sustainability</h4>
            <p className="text-gray-600 text-sm">Delivering environmentally sustainable solutions that protect our planet's future</p>
          </div>
          <div className="text-center">
            <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <Users className="h-8 w-8 text-red-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Safety</h4>
            <p className="text-gray-600 text-sm">Maintaining the highest safety standards and accountability in every installation</p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          <div className="bg-blue-600 text-white rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-blue-100 leading-relaxed">
              To make solar energy affordable and accessible to everyone by maintaining competitive costs 
              and passing maximum savings directly to our valued customers across Kenya.
            </p>
          </div>
          <div className="bg-green-600 text-white rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
            <p className="text-green-100 leading-relaxed">
              To lead Kenya's transition to sustainable energy by making solar power the primary energy 
              source for homes and businesses, promoting energy independence while actively combating climate change.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;