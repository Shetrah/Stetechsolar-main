export interface Project {
  slug: string;
  name: string;
  location: string;
  size: string;
  type: string;
  description: string;
  year: number | null;
  images: string[];
}

export const projects: Project[] = [
  {
    slug: 'maranda-high-school',
    name: 'Maranda High School',
    location: 'Bondo, Siaya',
    size: '15 kVA solar PV',
    type: 'Schools & institutions',
    description: 'A reliable solar power system designed to support the day-to-day energy needs of Maranda High School.',
    year: null,
    images: ['/maranda/1.jpg', '/maranda/2.jpg'],
  },
  {
    slug: 'home-solar-usenge',
    name: 'Home solar in Usenge',
    location: 'Usenge, Siaya',
    size: '3 kVA solar PV',
    type: 'Residential',
    description: 'A home solar installation providing dependable electricity for everyday living in Usenge.',
    year: null,
    images: ['/Usenge/1.jpeg', '/Usenge/2.jpeg', '/Usenge/3.jpeg', '/Usenge/4.jpeg', '/Usenge/5.jpg', '/Usenge/6.jpg', '/Usenge/7.jpg', '/Usenge/8.jpg', '/Usenge/9.jpg', '/Usenge/10.jpg', '/Usenge/11.jpg'],
  },
  {
    slug: 'port-victoria-solar-lighting',
    name: 'Port Victoria solar lighting',
    location: 'Port Victoria',
    size: '600 W floodlights',
    type: 'Solar lighting',
    description: 'Solar floodlighting brings practical, dependable illumination to shared spaces in Port Victoria.',
    year: null,
    images: ['/port/1.jpeg', '/port/2.jpeg', '/port/3.jpeg', '/port/4.jpeg', '/port/5.jpeg', '/port/6.jpeg', '/port/7.jpeg'],
  },
  {
    slug: 'home-solar-simatwet',
    name: 'Home solar in Simatwet',
    location: 'Simatwet, Kitale',
    size: '5 kVA solar PV',
    type: 'Residential',
    description: 'A 5 kVA solar PV system tailored to the energy needs of a home in Simatwet, Kitale.',
    year: null,
    images: ['/kitale/1.jpeg', '/kitale/2.jpeg', '/kitale/3.jpeg', '/kitale/4.jpeg', '/kitale/5.jpeg', '/kitale/6.jpeg', '/kitale/7.jpeg'],
  },
  {
    slug: 'kasigau-home-installation',
    name: 'Kasigau home installation',
    location: 'Kasigau, Taita Taveta',
    size: '3 kVA solar PV',
    type: 'Residential',
    description: 'A compact residential solar installation bringing reliable power to a home in Kasigau.',
    year: null,
    images: ['/kasigau/1.jpeg', '/kasigau/2.jpeg', '/kasigau/3.jpeg', '/kasigau/4.jpeg', '/kasigau/5.jpeg', '/kasigau/6.jpeg', '/kasigau/7.jpeg'],
  },
  {
    slug: 'moi-bridge-installation',
    name: 'Moi’s Bridge installation',
    location: 'Moi’s Bridge',
    size: '15 kVA solar PV',
    type: 'Residential',
    description: 'A higher-capacity solar PV installation planned for the energy demands of a home in Moi’s Bridge.',
    year: null,
    images: ['/moi/1.jpeg', '/moi/2.jpeg', '/moi/3.jpeg', '/moi/4.jpeg', '/moi/5.jpeg', '/moi/6.jpeg', '/moi/7.jpeg', '/moi/8.jpeg', '/moi/9.jpeg'],
  },
  {
    slug: 'esibuye-home-installation',
    name: 'Esibuye home installation',
    location: 'Esibuye, Vihiga',
    size: '3 kVA solar PV',
    type: 'Residential',
    description: 'A 3 kVA solar PV system installed to provide consistent household power in Esibuye.',
    year: null,
    images: ['/sibuye/1.jpeg', '/sibuye/2.jpeg', '/sibuye/3.jpeg', '/sibuye/4.jpeg', '/sibuye/5.jpeg', '/sibuye/6.jpeg', '/sibuye/7.jpeg', '/sibuye/8.jpeg'],
  },
];