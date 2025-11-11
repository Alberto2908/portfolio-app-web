export interface ContactMessage {
  id?: string;
  email: string;
  asunto: string;
  mensaje: string;
  createdAt?: string;
  processed?: boolean;
}
