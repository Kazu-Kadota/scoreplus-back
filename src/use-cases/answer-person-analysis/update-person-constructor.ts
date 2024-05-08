import { AnalysisplusPeople } from '~/models/dynamo/analysisplus/people/table'
import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import {
  PersonAnalysisOptionsRequest,
  PersonAnalysisOptionsRequestValueAnswer,
  PersonAnalysisOptionsRequestValueHistory,
} from '~/models/dynamo/requestplus/analysis-person/person-analysis-options'
import { RequestplusAnalysisPerson } from '~/models/dynamo/requestplus/analysis-person/table'
import removeEmpty from '~/utils/remove-empty'

export type UpdatePersonConstructor = {
  person: AnalysisplusPeople
  now: string
  person_analysis_options: Partial<PersonAnalysisOptionsRequest<true>>
  request_person: RequestplusAnalysisPerson
}

const updatePersonConstructor = ({
  now,
  person,
  person_analysis_options,
  request_person,
}: UpdatePersonConstructor): AnalysisplusPeople => {
  const person_constructor: AnalysisplusPeople = {
    ...person,
    category_cnh: person.category_cnh ?? request_person.category_cnh,
    cnh: person.cnh ?? request_person.cnh,
    expire_at_cnh: person.expire_at_cnh ?? request_person.expire_at_cnh,
    father_name: person.father_name ?? request_person.father_name,
    naturalness: person.naturalness ?? request_person.naturalness,
    security_number_cnh: person.security_number_cnh ?? request_person.security_number_cnh,
    // black_list
  }

  for (const [analysis, value] of Object.entries(person_analysis_options)) {
    const person_analysis = analysis as CompanyRequestPersonConfigEnum
    if (person_analysis === CompanyRequestPersonConfigEnum.HISTORY) {
      const historical_value = value as PersonAnalysisOptionsRequestValueHistory<true>
      historical_value.regions.forEach((object) => {
        const exist_region = person.companies.history.find((value) =>
          value.state === object.region,
        )

        if (!exist_region) {
          person.companies.history.push({
            company_names: [request_person.company_name],
            created_at: now,
            request_id: request_person.request_id,
            state: object.region,
            updated_at: now,
          })

          person.validated.history.push({
            created_at: now,
            request_id: request_person.request_id,
            result: object.result,
            state: object.region,
            updated_at: now,
            reason: object.reason,
          })
        } else {
          const region_index = person.companies.history.findIndex((value) =>
            value.state === object.region,
          )
          const company_names = new Set(person.companies.history[region_index].company_names)
          company_names.add(request_person.company_name)

          person.companies.history[region_index] = {
            ...person.companies.history[region_index],
            company_names: Array.from(company_names),
            request_id: request_person.request_id,
            updated_at: now,
          }

          person.validated.history[region_index] = {
            ...person.validated.history[region_index],
            request_id: request_person.request_id,
            result: object.result,
            updated_at: now,
            reason: object.reason,
          }
        }
      })
    } else {
      const generic_value = value as PersonAnalysisOptionsRequestValueAnswer

      if (!person.companies[person_analysis]) {
        person.companies[person_analysis] = {
          company_names: [request_person.company_name],
          created_at: now,
          request_id: request_person.request_id,
          updated_at: now,
        }

        person.validated[person_analysis] = {
          created_at: now,
          request_id: request_person.request_id,
          result: generic_value.result,
          updated_at: now,
          reason: generic_value.reason,
        }
      } else {
        const company_names = new Set(person.companies[person_analysis].company_names)
        company_names.add(request_person.company_name)

        person.companies[person_analysis] = {
          ...person.companies[person_analysis],
          company_names: Array.from(company_names),
          request_id: request_person.request_id,
          updated_at: now,
        }

        person.validated[person_analysis] = {
          ...person.validated[person_analysis],
          request_id: request_person.request_id,
          result: generic_value.result,
          updated_at: now,
          reason: generic_value.reason,
        }
      }
    }
  }

  return removeEmpty(person_constructor)
}

export default updatePersonConstructor
