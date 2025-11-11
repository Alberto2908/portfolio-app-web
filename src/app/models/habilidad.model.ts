export interface Habilidad {
  id: string;
  name: string;
  image: string;
  category: 'frontend' | 'backend' | 'database' | 'tools' | 'other';
}
