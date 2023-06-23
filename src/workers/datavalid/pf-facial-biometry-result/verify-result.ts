import { BiometryAcceptablePercentageEnum } from 'src/models/datavalid/pf-facial-biometry/biometry-acceptable-percentage'
import { PFFacialResult } from 'src/models/datavalid/pf-facial-biometry/result'
import logger from 'src/utils/logger'

export interface VerifyResultReturn {
  approved: boolean,
  reproved_data?: Record<string, any>
}

const verifyResult = (body: PFFacialResult): VerifyResultReturn => {
  logger.debug({
    message: 'Verifying the results',
  })
  const reproved_data: Record<string, any> = {}

  for (const [key, result] of Object.entries(body)) {
    if (typeof result === 'boolean' && result !== true) {
      reproved_data[key] = 'reproved'
    } else if (typeof result === 'number' && result <= BiometryAcceptablePercentageEnum.FACE) {
      reproved_data[key] = 'reproved'
    } else if (typeof result === 'object') {
      reproved_data[key] = {}

      let reproved_quantity = 0
      for (const [specific_key, specific_result] of Object.entries(result)) {
        if ((typeof specific_result === 'boolean' && specific_result !== true)) {
          if (specific_key === 'possui_impedimento') {
            continue
          }
          reproved_quantity++
          reproved_data[key][specific_key] = 'reproved'
        } else if (typeof specific_result === 'number' && specific_result <= BiometryAcceptablePercentageEnum.FACE) {
          reproved_quantity++
          reproved_data[key][specific_key] = 'reproved'
        }
      }

      if (reproved_quantity === 0) {
        delete reproved_data[key]
      }
    }
  }

  if (Object.keys(reproved_data).length !== 0) {
    return {
      approved: false,
      reproved_data,
    }
  }

  return {
    approved: true,
  }
}

export default verifyResult
