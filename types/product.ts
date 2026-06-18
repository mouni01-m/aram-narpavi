export interface Product {
  id: string;
  name: string;
  category: 'soaps' | 'malts' | 'oils' | 'honey' | 'wellness';
  price: number;
  rating: number;
  reviews: number;
  description: string;
  image: string;
  isBestseller: boolean;
  benefits: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Testimonial {
  id: string;
  author: string;
  content: string;
  rating: number;
  image?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}
