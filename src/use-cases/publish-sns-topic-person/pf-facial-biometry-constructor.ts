import { DatavalidImageObject } from '~/models/datavalid/image-object'
import { PFFacialBiometrySendRequestBody } from '~/models/datavalid/pf-facial/request-body'
import { CompanyRequestPersonBiometryConfigEnum } from '~/models/dynamo/enums/company'
import { PersonRequestForms } from '~/models/dynamo/requestplus/analysis-person/forms'

export type PfFacialBiometryConstructorParams =
  PersonRequestForms
  & DatavalidImageObject<CompanyRequestPersonBiometryConfigEnum.BIOMETRY_FACIAL>

const pfFacialBiometryConstructor = (
  data: PfFacialBiometryConstructorParams,
): PFFacialBiometrySendRequestBody => (
  {
    key: {
      cpf: data.document.replace(/[.-]/g, ''),
    },
    answer: {
      nome: data.name,
      data_nascimento: data.birth_date.split('T')[0],
      situacao_cpf: 'regular',
      cnh: {
        numero_registro: data.cnh,
        categoria: data.category_cnh,
        codigo_situacao: '3',
        possui_impedimento: false,
      },
      filiacao: {
        nome_mae: data.mother_name,
        nome_pai: data.father_name,
      },
      documento: {
        numero: data.rg,
        tipo: 1,
        uf_expedidor: data.state_rg,
      },
      endereco: {},
      biometria_face: {
        s3_image_path: data.s3_facial_image_path,
      },
    },
  }
)

export default pfFacialBiometryConstructor
