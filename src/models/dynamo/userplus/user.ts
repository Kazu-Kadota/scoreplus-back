import { UserGroupEnum } from '../enums/user'
import { Timestamp } from '../timestamp'

export type UserplusUserKey = {
  user_id: string
}

export type UserplusUserBody = {
  user_first_name: string
  user_last_name: string
  email: string
  password: string
  user_type: UserGroupEnum
  company_name: string
  company_id: string
  api: boolean
}

export type UserplusUser = UserplusUserKey & UserplusUserBody & Timestamp & {}
