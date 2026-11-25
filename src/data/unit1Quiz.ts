import type { GarmentType } from '../components/illustrations/ClothingSvg';

export type QuizQuestionType = 'visual' | 'fill-blank' | 'multiple-choice';

export interface QuizQuestion {
  id: number;
  type: QuizQuestionType;
  instructionEs: string;
  sentenceEn?: string;
  visual?: {
    garment: GarmentType;
    color: string;
    accentColor?: string;
  };
  options: string[];
  correctIndex: number;
  explanationEs: string;
}

export const UNIT1_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    type: 'visual',
    instructionEs: 'Observa la imagen y elige la opción correcta en inglés:',
    visual: { garment: 'tshirt', color: '#EF4444' },
    options: ['A blue jacket', 'A red T-shirt', 'A green sweater', 'A yellow dress'],
    correctIndex: 1,
    explanationEs: '¡Exacto! Una camiseta roja se dice "a red T-shirt".',
  },
  {
    id: 2,
    type: 'visual',
    instructionEs: 'Elige la descripción correcta en inglés para esta prenda:',
    visual: { garment: 'jeans', color: '#2563EB' },
    options: ['Blue jeans', 'Black shorts', 'Red socks', 'White shoes'],
    correctIndex: 0,
    explanationEs: 'Pantalones jeans azules se dice "Blue jeans" (sin "a" porque es plural).',
  },
  {
    id: 3,
    type: 'fill-blank',
    instructionEs: 'Observa el color de la chaqueta y completa la frase en inglés:',
    sentenceEn: 'I am wearing a ___ jacket.',
    visual: { garment: 'jacket', color: '#22C55E' },
    options: ['pink', 'orange', 'green', 'black'],
    correctIndex: 2,
    explanationEs: 'La chaqueta de la imagen es verde, es decir, "green".',
  },
  {
    id: 4,
    type: 'visual',
    instructionEs: 'Observa la prenda y elige la oración correcta en inglés:',
    visual: { garment: 'dress', color: '#FACC15' },
    options: [
      'She is wearing a purple skirt.',
      'She is wearing a yellow dress.',
      'She is wearing an orange hat.',
      'She is wearing brown shoes.',
    ],
    correctIndex: 1,
    explanationEs: 'Un vestido amarillo se dice "a yellow dress".',
  },
  {
    id: 5,
    type: 'multiple-choice',
    instructionEs: '¿Qué oración tiene el orden correcto de color y prenda en inglés?',
    options: [
      'I have a hat blue.',
      'I have blue a hat.',
      'I have a blue hat.',
      'I have a hats blue.',
    ],
    correctIndex: 2,
    explanationEs: 'Recuerda: en inglés el color siempre va ANTES de la prenda ("a blue hat").',
  },
  {
    id: 6,
    type: 'fill-blank',
    instructionEs: 'Completa la frase con el color en inglés que corresponde a la imagen:',
    sentenceEn: 'The sneakers are ___.',
    visual: { garment: 'sneakers', color: '#EC4899' },
    options: ['pink', 'gray', 'yellow', 'brown'],
    correctIndex: 0,
    explanationEs: 'Las zapatillas son rosadas: "pink".',
  },
  {
    id: 7,
    type: 'multiple-choice',
    instructionEs: 'Elige la palabra correcta para completar la oración en inglés:',
    sentenceEn: 'He ___ wearing black shoes.',
    visual: { garment: 'shoes', color: '#1E293B' },
    options: ['am', 'are', 'is', 'be'],
    correctIndex: 2,
    explanationEs: 'Con "He" o "She" siempre usamos "is": "He is wearing...".',
  },
  {
    id: 8,
    type: 'visual',
    instructionEs: 'Observa el color y la prenda. ¿Cómo se dice en inglés?',
    visual: { garment: 'sweater', color: '#F97316' },
    options: ['An orange sweater', 'A red scarf', 'A blue T-shirt', 'A white skirt'],
    correctIndex: 0,
    explanationEs: 'Un suéter naranja se dice "An orange sweater".',
  },
  {
    id: 9,
    type: 'fill-blank',
    instructionEs: 'Completa la frase con la palabra en inglés que falta:',
    sentenceEn: 'She is ___ a purple hat.',
    visual: { garment: 'hat', color: '#9333EA' },
    options: ['wear', 'wearing', 'wears', 'color'],
    correctIndex: 1,
    explanationEs: 'Para decir lo que alguien lleva puesto en este momento usamos "is wearing".',
  },
  {
    id: 10,
    type: 'multiple-choice',
    instructionEs: 'Observa la imagen: ¿qué prenda en inglés usas en los pies?',
    visual: { garment: 'socks', color: '#FFFFFF', accentColor: '#3B82F6' },
    options: ['A scarf', 'A hat', 'Socks', 'A jacket'],
    correctIndex: 2,
    explanationEs: 'Los calcetines ("Socks") se usan en los pies.',
  },
];
