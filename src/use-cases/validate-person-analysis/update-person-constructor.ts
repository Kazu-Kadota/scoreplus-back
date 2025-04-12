import { AnalysisplusPeople } from '~/models/dynamo/analysisplus/people/table'
import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { RequestplusValidateAnalysisPerson } from '~/models/dynamo/requestplus/validate-analysis-person/table'
import {
  PersonAnalysisInformationValidation,
  PersonAnalysisInformationValidationHistory,
  PersonAnalysisInformationValidationValueAnswer,
} from '~/models/dynamo/requestplus/validate-analysis-person/validation-information'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'
import removeEmpty from '~/utils/remove-empty'

export type UpdatePersonConstructor = {
  person: AnalysisplusPeople
  now: string
  information_validation: Partial<PersonAnalysisInformationValidation<true>>
  validate_request_person: RequestplusValidateAnalysisPerson
}

const updatePersonConstructor = ({
  now,
  person,
  information_validation,
  validate_request_person,
}: UpdatePersonConstructor): AnalysisplusPeople => {
  const person_constructor: AnalysisplusPeople = {
    ...person,
    category_cnh: person.category_cnh ?? validate_request_person.category_cnh,
    cnh: person.cnh ?? validate_request_person.cnh,
    expire_at_cnh: person.expire_at_cnh ?? validate_request_person.expire_at_cnh,
    father_name: person.father_name ?? validate_request_person.father_name,
    naturalness: person.naturalness ?? validate_request_person.naturalness,
    mirror_number_cnh: person.mirror_number_cnh ?? validate_request_person.mirror_number_cnh,
    // black_list
  }

  for (const [analysis, value] of Object.entries(information_validation)) {
    const person_analysis = analysis as CompanyRequestPersonConfigEnum

    if (person_analysis === CompanyRequestPersonConfigEnum.HISTORY) {
      const historical_value = value as PersonAnalysisInformationValidationHistory<true>
      historical_value.regions.forEach((object) => {
        if (!person.companies.history) {
          person.companies.history = []
        }

        if (!person.validated.history) {
          person.validated.history = []
        }

        const exist_region = person.companies.history.find((value) =>
          value.state === object.region,
        )

        if (!exist_region) {
          person.companies.history.push({
            company_names: [validate_request_person.company_name],
            created_at: now,
            request_id: validate_request_person.request_id,
            state: object.region,
            updated_at: now,
          })

          person.validated.history.push({
            created_at: now,
            request_id: validate_request_person.request_id,
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
          company_names.add(validate_request_person.company_name)

          person.companies.history[region_index] = {
            ...person.companies.history[region_index],
            company_names: Array.from(company_names),
            request_id: validate_request_person.request_id,
            updated_at: now,
          }

          person.validated.history[region_index] = {
            ...person.validated.history[region_index],
            request_id: validate_request_person.request_id,
            result: object.result,
            updated_at: now,
            reason: object.reason,
          }
        }
      })
    } else {
      const generic_value = value as PersonAnalysisInformationValidationValueAnswer

      if (!person.companies[person_analysis] && !person.validated[person_analysis]) {
        person.companies[person_analysis] = {
          company_names: [validate_request_person.company_name],
          created_at: now,
          request_id: validate_request_person.request_id,
          updated_at: now,
        }

        person.validated[person_analysis] = {
          created_at: now,
          request_id: validate_request_person.request_id,
          result: generic_value.result,
          updated_at: now,
          reason: generic_value.reason,
        }
      } else if (person.companies[person_analysis] && person.validated[person_analysis]) {
        // @ts-ignore-next-line
        const company_names = new Set(person.companies[person_analysis].company_names)
        company_names.add(validate_request_person.company_name)

        // @ts-ignore-next-line
        person.companies[person_analysis] = {
          ...person.companies[person_analysis],
          company_names: Array.from(company_names),
          request_id: validate_request_person.request_id,
          updated_at: now,
        }

        // @ts-ignore-next-line
        person.validated[person_analysis] = {
          ...person.validated[person_analysis],
          request_id: validate_request_person.request_id,
          result: generic_value.result,
          updated_at: now,
          reason: generic_value.reason,
        }
      } else {
        logger.warn({
          message: 'One of person.companies or person.validated not exist',
          company: person.companies[person_analysis],
          validated: person.validated[person_analysis],
        })

        throw new InternalServerError('Verificar Person')
      }
    }
  }

  return removeEmpty(person_constructor)
}

export default updatePersonConstructor
