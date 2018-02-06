export interface Account {
  id: string
  username: string
  display_name: string
  avatar_static: string
  avatar: string
  acct: string
  url: string
}

export interface UserWithRank {
  e: Account
  r: number 
}
