import { StateEnum } from '../../dynamo/enums/request'

export type PFBasicKey = {
  cpf: string
}

export type CNHAnswer = {
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

export type FiliacaoAnswer = {
  nome_mae: string
  nome_pai: string
}

export type DocumentoAnswer = {
  tipo: 1 | 2 | 3 | 4 // 1 - carteira de identidade, 2 - carteira profissional, 3 - passaporte, 4 - carteira de reservista
  numero: string
  orgao_expedidor: string
  uf_expedidor: StateEnum
}

export type EnderecoAnswer = {
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cep: string
  municipio: string
  uf: StateEnum
}

export type PFBasicAnswer = {
  nome: string
  data_nascimento: string // Format: yyyy-mm-dd
  situacao_cpf: 'regular' | 'suspensa' | 'titular falecido' | 'pendente de regularização' | 'cancelada por multiplicidade' | 'nula' | 'cancelada de oficio'
  sexo: 'F' | 'M'
  nacionalidade: 1 | 2 | 3 | 4 // 1 - brasileiro, 2 - brasileiro naturalizado, 3 - estrangeiro, 4 - brasileiro nascido no exterior
  cnh: Partial<CNHAnswer>
  filiacao: Partial<FiliacaoAnswer>
  documento: Partial<DocumentoAnswer>
  endereco: Partial<EnderecoAnswer>
}

export type PFBasicBiometryBody = {
  key: PFBasicKey
  answer: Partial<PFBasicAnswer>
}
