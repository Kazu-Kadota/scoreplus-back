import { m2SystemScoreplusPersonConfigMap } from '~/constants/scoreplus-m2-system-map'
import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { RequestplusAnalysisPerson } from '~/models/dynamo/requestplus/analysis-person/table'
import { M2PersonAnalysisTypeEnum } from '~/models/m2system/enums/analysis'
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
      continue
    } else {
      // @ts-ignore-next-line
      third_party[m2SystemScoreplusPersonConfigMap[person_analysis_type] as CompanyRequestPersonConfigEnum] = person_analysis
    }
  }

  return third_party
}

export default thirdPartyConstructor
