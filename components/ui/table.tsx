import { ComponentProps, useState } from "react"
import { ChevronUp, ChevronDown, ArrowUpDown, MoreHorizontal } from "lucide-react"
import { cn } from "../../lib/utils"

interface TableProps extends ComponentProps<"table"> {
  variant?: "default" | "striped" | "bordered" | "minimal"
  size?: "sm" | "default" | "lg"
  stickyHeader?: boolean
}

function Table({ 
  className, 
  variant = "default",
  size = "default", 
  stickyHeader = false,
  ...props 
}: TableProps) {
  const variantClasses = {
    default: "",
    striped: "[&_tbody_tr:nth-child(odd)]:bg-bg-muted/30",
    bordered: "border border-border rounded-xl overflow-hidden",
    minimal: "border-0"
  }

  const sizeClasses = {
    sm: "text-sm",
    default: "text-sm",
    lg: "text-base"
  }

  return (
    <div
      data-slot="table-container"
      className={cn(
        "relative w-full",
        variant === "bordered" ? "rounded-xl border border-border overflow-hidden" : "overflow-x-auto",
        stickyHeader && "max-h-[70vh] overflow-y-auto"
      )}
    >
      <table
        data-slot="table"
        className={cn(
          "w-full caption-bottom border-collapse",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      />
    </div>
  )
}

interface TableHeaderProps extends ComponentProps<"thead"> {
  sticky?: boolean
}

function TableHeader({ 
  className, 
  sticky = false,
  ...props 
}: TableHeaderProps) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "[&_tr]:border-b [&_tr]:border-border",
        sticky && "sticky top-0 z-10 bg-surface/95 backdrop-blur-sm",
        className
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(
        "[&_tr:last-child]:border-0",
        "[&_tr]:border-b [&_tr]:border-border/50",
        "[&_tr]:transition-colors [&_tr]:duration-200",
        className
      )}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-bg-muted/50 border-t border-border font-medium",
        "[&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

interface TableRowProps extends ComponentProps<"tr"> {
  hoverable?: boolean
  clickable?: boolean
  selected?: boolean
}

function TableRow({ 
  className, 
  hoverable = true,
  clickable = false,
  selected = false,
  ...props 
}: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "transition-colors duration-200",
        hoverable && "hover:bg-surface-hover",
        clickable && "cursor-pointer hover:bg-surface-hover",
        selected && "bg-brand-50 border-brand-200",
        "data-[state=selected]:bg-brand-50",
        className
      )}
      {...props}
    />
  )
}

interface TableHeadProps extends ComponentProps<"th"> {
  sortable?: boolean
  sortDirection?: "asc" | "desc" | null
  onSort?: () => void
  align?: "left" | "center" | "right"
}

function TableHead({ 
  className,
  sortable = false,
  sortDirection = null,
  onSort,
  align = "left",
  children,
  ...props 
}: TableHeadProps) {
  const alignClasses = {
    left: "text-left",
    center: "text-center", 
    right: "text-right"
  }

  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-12 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wider",
        "whitespace-nowrap border-b border-border",
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        alignClasses[align],
        sortable && [
          "cursor-pointer select-none hover:text-text transition-colors",
          "hover:bg-surface-hover"
        ],
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className={cn(
        "flex items-center gap-2",
        align === "center" && "justify-center",
        align === "right" && "justify-end"
      )}>
        {children}
        {sortable && (
          <div className="flex flex-col">
            {sortDirection === null && <ArrowUpDown className="h-3 w-3 opacity-50" />}
            {sortDirection === "asc" && <ChevronUp className="h-3 w-3" />}
            {sortDirection === "desc" && <ChevronDown className="h-3 w-3" />}
          </div>
        )}
      </div>
    </th>
  )
}

interface TableCellProps extends ComponentProps<"td"> {
  align?: "left" | "center" | "right"
  truncate?: boolean
}

function TableCell({ 
  className,
  align = "left", 
  truncate = false,
  ...props 
}: TableCellProps) {
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right"
  }

  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-4 py-3 text-text",
        "border-b border-border/30 last:border-b-0",
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        alignClasses[align],
        truncate && "max-w-0 truncate",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn(
        "mt-4 text-text-muted text-sm text-center",
        className
      )}
      {...props}
    />
  )
}

// Enhanced sortable table hook
interface UseSortableTableProps<T> {
  data: T[]
  defaultSortKey?: keyof T
  defaultSortDirection?: "asc" | "desc"
}

function useSortableTable<T>({ 
  data, 
  defaultSortKey,
  defaultSortDirection = "asc" 
}: UseSortableTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(defaultSortKey || null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(defaultSortDirection)

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0

    const aValue = a[sortKey]
    const bValue = b[sortKey]

    if (aValue === bValue) return 0

    const isAsc = sortDirection === "asc"
    
    if (aValue == null) return isAsc ? -1 : 1
    if (bValue == null) return isAsc ? 1 : -1

    if (typeof aValue === "string" && typeof bValue === "string") {
      return isAsc 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return isAsc ? aValue - bValue : bValue - aValue
    }

    // Default string comparison
    return isAsc 
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue))
  })

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      // Toggle direction if same column
      setSortDirection(prev => prev === "asc" ? "desc" : "asc")
    } else {
      // New column, default to ascending
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  const getSortProps = (key: keyof T) => ({
    sortable: true,
    sortDirection: sortKey === key ? sortDirection : null,
    onSort: () => handleSort(key)
  })

  return {
    sortedData,
    sortKey,
    sortDirection,
    handleSort,
    getSortProps
  }
}

// Data table component with built-in features
interface DataTableProps<T> {
  data: T[]
  columns: Array<{
    key: keyof T
    label: string
    sortable?: boolean
    align?: "left" | "center" | "right"
    render?: (value: T[keyof T], row: T, index: number) => React.ReactNode
    width?: string
  }>
  onRowClick?: (row: T, index: number) => void
  selectedRows?: T[]
  onSelectionChange?: (rows: T[]) => void
  emptyMessage?: string
  className?: string
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  selectedRows = [],
  onSelectionChange,
  emptyMessage = "No data available",
  className
}: DataTableProps<T>) {
  const { sortedData, getSortProps } = useSortableTable({ data })

  const handleRowClick = (row: T, index: number) => {
    onRowClick?.(row, index)
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-text-muted text-sm">{emptyMessage}</div>
      </div>
    )
  }

  return (
    <Table variant="striped" className={className}>
      <TableHeader>
        <TableRow hoverable={false}>
          {columns.map((column) => (
            <TableHead
              key={String(column.key)}
              align={column.align}
              style={column.width ? { width: column.width } : undefined}
              {...(column.sortable !== false ? getSortProps(column.key) : {})}
            >
              {column.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((row, index) => (
          <TableRow
            key={index}
            clickable={!!onRowClick}
            selected={selectedRows.includes(row)}
            onClick={() => handleRowClick(row, index)}
          >
            {columns.map((column) => (
              <TableCell
                key={String(column.key)}
                align={column.align}
              >
                {column.render 
                  ? column.render(row[column.key], row, index)
                  : String(row[column.key] ?? "")
                }
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  DataTable,
  useSortableTable,
  type TableProps,
  type TableHeaderProps,
  type TableRowProps,
  type TableHeadProps,
  type TableCellProps,
  type DataTableProps,
  type UseSortableTableProps,
}
