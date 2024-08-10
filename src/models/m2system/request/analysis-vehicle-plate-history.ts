import { M2PlateHistoryStateEnum } from '../enums/analysis'
import { PlateStateEnum } from '~/models/dynamo/enums/request'

export type M2VehicleRequestPlateHistoryForms = {
  company_name?: string
  owner_document: string
  owner_name: string
  plate_state: PlateStateEnum
  plate: string
  region: M2PlateHistoryStateEnum
}
