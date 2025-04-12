import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { AnalysisResultEnum, RequestStatusEnum, VehicleAnalysisStateEnum } from '~/models/dynamo/enums/request'
import { VehicleAnalysisStatus, VehicleAnalysisStatusHistory } from '~/models/dynamo/requestplus/analysis-vehicle/status'
import { RequestplusAnalysisVehicleKey } from '~/models/dynamo/requestplus/analysis-vehicle/table'
import { VehicleAnalysisInformationValidation, VehicleAnalysisInformationValidationHistory, VehicleAnalysisInformationValidationValueAnswer } from '~/models/dynamo/requestplus/validate-analysis-vehicle/validation-information'
import ForbiddenError from '~/utils/errors/403-forbidden'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'

import { UseCaseValidateVehicleAnalysisBody } from '.'

export type VerifyVehicleRequestStatusParams = RequestplusAnalysisVehicleKey & {
  answers_body: UseCaseValidateVehicleAnalysisBody[]
  information_validation: Partial<VehicleAnalysisInformationValidation<false>>
  request_vehicle_status: VehicleAnalysisStatus<false>
}

export type VerifyVehicleRequestStatusReturn = {
  is_finished: true;
  status: VehicleAnalysisStatus<true>;
  information_validation: Partial<VehicleAnalysisInformationValidation<true>>
  is_all_approved: AnalysisResultEnum
} | {
  is_finished: false;
  status: VehicleAnalysisStatus<false>;
  information_validation: Partial<VehicleAnalysisInformationValidation<false>>
  is_all_approved: AnalysisResultEnum
}

const verifyRequestStatus = ({
  request_vehicle_status,
  answers_body,
  vehicle_id,
  request_id,
  information_validation,
}: VerifyVehicleRequestStatusParams): VerifyVehicleRequestStatusReturn => {
  const is_validating = request_vehicle_status.general === RequestStatusEnum.VALIDATING

  if (!is_validating) {
    logger.warn({
      message: 'Vehicle request not authorized to validate',
      request_id,
      vehicle_id,
    })

    throw new ForbiddenError('Análise de veículos não autorizado a ser validado')
  }

  const now = new Date().toISOString()

  const mount_information_validation: Partial<VehicleAnalysisInformationValidation<false>> | Partial<VehicleAnalysisInformationValidation<true>> = {
    ...information_validation,
  }

  const analysis_answered: VehicleAnalysisStatus<false> = {
    ...request_vehicle_status,
    general: RequestStatusEnum.FINISHED,
  }

  for (const answer of answers_body) {
    const is_eagle_request = answer.type === CompanyRequestVehicleConfigEnum.BASIC_DATA
      || answer.type === CompanyRequestVehicleConfigEnum.ANTT

    if (answer.type === CompanyRequestVehicleConfigEnum.PLATE_HISTORY) {
      const historical_status = request_vehicle_status[answer.type]
      if (!historical_status) {
        logger.warn({
          message: 'Plate history analysis not requested',
          request_id,
          vehicle_id,
        })

        throw new ForbiddenError('Análise de histórico de placa não solicitado')
      }
      const region = answer.region as VehicleAnalysisStateEnum

      const find_region = historical_status.regions.find((object) => region in object)

      if (!find_region) {
        logger.warn({
          message: 'Region not requested for plate history analysis',
          request_id,
          vehicle_id,
          region,
        })

        throw new ForbiddenError('Região não solicitado para análise de histórico de placa', region)
      }

      const is_already_validated = find_region[region] === RequestStatusEnum.FINISHED

      if (is_already_validated) {
        logger.warn({
          message: 'Plate history analysis already validated',
          answer_type: answer.type,
          request_id,
          vehicle_id,
          region,
        })

        throw new ForbiddenError('Análise de histórico de placa já validado', region)
      }

      const is_canceled = find_region[region] === RequestStatusEnum.CANCELED
      if (is_canceled) {
        logger.warn({
          message: 'Plate history analysis canceled',
          answer_type: answer.type,
          request_id,
          vehicle_id,
          region,
        })

        throw new ForbiddenError('Análise de histórico de placa cancelado')
      }

      const index_find_region = historical_status.regions
        .findIndex((object) => region in object) as number

      const history_answer = analysis_answered[answer.type] as VehicleAnalysisStatusHistory<false>

      history_answer.regions[index_find_region][region] = RequestStatusEnum.FINISHED

      const historical_analysis = mount_information_validation['plate-history'] as VehicleAnalysisInformationValidationHistory<false>

      const index_find_historical_region = historical_analysis.regions
        .findIndex((object) => region === object.region) as number

      historical_analysis.regions[index_find_historical_region] = {
        ...answer,
        region,
        validated_at: now,
      }
    } else if (answer.type === CompanyRequestVehicleConfigEnum.ETHICAL) {
      const ethical_status = request_vehicle_status[answer.type]

      const is_already_validated = ethical_status === RequestStatusEnum.FINISHED

      if (is_already_validated) {
        logger.warn({
          message: 'Ethical analysis already validated',
          answer_type: answer.type,
          request_id,
          vehicle_id,
        })

        throw new ForbiddenError('Análise ética já validado')
      }

      const is_canceled = ethical_status === RequestStatusEnum.CANCELED
      if (is_canceled) {
        logger.warn({
          message: 'Ethical analysis canceled',
          answer_type: answer.type,
          request_id,
          vehicle_id,
        })

        throw new ForbiddenError('Análise ética cancelado')
      }

      analysis_answered[answer.type] = RequestStatusEnum.FINISHED

      mount_information_validation[answer.type] = {
        ...answer,
        validated_at: now,
      }
    } else if (is_eagle_request) {
      const eagle_answer_type_status = request_vehicle_status[answer.type]

      const is_already_validated = eagle_answer_type_status === RequestStatusEnum.FINISHED

      if (is_already_validated) {
        logger.warn({
          message: `${answer.type} analysis already validated`,
          answer_type: answer.type,
          request_id,
          vehicle_id,
        })

        throw new ForbiddenError(`Análise ${answer.type} já validado`)
      }

      const is_canceled = eagle_answer_type_status === RequestStatusEnum.CANCELED
      if (is_canceled) {
        logger.warn({
          message: `${answer.type} analysis canceled`,
          answer_type: answer.type,
          request_id,
          vehicle_id,
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
        vehicle_id,
        answer_type: answer.type,
      })

      throw new InternalServerError()
    }
  }

  let is_all_approved: AnalysisResultEnum = AnalysisResultEnum.APPROVED

  for (const [analysis, value] of Object.entries(mount_information_validation)) {
    const vehicle_analysis = analysis as CompanyRequestVehicleConfigEnum
    if (vehicle_analysis === CompanyRequestVehicleConfigEnum.PLATE_HISTORY) {
      const historical_value = value as VehicleAnalysisInformationValidationHistory<false>

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
      const status = value as Partial<VehicleAnalysisInformationValidationValueAnswer>
      if (status.result !== AnalysisResultEnum.APPROVED) {
        is_all_approved = AnalysisResultEnum.REJECTED

        break
      }
    }
  }

  for (const [analysis, value] of Object.entries(analysis_answered)) {
    const vehicle_analysis = analysis as CompanyRequestVehicleConfigEnum
    if (vehicle_analysis === CompanyRequestVehicleConfigEnum.PLATE_HISTORY) {
      const historical_value = value as VehicleAnalysisStatusHistory<false>
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

  const status = analysis_answered as VehicleAnalysisStatus<true>
  const information_validation_finished = mount_information_validation as Partial<VehicleAnalysisInformationValidation<true>>
  return {
    is_finished: true,
    status,
    information_validation: information_validation_finished,
    is_all_approved,
  }
}

export default verifyRequestStatus
