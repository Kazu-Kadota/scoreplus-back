import { PersonRequestForms } from '~/models/dynamo/requestplus/analysis-person/forms'
import { PersonAnalysisOptionsToRequest } from '~/models/dynamo/requestplus/analysis-person/person-analysis-options'
import { CompanyRequestPersonConfig } from '~/models/dynamo/userplus/company'
import { M2PersonAnalysisItems, M2PersonRequestAnalysisBody, M2PersonRequestAnalysisResponseBody } from '~/models/m2system/request/analysis-person'
import m2RequestAnalysisPerson from '~/services/m2/request/analysis-person'

import m2PersonAnalysisConstructor from './m2-person-analysis-constructor'

export type SendPersonAnalysisToM2SystemParams = {
  person: PersonRequestForms
  person_analysis_options_to_request: PersonAnalysisOptionsToRequest
  company_request_person_config: CompanyRequestPersonConfig
}

async function sendPersonAnalysisToM2System ({
  person,
  company_request_person_config,
  person_analysis_options_to_request,
}: SendPersonAnalysisToM2SystemParams): Promise<M2PersonRequestAnalysisResponseBody[]> {
  const person_analysis_constructor: M2PersonAnalysisItems[] = m2PersonAnalysisConstructor({
    company_request_person_config,
    person_analysis_options_to_request,
  })

  const { mirror_number_cnh, ...person_forms } = person

  const params: M2PersonRequestAnalysisBody = {
    person: {
      ...person_forms,
      security_number_cnh: mirror_number_cnh,
    },
    person_analysis: person_analysis_constructor,
  }

  const result = await m2RequestAnalysisPerson({
    body: params,
  })

  return result.person_analyzes
}

export default sendPersonAnalysisToM2System
