export interface GalleryImage { id: string; src: string; title: string; category: string; location: string; published: boolean; order: number; storagePath?: string; }
export const galleryCategories = ['Residential', 'Schools & institutions', 'Solar lighting', 'Installation'];
export const seedGallery: GalleryImage[] = [
  ['maranda-1', '/maranda/1.jpg', 'Solar power for Maranda High School', 'Schools & institutions', 'Bondo, Siaya'],
  ['usenge-1', '/Usenge/1.jpeg', 'Home solar installation', 'Residential', 'Usenge, Siaya'],
  ['port-1', '/port/1.jpeg', 'Solar floodlight installation', 'Solar lighting', 'Port Victoria'],
  ['kitale-1', '/kitale/1.jpeg', 'A brighter home in Kitale', 'Residential', 'Simatwet, Kitale'],
  ['kasigau-1', '/kasigau/1.jpeg', 'Residential solar power', 'Residential', 'Kasigau, Taita Taveta'],
  ['moi-1', '/moi/1.jpeg', 'Solar installation at Moi’s Bridge', 'Residential', 'Moi’s Bridge'],
  ['maranda-2', '/maranda/2.jpg', 'School solar equipment', 'Schools & institutions', 'Bondo, Siaya'],
  ['usenge-2', '/Usenge/2.jpeg', 'Installation in progress', 'Installation', 'Usenge, Siaya'],
  ['sibuye-1', '/sibuye/1.jpeg', 'Home solar system', 'Residential', 'Esibuye, Vihiga'],
].map(([id, src, title, category, location], order) => ({ id, src, title, category, location, published: true, order }));
