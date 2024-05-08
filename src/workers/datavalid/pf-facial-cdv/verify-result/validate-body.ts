import Joi from 'joi'

import { FaceResult, faceResultProbabilities } from '~/models/datavalid/face-result'
import { CNHCDVResult, PFFacialCDVResult } from '~/models/datavalid/pf-facial-cdv/result'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'

const FaceResultSchema = Joi.object<FaceResult, true>({
  disponivel: Joi
    .bool()
    .required(),
  probabilidade: Joi
    .string()
    .valid(...faceResultProbabilities)
    .optional(),
  similaridade: Joi
    .number()
    .min(0)
    .max(1)
    .optional(),
})

const CNHResultSchema = Joi.object<CNHCDVResult, true>({
  numero_registro: Joi
    .bool()
    .required(),
  numero_registro_ocr: Joi
    .string()
    .max(255)
    .required(),
  nome: Joi
    .bool()
    .required(),
  nome_similaridade: Joi
    .number()
    .min(0)
    .max(1)
    .required(),
  nome_ocr: Joi
    .string()
    .max(255)
    .required(),
  identidade: Joi
    .bool()
    .required(),
  identidade_similaridade: Joi
    .number()
    .min(0)
    .max(1)
    .required(),
  identidade_ocr: Joi
    .string()
    .max(255)
    .required(),
  data_nascimento: Joi
    .bool()
    .required(),
  data_nascimento_ocr: Joi
    .string()
    .isoDate()
    .required(),
  data_primeira_habilitacao: Joi
    .bool()
    .required(),
  data_primeira_habilitacao_ocr: Joi
    .string()
    .isoDate()
    .required(),
  data_ultima_emissao: Joi
    .bool()
    .required(),
  data_ultima_emissao_ocr: Joi
    .string()
    .isoDate()
    .required(),
  data_validade: Joi
    .bool()
    .required(),
  data_validade_ocr: Joi
    .string()
    .isoDate()
    .required(),
  retrato: FaceResultSchema.optional(),
})

const PFFacialCDVResultSchema = Joi.object<PFFacialCDVResult, true>({
  documento: Joi.string().valid('CNH').required(),
  cnh: CNHResultSchema.optional(),
  biometria_face: FaceResultSchema.optional(),
}).required()

const schema = PFFacialCDVResultSchema

const validateBody = (
  data: Partial<PFFacialCDVResult>,
): PFFacialCDVResult => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate facial-cdv biometry result body',
    })

    throw new InternalServerError('Erro na validação do body para análise do resultado da biometria facial-cdv (cnh)', error.stack as string)
  }

  return value
}

export default validateBody
