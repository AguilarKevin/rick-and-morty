import type { Character, CharactersResponse } from '~/types/character'

const API_URL = 'https://rickandmortyapi.com/graphql'
const CACHE_TTL_MS = 1000 * 60 * 2
const responseCache = new Map<string, { value: unknown, expiresAt: number }>()
const inFlightRequests = new Map<string, Promise<unknown>>()
const RATE_LIMIT_RETRY_DELAYS = [800, 1600, 3000]

interface GraphqlResponse<TData> {
  data?: TData
  errors?: Array<{ message: string }>
}

interface CharactersQueryData {
  characters: CharactersResponse | null
}

interface CharacterQueryData {
  character: Character | null
}

interface CharactersByIdsQueryData {
  charactersByIds: Character[] | null
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function isRateLimitError(error: unknown) {
  if (error instanceof Error) {
    return /429|too many requests/i.test(error.message)
  }

  if (!error || typeof error !== 'object') {
    return false
  }

  const candidate = error as {
    status?: number
    statusCode?: number
    response?: { status?: number }
    message?: string
  }

  return candidate.status === 429
    || candidate.statusCode === 429
    || candidate.response?.status === 429
    || /429|too many requests/i.test(candidate.message ?? '')
}

async function requestGraphql<TData>(query: string, variables: Record<string, unknown>) {
  const key = JSON.stringify({ query, variables })
  const now = Date.now()

  const cached = responseCache.get(key)
  if (cached) {
    if (cached.expiresAt > now) {
      return cached.value as TData
    }

    responseCache.delete(key)
  }

  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key) as Promise<TData>
  }

  const request = (async () => {
    for (let attempt = 0; attempt <= RATE_LIMIT_RETRY_DELAYS.length; attempt++) {
      try {
        const response = await $fetch<GraphqlResponse<TData>>(API_URL, {
          method: 'POST',
          body: {
            query,
            variables
          }
        })

        if (response.errors?.length) {
          throw new Error(response.errors[0]?.message ?? 'GraphQL request failed')
        }

        if (!response.data) {
          throw new Error('No data returned from API')
        }

        responseCache.set(key, {
          value: response.data,
          expiresAt: Date.now() + CACHE_TTL_MS
        })
        return response.data
      } catch (error) {
        if (isRateLimitError(error) && attempt < RATE_LIMIT_RETRY_DELAYS.length) {
          await wait(RATE_LIMIT_RETRY_DELAYS[attempt]!)
          continue
        }

        throw error
      }
    }

    throw new Error('GraphQL request failed after retry')
  })() as Promise<TData>

  inFlightRequests.set(key, request)
  request.finally(() => inFlightRequests.delete(key))
  return request
}

export function useRickAndMortyApi() {
  const fetchCharacters = async (
    page: number,
    name: string,
    status: string,
    species: string
  ) => {
    const query = `
      query GetCharacters($page: Int!, $name: String, $status: String, $species: String) {
        characters(page: $page, filter: { name: $name, status: $status, species: $species }) {
          info {
            count
            pages
            next
            prev
          }
          results {
            id
            image
            name
            species
            type
            status
            gender
            origin {
              id
              name
            }
            location {
              id
              name
            }
            episode {
              id
            }
          }
        }
      }
    `

    const data = await requestGraphql<CharactersQueryData>(query, {
      page,
      name: name || null,
      status: status || null,
      species: species || null
    })

    if (!data.characters) {
      return {
        info: {
          count: 0,
          pages: 0,
          next: null,
          prev: null
        },
        results: []
      } satisfies CharactersResponse
    }

    return data.characters
  }

  const fetchCharacterById = async (id: string) => {
    const query = `
      query GetCharacter($id: ID!) {
        character(id: $id) {
          id
          image
          name
          status
          species
          type
          gender
          origin {
            id
            name
          }
          location {
            id
            name
          }
          episode {
            id
            name
            episode
            air_date
          }
        }
      }
    `

    const data = await requestGraphql<CharacterQueryData>(query, { id })

    if (!data.character) {
      throw new Error('Character not found')
    }

    return data.character
  }

  const fetchCharactersByIds = async (ids: string[]) => {
    if (!ids.length) {
      return [] as Character[]
    }

    const query = `
      query GetCharactersByIds($ids: [ID!]!) {
        charactersByIds(ids: $ids) {
          id
          image
          name
          species
          type
          status
          gender
          origin {
            id
            name
          }
          location {
            id
            name
          }
          episode {
            id
          }
        }
      }
    `

    const data = await requestGraphql<CharactersByIdsQueryData>(query, { ids })

    return data.charactersByIds ?? []
  }

  return {
    fetchCharacters,
    fetchCharacterById,
    fetchCharactersByIds
  }
}
