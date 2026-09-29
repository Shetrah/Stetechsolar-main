import React from 'react';
import { DollarSign, TrendingUp, Home, Leaf, Award, Users, Factory, Sun } from 'lucide-react';

const WhySolar: React.FC = () => {
  const benefits = [
    {
      icon: DollarSign,
      title: 'Slash Your Electricity Bills by 90%',
      description: 'Generate free power for your system\'s entire 25+ year lifecycle. Most customers see immediate savings from month one with payback periods of 3-5 years.',
      color: 'bg-green-500'
    },
    {
      icon: TrendingUp,
      title: 'Exceptional Return on Investment',
      description: 'Solar panels deliver 15-20% annual returns, significantly outperforming traditional investments while providing decades of financial benefits.',
      color: 'bg-blue-500'
    },
    {
      icon: Home,
      title: 'Boost Property Value by 15-20%',
      description: 'Properties with solar installations command premium prices and sell 20% faster than comparable non-solar properties in today\'s market.',
      color: 'bg-purple-500'
    },
    {
      icon: Leaf,
      title: 'Make a Real Environmental Impact',
      description: 'A typical residential solar system prevents 3-4 tons of carbon emissions annually - equivalent to planting 100+ trees every year.',
      color: 'bg-green-600'
    },
    {
      icon: Award,
      title: 'Lead in Corporate Responsibility',
      description: 'Demonstrate your commitment to sustainability and environmental stewardship, enhancing brand reputation and attracting eco-conscious customers.',
      color: 'bg-yellow-500'
    },
    {
      icon: Users,
      title: 'Gain Competitive Advantage',
      description: 'Businesses with solar installations reduce operational costs while demonstrating forward-thinking leadership in their industry.',
      color: 'bg-indigo-500'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Solar?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the compelling financial, environmental, and social benefits of switching to solar energy
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div key={index} className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className={`${benefit.color} rounded-full p-3 w-12 h-12 mb-4`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            );
          })}
        </div>

        {/* Solar vs Traditional Energy */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Solar Energy vs Traditional Power</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Factory className="h-7 w-7 text-red-600" />
              </div>
              <h4 className="text-lg font-semibold text-red-600 mb-2">Traditional Grid Power</h4>
              <ul className="text-gray-600 space-y-2">
                <li>• Constantly rising electricity costs</li>
                <li>• Environmental pollution</li>
                <li>• Depleting fossil fuel resources</li>
                <li>• Dependence on imported fuels</li>
                <li>• Unpredictable price increases</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Sun className="h-7 w-7 text-emerald-600" />
              </div>
              <h4 className="text-lg font-semibold text-green-600 mb-2">Solar Energy</h4>
              <ul className="text-gray-600 space-y-2">
                <li>• Unlimited free sunlight</li>
                <li>• Zero harmful emissions</li>
                <li>• 100% renewable resource</li>
                <li>• Energy independence</li>
                <li>• Fixed, predictable costs</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Saving Money?</h3>
          <p className="text-lg text-gray-600 mb-8">
            Join 500+ satisfied customers who are already saving thousands on electricity bills
          </p>
          <button
            onClick={() => window.open('https://wa.me/254717656407?text=Hello%20STETECH%20Solar%20Technology,%0A%0AI%20am%20ready%20to%20switch%20to%20solar%20energy%20and%20start%20saving%20on%20my%20electricity%20bills.%0A%0APlease%20help%20me%20understand:%0A%E2%80%A2%20Potential%20savings%20for%20my%20property%0A%E2%80%A2%20Installation%20costs%20and%20financing%20options%0A%E2%80%A2%20System%20size%20recommendations%0A%E2%80%A2%20Timeline%20for%20installation%0A%0AI%20would%20like%20to%20schedule%20a%20free%20consultation%20at%20your%20earliest%20convenience.%0A%0AThank%20you!', '_blank')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Get My Free Solar Assessment
          </button>
        </div>
      </div>
    </section>
  );
};

export default WhySolar;