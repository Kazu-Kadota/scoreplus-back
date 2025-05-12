import { m2SystemScoreplusPersonConfigMap } from '~/constants/scoreplus-m2-system-map'
import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { RequestplusAnalysisPerson } from '~/models/dynamo/requestplus/analysis-person/table'
import { M2PersonAnalysisTypeEnum, M2RequestAnalysisStateEnum } from '~/models/m2system/enums/analysis'
import { M2PersonRequestAnalysisResponse } from '~/models/m2system/request/analysis-person'

export type ThirdPartyConstructorParams = {
  m2_request_person_analysis: M2PersonRequestAnalysisResponse
  request_person: RequestplusAnalysisPerson
}

function thirdPartyConstructor ({
  m2_request_person_analysis,
  request_person,
}: ThirdPartyConstructorParams) {
  const third_party = request_person.third_party ? request_person.third_party : {}

  for (const person_analysis of m2_request_person_analysis.person_analyzes) {
    const person_analysis_type = person_analysis.person_analysis_type
    if (person_analysis_type === M2PersonAnalysisTypeEnum.HISTORY) {
      if (person_analysis.region === M2RequestAnalysisStateEnum.NATIONAL_HISTORY_WITH_SP && request_person.person_analysis_options['ethical-complete']) {
        third_party[CompanyRequestPersonConfigEnum.ETHICAL_COMPLETE] = person_analysis
      } else {
        if (third_party[m2SystemScoreplusPersonConfigMap[person_analysis_type] as CompanyRequestPersonConfigEnum.HISTORY]) {
          third_party[m2SystemScoreplusPersonConfigMap[person_analysis_type] as CompanyRequestPersonConfigEnum.HISTORY] = {
            regions: [
              ...third_party[m2SystemScoreplusPersonConfigMap[person_analysis_type] as CompanyRequestPersonConfigEnum.HISTORY]!.regions,
              {
                [person_analysis.region as M2RequestAnalysisStateEnum]: person_analysis,
              },
            ],
          }
        } else {
          third_party[m2SystemScoreplusPersonConfigMap[person_analysis_type] as CompanyRequestPersonConfigEnum.HISTORY] = {
            regions: [{
              [person_analysis.region as M2RequestAnalysisStateEnum]: person_analysis,
            }],
          }
        }
      }
    } else {
      third_party[m2SystemScoreplusPersonConfigMap[person_analysis_type] as CompanyRequestPersonConfigEnum.ETHICAL] = person_analysis
    }
  }

  return third_party
}

export default thirdPartyConstructor
