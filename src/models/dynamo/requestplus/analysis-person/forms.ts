import { DriverCategoryEnum, StateEnum } from '../../enums/request'

export type PersonRequestForms = {
  birth_date: string
  category_cnh?: DriverCategoryEnum
  cnh?: string
  company_name?: string
  document: string
  expire_at_cnh?: string
  father_name?: string
  mother_name: string
  name: string
  naturalness?: string
  rg: string
  mirror_number_cnh?: string
  state_rg: StateEnum
}
