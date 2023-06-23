import { StateEnum } from '../../dynamo/request-enum'

export interface PFKey {
  cpf: string
}

export interface CNHAnswer {
  numero_registro: string
  categoria: string
  codigo_situacao: '2' | '3' | 'A' // 2 - em emissão, 3 - emitida, A - cancelada
  data_ultima_emissao: string // Format: yyyy-mm-dd
  data_validade: string // Format: yyyy-mm-dd
  data_primeira_habilitacao: string // Format: yyyy-mm-dd
  registro_nacional_estrangeiro: string
  possui_impedimento: boolean
  observacoes: string
}

export interface FiliacaoAnswer {
  nome_mae: string
  nome_pai: string
}

export interface DocumentoAnswer {
  tipo: 1 | 2 | 3 | 4 // 1 - carteira de identidade, 2 - carteira profissional, 3 - passaporte, 4 - carteira de reservista
  numero: string
  orgao_expedidor: string
  uf_expedidor: StateEnum
}

export interface EnderecoAnswer {
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cep: string
  municipio: string
  uf: StateEnum
}

export interface FaceAnswer {
  description: string
  formato: 'JPG' | 'PDF' | 'PNG'
  base64: string // Encoded in base64 without line breaks
}

export interface PFFacialAnswer {
  nome: string
  data_nascimento: string // Format: yyyy-mm-dd
  situacao_cpf: 'regular' | 'suspensa' | 'titular falecido' | 'pendente de regularização' | 'cancelada por multiplicidade' | 'nula' | 'cancelada de oficio'
  sexo: 'F' | 'M'
  nacionalidade: 1 | 2 | 3 | 4 // 1 - brasileiro, 2 - brasileiro naturalizado, 3 - estrangeiro, 4 - brasileiro nascido no exterior
  cnh: Partial<CNHAnswer>
  filiacao: Partial<FiliacaoAnswer>
  documento: Partial<DocumentoAnswer>
  endereco: Partial<EnderecoAnswer>
  biometria_face: Partial<FaceAnswer>
}

export interface PFFacialBiometryBody {
  key: PFKey
  answer: Partial<PFFacialAnswer>
}
