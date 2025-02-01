}

export interface TimeBlock {
  hours: number;
  price: number;
  discount?: number;
export interface Instructor {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  image_url: string | null;
  created_at: string;
}