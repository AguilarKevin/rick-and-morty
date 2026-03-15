export const statusBadgeColor = (value: string) => {
  const normalized = value.toLowerCase()

  if (normalized === 'alive') {
    return 'success'
  }

  if (normalized === 'dead') {
    return 'error'
  }

  return 'neutral'
}

export const speciesBadgeColor = (value: string) => {
  const normalized = value.toLowerCase()

  if (normalized === 'human') {
    return 'primary'
  }

  if (normalized === 'alien') {
    return 'info'
  }

  if (normalized === 'humanoid') {
    return 'warning'
  }

  return 'neutral'
}
