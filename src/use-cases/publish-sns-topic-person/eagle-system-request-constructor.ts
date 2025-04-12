import { scoreplusEagleSystemPersonConfigMap } from '~/constants/scoreplus-eagle-system-map'
import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { PersonRequestForms } from '~/models/dynamo/requestplus/analysis-person/forms'
import { EagleSystemDriverCategoryEnum, EagleSystemPersonAnalysisTypeEnum, EagleSystemStateEnum } from '~/models/eagle/enums/request-enum'
import { EagleSystemRequestAnalysisPersonParams } from '~/models/eagle/request/analysis-person'

export type EagleSystemRequestConstructorParams = {
  person_analysis_option: CompanyRequestPersonConfigEnum,
  person_data: PersonRequestForms,
  person_id: string
  request_id: string
}

const eagleSystemRequestConstructor = ({
  person_analysis_option,
  person_data,
  person_id,
  request_id,
}: EagleSystemRequestConstructorParams): EagleSystemRequestAnalysisPersonParams => (
  {
    person: {
      birth_date: person_data.birth_date,
      category_cnh: person_data.category_cnh as unknown as EagleSystemDriverCategoryEnum | undefined,
      cnh: person_data.cnh,
      document: person_data.document,
      expire_at_cnh: person_data.expire_at_cnh,
      father_name: person_data.father_name,
      metadata: {
        person_id,
        request_id,
      },
      mother_name: person_data.mother_name,
      name: person_data.name,
      naturalness: person_data.naturalness,
      postback: 'scoreplus',
      rg: person_data.rg,
      security_number_cnh: person_data.mirror_number_cnh,
      state_rg: person_data.state_rg as unknown as EagleSystemStateEnum,
    },
    person_analysis: [
      {
        type: scoreplusEagleSystemPersonConfigMap[person_analysis_option] as EagleSystemPersonAnalysisTypeEnum,
      },
    ],
  }
)

export default eagleSystemRequestConstructor
