export const imageAnswerFormato = [
  'JPG',
  'jpg',
  'PDF',
  'pdf',
  'PNG',
  'png',
] as const

export type ImageAnswerFormato = typeof imageAnswerFormato[number];

export type ImageAnswer = {
  // formato: string,
  formato: ImageAnswerFormato,
  base64: string
}
