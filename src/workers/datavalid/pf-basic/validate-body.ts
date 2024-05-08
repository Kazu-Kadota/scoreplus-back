import Joi from 'joi'

import { CNHAnswer, DocumentoAnswer, EnderecoAnswer, FiliacaoAnswer, PFBasicAnswer, PFBasicBiometryBody, PFBasicKey } from '~/models/datavalid/pf-basic/request-body'
import { DriverCategoryEnum, StateEnum } from '~/models/dynamo/enums/request'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

const documentRegex = /^[0-9]{3}\.?[0-9]{3}\.?[0-9]{3}\-?[0-9]{2}$/
const cnhRegex = /(?=.*\d)[A-Za-z0-9]{1,11}/
const cepRegex = /^\d[0-9]{5}-\d[0-9]{3}$/

const PFKeySchema = Joi.object<PFBasicKey, true>({
  cpf: Joi
    .string()
    .regex(documentRegex)
    .required(),
})

const CNHAnswerSchema = Joi.object<CNHAnswer, true>({
  numero_registro: Joi
    .string()
    .regex(cnhRegex)
    .optional(),
  categoria: Joi
    .string()
    .valid(...Object.values(DriverCategoryEnum))
    .optional(),
  codigo_situacao: Joi
    .string()
    .valid('2', '3', 'A')
    .optional(),
  data_ultima_emissao: Joi
    .string()
    .isoDate()
    .optional(),
  data_validade: Joi
    .string()
    .isoDate()
    .optional(),
  data_primeira_habilitacao: Joi
    .string()
    .isoDate()
    .optional(),
  registro_nacional_estrangeiro: Joi
    .string()
    .min(1)
    .max(255)
    .optional(),
  possui_impedimento: Joi
    .boolean()
    .optional(),
  observacoes: Joi
    .string()
    .max(255)
    .optional(),
})

const FiliacaoAnswerSchema = Joi.object<FiliacaoAnswer, true>({
  nome_mae: Joi
    .string()
    .min(1)
    .max(255)
    .optional(),
  nome_pai: Joi
    .string()
    .min(1)
    .max(255)
    .optional(),
})

const DocumentoAnswerSchema = Joi.object<DocumentoAnswer, true>({
  tipo: Joi
    .number()
    .valid(1, 2, 3, 4)
    .optional(),
  numero: Joi
    .string()
    .max(255)
    .optional(),
  orgao_expedidor: Joi
    .string()
    .max(31)
    .optional(),
  uf_expedidor: Joi
    .string()
    .valid(...Object.values(StateEnum))
    .optional(),
})

const EnderecoAnswerSchema = Joi.object<EnderecoAnswer, true>({
  logradouro: Joi
    .string()
    .max(255)
    .optional(),
  numero: Joi
    .string()
    .max(32)
    .optional(),
  complemento: Joi
    .string()
    .max(32)
    .optional(),
  bairro: Joi
    .string()
    .max(255)
    .optional(),
  cep: Joi
    .string()
    .regex(cepRegex)
    .optional(),
  municipio: Joi
    .string()
    .max(255)
    .optional(),
  uf: Joi
    .string()
    .valid(...Object.values(StateEnum))
    .optional(),
})

const PFBasicAnswerSchema = Joi.object<PFBasicAnswer, true>({
  nome: Joi
    .string()
    .max(255)
    .optional(),
  data_nascimento: Joi
    .string()
    .isoDate()
    .optional(),
  situacao_cpf: Joi
    .string()
    .valid(
      'regular',
      'suspensa',
      'titular falecido',
      'pendente de regularização',
      'cancelada por multiplicidade',
      'nula',
      'cancelada de oficio',
    )
    .optional(),
  sexo: Joi
    .string()
    .valid('F', 'M')
    .optional(),
  nacionalidade: Joi
    .number()
    .valid(1, 2, 3, 4)
    .optional(),
  cnh: CNHAnswerSchema.optional(),
  filiacao: FiliacaoAnswerSchema.optional(),
  documento: DocumentoAnswerSchema.optional(),
  endereco: EnderecoAnswerSchema.optional(),
})

const schema = Joi.object<PFBasicBiometryBody, true>({
  key: PFKeySchema.required(),
  answer: PFBasicAnswerSchema.required(),
}).required()

const validateBody = (
  data: Partial<PFBasicBiometryBody>,
): PFBasicBiometryBody => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate send request basic biometry',
    })

    throw new BadRequestError('Erro na validação do body para envio da análise de biometria básico', error.stack as string)
  }

  return value
}

export default validateBody
