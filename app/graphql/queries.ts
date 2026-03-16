import { gql } from 'graphql-tag'

export const GET_CHARACTERS_QUERY = gql`
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
        status
        origin {
          name
        }
      }
    }
  }
`

export const GET_CHARACTER_QUERY = gql`
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

export const GET_CHARACTERS_BY_IDS_QUERY = gql`
  query GetCharactersByIds($ids: [ID!]!) {
    charactersByIds(ids: $ids) {
      id
      image
      name
      species
      status
      origin {
        name
      }
    }
  }
`
