import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { AnalysisResultEnum, PersonStateEnum, RequestStatusEnum } from '~/models/dynamo/enums/request'
import { PersonAnalysisStatus, PersonAnalysisStatusHistory } from '~/models/dynamo/requestplus/analysis-person/status'
import { RequestplusAnalysisPersonKey } from '~/models/dynamo/requestplus/analysis-person/table'
import { PersonAnalysisInformationValidation, PersonAnalysisInformationValidationHistory, PersonAnalysisInformationValidationValueAnswer } from '~/models/dynamo/requestplus/validate-analysis-person/validation-information'
import ForbiddenError from '~/utils/errors/403-forbidden'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'

import { UseCaseValidatePersonAnalysisBody } from '.'

export type VerifyPersonRequestStatusParams = RequestplusAnalysisPersonKey & {
  answers_body: UseCaseValidatePersonAnalysisBody[]
  information_validation: Partial<PersonAnalysisInformationValidation<false>>
  request_person_status: PersonAnalysisStatus<false>
}

export type VerifyPersonRequestStatusReturn = {
  is_finished: true;
  status: PersonAnalysisStatus<true>;
  information_validation: Partial<PersonAnalysisInformationValidation<true>>
  is_all_approved: AnalysisResultEnum
} | {
  is_finished: false;
  status: PersonAnalysisStatus<false>;
  information_validation: Partial<PersonAnalysisInformationValidation<false>>
  is_all_approved: AnalysisResultEnum
}

const verifyRequestStatus = ({
  request_person_status,
  answers_body,
  person_id,
  request_id,
  information_validation,
}: VerifyPersonRequestStatusParams): VerifyPersonRequestStatusReturn => {
  const is_validating = request_person_status.general === RequestStatusEnum.VALIDATING

  if (!is_validating) {
    logger.warn({
      message: 'Person request not authorized to validate',
      request_id,
      person_id,
    })

    throw new ForbiddenError('Análise de pessoas não autorizado a ser validado')
  }

  const now = new Date().toISOString()

  const mount_information_validation: Partial<PersonAnalysisInformationValidation<false>> | Partial<PersonAnalysisInformationValidation<true>> = {
    ...information_validation,
  }

  const analysis_answered: PersonAnalysisStatus<false> = {
    ...request_person_status,
    general: RequestStatusEnum.FINISHED,
  }

  for (const answer of answers_body) {
    const is_biometry_request = answer.type === CompanyRequestPersonConfigEnum.BIOMETRY_BASIC
      || answer.type === CompanyRequestPersonConfigEnum.BIOMETRY_CNH
      || answer.type === CompanyRequestPersonConfigEnum.BIOMETRY_FACIAL

    const is_eagle_request = answer.type === CompanyRequestPersonConfigEnum.BASIC_DATA
      || answer.type === CompanyRequestPersonConfigEnum.CNH_SIMPLE
      || answer.type === CompanyRequestPersonConfigEnum.CNH_ADVANCED
      || answer.type === CompanyRequestPersonConfigEnum.PROCESS

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

        throw new ForbiddenError('Região não solicitado para análise histórico', region)
      }

      const is_already_validated = find_region[region] === RequestStatusEnum.FINISHED

      if (is_already_validated) {
        logger.warn({
          message: 'Historical analysis already validated',
          answer_type: answer.type,
          request_id,
          person_id,
          region,
        })

        throw new ForbiddenError('Análise histórico já validado', region)
      }

      const is_canceled = find_region[region] === RequestStatusEnum.CANCELED
      if (is_canceled) {
        logger.warn({
          message: 'Analysis canceled',
          answer_type: answer.type,
          request_id,
          person_id,
          region,
        })

        throw new ForbiddenError('Análise histórico cancelado')
      }

      const index_find_region = historical_status.regions
        .findIndex((object) => region in object) as number

      const history_answer = analysis_answered[answer.type] as PersonAnalysisStatusHistory<false>

      history_answer.regions[index_find_region][region] = RequestStatusEnum.FINISHED

      const historical_analysis = mount_information_validation.history as PersonAnalysisInformationValidationHistory<false>

      const index_find_historical_region = historical_analysis.regions
        .findIndex((object) => region === object.region) as number

      historical_analysis.regions[index_find_historical_region] = {
        ...answer,
        region,
        validated_at: now,
      }
    } else if (answer.type === CompanyRequestPersonConfigEnum.ETHICAL) {
      const ethical_status = request_person_status[answer.type]

      const is_already_validated = ethical_status === RequestStatusEnum.FINISHED

      if (is_already_validated) {
        logger.warn({
          message: 'Ethical analysis already validated',
          answer_type: answer.type,
          request_id,
          person_id,
        })

        throw new ForbiddenError('Análise ética já validado')
      }

      const is_canceled = ethical_status === RequestStatusEnum.CANCELED
      if (is_canceled) {
        logger.warn({
          message: 'Ethical analysis canceled',
          answer_type: answer.type,
          request_id,
          person_id,
        })

        throw new ForbiddenError('Análise ética cancelado')
      }

      analysis_answered[answer.type] = RequestStatusEnum.FINISHED

      mount_information_validation[answer.type] = {
        ...answer,
        validated_at: now,
      }
    } else if (is_eagle_request) {
      const eagle_answer_type_status = request_person_status[answer.type]

      const is_already_validated = eagle_answer_type_status === RequestStatusEnum.FINISHED

      if (is_already_validated) {
        logger.warn({
          message: `${answer.type} analysis already validated`,
          answer_type: answer.type,
          request_id,
          person_id,
        })

        throw new ForbiddenError(`Análise ${answer.type} já validado`)
      }

      const is_canceled = eagle_answer_type_status === RequestStatusEnum.CANCELED
      if (is_canceled) {
        logger.warn({
          message: `${answer.type} analysis canceled`,
          answer_type: answer.type,
          request_id,
          person_id,
        })

        throw new ForbiddenError(`Análise ${answer.type} cancelado`)
      }

      analysis_answered[answer.type] = RequestStatusEnum.FINISHED

      mount_information_validation[answer.type] = {
        ...answer,
        validated_at: now,
      }
    } else if (is_biometry_request) {
      const biometry_status = request_person_status[answer.type]

      const is_already_validated = biometry_status === RequestStatusEnum.FINISHED

      if (is_already_validated) {
        logger.warn({
          message: `${answer.type} analysis already validated`,
          answer_type: answer.type,
          request_id,
          person_id,
        })

        throw new ForbiddenError(`Análise ${answer.type} já validado`)
      }

      const is_canceled = biometry_status === RequestStatusEnum.CANCELED
      if (is_canceled) {
        logger.warn({
          message: `${answer.type} analysis canceled`,
          answer_type: answer.type,
          request_id,
          person_id,
        })

        throw new ForbiddenError(`Análise ${answer.type} cancelado`)
      }

      analysis_answered[answer.type] = RequestStatusEnum.FINISHED

      mount_information_validation[answer.type] = {
        ...answer,
        validated_at: now,
      }
    } else {
      logger.warn({
        message: 'Request not authorized to be answered',
        request_id,
        person_id,
        answer_type: answer.type,
      })

      throw new InternalServerError()
    }
  }

  let is_all_approved: AnalysisResultEnum = AnalysisResultEnum.APPROVED

  for (const [analysis, value] of Object.entries(mount_information_validation)) {
    const person_analysis = analysis as CompanyRequestPersonConfigEnum
    if (person_analysis === CompanyRequestPersonConfigEnum.HISTORY) {
      const historical_value = value as PersonAnalysisInformationValidationHistory<false>

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
      const status = value as Partial<PersonAnalysisInformationValidationValueAnswer>
      if (status.result !== AnalysisResultEnum.APPROVED) {
        is_all_approved = AnalysisResultEnum.REJECTED

        break
      }
    }
  }

  for (const [analysis, value] of Object.entries(analysis_answered)) {
    const person_analysis = analysis as CompanyRequestPersonConfigEnum
    if (person_analysis === CompanyRequestPersonConfigEnum.HISTORY) {
      const historical_value = value as PersonAnalysisStatusHistory<false>
      const find_region = historical_value.regions.find((object) =>
        Object.values(object).includes(RequestStatusEnum.VALIDATING),
      )
      if (find_region) {
        return {
          is_finished: false,
          status: {
            ...analysis_answered,
            general: RequestStatusEnum.VALIDATING,
          },
          information_validation: mount_information_validation,
          is_all_approved,
        }
      }
    } else {
      const status = value as RequestStatusEnum
      if (status === RequestStatusEnum.VALIDATING) {
        return {
          is_finished: false,
          status: {
            ...analysis_answered,
            general: RequestStatusEnum.VALIDATING,
          },
          information_validation: mount_information_validation,
          is_all_approved,
        }
      }
    }
  }

  const status = analysis_answered as PersonAnalysisStatus<true>
  const information_validation_finished = mount_information_validation as Partial<PersonAnalysisInformationValidation<true>>
  return {
    is_finished: true,
    status,
    information_validation: information_validation_finished,
    is_all_approved,
  }
}

export default verifyRequestStatus
