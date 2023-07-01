import { CompanySystemConfig, CompanySystemConfigEnum } from 'src/models/dynamo/company'
import { RequestStatusEnum } from 'src/models/dynamo/request-enum'
import { PersonAnalysisStatus } from 'src/models/dynamo/request-person'

const personStatusConstructor = (company_system_config: CompanySystemConfig): PersonAnalysisStatus => {
  const status = {} as PersonAnalysisStatus

  for (const [key, value] of Object.entries<boolean>(company_system_config)) {
    const key_status = key as CompanySystemConfigEnum

    status[key_status] = value === true
      ? RequestStatusEnum.PROCESSING
      : undefined
  }

  if (Object.keys(status).length === 0) {
    status.general = RequestStatusEnum.WAITING
  } else {
    status.general = RequestStatusEnum.PROCESSING
  }

  return status
}

export default personStatusConstructor
