export interface Award {
  id: number;
  name: string;
  category: string | null;
  year: number | null;
}

export interface WritingProject {
  id: number;
  title: string;
  logline: string;
  posterUrl: string | null;
  genre: string | null;
  format: string | null;
  scriptUrl: string | null;
  status: 'draft' | 'published';
  featured: boolean;
  sortOrder: number;
  awards: Award[];
}

export interface FilmProject {
  id: number;
  title: string;
  logline: string;
  posterUrl: string | null;
  genre: string | null;
  format: string | null;
  year: number | null;
  trailerUrl: string | null;
  filmUrl: string | null;
  status: 'draft' | 'published';
  featured: boolean;
  sortOrder: number;
  awards: Award[];
}

export interface Service {
  id: number;
  title: string;
  description: string;
  sortOrder: number;
  published: boolean;
  samples: ServiceSample[];
}

export interface ServiceSample {
  id: number;
  title: string;
  description: string | null;
  fileUrl: string | null;
  sortOrder: number;
}

export interface Testimonial {
  id: number;
  quoteText: string;
  attributeName: string;
  attributeTitle: string | null;
  organisation: string | null;
  sortOrder: number;
  published: boolean;
}

export interface UpsertWritingProject {
  title: string;
  logline: string;
  posterUrl: string | null;
  genre: string | null;
  format: string | null;
  scriptUrl: string | null;
  status: 'draft' | 'published';
  featured: boolean;
  sortOrder: number;
  awards: Omit<Award, 'id'>[];
}
