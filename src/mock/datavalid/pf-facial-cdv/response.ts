import { PFFacialCDVResult } from '~/models/datavalid/pf-facial-cdv/result'

export const mockDatavalidPfFacialCDVResponse: PFFacialCDVResult = {
  documento: 'cnh',
  cnh: {
    numero_registro: true,
    numero_registro_ocr: '123456789',
    nome: true,
    nome_similaridade: 0.95,
    nome_ocr: 'JOÃO DA SILVA',
    identidade: true,
    identidade_similaridade: 0.9,
    identidade_ocr: '1234567',
    data_nascimento: true,
    data_nascimento_ocr: '1990-05-15',
    data_primeira_habilitacao: true,
    data_primeira_habilitacao_ocr: '2010-06-20',
    data_ultima_emissao: true,
    data_ultima_emissao_ocr: '2023-07-10',
    data_validade: true,
    data_validade_ocr: '2033-07-10',
    retrato: {
      disponivel: true,
      probabilidade: 'Alta probabilidade',
      similaridade: 0.92,
    },
  },
  biometria_face: {
    disponivel: true,
    probabilidade: 'Altíssima probabilidade',
    similaridade: 0.97,
  },
}
