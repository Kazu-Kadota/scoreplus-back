import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { AnalysisResultEnum, PersonStateEnum, RequestStatusEnum } from '~/models/dynamo/enums/request'
import { PersonAnalysisOptionsRequest, PersonAnalysisOptionsRequestValueAnswer, PersonAnalysisOptionsRequestValueHistory } from '~/models/dynamo/requestplus/analysis-person/person-analysis-options'
import { PersonAnalysisStatus, PersonAnalysisStatusHistory } from '~/models/dynamo/requestplus/analysis-person/status'
import { RequestplusAnalysisPersonKey } from '~/models/dynamo/requestplus/analysis-person/table'
import ForbiddenError from '~/utils/errors/403-forbidden'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'

import { UseCaseSendPersonAnswersBody } from '.'

export type VerifyPersonRequestStatusParams = RequestplusAnalysisPersonKey & {
  request_person_status: PersonAnalysisStatus<false>
  answers_body: UseCaseSendPersonAnswersBody[]
  person_analysis_options: Partial<PersonAnalysisOptionsRequest<false>>
}

export type VerifyPersonRequestStatusReturn = {
  is_finished: true;
  status: PersonAnalysisStatus<true>;
  person_analysis_options: Partial<PersonAnalysisOptionsRequest<true>>
  is_all_approved: AnalysisResultEnum
} | {
  is_finished: false;
  status: PersonAnalysisStatus<false>;
  person_analysis_options: Partial<PersonAnalysisOptionsRequest<false>>
  is_all_approved: AnalysisResultEnum
}

const verifyRequestStatus = ({
  request_person_status,
  answers_body,
  person_id,
  request_id,
  person_analysis_options,
}: VerifyPersonRequestStatusParams): VerifyPersonRequestStatusReturn => {
  if (request_person_status.general !== RequestStatusEnum.WAITING) {
    logger.warn({
      message: 'Person request not authorized to send answer',
      request_id,
      person_id,
    })

    throw new ForbiddenError('Análise de pessoas não autorizado a ser respondido')
  }

  const now = new Date().toISOString()

  const mount_person_analysis_options: Partial<PersonAnalysisOptionsRequest<false>> | Partial<PersonAnalysisOptionsRequest<true>> = {
    ...person_analysis_options,
  }

  const analysis_answered = {
    ...request_person_status,
    general: RequestStatusEnum.FINISHED,
  }

  for (const answer of answers_body) {
    if (answer.type === CompanyRequestPersonConfigEnum.HISTORY) {
      const historical_status = request_person_status[answer.type]
      if (!historical_status) {
        logger.warn({
          message: 'Historical analysis not requested',
          request_id,
          person_id,
        })

        throw new ForbiddenError('Análise histórico não solicitado')
      }
      const region = answer.region as PersonStateEnum

      const find_region = historical_status.regions.find((object) => region in object)

      if (!find_region) {
        logger.warn({
          message: 'Region not requested for historical analysis',
          request_id,
          person_id,
          region,
        })

        throw new ForbiddenError('Região não solicitado para análise histórico')
      }

      const is_already_answered = find_region[region] === RequestStatusEnum.FINISHED

      if (is_already_answered) {
        logger.warn({
          message: 'Historical analysis already answered',
          request_id,
          person_id,
          region,
        })

        throw new ForbiddenError('Análise histórico já respondido')
      }

      const is_canceled = find_region[region] === RequestStatusEnum.CANCELED
      if (is_canceled) {
        logger.warn({
          message: 'Analysis canceled',
          request_id,
          person_id,
          region,
        })

        throw new ForbiddenError('Análise cancelado')
      }

      const index_find_region = historical_status.regions
        .findIndex((object) => region in object) as number

      const history_answer = analysis_answered[answer.type] as PersonAnalysisStatusHistory<false>

      history_answer.regions[index_find_region][region] = RequestStatusEnum.FINISHED

      const historical_analysis = mount_person_analysis_options.history as PersonAnalysisOptionsRequestValueHistory<false>

      const index_find_historical_region = historical_analysis.regions
        .findIndex((object) => region === object.region) as number

      historical_analysis.regions[index_find_historical_region] = {
        ...answer,
        region,
        answered_at: now,
      }
    } else if (answer.type === CompanyRequestPersonConfigEnum.ETHICAL) {
      const ethical_status = request_person_status[answer.type]

      const is_already_answered = ethical_status === RequestStatusEnum.FINISHED

      if (is_already_answered) {
        logger.warn({
          message: 'Ethical analysis already answered',
          request_id,
          person_id,
        })

        throw new ForbiddenError('Análise ética já respondido')
      }

      const is_canceled = ethical_status === RequestStatusEnum.CANCELED
      if (is_canceled) {
        logger.warn({
          message: 'Analysis canceled',
          request_id,
          person_id,
        })

        throw new ForbiddenError('Análise cancelado')
      }

      analysis_answered[answer.type] = RequestStatusEnum.FINISHED

      mount_person_analysis_options[answer.type] = {
        ...answer,
        answered_at: now,
      }
    } else if (answer.type === CompanyRequestPersonConfigEnum.BIOMETRY_BASIC
      || answer.type === CompanyRequestPersonConfigEnum.BIOMETRY_CNH
      || answer.type === CompanyRequestPersonConfigEnum.BIOMETRY_FACIAL) {
      const biometry_status = request_person_status[answer.type]

      const is_already_answered = biometry_status === RequestStatusEnum.FINISHED

      if (is_already_answered) {
        logger.warn({
          message: 'Analysis already answered',
          request_id,
          person_id,
        })

        throw new ForbiddenError('Análise já respondido')
      }

      const is_canceled = biometry_status === RequestStatusEnum.CANCELED
      if (is_canceled) {
        logger.warn({
          message: 'Analysis canceled',
          request_id,
          person_id,
        })

        throw new ForbiddenError('Análise cancelado')
      }

      analysis_answered[answer.type] = RequestStatusEnum.FINISHED

      mount_person_analysis_options[answer.type] = {
        ...answer,
        answered_at: now,
      }
    } else {
      logger.warn({
        message: 'Request not authorized to be answered',
        request_id,
        person_id,
        type: answer.type,
      })

      throw new InternalServerError()
    }
  }

  let is_all_approved: AnalysisResultEnum = AnalysisResultEnum.APPROVED

  for (const [analysis, value] of Object.entries(mount_person_analysis_options)) {
    const person_analysis = analysis as CompanyRequestPersonConfigEnum
    if (person_analysis === CompanyRequestPersonConfigEnum.HISTORY) {
      const historical_value = value as PersonAnalysisOptionsRequestValueHistory<false>

      for (const region of historical_value.regions) {
        if (region.result !== AnalysisResultEnum.APPROVED) {
          is_all_approved = AnalysisResultEnum.REJECTED

          break
        }
      }

      if (is_all_approved === AnalysisResultEnum.REJECTED) {
        break
      }
    } else {
      const status = value as Partial<PersonAnalysisOptionsRequestValueAnswer>
      if (status.result !== AnalysisResultEnum.APPROVED) {
        is_all_approved = AnalysisResultEnum.REJECTED

        break
      }
    }
  }

  let is_worker_finished = true

  for (const [analysis, value] of Object.entries(analysis_answered)) {
    const person_analysis = analysis as CompanyRequestPersonConfigEnum
    if (person_analysis === CompanyRequestPersonConfigEnum.HISTORY) {
      const historical_value = value as PersonAnalysisStatusHistory<false>
      const find_region = historical_value.regions.find((object) =>
        Object.values(object).includes(RequestStatusEnum.WAITING),
      )
      if (find_region) {
        return {
          is_finished: false,
          status: {
            ...analysis_answered,
            general: RequestStatusEnum.WAITING,
          },
          person_analysis_options: mount_person_analysis_options,
          is_all_approved,
        }
      }
    } else if (person_analysis === CompanyRequestPersonConfigEnum.ETHICAL) {
      const status = value as RequestStatusEnum
      if (status === RequestStatusEnum.WAITING) {
        return {
          is_finished: false,
          status: {
            ...analysis_answered,
            general: RequestStatusEnum.WAITING,
          },
          person_analysis_options: mount_person_analysis_options,
          is_all_approved,
        }
      }
    } else {
      const status = value as RequestStatusEnum
      if (status === RequestStatusEnum.PROCESSING) {
        is_worker_finished = false
      }
    }
  }

  if (is_worker_finished) {
    const status = analysis_answered as PersonAnalysisStatus<true>
    const person_analysis_options_finished = mount_person_analysis_options as Partial<PersonAnalysisOptionsRequest<true>>
    return {
      is_finished: true,
      status,
      person_analysis_options: person_analysis_options_finished,
      is_all_approved,
    }
  }

  return {
    is_finished: false,
    status: {
      ...analysis_answered,
      general: RequestStatusEnum.PROCESSING,
    },
    person_analysis_options: mount_person_analysis_options,
    is_all_approved,
  }
}

export default verifyRequestStatus
