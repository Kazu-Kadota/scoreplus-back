import { UserGroupEnum } from '~/models/dynamo/enums/user'
import { Timestamp } from '~/models/dynamo/timestamp'

export type M2UserKey = {
  user_id: string
}

export type M2UserBody = {
  user_first_name: string
  user_last_name: string
  email: string
  password: string
  user_type: UserGroupEnum
  company_name: string
  api: boolean
}

export type M2User = M2UserKey & M2UserBody & Timestamp & {}
