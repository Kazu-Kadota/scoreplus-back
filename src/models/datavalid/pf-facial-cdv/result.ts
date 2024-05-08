import { FaceResult } from '../face-result'

export type CNHCDVResult = {
  numero_registro: boolean;
  numero_registro_ocr: string;
  nome: boolean;
  nome_similaridade: number;
  nome_ocr: string;
  identidade: boolean;
  identidade_similaridade: number;
  identidade_ocr: string;
  data_nascimento: boolean;
  data_nascimento_ocr: string; // yyyy-mm-dd
  data_primeira_habilitacao: boolean;
  data_primeira_habilitacao_ocr: string; // yyyy-mm-dd
  data_ultima_emissao: boolean;
  data_ultima_emissao_ocr: string; // yyyy-mm-dd
  data_validade: boolean;
  data_validade_ocr: string; // yyyy-mm-dd
  retrato: FaceResult;
}

export type PFFacialCDVResult = {
  documento: 'cnh';
  cnh: CNHCDVResult;
  biometria_face: FaceResult;
}
