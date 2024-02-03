export type UserplusPasswordHistoryKey = {
  user_id: string
  created_at: string
}

export type UserplusPasswordHistoryBody = {
  old_password: string
  new_password: string
}

export type UserplusPasswordHistory = UserplusPasswordHistoryKey & UserplusPasswordHistoryBody & {}
