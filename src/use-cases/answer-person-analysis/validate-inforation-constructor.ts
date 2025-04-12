import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import {
  PersonAnalysisOptionsRequest,
  PersonAnalysisOptionsRequestValueHistory,
} from '~/models/dynamo/requestplus/analysis-person/person-analysis-options'
import { PersonAnalysisInformationValidation } from '~/models/dynamo/requestplus/validate-analysis-person/validation-information'

export type InformationValidationConstructorParams = {
  person_analysis_options: Partial<PersonAnalysisOptionsRequest<true>>,
}

const informationValidationConstructor = ({
  person_analysis_options,
}: InformationValidationConstructorParams): PersonAnalysisInformationValidation<false> => {
  const information_validation: PersonAnalysisInformationValidation<false> = CompanyRequestPersonConfigEnum.HISTORY in person_analysis_options
    ? {
      history: {
        regions: [],
      },
    } as PersonAnalysisInformationValidation<false>
    : {
    } as PersonAnalysisInformationValidation<false>

  for (const [analysis, object] of Object.entries(person_analysis_options)) {
    const analysis_key = analysis as CompanyRequestPersonConfigEnum
    if (analysis_key === CompanyRequestPersonConfigEnum.HISTORY) {
      const object_value = object as PersonAnalysisOptionsRequestValueHistory<true>
      for (const { region } of object_value.regions) {
        information_validation[CompanyRequestPersonConfigEnum.HISTORY]?.regions.push(
          {
            region,
          },
        )
      }
    } else {
      information_validation[analysis_key] = {}
    }
  }

  return information_validation
}

export default informationValidationConstructor
