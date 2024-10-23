import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { VehicleRequestForms } from '~/models/dynamo/requestplus/analysis-vehicle/forms'
import { VehicleAnalysisOptionsToRequest } from '~/models/dynamo/requestplus/analysis-vehicle/vehicle-analysis-options'
import { CompanyRequestVehicleConfig } from '~/models/dynamo/userplus/company'
import { M2PlateHistoryStateEnum } from '~/models/m2system/enums/analysis'
import { M2VehicleAnalysisResponse } from '~/models/m2system/request/analysis-vehicle'
import { M2VehicleRequestPlateHistoryForms } from '~/models/m2system/request/analysis-vehicle-plate-history'
import m2RequestAnalysisVehicle from '~/services/m2/request/analysis-vehicle-default'
import m2RequestAnalysisVehiclePlateHistory from '~/services/m2/request/analysis-vehicle-plate-history'

export type SendVehicleAnalysisToM2SystemParams = {
  vehicle_data: VehicleRequestForms
  vehicle_analysis_options_to_request: VehicleAnalysisOptionsToRequest,
  company_request_vehicle_config: CompanyRequestVehicleConfig,
}

async function sendVehicleAnalysisToM2System ({
  vehicle_data,
  vehicle_analysis_options_to_request,
  company_request_vehicle_config,
}: SendVehicleAnalysisToM2SystemParams): Promise<M2VehicleAnalysisResponse[]> {
  const vehicle_analysis: M2VehicleAnalysisResponse[] = []
  for (const analysis of vehicle_analysis_options_to_request) {
    if (company_request_vehicle_config[analysis]) {
      const analysis_key = analysis as CompanyRequestVehicleConfigEnum

      if (analysis_key === CompanyRequestVehicleConfigEnum.ETHICAL) {
        const result = await m2RequestAnalysisVehicle({
          body: vehicle_data,
        })

        vehicle_analysis.push(result)
      } else if (analysis_key === CompanyRequestVehicleConfigEnum.PLATE_HISTORY) {
        const company_request_person_config_history = Object.entries(company_request_vehicle_config[CompanyRequestVehicleConfigEnum.PLATE_HISTORY])

        for (const [history_regions, to_be_analyzed] of company_request_person_config_history) {
          const region = history_regions as M2PlateHistoryStateEnum
          if (to_be_analyzed) {
            const vehicle_plate_history_body: M2VehicleRequestPlateHistoryForms = {
              owner_document: vehicle_data.owner_document,
              owner_name: vehicle_data.owner_name,
              plate: vehicle_data.plate,
              plate_state: vehicle_data.plate_state,
              region,
              company_name: vehicle_data.company_name,
            }

            const result = await m2RequestAnalysisVehiclePlateHistory({
              body: vehicle_plate_history_body,
            })

            vehicle_analysis.push(result)
          } else {
            continue
          }
        }
      } else {
        continue
      }
    } else {
      continue
    }
  }

  return vehicle_analysis
}

export default sendVehicleAnalysisToM2System
