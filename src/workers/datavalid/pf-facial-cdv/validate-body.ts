import Joi from 'joi'

import { PFFacialKey } from '~/models/datavalid/pf-facial/request-body'
import { PFFacialCDVBiometrySendRequestBody, PFFacialCDVSendRequestAnswer } from '~/models/datavalid/pf-facial-cdv/request-body'
import { DatavalidRequestImage } from '~/models/datavalid/request-image'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

const documentRegex = /^[0-9]{3}\.?[0-9]{3}\.?[0-9]{3}\-?[0-9]{2}$/

const PFKeySchema = Joi.object<PFFacialKey, true>({
  cpf: Joi
    .string()
    .regex(documentRegex)
    .required(),
})

const ImageAnswerSchema = Joi.object<DatavalidRequestImage, true>({
  s3_image_path: Joi
    .string()
    .required(),
})

const PFFacialCDVAnswerSchema = Joi.object<PFFacialCDVSendRequestAnswer, true>({
  documento: ImageAnswerSchema.required(),
  documento_verso: ImageAnswerSchema.optional(),
  biometria_face: ImageAnswerSchema.optional(),
})

const schema = Joi.object<PFFacialCDVBiometrySendRequestBody, true>({
  key: PFKeySchema.required(),
  answer: PFFacialCDVAnswerSchema.required(),
}).required()

const validateBody = (
  data: Partial<PFFacialCDVBiometrySendRequestBody>,
): PFFacialCDVBiometrySendRequestBody => {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
  })

  if (error) {
    logger.error({
      message: 'Error on validate send request facial-cdv biometry',
    })

    throw new BadRequestError('Erro na validação do body para envio da análise de biometria facial-cdv', error.stack as string)
  }

  return value
}

export default validateBody
