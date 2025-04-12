import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { LRUCache } from 'lru-cache'

import { UserGroupEnum } from '~/models/dynamo/enums/user'
import { RequestplusAnalysisPerson } from '~/models/dynamo/requestplus/analysis-person/table'
import { RequestplusFinishedAnalysisPerson } from '~/models/dynamo/requestplus/finished-analysis-person/table'
import { RequestplusValidateAnalysisPerson } from '~/models/dynamo/requestplus/validate-analysis-person/table'
import { UserplusCompany } from '~/models/dynamo/userplus/company'
import { Controller } from '~/models/lambda'
import NotFoundError from '~/utils/errors/404-not-found'
import logger from '~/utils/logger'
import { Exact } from '~/utils/types/exact'

import getCompanyAdapter from './get-company-adapter'
import queryFinishedRequestPersonByDocumentAdapter, { QueryFinishedRequestPersonByDocumentAdapterParams } from './query-finished-request-person-by-document-adapter'
import queryRequestPersonByDocumentAdapter, { QueryRequestPersonByDocumentAdapterParams } from './query-request-person-by-document-adapter'
import queryValidatePersonByDocumentAdapter from './query-validate-person-by-document-adapter'
import validateQuery from './validate-query'

import verifyValidityDate, { VerifyValidityDateParams } from './verify-validity-date'

export type QueryPersonByDocumentControllerClientResponse = Omit<RequestplusAnalysisPerson,
  'person_analysis_options'
  | 'third_party'
>

export type QueryPersonByDocumentControllerClientValidateResponse = Omit<RequestplusValidateAnalysisPerson,
  'person_analysis_options'
  | 'information_validation'
  | 'third_party'
>

export type QueryPersonByDocumentControllerClientFinishedResponse = Omit<RequestplusFinishedAnalysisPerson,
  'person_analysis_options'
  | 'information_validation'
  | 'third_party'
  | 'already_consulted'
  | 'company_name'
> & {
  is_my_company: boolean
}

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
})

const cache_options = {
  ttl: 60 * 60 * 24 * 30, // 1 hour: 60 seconds * 60 minutes * 24 hours * 30 days
  ttlAutopurge: true,
}

const company_cache = new LRUCache(cache_options)

function isFinishedAnalysisPerson (person: RequestplusAnalysisPerson | RequestplusValidateAnalysisPerson | RequestplusFinishedAnalysisPerson): person is RequestplusFinishedAnalysisPerson {
  return (person as RequestplusFinishedAnalysisPerson).finished_at !== undefined
}

const queryPersonByDocumentController: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start query person analysis by document',
  })

  const user_info = req.user
  const query_person = validateQuery({ ...req.queryStringParameters })

  const people: Array<(
    QueryPersonByDocumentControllerClientFinishedResponse
    | QueryPersonByDocumentControllerClientValidateResponse
    | QueryPersonByDocumentControllerClientResponse
    | RequestplusFinishedAnalysisPerson
    | RequestplusAnalysisPerson
    ) & {
      validity_date?: string
  }> = []

  const query_person_params: QueryRequestPersonByDocumentAdapterParams = {
    dynamodbClient,
    query_person,
  }

  const query_finished_person_params: QueryFinishedRequestPersonByDocumentAdapterParams = {
    dynamodbClient,
    query_person,
  }

  if (req.user.user_type === UserGroupEnum.CLIENT) {
    const request_person = await queryRequestPersonByDocumentAdapter(query_person_params)

    if (request_person) {
      for (const request of request_person) {
        if (user_info.user_type === UserGroupEnum.CLIENT && request.company_name === user_info.company_name) {
          const {
            person_analysis_options,
            third_party,
            ...client_person_info
          } = request

          const person: Exact<QueryPersonByDocumentControllerClientResponse, typeof client_person_info> = client_person_info

          people.push(person)
        }
      }
    }

    const validate_request_person = await queryValidatePersonByDocumentAdapter(query_person_params)

    if (validate_request_person) {
      for (const request of validate_request_person) {
        if (user_info.user_type === UserGroupEnum.CLIENT && request.company_name === user_info.company_name) {
          const {
            information_validation,
            person_analysis_options,
            third_party,
            ...client_person_info
          } = request

          const person: Exact<QueryPersonByDocumentControllerClientValidateResponse, typeof client_person_info> = client_person_info

          people.push(person)
        }
      }
    }

    const finished_people = await queryFinishedRequestPersonByDocumentAdapter(query_finished_person_params)

    if (finished_people) {
      let last_finished_person: RequestplusFinishedAnalysisPerson | undefined = finished_people[0]
      const finished_people_from_company = finished_people.filter((value) => value.company_name === user_info.company_name)

      if (!finished_people_from_company[0] && !last_finished_person) {
        logger.warn({
          message: 'Person not found with document',
          document: query_person.document,
        })

        throw new NotFoundError('Pessoa não encontrada pelo documento')
      }

      if (last_finished_person && finished_people_from_company[0] && last_finished_person.request_id === finished_people_from_company[0].request_id) {
        last_finished_person = undefined
      }

      if (finished_people_from_company[0]) {
        const company_from_company = await getCompanyAdapter(finished_people_from_company[0].company_name, dynamodbClient)

        for (const finished_person of finished_people_from_company) {
          const verify_validity_date_params: VerifyValidityDateParams = {
            company_analysis_config: company_from_company.analysis_config,
            person_analysis_type: finished_person.person_analysis_type,
            person_finished_at: finished_person.finished_at,
          }

          const validity_date = verifyValidityDate(verify_validity_date_params)

          const {
            already_consulted,
            company_name,
            information_validation,
            person_analysis_options,
            third_party,
            ...client_person_info
          } = finished_person

          const client_person_info_company: QueryPersonByDocumentControllerClientFinishedResponse = {
            ...client_person_info,
            is_my_company: true,
          }

          const person: Exact<QueryPersonByDocumentControllerClientFinishedResponse, typeof client_person_info_company> = client_person_info_company

          people.push({
            ...person,
            validity_date,
          })
        }
      }

      if (last_finished_person) {
        const company_from_last_finished_person = await getCompanyAdapter(last_finished_person.company_name, dynamodbClient)

        const verify_validity_date_params: VerifyValidityDateParams = {
          company_analysis_config: company_from_last_finished_person.analysis_config,
          person_analysis_type: last_finished_person.person_analysis_type,
          person_finished_at: last_finished_person.finished_at,
        }

        const validity_date = verifyValidityDate(verify_validity_date_params)

        const {
          already_consulted,
          company_name,
          information_validation,
          person_analysis_options,
          third_party,
          ...client_person_info
        } = last_finished_person

        const client_person_info_company: QueryPersonByDocumentControllerClientFinishedResponse = {
          ...client_person_info,
          is_my_company: false,
        }

        const person: Exact<QueryPersonByDocumentControllerClientFinishedResponse, typeof client_person_info_company> = client_person_info_company

        people.push({
          ...person,
          validity_date,
        })
      }
    }

    // if (people.length === 0) {
    //   const finished_people = await queryFinishedRequestPersonByDocumentAdapter(query_finished_person_params)
    //   if (finished_people) {
    //     const finished_person = finished_people[0]

    //     if (!finished_person) {
    //       logger.warn({
    //         message: 'Person not found with document',
    //         document: query_person.document,
    //       })

    //       throw new NotFoundError('Pessoa não encontrada pelo documento')
    //     }

    //     const company = await getCompanyAdapter(finished_person.company_name, dynamodbClient)

    //     const verify_validity_date_params: VerifyValidityDateParams = {
    //       company_analysis_config: company.analysis_config,
    //       person_analysis_type: finished_person.person_analysis_type,
    //       person_finished_at: finished_person.finished_at,
    //     }

    //     const validity_date = verifyValidityDate(verify_validity_date_params)

    //     const {
    //       already_consulted,
    //       company_name,
    //       information_validation,
    //       person_analysis_options,
    //       third_party,
    //       ...client_person_info
    //     } = finished_person

    //     const client_person_info_company: QueryPersonByDocumentControllerClientFinishedResponse = {
    //       ...client_person_info,
    //       is_my_company: user_info.company_name === company.name,
    //     }

    //     const person: Exact<QueryPersonByDocumentControllerClientFinishedResponse, typeof client_person_info_company> = client_person_info_company

    //     people.push({
    //       ...person,
    //       validity_date,
    //     })
    //   }
    // }
  } else {
    const analysis: Array<(RequestplusAnalysisPerson | RequestplusValidateAnalysisPerson | RequestplusFinishedAnalysisPerson)> = []

    const request_person = await queryRequestPersonByDocumentAdapter(query_person_params)
    if (request_person) {
      analysis.push(...request_person)
    }

    const validate_person = await queryValidatePersonByDocumentAdapter(query_person_params)
    if (validate_person) {
      analysis.push(...validate_person)
    }

    const finished_person = await queryFinishedRequestPersonByDocumentAdapter(query_finished_person_params)
    if (finished_person) {
      analysis.push(...finished_person)
    }

    for (const item of analysis) {
      if (isFinishedAnalysisPerson(item)) {
        if (!company_cache.has(item.company_name)) {
          company_cache.set(item.company_name, await getCompanyAdapter(item.company_name, dynamodbClient))
        }

        const company = company_cache.get(item.company_name) as UserplusCompany

        const verify_validity_date_params: VerifyValidityDateParams = {
          company_analysis_config: company.analysis_config,
          person_analysis_type: item.person_analysis_type,
          person_finished_at: item.finished_at,
        }

        const validity_date = verifyValidityDate(verify_validity_date_params)

        people.push({
          ...item,
          validity_date,
        })
      } else {
        people.push(item)
      }
    }
  }

  if (people.length === 0) {
    logger.warn({
      message: 'Person not found with document',
      document: query_person.document,
    })

    throw new NotFoundError('Pessoa não encontrada pelo documento')
  }

  logger.info({
    message: 'Finish on query person analysis by document',
  })

  return {
    body: {
      message: 'Finish on get person analysis by document',
      people,
    },
  }
}

export default queryPersonByDocumentController
