export interface CharacterLocation {
  id?: string
  name: string
}

export interface Character {
  id: string
  image: string
  name: string
  species: string
  status: string
  origin: CharacterLocation
  location: CharacterLocation
  gender: string
  episode: Array<{ id: string }>
}

export interface CharactersInfo {
  count: number
  pages: number
  next: number | null
  prev: number | null
}

export interface CharactersResponse {
  info: CharactersInfo
  results: Character[]
}
