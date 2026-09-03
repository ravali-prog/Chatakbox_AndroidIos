export interface UserPrivilage {
    active : {
        ads: number
        device: string[]
        streaming: string[]
        contentgroup: string[]
    },
    inactive : {
      ads: number
      device: string[]
      streaming: string[]
      contentgroup: string[]
  }
  }