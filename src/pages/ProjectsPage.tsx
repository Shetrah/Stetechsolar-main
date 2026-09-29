import React, { useState } from "react";
import { MapPin, Zap, Eye, X, ChevronLeft, ChevronRight } from "lucide-react";

const ProjectGallery: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const projects = [
    {
      title: "15kva solar PV System Installation",
      location: "Maranda in Bondo, Siaya County",
      capacity: "15kva",
      type: "Instituional",
      completionYear: "2025",
      images: ["/maranda/1.jpg", "/maranda/2.jpg"],
      description:
        "Complete solar PV system installation for Maranda High School",
    },
    {
      title: "3kva solar PV System Installation",
      location: "Usenge, Siaya County",
      capacity: "3kva",
      type: "Household",
      completionYear: "2025",
      images: [
        "/Usenge/1.jpeg",
        "/Usenge/2.jpeg",
        "/Usenge/3.jpeg",
        "/Usenge/4.jpeg",
        "/Usenge/5.jpg",
        "/Usenge/6.jpg",
        "/Usenge/7.jpg",
        "/Usenge/8.jpg",
        "/Usenge/9.jpg",
        "/Usenge/10.jpg",
        "/Usenge/11.jpg",
      ],
      description:
        "Complete solar PV system installation for a household in Usenge",
    },
    {
      title: "Solar 600W floodlights installation",
      location: "Port Victoria, Bunyala Sub-County",
      capacity: "150kWp",
      type: "Industrial",
      completionYear: "2025",
      images: [
        "/port/1.jpeg",
        "/port/2.jpeg",
        "/port/3.jpeg",
        "/port/4.jpeg",
        "/port/5.jpeg",
        "/port/6.jpeg",
        "/port/7.jpeg",
      ],
      description:
        "High-efficiency solar floodlights installed in Port Victoria",
    },
    {
      title: "5kva Solar PV System installation",
      location: "Simatwet, kitale.",
      capacity: "5kva",
      type: "Household",
      completionYear: "2025",
      images: [
        "/kitale/1.jpeg",
        "/kitale/2.jpeg",
        "/kitale/3.jpeg",
        "/kitale/4.jpeg",
        "/kitale/5.jpeg",
        "/kitale/6.jpeg",
        "/kitale/7.jpeg",
      ],
      description:
        "Intelligent LED street lighting with motion sensors and remote monitoring",
    },
    {
      title: "3kva solar PV system installation",
      location: "Kasigau - Voi, Taita Taveta County",
      capacity: "3kva",
      type: "Household",
      completionYear: "2024",
      images: [
        "/kasigau/1.jpeg",
        "/kasigau/2.jpeg",
        "/kasigau/3.jpeg",
        "/kasigau/4.jpeg",
        "/kasigau/5.jpeg",
        "/kasigau/6.jpeg",
        "/kasigau/7.jpeg",
      ],
      description:
        "Complete solar PV system installation for a household in Kasigau",
    },
    {
      title: "15kva solar PV System Installation",
      location: "Moi's Bridge, Kitale.",
      capacity: "15kva",
      type: "Household",
      completionYear: "2024",
      images: [
        "/moi/1.jpeg",
        "/moi/2.jpeg",
        "/moi/3.jpeg",
        "/moi/4.jpeg",
        "/moi/5.jpeg",
        "/moi/6.jpeg",
        "/moi/7.jpeg",
        "/moi/8.jpeg",
        "/moi/9.jpeg",
      ],
      description:
        "Complete solar PV system installation for a household in Moi's Bridge",
    },
    {
      title: "3kva solar PV system installation",
      location: "Esibuye - Luanda, Vihiga county",
      capacity: "3kva",
      type: "household",
      completionYear: "2023",
      images: [
        "/sibuye/1.jpeg",
        "/sibuye/2.jpeg",
        "/sibuye/3.jpeg",
        "/sibuye/4.jpeg",
        "/sibuye/5.jpeg",
        "/sibuye/6.jpeg",
        "/sibuye/7.jpeg",
        "/sibuye/8.jpeg",
      ],
      description:
        "Complete solar PV system installation for a household in Esibuye",
    },
  ];

  const openGallery = (project: any) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
  };

  const closeGallery = () => {
    setSelectedProject(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedProject) {
      setCurrentImageIndex(
        (prev) => (prev + 1) % selectedProject.images.length
      );
    }
  };

  const prevImage = () => {
    if (selectedProject) {
      setCurrentImageIndex(
        (prev) =>
          (prev - 1 + selectedProject.images.length) %
          selectedProject.images.length
      );
    }
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      Residential: "bg-green-100 text-green-800",
      Commercial: "bg-blue-100 text-blue-800",
      Industrial: "bg-purple-100 text-purple-800",
      Infrastructure: "bg-orange-100 text-orange-800",
      Agricultural: "bg-yellow-100 text-yellow-800",
      Utility: "bg-red-100 text-red-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <section className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Project Gallery
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our solar installations across Kenya - capturing the
            excellence and impact of our renewable energy solutions
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="group bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={project.images[0]}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <button
                    onClick={() => openGallery(project)}
                    className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 p-3 rounded-full transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg hover:bg-gray-100"
                  >
                    <Eye className="h-6 w-6" />
                  </button>
                </div>

                {/* Project Type Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(project.type)}`}
                  >
                    {project.type}
                  </span>
                </div>

                {/* Image Count Badge */}
                {project.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm">
                    +{project.images.length - 1}
                  </div>
                )}
              </div>

              {/* Project Info */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {project.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-700">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                    <span className="truncate">{project.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-700">
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-gray-500" />
                      {project.capacity}
                    </div>
                    <span className="text-gray-500">
                      {project.completionYear}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="text-white">
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-blue-100 text-sm">Projects Completed</div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-bold mb-2">10MW+</div>
              <div className="text-blue-100 text-sm">
                Total Capacity Installed
              </div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-bold mb-2">12+</div>
              <div className="text-blue-100 text-sm">Years of Excellence</div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-bold mb-2">47</div>
              <div className="text-blue-100 text-sm">Counties Served</div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="relative max-w-6xl w-full">
            {/* Close Button */}
            <button
              onClick={closeGallery}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 z-10"
            >
              <X className="h-8 w-8" />
            </button>

            {/* Main Image */}
            <div className="relative">
              <img
                src={selectedProject.images[currentImageIndex]}
                alt={`${selectedProject.title} - Image ${currentImageIndex + 1}`}
                className="w-full max-h-[70vh] object-contain rounded-lg"
              />

              {/* Navigation Arrows */}
              {selectedProject.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Project Info */}
            <div className="bg-white rounded-lg p-6 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedProject.title}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedProject.type)}`}
                >
                  {selectedProject.type}
                </span>
              </div>

              <p className="text-gray-600 mb-4">
                {selectedProject.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-gray-700">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  {selectedProject.location}
                </div>
                <div className="flex items-center text-gray-700">
                  <Zap className="h-4 w-4 mr-2 text-gray-500" />
                  {selectedProject.capacity}
                </div>
                <div className="text-gray-700">
                  <strong>Completed:</strong> {selectedProject.completionYear}
                </div>
              </div>

              {/* Image Thumbnails */}
              {selectedProject.images.length > 1 && (
                <div className="flex space-x-2 mt-6 overflow-x-auto">
                  {selectedProject.images.map(
                    (image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex
                            ? "border-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Image Counter */}
            {selectedProject.images.length > 1 && (
              <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {selectedProject.images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default ProjectGallery;
