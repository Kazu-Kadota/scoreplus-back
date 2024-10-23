import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { AnalysisResultEnum, RequestStatusEnum, StateEnum } from '~/models/dynamo/enums/request'
import { VehicleAnalysisStatus, VehicleAnalysisStatusHistory } from '~/models/dynamo/requestplus/analysis-vehicle/status'
import { RequestplusAnalysisVehicleKey } from '~/models/dynamo/requestplus/analysis-vehicle/table'
import { VehicleAnalysisOptionsRequest, VehicleAnalysisOptionsRequestValueAnswer, VehicleAnalysisOptionsRequestValueHistory } from '~/models/dynamo/requestplus/analysis-vehicle/vehicle-analysis-options'
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

  const now = new Date().toISOString()

  const mount_vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<false>> | Partial<VehicleAnalysisOptionsRequest<true>> = {
    ...vehicle_analysis_options,
  }

  const analysis_answered = {
    ...request_vehicle_status,
    general: RequestStatusEnum.FINISHED,
  }

  for (const answer of answers_body) {
    if (answer.type === CompanyRequestVehicleConfigEnum.PLATE_HISTORY) {
      const plate_history_status = request_vehicle_status[answer.type]
      if (!plate_history_status) {
        logger.warn({
          message: 'Plate history analysis not requested',
          request_id,
          vehicle_id,
        })

        throw new ForbiddenError('Análise de histórico de placa não solicitado')
      }
      const region = answer.region as StateEnum

      const find_region = plate_history_status.regions.find((object) => region in object)

      if (!find_region) {
        logger.warn({
          message: 'Region not requested for plate history analysis',
          request_id,
          vehicle_id,
          region,
        })

        throw new ForbiddenError('Região não solicitado para análise de histórico de placa')
      }

      const is_already_answered = find_region[region] === RequestStatusEnum.FINISHED

      if (is_already_answered) {
        logger.warn({
          message: 'Plate history analysis already answered',
          request_id,
          vehicle_id,
          region,
        })

        throw new ForbiddenError('Análise de histórico de placa já respondido')
      }

      const is_canceled = find_region[region] === RequestStatusEnum.CANCELED
      if (is_canceled) {
        logger.warn({
          message: 'Analysis canceled',
          request_id,
          vehicle_id,
          region,
        })

        throw new ForbiddenError('Análise cancelado')
      }

      const index_find_region = plate_history_status.regions
        .findIndex((object) => region in object) as number

      const plate_history_answer = analysis_answered[answer.type] as VehicleAnalysisStatusHistory<false>

      plate_history_answer.regions[index_find_region][region] = RequestStatusEnum.FINISHED

      const historical_analysis = mount_vehicle_analysis_options['plate-history'] as VehicleAnalysisOptionsRequestValueHistory<false>

      const index_find_historical_region = historical_analysis.regions
        .findIndex((object) => region === object.region) as number

      historical_analysis.regions[index_find_historical_region] = {
        ...answer,
        region,
        answered_at: now,
      }
    } else if (answer.type === CompanyRequestVehicleConfigEnum.ETHICAL) {
      const ethical_status = request_vehicle_status[answer.type]

      const is_already_answered = ethical_status === RequestStatusEnum.FINISHED

      if (is_already_answered) {
        logger.warn({
          message: 'Ethical analysis already answered',
          request_id,
          vehicle_id,
        })

        throw new ForbiddenError('Análise ética já respondido')
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
        answered_at: now,
      }
    } else if (answer.type === CompanyRequestVehicleConfigEnum.ANTT
      || answer.type === CompanyRequestVehicleConfigEnum.CRONOTACOGRAFO) {
      const worker_status = request_vehicle_status[answer.type]

      const is_already_answered = worker_status === RequestStatusEnum.FINISHED

      if (is_already_answered) {
        logger.warn({
          message: 'Analysis already answered',
          request_id,
          vehicle_id,
        })

        throw new ForbiddenError('Análise já respondido')
      }

      const is_canceled = worker_status === RequestStatusEnum.CANCELED
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
        answered_at: now,
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

  for (const [analysis, value] of Object.entries(mount_vehicle_analysis_options)) {
    const vehicle_analysis = analysis as CompanyRequestVehicleConfigEnum
    if (vehicle_analysis === CompanyRequestVehicleConfigEnum.PLATE_HISTORY) {
      const plate_history_value = value as VehicleAnalysisOptionsRequestValueHistory<false>

      for (const region of plate_history_value.regions) {
        if (region.result !== AnalysisResultEnum.APPROVED) {
          is_all_approved = AnalysisResultEnum.REJECTED

          break
        }
      }

      if (is_all_approved === AnalysisResultEnum.REJECTED) {
        break
      }
    } else {
      const status = value as Partial<VehicleAnalysisOptionsRequestValueAnswer>
      if (status.result !== AnalysisResultEnum.APPROVED) {
        is_all_approved = AnalysisResultEnum.REJECTED

        break
      }
    }
  }

  let is_worker_finished = true

  for (const [analysis, value] of Object.entries(analysis_answered)) {
    const vehicle_analysis = analysis as CompanyRequestVehicleConfigEnum
    if (vehicle_analysis === CompanyRequestVehicleConfigEnum.PLATE_HISTORY) {
      const plate_history_value = value as VehicleAnalysisStatusHistory<false>
      const find_region = plate_history_value.regions.find((object) =>
        Object.values(object).includes(RequestStatusEnum.WAITING),
      )
      if (find_region) {
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
    } else if (vehicle_analysis === CompanyRequestVehicleConfigEnum.ETHICAL) {
      const status = value as RequestStatusEnum
      if (status === RequestStatusEnum.WAITING) {
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
      const status = value as RequestStatusEnum
      if (status === RequestStatusEnum.PROCESSING) {
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
