import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { AnalysisResultEnum, RequestStatusEnum } from '~/models/dynamo/enums/request'
import { VehicleAnalysisStatus } from '~/models/dynamo/requestplus/analysis-vehicle/status'
import { RequestplusAnalysisVehicleKey } from '~/models/dynamo/requestplus/analysis-vehicle/table'
import { VehicleAnalysisOptionsRequest } from '~/models/dynamo/requestplus/analysis-vehicle/vehicle-analysis-options'
import ForbiddenError from '~/utils/errors/403-forbidden'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'

import { ValidateSendAnswerVehicleBody } from './validate-body'

export type VerifyVehicleRequestStatusParams = RequestplusAnalysisVehicleKey & {
  request_vehicle_status: VehicleAnalysisStatus<false>
  answers_body: ValidateSendAnswerVehicleBody[]
  vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<false>>
}

export type VerifyVehicleRequestStatusReturn = {
  is_finished: true;
  status: VehicleAnalysisStatus<true>;
  vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<true>>
  is_all_approved: AnalysisResultEnum
} | {
  is_finished: false;
  status: VehicleAnalysisStatus<false>;
  vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<false>>
  is_all_approved: AnalysisResultEnum
}

const verifyRequestStatus = ({
  request_vehicle_status,
  answers_body,
  vehicle_id,
  request_id,
  vehicle_analysis_options,
}: VerifyVehicleRequestStatusParams): VerifyVehicleRequestStatusReturn => {
  if (request_vehicle_status.general !== RequestStatusEnum.WAITING) {
    logger.warn({
      message: 'Vehicle request not authorized to send answer',
      request_id,
      vehicle_id,
    })

    throw new ForbiddenError('Análise de veículo não autorizado a ser respondido')
  }

  const mount_vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<false>> | Partial<VehicleAnalysisOptionsRequest<true>> = {
    ...vehicle_analysis_options,
  }

  const analysis_answered = {
    ...request_vehicle_status,
    general: RequestStatusEnum.FINISHED,
  }

  for (const answer of answers_body) {
    if (
      answer.type === CompanyRequestVehicleConfigEnum.PLATE_HISTORY
      || answer.type === CompanyRequestVehicleConfigEnum.ETHICAL
    ) {
      const ethical_status = request_vehicle_status[answer.type]

      const is_already_answered = ethical_status === RequestStatusEnum.FINISHED
        || ethical_status === RequestStatusEnum.PROCESSING
      if (is_already_answered) {
        logger.warn({
          message: 'Analysis already answered',
          request_id,
          vehicle_id,
        })

        throw new ForbiddenError('Análise já respondido')
      }

      const is_canceled = ethical_status === RequestStatusEnum.CANCELED
      if (is_canceled) {
        logger.warn({
          message: 'Analysis canceled',
          request_id,
          vehicle_id,
        })

        throw new ForbiddenError('Análise cancelado')
      }

      analysis_answered[answer.type] = RequestStatusEnum.FINISHED

      mount_vehicle_analysis_options[answer.type] = {
        ...answer,
      }
    } else {
      logger.warn({
        message: 'Request not authorized to be answered',
        request_id,
        vehicle_id,
        type: answer.type,
      })

      throw new InternalServerError()
    }
  }

  let is_all_approved: AnalysisResultEnum = AnalysisResultEnum.APPROVED

  for (const value of Object.values(mount_vehicle_analysis_options)) {
    if (value.result !== AnalysisResultEnum.APPROVED) {
      is_all_approved = AnalysisResultEnum.REJECTED

      break
    }
  }

  let is_worker_finished = true

  for (const [analysis, value] of Object.entries(analysis_answered)) {
    const vehicle_analysis = analysis as CompanyRequestVehicleConfigEnum
    if (
      vehicle_analysis === CompanyRequestVehicleConfigEnum.PLATE_HISTORY
      || vehicle_analysis === CompanyRequestVehicleConfigEnum.ETHICAL
    ) {
      if (value === RequestStatusEnum.WAITING) {
        return {
          is_finished: false,
          status: {
            ...analysis_answered,
            general: RequestStatusEnum.WAITING,
          },
          vehicle_analysis_options: mount_vehicle_analysis_options,
          is_all_approved,
        }
      }
    } else {
      if (value !== RequestStatusEnum.FINISHED) {
        is_worker_finished = false
      }
    }
  }

  if (is_worker_finished) {
    const status = analysis_answered as VehicleAnalysisStatus<true>
    const vehicle_analysis_options_finished = mount_vehicle_analysis_options as Partial<VehicleAnalysisOptionsRequest<true>>
    return {
      is_finished: true,
      status,
      vehicle_analysis_options: vehicle_analysis_options_finished,
      is_all_approved,
    }
  }

  return {
    is_finished: false,
    status: {
      ...analysis_answered,
      general: RequestStatusEnum.PROCESSING,
    },
    vehicle_analysis_options: mount_vehicle_analysis_options,
    is_all_approved,
  }
}

export default verifyRequestStatus
