import type { GarmentType } from '../components/illustrations/ClothingSvg';

export interface ColorVocabItem {
  english: string;
  spanish: string;
  pronunciation: string;
  hex: string;
  borderHex?: string;
}

export interface ClothingVocabItem {
  english: string;
  spanish: string;
  pronunciation: string;
  garment: GarmentType;
  defaultColor: string;
  accentColor?: string;
}

export interface GrammarExampleItem {
  title: string;
  formula: string;
  sentence: string;
  translation: string;
  garment: GarmentType;
  color: string;
}

export const COLORS_VOCAB: ColorVocabItem[] = [
  { english: 'Red', spanish: 'Rojo', pronunciation: 'red', hex: '#EF4444' },
  { english: 'Blue', spanish: 'Azul', pronunciation: 'blu', hex: '#3B82F6' },
  { english: 'Yellow', spanish: 'Amarillo', pronunciation: 'ié-lou', hex: '#FACC15' },
  { english: 'Green', spanish: 'Verde', pronunciation: 'grin', hex: '#22C55E' },
  { english: 'Orange', spanish: 'Naranja', pronunciation: 'ó-rendch', hex: '#F97316' },
  { english: 'Purple', spanish: 'Morado', pronunciation: 'pér-pol', hex: '#9333EA' },
  { english: 'Pink', spanish: 'Rosa', pronunciation: 'pink', hex: '#EC4899' },
  { english: 'Black', spanish: 'Negro', pronunciation: 'blak', hex: '#1E293B' },
  { english: 'White', spanish: 'Blanco', pronunciation: 'uáit', hex: '#FFFFFF', borderHex: '#CBD5E1' },
  { english: 'Gray', spanish: 'Gris', pronunciation: 'grei', hex: '#94A3B8' },
  { english: 'Brown', spanish: 'Marrón / Café', pronunciation: 'bráun', hex: '#92400E' },
  { english: 'Light blue', spanish: 'Celeste', pronunciation: 'láit blu', hex: '#38BDF8' },
];

export const CLOTHES_VOCAB: ClothingVocabItem[] = [
  {
    english: 'T-shirt',
    spanish: 'Camiseta / Polera',
    pronunciation: 'tí-shert',
    garment: 'tshirt',
    defaultColor: '#EF4444',
  },
  {
    english: 'Jeans',
    spanish: 'Pantalón jean',
    pronunciation: 'yins',
    garment: 'jeans',
    defaultColor: '#2563EB',
  },
  {
    english: 'Jacket',
    spanish: 'Chaqueta / Chamarra',
    pronunciation: 'yá-ket',
    garment: 'jacket',
    defaultColor: '#16A34A',
  },
  {
    english: 'Dress',
    spanish: 'Vestido',
    pronunciation: 'dres',
    garment: 'dress',
    defaultColor: '#FACC15',
  },
  {
    english: 'Shoes',
    spanish: 'Zapatos',
    pronunciation: 'shus',
    garment: 'shoes',
    defaultColor: '#1E293B',
  },
  {
    english: 'Hat',
    spanish: 'Gorra / Sombrero',
    pronunciation: 'jat',
    garment: 'hat',
    defaultColor: '#9333EA',
  },
  {
    english: 'Sweater',
    spanish: 'Suéter / Chompa',
    pronunciation: 'sué-ter',
    garment: 'sweater',
    defaultColor: '#F97316',
  },
  {
    english: 'Sneakers',
    spanish: 'Zapatillas / Tenis',
    pronunciation: 'sní-kers',
    garment: 'sneakers',
    defaultColor: '#EC4899',
  },
  {
    english: 'Shorts',
    spanish: 'Pantalón corto',
    pronunciation: 'shorts',
    garment: 'shorts',
    defaultColor: '#38BDF8',
  },
  {
    english: 'Skirt',
    spanish: 'Falda',
    pronunciation: 'skert',
    garment: 'skirt',
    defaultColor: '#A855F7',
  },
  {
    english: 'Scarf',
    spanish: 'Bufanda',
    pronunciation: 'skarf',
    garment: 'scarf',
    defaultColor: '#E11D48',
  },
  {
    english: 'Socks',
    spanish: 'Calcetines / Medias',
    pronunciation: 'soks',
    garment: 'socks',
    defaultColor: '#FFFFFF',
    accentColor: '#3B82F6',
  },
];

export const GRAMMAR_EXAMPLES: GrammarExampleItem[] = [
  {
    title: '1. Color + Prenda (Adjective + Noun)',
    formula: 'a / an + [Color] + [Clothing]',
    sentence: 'a red T-shirt',
    translation: 'En inglés el color siempre va ANTES de la prenda ("una camiseta roja").',
    garment: 'tshirt',
    color: '#EF4444',
  },
  {
    title: '2. Describir lo que llevas puesto',
    formula: 'I am wearing + [Color] + [Clothing]',
    sentence: 'I am wearing blue jeans.',
    translation: 'Yo estoy usando pantalones jeans azules.',
    garment: 'jeans',
    color: '#2563EB',
  },
  {
    title: '3. Describir a otra persona',
    formula: 'He / She is wearing + [Color] + [Clothing]',
    sentence: 'She is wearing a yellow dress.',
    translation: 'Ella está usando un vestido amarillo.',
    garment: 'dress',
    color: '#FACC15',
  },
  {
    title: '4. Prendas en plural (sin "a")',
    formula: 'Subject + am/is/are wearing + [Color] + [Plural]',
    sentence: 'He is wearing white sneakers.',
    translation: 'Con prendas en plural (jeans, shoes, sneakers, socks, shorts) no usamos "a".',
    garment: 'sneakers',
    color: '#FFFFFF',
  },
];
