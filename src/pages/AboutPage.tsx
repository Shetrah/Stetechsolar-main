import React from 'react';
import {
Users,
Award,
Globe,
Target,
ShieldCheck,
Lightbulb,
CheckCircle2,
Leaf,
BadgeCheck,
HeartHandshake,
ArrowRight,
} from 'lucide-react';

const About: React.FC = () => {
return ( <section id="about" className="bg-gray-50">

```
  {/* =========================================================
      TOP HERO BACKGROUND
  ========================================================== */}
  <div
    className="relative min-h-[480px] md:min-h-[560px] flex items-center overflow-hidden"
    style={{
      backgroundImage: "url('/about-hero.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
    {/* Dark overlay */}
    <div className="absolute inset-0 bg-black/55" />

    {/* Solar-themed gradient */}
    <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/60 to-green-900/40" />

    <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-3xl">

        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/30 backdrop-blur-sm text-white text-sm font-semibold mb-6">
          <Leaf className="h-4 w-4 text-green-300" />
          STETECH Solar Technology
        </span>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
          Powering a Cleaner,
          <span className="block text-green-300">
            Brighter Future
          </span>
        </h1>

        <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-8">
          Partnering for a greener future through reliable, sustainable
          and innovative solar energy solutions across Kenya and
          neighbouring East African countries.
        </p>

        <div className="flex flex-wrap gap-3">

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-3 rounded-full">
            <CheckCircle2 className="h-5 w-5 text-green-300" />
            Since 2012
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-3 rounded-full">
            <Globe className="h-5 w-5 text-green-300" />
            100% Kenyan Owned
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-3 rounded-full">
            <Target className="h-5 w-5 text-green-300" />
            Up to 10MW Projects
          </div>

        </div>

      </div>
    </div>

    {/* Bottom transition */}
    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gray-50 rounded-t-[50%]" />
  </div>


  {/* =========================================================
      MAIN CONTENT
  ========================================================== */}
  <div className="py-20">

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* =====================================================
          SECTION HEADER
      ====================================================== */}
      <div className="text-center mb-16">

        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-semibold mb-4">
          <Leaf className="h-4 w-4" />
          About STETECH Solar Technology
        </span>

        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          About STETECH Solar Technology
        </h2>

        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          "Partnering for a greener future" — Kenya's trusted solar
          energy solutions provider since 2012.
        </p>

      </div>


      {/* =====================================================
          WHO WE ARE
      ====================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">

        {/* Text */}
        <div>

          <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Who We Are
          </span>

          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2 mb-6">
            Powering a Cleaner and More Sustainable Future
          </h3>

          <p className="text-gray-600 mb-4 leading-relaxed">
            STETECH SOLAR TECHNOLOGY-K is a leading provider of energy
            solutions, serving customers since 2012. We are dedicated to
            delivering sustainable and reliable clean energy solutions
            across Kenya and neighbouring East African countries.
          </p>

          <p className="text-gray-600 mb-6 leading-relaxed">
            We take pride in our commitment to innovation, quality,
            durability, efficiency and timely service delivery. Above all,
            we are committed to ensuring our customers' satisfaction. We
            offer a wide range of products, services and solutions tailored
            to meet the diverse energy needs of homes, businesses and
            institutions.
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


        {/* About Image */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

          <img
            src="/1.jpg"
            alt="STETECH Solar Technology installation"
            className="w-full h-72 md:h-80 object-cover"
          />

          <div className="p-8">

            <div className="flex items-center gap-3 mb-3">

              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>

              <h4 className="text-lg font-semibold text-gray-900">
                Recent Success Story
              </h4>

            </div>

            <p className="text-gray-600">
              15kWp Solar Installation — MountainView Estate,
              Kangemi, Nairobi.
            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          WHY CHOOSE US
      ====================================================== */}
      <div className="mb-24">

        <div className="text-center max-w-3xl mx-auto mb-12">

          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-4">
            <BadgeCheck className="h-4 w-4" />
            Why Choose Us
          </span>

          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose STETECH?
          </h3>

          <p className="text-gray-600 text-lg leading-relaxed">
            We are guided by our core values of consistency, integrity,
            quality, innovation, safety and sustainability. These
            principles shape how we work, how we serve our customers and
            how we deliver every project.
          </p>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Consistency */}
          <div className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">

            <div className="bg-blue-100 text-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <h4 className="text-xl font-bold text-gray-900 mb-3">
              Consistency
            </h4>

            <p className="text-gray-600 leading-relaxed">
              When it comes to providing our services, we ensure that we
              remain consistent in our standards and delivery while working
              to satisfy our clients to the highest level.
            </p>

          </div>


          {/* Integrity */}
          <div className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">

            <div className="bg-green-100 text-green-600 w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <HeartHandshake className="h-7 w-7" />
            </div>

            <h4 className="text-xl font-bold text-gray-900 mb-3">
              Integrity
            </h4>

            <p className="text-gray-600 leading-relaxed">
              We uphold honesty and strong moral principles that unite us
              as a team. Every project and task is approached with
              honesty, accountability and a commitment to doing what is
              right.
            </p>

          </div>


          {/* Quality */}
          <div className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">

            <div className="bg-yellow-100 text-yellow-600 w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Award className="h-7 w-7" />
            </div>

            <h4 className="text-xl font-bold text-gray-900 mb-3">
              Quality
            </h4>

            <p className="text-gray-600 leading-relaxed">
              Quality products and services are the foundation of our
              success. We carefully select and deliver quality solutions
              that help us maintain our clients' trust.
            </p>

          </div>


          {/* Innovation */}
          <div className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">

            <div className="bg-purple-100 text-purple-600 w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Lightbulb className="h-7 w-7" />
            </div>

            <h4 className="text-xl font-bold text-gray-900 mb-3">
              Innovation
            </h4>

            <p className="text-gray-600 leading-relaxed">
              We work at the cutting edge of solar energy, energy storage
              and grid modernization, continuously exploring better ways
              to deliver efficient energy solutions.
            </p>

          </div>


          {/* Sustainability */}
          <div className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">

            <div className="bg-emerald-100 text-emerald-600 w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Leaf className="h-7 w-7" />
            </div>

            <h4 className="text-xl font-bold text-gray-900 mb-3">
              Sustainability
            </h4>

            <p className="text-gray-600 leading-relaxed">
              We work with trusted partners to deliver sustainable solar
              solutions that support energy independence and contribute to
              a cleaner future.
            </p>

          </div>


          {/* Safety */}
          <div className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">

            <div className="bg-red-100 text-red-600 w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-7 w-7" />
            </div>

            <h4 className="text-xl font-bold text-gray-900 mb-3">
              Safety
            </h4>

            <p className="text-gray-600 leading-relaxed">
              We foster a culture of safety by holding ourselves
              accountable for our own and others' physical, interpersonal
              and emotional safety throughout every project.
            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          MISSION & VISION
      ====================================================== */}
      <section className="relative">

        {/* Section heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">

          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-semibold mb-4">
            <Target className="h-4 w-4" />
            Our Direction
          </span>

          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Mission & Vision
          </h3>

          <p className="text-gray-600 text-lg leading-relaxed">
            Our purpose and long-term direction guide how we serve our
            customers and contribute to a sustainable energy future.
          </p>

        </div>


        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

          {/* =================================================
              MISSION CARD
          ================================================== */}
          <div className="relative group h-full">

            <div className="absolute inset-0 bg-blue-600 rounded-3xl rotate-1 opacity-10 group-hover:rotate-2 transition-transform duration-300" />

            <div className="relative h-full min-h-[380px] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-3xl overflow-hidden shadow-xl">

              {/* Decorative circles */}
              <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10" />
              <div className="absolute -bottom-28 -left-28 w-80 h-80 rounded-full bg-white/5" />

              {/* Decorative icon */}
              <div className="absolute right-8 bottom-8 opacity-10">
                <Target className="w-40 h-40 text-white" />
              </div>

              <div className="relative z-10 p-8 md:p-10 lg:p-12 flex flex-col h-full">

                <div className="flex items-center gap-5 mb-8">

                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm flex items-center justify-center">
                    <Target className="h-8 w-8 text-white" />
                  </div>

                  <div>
                    <p className="text-blue-200 text-sm font-semibold uppercase tracking-[0.18em] mb-1">
                      What Drives Us
                    </p>

                    <h4 className="text-3xl font-bold text-white">
                      Our Mission
                    </h4>
                  </div>

                </div>

                <div className="w-16 h-1 bg-blue-300 rounded-full mb-7" />

                <p className="text-blue-50 text-lg md:text-xl leading-relaxed max-w-xl">
                  To ensure that solar energy becomes an affordable source
                  even for the masses by tightly managing our own costs so
                  that the savings pass on to you, our valued customers.
                </p>

                <div className="mt-auto pt-8 flex items-center gap-3 text-blue-100 font-medium">
                  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10">
                    <ArrowRight className="h-4 w-4" />
                  </span>

                  <span>
                    Making clean energy more accessible
                  </span>
                </div>

              </div>
            </div>
          </div>


          {/* =================================================
              VISION CARD
          ================================================== */}
          <div className="relative group h-full">

            <div className="absolute inset-0 bg-green-600 rounded-3xl -rotate-1 opacity-10 group-hover:-rotate-2 transition-transform duration-300" />

            <div className="relative h-full min-h-[380px] bg-gradient-to-br from-green-600 via-green-700 to-emerald-900 rounded-3xl overflow-hidden shadow-xl">

              {/* Decorative circles */}
              <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10" />
              <div className="absolute -bottom-28 -left-28 w-80 h-80 rounded-full bg-white/5" />

              {/* Decorative icon */}
              <div className="absolute right-8 bottom-8 opacity-10">
                <Globe className="w-40 h-40 text-white" />
              </div>

              <div className="relative z-10 p-8 md:p-10 lg:p-12 flex flex-col h-full">

                <div className="flex items-center gap-5 mb-8">

                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm flex items-center justify-center">
                    <Globe className="h-8 w-8 text-white" />
                  </div>

                  <div>
                    <p className="text-green-200 text-sm font-semibold uppercase tracking-[0.18em] mb-1">
                      Where We Are Going
                    </p>

                    <h4 className="text-3xl font-bold text-white">
                      Our Vision
                    </h4>
                  </div>

                </div>

                <div className="w-16 h-1 bg-green-300 rounded-full mb-7" />

                <p className="text-green-50 text-lg md:text-xl leading-relaxed max-w-xl">
                  To lead the transition to a sustainable future by making
                  solar power the primary energy source for both residential
                  and commercial properties, while also promoting energy
                  independence and combating climate change.
                </p>

                <div className="mt-auto pt-8 flex items-center gap-3 text-green-100 font-medium">
                  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10">
                    <ArrowRight className="h-4 w-4" />
                  </span>

                  <span>
                    Building a sustainable energy future
                  </span>
                </div>

              </div>
            </div>
          </div>

        </div>

      </section>

    </div>
  </div>

</section>

);
};

export default About;