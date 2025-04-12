import { PeopleAnalysisCompanyOptions } from '~/models/dynamo/analysisplus/people/company-options'
import { AnalysisplusPeople } from '~/models/dynamo/analysisplus/people/table'
import { PeopleAnalysisValidatedOptions } from '~/models/dynamo/analysisplus/people/validated-options'
import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { RequestplusValidateAnalysisPerson } from '~/models/dynamo/requestplus/validate-analysis-person/table'
import {
  PersonAnalysisInformationValidation,
  PersonAnalysisInformationValidationHistory,
  PersonAnalysisInformationValidationValueAnswer,
} from '~/models/dynamo/requestplus/validate-analysis-person/validation-information'
import removeEmpty from '~/utils/remove-empty'

export type PeopleConstructor = {
  information_validation: Partial<PersonAnalysisInformationValidation<true>>
  now: string
  validate_request_person: RequestplusValidateAnalysisPerson
}

const personConstructor = ({
  information_validation,
  now,
  validate_request_person,
}: PeopleConstructor): AnalysisplusPeople => {
  const company_constructor = {} as PeopleAnalysisCompanyOptions
  const validated_constructor = {} as PeopleAnalysisValidatedOptions
  if (information_validation.history) {
    company_constructor.history = []
    validated_constructor.history = []
  }

  for (const [analysis, value] of Object.entries(information_validation)) {
    const person_analysis = analysis as CompanyRequestPersonConfigEnum
    if (person_analysis === CompanyRequestPersonConfigEnum.HISTORY) {
      const historical_value = value as PersonAnalysisInformationValidationHistory<true>
      historical_value.regions.forEach((object) => {
        company_constructor[person_analysis].push({
          company_names: [validate_request_person.company_name],
          created_at: now,
          request_id: validate_request_person.request_id,
          state: object.region,
          updated_at: now,
        })

        validated_constructor[person_analysis].push({
          created_at: now,
          request_id: validate_request_person.request_id,
          result: object.result,
          state: object.region,
          updated_at: now,
          reason: object.reason,
        })
      })
    } else {
      const generic_value = value as PersonAnalysisInformationValidationValueAnswer
      company_constructor[person_analysis] = {
        company_names: [validate_request_person.company_name],
        created_at: now,
        request_id: validate_request_person.request_id,
        updated_at: now,
      }

      validated_constructor[person_analysis] = {
        created_at: now,
        request_id: validate_request_person.request_id,
        result: generic_value.result,
        updated_at: now,
        reason: generic_value.reason,
      }
    }
  }

  const person_constructor: AnalysisplusPeople = removeEmpty({
    birth_date: validate_request_person.birth_date,
    companies: company_constructor,
    created_at: now,
    document: validate_request_person.document,
    mother_name: validate_request_person.mother_name,
    name: validate_request_person.name,
    person_id: validate_request_person.person_id,
    rg: validate_request_person.rg,
    state_rg: validate_request_person.state_rg,
    updated_at: now,
    validated: validated_constructor,
    category_cnh: validate_request_person.category_cnh,
    cnh: validate_request_person.cnh,
    expire_at_cnh: validate_request_person.expire_at_cnh,
    father_name: validate_request_person.father_name,
    naturalness: validate_request_person.naturalness,
    mirror_number_cnh: validate_request_person.mirror_number_cnh,
    // black_list,
  })

  return person_constructor
}

export default personConstructor
