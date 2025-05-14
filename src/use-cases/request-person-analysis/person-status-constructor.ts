import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { RequestStatusEnum } from '~/models/dynamo/enums/request'
import {
  PersonAnalysisOptionsRequest,
  PersonAnalysisOptionsRequestValueHistory,
} from '~/models/dynamo/requestplus/analysis-person/person-analysis-options'
import { PersonAnalysisStatus } from '~/models/dynamo/requestplus/analysis-person/status'

const personStatusConstructor = (
  person_analysis_options: Partial<PersonAnalysisOptionsRequest<false>>,
): PersonAnalysisStatus<false> => {
  const status = CompanyRequestPersonConfigEnum.HISTORY in person_analysis_options
    ? {
      history: {
        regions: [],
      },
      general: RequestStatusEnum.WAITING,
    } as PersonAnalysisStatus<false>
    : {
      general: RequestStatusEnum.WAITING,
    } as PersonAnalysisStatus<false>

  let at_least_one_waiting = false

  for (const [analysis, object] of Object.entries(person_analysis_options)) {
    const analysis_key = analysis as CompanyRequestPersonConfigEnum
    const is_ethical_analysis = analysis_key === CompanyRequestPersonConfigEnum.ETHICAL
      || analysis_key === CompanyRequestPersonConfigEnum.ETHICAL_COMPLETE

    if (analysis_key === CompanyRequestPersonConfigEnum.HISTORY) {
      const object_value = object as PersonAnalysisOptionsRequestValueHistory<false>
      for (const { region } of object_value.regions) {
        status[CompanyRequestPersonConfigEnum.HISTORY]?.regions.push(
          {
            [region]: RequestStatusEnum.WAITING,
          },
        )

        at_least_one_waiting = true
      }
    } else if (is_ethical_analysis) {
      status[analysis_key] = RequestStatusEnum.WAITING

      at_least_one_waiting = true
    } else {
      status[analysis_key] = RequestStatusEnum.PROCESSING
    }
  }

  if (!at_least_one_waiting) {
    status.general = RequestStatusEnum.PROCESSING
  }

  return status
}

export default personStatusConstructor
