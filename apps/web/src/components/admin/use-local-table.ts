import { useMemo, useState } from 'react'

/** Client-side search, filter and paging for lists the API returns whole. */
export function useLocalTable<T>(rows: Array<T> | undefined, match: (row: T, q: string) => boolean, pageSize = 25) {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return (rows ?? []).filter((r) => match(r, term))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, q, match])
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = Math.min(page, pages)
  return {
    q,
    setQ: (v: string) => (setQ(v), setPage(1)),
    page: current,
    setPage,
    pageSize,
    total: filtered.length,
    filtered,
    rows: filtered.slice((current - 1) * pageSize, current * pageSize),
    reset: () => setPage(1),
  }
}
