'use client'

import { forwardRef, SelectHTMLAttributes, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface TreeOption {
  label: string
  value: string
  children?: TreeOption[]
}

export interface TreeSelectProps {
  options: TreeOption[]
  value?: string[]
  onChange?: (value: string[]) => void
  placeholder?: string
  multiple?: boolean
  className?: string
}

const TreeSelect = forwardRef<HTMLDivElement, TreeSelectProps>(
  ({ options, value = [], onChange, placeholder = 'Select', multiple = true, className }, ref) => {
    const [open, setOpen] = useState(false)
    const [selected, setSelected] = useState<string[]>(value)

    useEffect(() => {
      setSelected(value)
    }, [value])

    const toggleOption = (val: string) => {
      let newSelected: string[]
      if (multiple) {
        newSelected = selected.includes(val)
          ? selected.filter((v) => v !== val)
          : [...selected, val]
      } else {
        newSelected = [val]
        setOpen(false)
      }
      setSelected(newSelected)
      onChange?.(newSelected)
    }

    const renderOptions = (opts: TreeOption[], level = 0) => {
      return opts.map((opt) => (
        <div key={opt.value}>
          <div
            className={cn(
              'flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700',
              selected.includes(opt.value) && 'bg-blue-50 dark:bg-blue-900/30'
            )}
            style={{ paddingLeft: `${level * 20 + 12}px` }}
            onClick={() => toggleOption(opt.value)}
          >
            {multiple && (
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggleOption(opt.value)}
                className="mr-2"
              />
            )}
            <span className="text-sm">{opt.label}</span>
          </div>
          {opt.children && renderOptions(opt.children, level + 1)}
        </div>
      ))
    }

    const getSelectedLabels = () => {
      const labels: string[] = []
      const findLabel = (opts: TreeOption[]) => {
        for (const opt of opts) {
          if (selected.includes(opt.value)) {
            labels.push(opt.label)
          }
          if (opt.children) {
            findLabel(opt.children)
          }
        }
      }
      findLabel(options)
      return labels
    }

    return (
      <div ref={ref} className={cn('relative', className)}>
        <div
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-white dark:bg-gray-800"
          onClick={() => setOpen(!open)}
        >
          {selected.length > 0 ? getSelectedLabels().join(', ') : placeholder}
        </div>
        {open && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.length > 0 ? renderOptions(options) : (
              <div className="px-3 py-2 text-sm text-gray-500">No options</div>
            )}
          </div>
        )}
      </div>
    )
  }
)

TreeSelect.displayName = 'TreeSelect'

export { TreeSelect }
