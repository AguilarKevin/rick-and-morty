export interface CharacterLocation {
  id?: string
  name: string
}

export interface CharacterEpisode {
  id: string
  name?: string
  episode?: string
  air_date?: string
}

export interface Character {
  id: string
  image: string
  name: string
  species: string
  type?: string
  status: string
  origin: CharacterLocation
  location: CharacterLocation
  gender: string
  episode: CharacterEpisode[]
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
