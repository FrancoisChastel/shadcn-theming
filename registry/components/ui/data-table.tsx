"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface DataTableColumn<T> {
  key: keyof T & string
  header: string
  numeric?: boolean
  sortable?: boolean
  /** Custom cell renderer. */
  render?: (row: T) => React.ReactNode
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  pageSize?: number
  /** Show a filter input that matches across all columns. Default true. */
  filterable?: boolean
  /** Show row-selection checkboxes. Default false. */
  selectable?: boolean
  getRowId?: (row: T, index: number) => string
  onSelectionChange?: (ids: string[]) => void
  className?: string
}

type SortState = { key: string; dir: 1 | -1 } | null

/**
 * A lightweight, dependency-free data table: sortable columns, a filter,
 * pagination, and optional row selection. Styled with shadcn theme tokens.
 */
export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  pageSize = 10,
  filterable = true,
  selectable = false,
  getRowId = (_row, i) => String(i),
  onSelectionChange,
  className,
}: DataTableProps<T>) {
  const [sort, setSort] = React.useState<SortState>(null)
  const [query, setQuery] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data
    return data.filter((row) => columns.some((c) => String(row[c.key] ?? "").toLowerCase().includes(q)))
  }, [data, columns, query])

  const sorted = React.useMemo(() => {
    if (!sort) return filtered
    const col = columns.find((c) => c.key === sort.key)
    return [...filtered].sort((a, b) => {
      const av = a[sort.key]
      const bv = b[sort.key]
      const cmp = col?.numeric ? Number(av) - Number(bv) : String(av).localeCompare(String(bv))
      return cmp * sort.dir
    })
  }, [filtered, sort, columns])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const current = Math.min(page, totalPages)
  const rows = sorted.slice((current - 1) * pageSize, current * pageSize)

  const toggleSort = (key: string, sortable?: boolean) => {
    if (sortable === false) return
    setSort((s) => (s && s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }))
  }

  const setRow = (id: string, on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      onSelectionChange?.([...next])
      return next
    })
  }
  const pageIds = rows.map((r, i) => getRowId(r, (current - 1) * pageSize + i))
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.has(id))

  return (
    <div className={cn("w-full overflow-hidden rounded-[var(--radius)] border bg-card", className)}>
      {filterable ? (
        <div className="flex items-center gap-2 border-b p-3">
          <input
            className="max-w-[220px] rounded-[var(--radius)] border bg-background px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Filter…"
            aria-label="Filter rows"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
          />
          <span className="text-xs text-muted-foreground">{sorted.length} rows</span>
        </div>
      ) : null}

      <div className="max-h-[360px] overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {selectable ? (
                <th className="sticky top-0 z-10 w-9 bg-card p-2 text-center">
                  <input
                    type="checkbox"
                    aria-label="Select all rows on this page"
                    checked={allOnPage}
                    onChange={(e) => pageIds.forEach((id) => setRow(id, e.target.checked))}
                  />
                </th>
              ) : null}
              {columns.map((c) => (
                <th
                  key={c.key}
                  onClick={() => toggleSort(c.key, c.sortable)}
                  className={cn(
                    "sticky top-0 z-10 select-none whitespace-nowrap border-b bg-card p-2 text-left font-medium text-muted-foreground",
                    c.numeric && "text-right",
                    c.sortable !== false && "cursor-pointer hover:text-foreground",
                  )}
                  aria-sort={sort?.key === c.key ? (sort.dir === 1 ? "ascending" : "descending") : "none"}
                >
                  {c.header}
                  {sort?.key === c.key ? <span aria-hidden> {sort.dir === 1 ? "↑" : "↓"}</span> : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const id = getRowId(row, (current - 1) * pageSize + i)
              return (
                <tr key={id} className={cn("hover:bg-muted", selected.has(id) && "bg-primary/5")}>
                  {selectable ? (
                    <td className="w-9 p-2 text-center">
                      <input
                        type="checkbox"
                        aria-label="Select row"
                        checked={selected.has(id)}
                        onChange={(e) => setRow(id, e.target.checked)}
                      />
                    </td>
                  ) : null}
                  {columns.map((c) => (
                    <td key={c.key} className={cn("border-b p-2", c.numeric && "text-right tabular-nums")}>
                      {c.render ? c.render(row) : String(row[c.key] ?? "")}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-2 border-t p-3 text-xs text-muted-foreground">
        <span>{selectable ? `${selected.size} selected` : `Page ${current} of ${totalPages}`}</span>
        <div className="inline-flex gap-1">
          <button
            className="h-7 min-w-7 rounded-[calc(var(--radius)-1px)] border px-2 disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={current <= 1}
            aria-label="Previous page"
          >
            ‹
          </button>
          <button
            className="h-7 min-w-7 rounded-[calc(var(--radius)-1px)] border px-2 disabled:opacity-40"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={current >= totalPages}
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  )
}
