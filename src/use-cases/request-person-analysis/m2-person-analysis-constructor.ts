import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { PersonAnalysisOptionsToRequest } from '~/models/dynamo/requestplus/analysis-person/person-analysis-options'
import { CompanyRequestPersonConfig } from '~/models/dynamo/userplus/company'
import { M2PersonAnalysisTypeEnum, M2PersonRegionTypeEnum, M2RequestAnalysisStateEnum } from '~/models/m2system/enums/analysis'
import { M2PersonAnalysisItems } from '~/models/m2system/request/analysis-person'

export type M2PersonAnalysisConstructorParams = {
  person_analysis_options_to_request: PersonAnalysisOptionsToRequest
  company_request_person_config: CompanyRequestPersonConfig
}

function m2PersonAnalysisConstructor ({
  company_request_person_config,
  person_analysis_options_to_request,
}: M2PersonAnalysisConstructorParams): M2PersonAnalysisItems[] {
  const person_analysis: M2PersonAnalysisItems[] = []

  for (const analysis_to_request of person_analysis_options_to_request) {
    if (analysis_to_request === CompanyRequestPersonConfigEnum.ETHICAL) {
      const type = M2PersonAnalysisTypeEnum.HISTORY
      const region_types = [M2PersonRegionTypeEnum.STATES]
      const regions = [M2RequestAnalysisStateEnum.NATIONAL_HISTORY_WITH_SP]

      person_analysis.push({
        type,
        region_types,
        regions,
      })
    } else if (analysis_to_request === CompanyRequestPersonConfigEnum.HISTORY) {
      const type = M2PersonAnalysisTypeEnum.HISTORY
      const region_types = [M2PersonRegionTypeEnum.STATES]
      const regions: M2RequestAnalysisStateEnum[] = []

      const company_request_person_config_history = Object.entries(company_request_person_config[CompanyRequestPersonConfigEnum.HISTORY])

      for (const [history_regions, to_be_analyzed] of company_request_person_config_history) {
        const region = history_regions as M2RequestAnalysisStateEnum
        if (to_be_analyzed) {
          regions.push(region)
        } else {
          continue
        }
      }

      person_analysis.push({
        region_types,
        type,
        regions,
      })
    } else {
      continue
    }
  }

  return person_analysis
}

export default m2PersonAnalysisConstructor
