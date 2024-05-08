import { ImageAnswerFormato } from '~/models/datavalid/image-answer'
import { PFFacialBiometryBody, PFFacialBiometrySendRequestBody } from '~/models/datavalid/pf-facial/request-body'
import { PFFacialResult } from '~/models/datavalid/pf-facial/result'
import serproDatavalidV3ValidatePfFacial from '~/services/serpro/datavalid/v3/validate/pf-facial'

export type SendValidationAdapter = {
  body: PFFacialBiometrySendRequestBody,
  image_base64: string
  image_type: ImageAnswerFormato
}

const sendValidationAdapter = async ({
  body,
  image_base64,
  image_type,
}: SendValidationAdapter): Promise<PFFacialResult> => {
  const body_validate: PFFacialBiometryBody = {
    answer: {
      ...body.answer,
      biometria_face: {
        base64: image_base64,
        formato: image_type,
      },
    },
    key: body.key,
  }

  return await serproDatavalidV3ValidatePfFacial({ body: body_validate })
}

export default sendValidationAdapter
