import useSWR from 'swr'
import { ExpensesResponse } from '@/types/expense'

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch expenses')
    return res.json()
  })

export function useExpenses(category?: string, sort?: string) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (sort) params.set('sort', sort)

  const url = `/expenses?${params.toString()}`

  const { data, error, isLoading, mutate } = useSWR<ExpensesResponse>(url, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 2000,
  })

  return {
    expenses: data?.expenses ?? [],
    total: data?.total ?? '0.00',
    count: data?.count ?? 0,
    isLoading,
    isError: !!error,
    mutate,
  }
}
