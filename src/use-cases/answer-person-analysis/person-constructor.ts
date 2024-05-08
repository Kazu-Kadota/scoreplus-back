import { PeopleAnalysisCompanyOptions } from '~/models/dynamo/analysisplus/people/company-options'
import { AnalysisplusPeople } from '~/models/dynamo/analysisplus/people/table'
import { PeopleAnalysisValidatedOptions } from '~/models/dynamo/analysisplus/people/validated-options'
import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import {
  PersonAnalysisOptionsRequest,
  PersonAnalysisOptionsRequestValueAnswer,
  PersonAnalysisOptionsRequestValueHistory,
} from '~/models/dynamo/requestplus/analysis-person/person-analysis-options'
import { RequestplusAnalysisPerson } from '~/models/dynamo/requestplus/analysis-person/table'
import removeEmpty from '~/utils/remove-empty'

export type PeopleConstructor = {
  request_person: RequestplusAnalysisPerson
  person_analysis_options: Partial<PersonAnalysisOptionsRequest<true>>
  now: string
}

const personConstructor = ({
  request_person,
  now,
  person_analysis_options,
}: PeopleConstructor): AnalysisplusPeople => {
  const company_constructor = {} as PeopleAnalysisCompanyOptions
  const validated_constructor = {} as PeopleAnalysisValidatedOptions
  if (person_analysis_options.history) {
    company_constructor.history = []
    validated_constructor.history = []
  }

  for (const [analysis, value] of Object.entries(person_analysis_options)) {
    const person_analysis = analysis as CompanyRequestPersonConfigEnum
    if (person_analysis === CompanyRequestPersonConfigEnum.HISTORY) {
      const historical_value = value as PersonAnalysisOptionsRequestValueHistory<true>
      historical_value.regions.forEach((object) => {
        company_constructor[person_analysis].push({
          company_names: [request_person.company_name],
          created_at: now,
          request_id: request_person.request_id,
          state: object.region,
          updated_at: now,
        })

        validated_constructor[person_analysis].push({
          created_at: now,
          request_id: request_person.request_id,
          result: object.result,
          state: object.region,
          updated_at: now,
          reason: object.reason,
        })
      })
    } else {
      const generic_value = value as PersonAnalysisOptionsRequestValueAnswer
      company_constructor[person_analysis] = {
        company_names: [request_person.company_name],
        created_at: now,
        request_id: request_person.request_id,
        updated_at: now,
      }

      validated_constructor[person_analysis] = {
        created_at: now,
        request_id: request_person.request_id,
        result: generic_value.result,
        updated_at: now,
        reason: generic_value.reason,
      }
    }
  }

  const person_constructor: AnalysisplusPeople = removeEmpty({
    birth_date: request_person.birth_date,
    companies: company_constructor,
    created_at: now,
    document: request_person.document,
    mother_name: request_person.mother_name,
    name: request_person.name,
    person_id: request_person.person_id,
    rg: request_person.rg,
    state_rg: request_person.state_rg,
    updated_at: now,
    validated: validated_constructor,
    category_cnh: request_person.category_cnh,
    cnh: request_person.cnh,
    expire_at_cnh: request_person.expire_at_cnh,
    father_name: request_person.father_name,
    naturalness: request_person.naturalness,
    security_number_cnh: request_person.security_number_cnh,
    // black_list,
  })

  return person_constructor
}

export default personConstructor
