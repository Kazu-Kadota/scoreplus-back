import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { PersonRequestForms } from '~/models/dynamo/requestplus/analysis-person/forms'
import { CompanyRequestPersonConfig } from '~/models/dynamo/userplus/company'
import { M2PersonAnalysisTypeEnum, M2PersonRegionTypeEnum, M2RequestAnalysisStateEnum } from '~/models/m2system/enums/analysis'
import { M2PersonRequestAnalysisBody } from '~/models/m2system/request/analysis-person'

export type M2PersonAnalysisConstructorParams = {
  person_analysis_options_to_request: CompanyRequestPersonConfigEnum
  person_data: PersonRequestForms
  company_request_person_config: CompanyRequestPersonConfig
  person_id: string
  request_id: string
}

function m2PersonAnalysisConstructor ({
  company_request_person_config,
  person_analysis_options_to_request,
  person_data,
  person_id,
  request_id,
}: M2PersonAnalysisConstructorParams): M2PersonRequestAnalysisBody {
  if (person_analysis_options_to_request === CompanyRequestPersonConfigEnum.ETHICAL) {
    // const type = M2PersonAnalysisTypeEnum.HISTORY
    // const region_types = [M2PersonRegionTypeEnum.STATES]
    // const regions = [M2RequestAnalysisStateEnum.NATIONAL_HISTORY_WITH_SP]

    const type = M2PersonAnalysisTypeEnum.SIMPLE
    const region_types = [M2PersonRegionTypeEnum.NATIONAL]

    return {
      person: {
        birth_date: person_data.birth_date,
        category_cnh: person_data.category_cnh,
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
        state_rg: person_data.state_rg,
      },
      person_analysis: [{
        type,
        region_types,
        // regions,
      }],
    }
  } else {
    // History
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

    return {
      person: {
        birth_date: person_data.birth_date,
        category_cnh: person_data.category_cnh,
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
        state_rg: person_data.state_rg,
      },
      person_analysis: [{
        type,
        region_types,
        regions,
      }],
    }
  }
}

export default m2PersonAnalysisConstructor
