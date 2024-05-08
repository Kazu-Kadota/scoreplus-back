import { ImageAnswer } from '~/models/datavalid/image-answer'
import { PFFacialCDVBiometryBody, PFFacialCDVBiometrySendRequestBody, PFFacialCDVImagesAnswerEnum } from '~/models/datavalid/pf-facial-cdv/request-body'
import { PFFacialCDVResult } from '~/models/datavalid/pf-facial-cdv/result'
import serproDatavalidV3ValidatePfFacialCDV from '~/services/serpro/datavalid/v3/validate/pf-facial-cdv'

export type SendValidationAdapter = {
  body: PFFacialCDVBiometrySendRequestBody,
  images_map: Map<string, ImageAnswer>
}

const sendValidationAdapter = async ({
  body,
  images_map,
}: SendValidationAdapter): Promise<PFFacialCDVResult> => {
  const body_validate: PFFacialCDVBiometryBody = {
    answer: {
      documento: {
        base64: images_map.get(PFFacialCDVImagesAnswerEnum.DOCUMENT)!.base64,
        formato: images_map.get(PFFacialCDVImagesAnswerEnum.DOCUMENT)!.formato,
      },
      documento_verso: {
        base64: images_map.get(PFFacialCDVImagesAnswerEnum.DOCUMENT_BACK)?.base64,
        formato: images_map.get(PFFacialCDVImagesAnswerEnum.DOCUMENT_BACK)?.formato,
      },
      biometria_face: {
        base64: images_map.get(PFFacialCDVImagesAnswerEnum.FACIAL)?.base64,
        formato: images_map.get(PFFacialCDVImagesAnswerEnum.FACIAL)?.formato,
      },
    },
    key: body.key,
  }

  return await serproDatavalidV3ValidatePfFacialCDV({ body: body_validate })
}

export default sendValidationAdapter
