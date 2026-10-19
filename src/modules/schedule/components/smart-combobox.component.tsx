import React, { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, Plus, Search } from 'lucide-react'

interface SmartComboboxProps {
  value: string
  options: string[]
  placeholder?: string
  disabled?: boolean
  label?: string
  icon?: React.ReactNode
  onSelect: (val: string) => void
  onLearnNewItem: (newItem: string) => void
}

export const SmartCombobox: React.FC<SmartComboboxProps> = ({
  value,
  options,
  placeholder = 'Որոնել կամ գրել...',
  disabled = false,
  label,
  icon,
  onSelect,
  onLearnNewItem,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Synchronize internal input value with external value
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Filter existing options
  const filteredOptions = options.filter((item) =>
    item.toLowerCase().includes(inputValue.toLowerCase().trim())
  )

  const isExactMatch = options.some(
    (opt) => opt.toLowerCase() === inputValue.trim().toLowerCase()
  )
  const canAddNew = inputValue.trim().length > 0 && !isExactMatch

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        commitValue()
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [inputValue, options])

  /**
   * Commits current value and triggers auto-learning if new item
   */
  const commitValue = () => {
    const trimmed = inputValue.trim()
    if (trimmed) {
      onSelect(trimmed)
      // Dynamic Addition (Learning)
      if (!options.includes(trimmed)) {
        onLearnNewItem(trimmed)
      }
    } else {
      onSelect('')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setIsOpen(true)
    setHighlightedIndex(-1)
  }

  const handleInputBlur = () => {
    // Delay slightly to permit click on list item
    setTimeout(() => {
      commitValue()
    }, 150)
  }

  const handleSelectOption = (item: string) => {
    setInputValue(item)
    onSelect(item)
    setIsOpen(false)
  }

  const handleAddNewItem = () => {
    const trimmed = inputValue.trim()
    if (trimmed) {
      handleSelectOption(trimmed)
      onLearnNewItem(trimmed)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
      } else {
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        )
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
        handleSelectOption(filteredOptions[highlightedIndex])
      } else {
        commitValue()
        setIsOpen(false)
      }
      inputRef.current?.blur()
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
          {icon}
          <span>{label}</span>
        </label>
      )}

      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          disabled={disabled}
          onChange={handleInputChange}
          onFocus={() => !disabled && setIsOpen(true)}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full text-xs sm:text-sm px-2.5 py-1.5 rounded-lg border transition focus:outline-none ${
            disabled
              ? 'bg-slate-100/70 border-slate-200 text-slate-500 cursor-not-allowed'
              : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 hover:border-slate-400'
          }`}
        />
        {!disabled && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-56 overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-xl custom-scrollbar animate-in fade-in duration-100">
          {filteredOptions.length > 0 ? (
            <ul className="py-1">
              {filteredOptions.map((item, idx) => {
                const isSelected = item.toLowerCase() === value.toLowerCase()
                const isHighlighted = idx === highlightedIndex
                return (
                  <li
                    key={item}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleSelectOption(item)
                    }}
                    className={`flex items-center justify-between px-3 py-2 text-xs cursor-pointer transition ${
                      isHighlighted
                        ? 'bg-blue-50 text-blue-900 font-medium'
                        : isSelected
                        ? 'bg-slate-50 text-blue-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="p-3 text-center text-xs text-slate-400">
              Համընկնումներ չկան
            </div>
          )}

          {/* Dynamic addition prompt */}
          {canAddNew && (
            <div className="border-t border-slate-100 p-1.5 bg-slate-50">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleAddNewItem()
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-100/60 hover:bg-blue-100 rounded-lg transition text-left cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Ավելացնել «{inputValue.trim()}» ցուցակում</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
