import { Timestamp } from '../timestamp'

export type UserplusRecoveryPasswordKey = {
  recovery_id: string
}

export type UserplusRecoveryPasswordBody = {
  user_id: string
  expires_at: string
}

export type UserplusRecoveryPassword = UserplusRecoveryPasswordKey & UserplusRecoveryPasswordBody & Timestamp & {}
