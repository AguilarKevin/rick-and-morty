const API_URL = 'https://rickandmortyapi.com/graphql'
const CACHE_TTL_MS = 1000 * 60 * 2

interface GraphqlBody {
  query?: string
  variables?: Record<string, unknown>
}

const responseCache = new Map<string, { value: unknown, expiresAt: number }>()
const inFlightRequests = new Map<string, Promise<unknown>>()

export default defineEventHandler(async (event) => {
  const body = await readBody<GraphqlBody>(event)

  if (!body?.query || typeof body.query !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid GraphQL request body'
    })
  }

  const variables = body.variables ?? {}
  const key = JSON.stringify({ query: body.query, variables })
  const now = Date.now()

  const cached = responseCache.get(key)
  if (cached?.expiresAt && cached.expiresAt > now) {
    return cached.value
  }

  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key)
  }

  const request = $fetch(API_URL, {
    method: 'POST',
    body: {
      query: body.query,
      variables
    }
  })

  inFlightRequests.set(key, request)

  try {
    const response = await request
    responseCache.set(key, {
      value: response,
      expiresAt: now + CACHE_TTL_MS
    })

    return response
  } finally {
    inFlightRequests.delete(key)
  }
})
