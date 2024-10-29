import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { LRUCache } from 'lru-cache'

import { AnalysisResultEnum, AnalysisTypeEnum } from '~/models/dynamo/enums/request'
import { UserGroupEnum } from '~/models/dynamo/enums/user'
import { PersonRequestForms } from '~/models/dynamo/requestplus/analysis-person/forms'
import { PersonAnalysisOptionsRequest } from '~/models/dynamo/requestplus/analysis-person/person-analysis-options'
import { PersonAnalysisType } from '~/models/dynamo/requestplus/analysis-person/person-analysis-type'
import { PersonAnalysisStatus } from '~/models/dynamo/requestplus/analysis-person/status'
import { RequestplusAnalysisPerson, RequestplusAnalysisPersonKey } from '~/models/dynamo/requestplus/analysis-person/table'
import { RequestplusFinishedAnalysisPerson, RequestplusFinishedAnalysisPersonKey } from '~/models/dynamo/requestplus/finished-analysis-person/table'
import { Timestamp } from '~/models/dynamo/timestamp'
import { UserplusCompany } from '~/models/dynamo/userplus/company'
import { Controller } from '~/models/lambda'
import NotFoundError from '~/utils/errors/404-not-found'
import logger from '~/utils/logger'
import { Exact } from '~/utils/types/exact'

import countConsult from './count-consult'
import getCompanyAdapter from './get-company-adapter '
import queryFinishedRequestPersonByDocumentAdapter, { QueryFinishedRequestPersonByDocumentAdapterParams } from './query-finished-request-person-by-document-adapter'
import queryRequestPersonByDocumentAdapter, { QueryRequestPersonByDocumentAdapterParams } from './query-request-person-by-document-adapter'
import validateQuery from './validate-query'

import verifyValidityDate from './verify-validity-date'

export type QueryPersonByDocumentControllerClientFinishedResponse = RequestplusFinishedAnalysisPersonKey & PersonRequestForms & Timestamp & {
  analysis_type: AnalysisTypeEnum
  finished_at: string
  person_analysis_options: Partial<PersonAnalysisOptionsRequest<true>>
  person_analysis_type: PersonAnalysisType
  release_extract_id?: string
  result: AnalysisResultEnum
  status: PersonAnalysisStatus<true>
}

export type QueryPersonByDocumentControllerClientResponse = RequestplusAnalysisPersonKey & PersonRequestForms & Timestamp & {
  analysis_type: AnalysisTypeEnum
  person_analysis_options: Partial<PersonAnalysisOptionsRequest<false>>
  person_analysis_type: PersonAnalysisType
  release_extract_id?: string
  status: PersonAnalysisStatus<false>
}

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })

const cache_options = {
  ttl: 60 * 60 * 24 * 30, // 1 hour: 60 seconds * 60 minutes * 24 hours * 30 days
  ttlAutopurge: true,
}

const company_cache = new LRUCache(cache_options)

function isFinishedAnalysisPerson (person: RequestplusFinishedAnalysisPerson | RequestplusAnalysisPerson): person is RequestplusFinishedAnalysisPerson {
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
    | QueryPersonByDocumentControllerClientResponse
    | RequestplusFinishedAnalysisPerson
    | RequestplusAnalysisPerson
    ) & {
      validity_date?: string
  }> = []

  const query_person_params: QueryRequestPersonByDocumentAdapterParams = {
    dynamodbClient,
    query_person,
    user_info,
  }

  const query_finished_person_params: QueryFinishedRequestPersonByDocumentAdapterParams = {
    dynamodbClient,
    query_person,
    user_info,
  }

  if (req.user.user_type === UserGroupEnum.CLIENT) {
    const request_person = await queryRequestPersonByDocumentAdapter(query_person_params)

    if (request_person) {
      for (const request of request_person) {
        if (request.company_name === user_info.company_name) {
          const {
            combo_id,
            combo_number,
            company_name,
            m2_request,
            user_id,
            ...client_person_info
          } = request

          const person: Exact<QueryPersonByDocumentControllerClientResponse, typeof client_person_info> = client_person_info

          people.push(person)
        }
      }
    }

    if (people.length === 0) {
      const finished_people = await queryFinishedRequestPersonByDocumentAdapter(query_finished_person_params)
      if (finished_people) {
        const finished_person = finished_people.find((value) => value.company_name === user_info.company_name) ?? finished_people[0]

        const company = await getCompanyAdapter(finished_person.company_name, dynamodbClient)

        const validity_date = verifyValidityDate(finished_person, company)

        const {
          already_consulted,
          combo_id,
          combo_number,
          company_name,
          m2_request,
          user_id,
          ...client_person_info
        } = finished_person

        const person: Exact<QueryPersonByDocumentControllerClientFinishedResponse, typeof client_person_info> = client_person_info

        people.push({
          ...person,
          validity_date,
        })

        await countConsult({
          dynamodbClient,
          finished_person,
          user_info,
        })
      }
    }
  } else {
    const analysis: Array<(RequestplusFinishedAnalysisPerson | RequestplusAnalysisPerson)> = []
    const request_person = await queryRequestPersonByDocumentAdapter(query_person_params)
    if (request_person) {
      analysis.push(...request_person)
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
        const validity_date = verifyValidityDate(item, company)

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
