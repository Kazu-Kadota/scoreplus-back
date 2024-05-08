export type CNHResult = {
  nome: boolean;
  nome_similaridade: number;
  numero_registro: boolean;
  categoria: boolean;
  codigo_situacao: boolean;
  registro_nacional_estrangeiro: boolean;
  data_ultima_emissao: boolean;
  data_primeira_habilitacao: boolean;
  data_validade: boolean;
  possui_impedimento: boolean;
  observacoes: boolean;
  observacoes_similaridade: number;
}

export type FiliacaoResult = {
  nome_mae: boolean;
  nome_mae_similaridade: number;
  nome_pai: boolean;
  nome_pai_similaridade: number;
}

export type DocumentoResult = {
  tipo: boolean;
  numero: boolean;
  numero_similaridade: number;
  orgao_expedidor: boolean;
  uf_expedidor: boolean;
}

export type EnderecoResult = {
  logradouro: boolean;
  logradouro_similaridade: number;
  complemento: boolean;
  complemento_similaridade: number;
  numero: boolean;
  numero_similaridade: number;
  bairro: boolean;
  bairro_similaridade: number;
  cep: boolean;
  municipio: boolean;
  municipio_similaridade: number;
  uf: boolean;
}

export type PFBasicResult = {
  cpf_disponivel: boolean;
  nome?: boolean;
  nome_similaridade?: number;
  data_nascimento?: boolean;
  situacao_cpf?: boolean;
  sexo?: boolean;
  nacionalidade?: boolean;
  cnh_disponivel: boolean;
  cnh: Partial<CNHResult>;
  filiacao: Partial<FiliacaoResult>;
  documento: Partial<DocumentoResult>;
  endereco: Partial<EnderecoResult>;
}
