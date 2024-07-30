export const faceResultProbabilities = [
  'Altíssima probabilidade',
  'Alta probabilidade',
  'Baixa probabilidade',
  'Baixíssima probabilidade',
] as const

export type FaceResultProbability = typeof faceResultProbabilities[number];

export type FaceResult = {
  disponivel: boolean;
  probabilidade: FaceResultProbability;
  similaridade: number;
}
