import { eagleSystemScoreplusPersonConfigMap } from '~/constants/scoreplus-eagle-system-map'
import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { RequestplusAnalysisPerson } from '~/models/dynamo/requestplus/analysis-person/table'
import { EagleSystemPersonAnalysisTypeEnum } from '~/models/eagle/enums/request-enum'
import { EagleSystemRequestAnalysisPersonResponse } from '~/models/eagle/request/analysis-person'

export type ThirdPartyConstructorParams = {
  eagle_request_person_analysis: EagleSystemRequestAnalysisPersonResponse
  request_person: RequestplusAnalysisPerson
}

function thirdPartyConstructor ({
  eagle_request_person_analysis,
  request_person,
}: ThirdPartyConstructorParams) {
  const third_party = request_person.third_party ? request_person.third_party : {}

  for (const person_analysis of eagle_request_person_analysis.person_analyzes) {
    const person_analysis_type = person_analysis.person_analysis_type
    if (person_analysis_type === EagleSystemPersonAnalysisTypeEnum.HISTORY) {
      continue
    } else {
      // @ts-ignore-next-line
      third_party[eagleSystemScoreplusPersonConfigMap[person_analysis_type] as CompanyRequestPersonConfigEnum] = person_analysis
    }
  }

  return third_party
}

export default thirdPartyConstructor
