export const formatDate = (date: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string => {
  if (!date) return '-'

  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'

    return d.toLocaleDateString(
      'fr-FR',
      options || {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    )
  } catch (e) {
    return '-'
  }
}

export const formatDateTime = (date: string | Date | null | undefined): string => {
  return formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
