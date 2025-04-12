import { EagleSystemUserGroupEnum } from '../enums/user'

export type EagleSystemLoginParams = {
  email: string
  password: string
}

export type EagleSystemLoginResponseUser = {
  api: boolean
  company_id: string,
  company_name: string
  email: string
  user_first_name: string
  user_last_name: string
  user_type: EagleSystemUserGroupEnum
}

export type EagleSystemLoginResponse = {
  message: string
  user: EagleSystemLoginResponseUser
  jwtToken: string,
  expires_date: string,
}
