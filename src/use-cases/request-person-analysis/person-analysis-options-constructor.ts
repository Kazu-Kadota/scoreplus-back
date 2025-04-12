import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { PersonStateEnum } from '~/models/dynamo/enums/request'
import { PersonAnalysisOptionsRequest, PersonAnalysisOptionsToRequest } from '~/models/dynamo/requestplus/analysis-person/person-analysis-options'
import { CompanyRequestPersonConfig } from '~/models/dynamo/userplus/company'
import BadRequestError from '~/utils/errors/400-bad-request'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'

const personAnalysisOptionsConstructor = (
  person_analysis_options_to_request: PersonAnalysisOptionsToRequest,
  request_person_config: CompanyRequestPersonConfig,
): Partial<PersonAnalysisOptionsRequest<false>> => {
  const person_analysis_options: Partial<PersonAnalysisOptionsRequest<false>> = {}
  const invalid_request_set = new Set<CompanyRequestPersonConfigEnum>()
  const invalid_regions: Array<PersonStateEnum> = []

  for (const analysis_to_request of person_analysis_options_to_request) {
    if (analysis_to_request === CompanyRequestPersonConfigEnum.HISTORY) {
      person_analysis_options[analysis_to_request] = { regions: [] }
      const company_request_person_config_history = Object.entries(request_person_config[CompanyRequestPersonConfigEnum.HISTORY])

      if (company_request_person_config_history.length === 0) {
        logger.warn({
          message: 'Company selected history but does not have states',
          request_person_config,
        })

        throw new InternalServerError('Empresa selecionou histórico mas não há estados', {
          request_person_config,
        })
      }

      for (const [history_regions, to_be_analyzed] of company_request_person_config_history) {
        const region = history_regions as PersonStateEnum
        if (to_be_analyzed) {
          person_analysis_options[analysis_to_request]!.regions.push({
            region,
          })
          // I think that I need to take this part, because even is false, it just request analysis
        } else {
          invalid_request_set.add(analysis_to_request)
          invalid_regions.push(region)
        }
      }
    } else {
      if (request_person_config[analysis_to_request]) {
        person_analysis_options[analysis_to_request] = {}
      } else {
        invalid_request_set.add(analysis_to_request)
      }
    }
  }

  if (invalid_request_set.size !== 0) {
    const invalid_request = Array.from(invalid_request_set)
    logger.warn({
      message: 'Company not allowed to request analysis to the selected options',
      invalid_request,
      invalid_regions,
    })

    throw new BadRequestError('Empresa não autorizado para solicitar análise para as seguintes opções', {
      invalid_request,
      invalid_regions,
    })
  }

  return person_analysis_options
}

export default personAnalysisOptionsConstructor
