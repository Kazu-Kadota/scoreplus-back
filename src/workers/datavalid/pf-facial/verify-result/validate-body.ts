import Joi from 'joi'

import { FaceResult } from '~/models/datavalid/face-result'
import {
  CNHResult,
  DocumentoResult,
  EnderecoResult,
  FiliacaoResult,
} from '~/models/datavalid/pf-basic/result'
import { PFFacialResult } from '~/models/datavalid/pf-facial/result'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'

const CNHResultSchema = Joi.object<CNHResult, true>({
  nome: Joi
    .bool()
    .optional(),
  nome_similaridade: Joi
    .number()
    .min(0)
    .max(1)
    .optional(),
  numero_registro: Joi
    .bool()
    .optional(),
  categoria: Joi
    .bool()
    .optional(),
  codigo_situacao: Joi
    .bool()
    .optional(),
  registro_nacional_estrangeiro: Joi
    .bool()
    .optional(),
  data_ultima_emissao: Joi
    .bool()
    .optional(),
  data_primeira_habilitacao: Joi
    .bool()
    .optional(),
  data_validade: Joi
    .bool()
    .optional(),
  possui_impedimento: Joi
    .bool()
    .optional(),
  observacoes: Joi
    .bool()
    .optional(),
  observacoes_similaridade: Joi
    .number()
    .min(0)
    .max(1)
    .optional(),
})

const FiliacaoResultSchema = Joi.object<FiliacaoResult, true>({
  nome_mae: Joi
    .bool()
    .optional(),
  nome_mae_similaridade: Joi
    .number()
    .min(0)
    .max(1)
    .optional(),
  nome_pai: Joi
    .bool()
    .optional(),
  nome_pai_similaridade: Joi
    .number()
    .min(0)
    .max(1)
    .optional(),
})

const DocumentoResultSchema = Joi.object<DocumentoResult, true>({
  tipo: Joi
    .bool()
    .optional(),
  numero: Joi
    .bool()
    .optional(),
  numero_similaridade: Joi
    .number()
    .min(0)
    .max(1)
    .optional(),
  orgao_expedidor: Joi
    .bool()
    .optional(),
  uf_expedidor: Joi
    .bool()
    .optional(),
})

const EnderecoResultSchema = Joi.object<EnderecoResult, true>({
  logradouro: Joi
    .bool()
    .optional(),
  logradouro_similaridade: Joi
    .number()
    .min(0)
    .max(1)
    .optional(),
  complemento: Joi
    .bool()
    .optional(),
  complemento_similaridade: Joi
    .number()
    .min(0)
    .max(1)
    .optional(),
  numero: Joi
    .bool()
    .optional(),
  numero_similaridade: Joi
    .number()
    .min(0)
    .max(1)
    .optional(),
  bairro: Joi
    .bool()
    .optional(),
  bairro_similaridade: Joi
    .number()
    .min(0)
    .max(1)
    .optional(),
  cep: Joi
    .bool()
    .optional(),
  municipio: Joi
    .bool()
    .optional(),
  municipio_similaridade: Joi
    .number()
    .min(0)
    .max(1)
    .optional(),
  uf: Joi
    .bool()
    .optional(),
})

const FaceResultSchema = Joi.object<FaceResult, true>({
  disponivel: Joi
    .bool()
    .optional(),
  probabilidade: Joi
    .string()
    .valid(
      'Altíssima probabilidade',
      'Alta probabilidade',
      'Baixa probabilidade',
      'Baixíssima probabilidade',
    )
    .optional(),
  similaridade: Joi
    .number()
    .min(0)
    .max(1)
    .optional(),
})

const PFFacialResultSchema = Joi.object<PFFacialResult, true>({
  cpf_disponivel: Joi
    .bool()
    .required(),
  nome: Joi
    .bool()
    .optional(),
  nome_similaridade: Joi
    .number()
    .min(0)
    .max(1)
    .optional(),
  data_nascimento: Joi
    .bool()
    .optional(),
  situacao_cpf: Joi
    .bool()
    .optional(),
  sexo: Joi
    .bool()
    .optional(),
  nacionalidade: Joi
    .bool()
    .optional(),
  cnh_disponivel: Joi
    .bool()
    .optional(),
  cnh: CNHResultSchema.optional(),
  filiacao: FiliacaoResultSchema.optional(),
  documento: DocumentoResultSchema.optional(),
  endereco: EnderecoResultSchema.optional(),
  biometria_face: FaceResultSchema.optional(),
}).required()

const schema = PFFacialResultSchema

const validateBody = (
  data: Partial<PFFacialResult>,
): PFFacialResult => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate facial biometry result body',
    })

    throw new InternalServerError('Erro na validação do body para análise do resultado da biometria facial', error.stack as string)
  }

  return value
}

export default validateBody
