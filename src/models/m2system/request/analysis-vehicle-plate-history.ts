import { M2PlateStateEnum, M2RequestAnalysisStateEnum } from '../enums/analysis'

export type M2VehicleRequestPlateHistoryForms = {
  company_name?: string
  metadata?: Record<any, any>
  owner_document: string
  owner_name: string
  plate_state: M2PlateStateEnum
  plate: string
  postback?: 'scoreplus'
  region: M2RequestAnalysisStateEnum
}
