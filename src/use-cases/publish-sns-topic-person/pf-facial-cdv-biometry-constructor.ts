import { DatavalidImageObject } from '~/models/datavalid/image-object'
import { PFFacialCDVBiometrySendRequestBody } from '~/models/datavalid/pf-facial-cdv/request-body'
import { CompanyRequestPersonBiometryConfigEnum } from '~/models/dynamo/enums/company'
import { PersonRequestForms } from '~/models/dynamo/requestplus/analysis-person/forms'

export type PfFacialCDVBiometryConstructorParams =
  PersonRequestForms
  & DatavalidImageObject<CompanyRequestPersonBiometryConfigEnum.BIOMETRY_CNH>

const pfFacialCDVBiometryConstructor = (
  data: PfFacialCDVBiometryConstructorParams,
): PFFacialCDVBiometrySendRequestBody => (
  {
    key: {
      cpf: data.document.replace(/[.-]/g, ''),
    },
    answer: {
      documento: {
        s3_image_path: data.s3_document_image_path,
      },
      documento_verso: {
        s3_image_path: data.s3_document_back_image_path,
      },
      biometria_face: {
        s3_image_path: data.s3_facial_image_path,
      },
    },
  }
)

export default pfFacialCDVBiometryConstructor
