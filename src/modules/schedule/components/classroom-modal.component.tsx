import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  DoorClosed,
  X,
  Search,
  Sparkles,
  Check,
  Building,
  ArrowRight,
  Layers,
  Trash2,
} from 'lucide-react'
import { FACULTY_CONSTANTS } from '../../faculty/faculty.constants'
import { SCHEDULE_CONSTANTS } from '../schedule.constants'
import type { ClassroomFloorMap } from '../../faculty/faculty.types'

interface ClassroomModalProps {
  isOpen: boolean
  onClose: () => void
  currentValue: string
  classroomsByFloor: ClassroomFloorMap
  facultyName: string
  onSelectClassroom: (room: string) => void
  onClearClassroom: () => void
}

interface ManualRoomInput {
  customRoom: string
}

export const ClassroomModal: React.FC<ClassroomModalProps> = ({
  isOpen,
  onClose,
  currentValue,
  classroomsByFloor,
  facultyName,
  onSelectClassroom,
  onClearClassroom,
}) => {
  const [searchFilter, setSearchFilter] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ManualRoomInput>({
    defaultValues: { customRoom: '' },
  })

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleManualSubmit = (data: ManualRoomInput) => {
    const trimmed = data.customRoom.trim()
    if (trimmed) {
      onSelectClassroom(trimmed)
      reset()
      onClose()
    }
  }

  const handleFloorRoomSelect = (room: string) => {
    onSelectClassroom(room)
    onClose()
  }

  const handleClear = () => {
    onClearClassroom()
    onClose()
  }

  // Helper to test if room is special
  const isSpecialRoom = (room: string) => {
    return FACULTY_CONSTANTS.SPECIAL_ROOMS.find(
      (spec) => spec.name.toLowerCase() === room.toLowerCase()
    )
  }

  // Floors sorted numerically (floor_1 to floor_9)
  const floorKeys = Object.keys(classroomsByFloor).sort((a, b) => {
    const numA = parseInt(a.replace('floor_', ''), 10) || 0
    const numB = parseInt(b.replace('floor_', ''), 10) || 0
    return numA - numB
  })

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="classroom-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex flex-col w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden">
        {/* FIXED HEADER */}
        <div className="shrink-0 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs text-blue-200">
                <DoorClosed className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 id="classroom-modal-title" className="text-base sm:text-lg font-bold text-white">
                  Ընտրել Լսարան ({facultyName})
                </h2>
                <p className="text-xs text-blue-200">
                  Լսարանները խմբավորված են ըստ հարկերի (մինչև 9 հարկ)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Փակել պատուհանը"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick search input in header */}
          <div className="mt-3 relative">
            <Search className="w-4 h-4 text-blue-300 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Ֆիլտրել ըստ համարի կամ անվան..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/10 text-white placeholder-blue-300 text-xs sm:text-sm rounded-xl border border-white/20 focus:outline-none focus:bg-white/20 focus:border-white/40 transition"
            />
          </div>
        </div>

        {/* SCROLLABLE CENTRAL AREA: Accommodates up to 9 floors */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-slate-50/60">
          {floorKeys.map((floorKey) => {
            const rawFloorNum = floorKey.replace('floor_', '')
            const floorLabel =
              FACULTY_CONSTANTS.FLOOR_LABELS[floorKey] || `${rawFloorNum}-րդ հարկ`
            const rooms = classroomsByFloor[floorKey] || []

            const filteredRooms = rooms.filter((r) =>
              r.toLowerCase().includes(searchFilter.toLowerCase().trim())
            )

            if (searchFilter && filteredRooms.length === 0) {
              return null
            }

            return (
              <div
                key={floorKey}
                className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs"
              >
                {/* Floor Header Badge */}
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                      {rawFloorNum}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
                      {floorLabel}
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {filteredRooms.length} լսարան
                  </span>
                </div>

                {/* Rooms Grid */}
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {filteredRooms.map((room) => {
                    const isSelected =
                      currentValue.toLowerCase().trim() === room.toLowerCase().trim()
                    const special = isSpecialRoom(room)

                    if (special) {
                      return (
                        <button
                          key={room}
                          type="button"
                          onClick={() => handleFloorRoomSelect(room)}
                          className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border font-bold text-xs transition transform active:scale-95 cursor-pointer col-span-2 xs:col-span-2 shadow-xs ${
                            isSelected
                              ? 'ring-2 ring-red-500 ring-offset-2 ' + special.color
                              : special.color
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-300 animate-pulse" />
                            <span>{room}</span>
                          </div>
                          <span className="text-[10px] opacity-90 font-medium mt-0.5">
                            {special.tag}
                          </span>
                        </button>
                      )
                    }

                    return (
                      <button
                        key={room}
                        type="button"
                        onClick={() => handleFloorRoomSelect(room)}
                        className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm font-semibold transition transform active:scale-95 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-700 text-white border-blue-800 shadow-sm'
                            : 'bg-white hover:bg-blue-50/70 border-slate-200 text-slate-800 hover:border-blue-300'
                        }`}
                      >
                        <span>{room}</span>
                        {isSelected && <Check className="w-4 h-4 shrink-0 text-white" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* FIXED FOOTER */}
        <div className="shrink-0 bg-white border-t border-slate-200 p-3 sm:p-4 space-y-3">
          {/* Manual Entry Form */}
          <form
            onSubmit={handleSubmit(handleManualSubmit)}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          >
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Ձեռքով մուտքագրել այլ շենքի կամ նոր լսարան (օր.՝ 405Բ, Ամֆիթատրոն)..."
                {...register('customRoom', { required: 'Մուտքագրեք լսարանը' })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              <span>Հաստատել Լսարանը</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Action row with Clear Button & Close */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold transition border border-transparent hover:border-red-200 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{SCHEDULE_CONSTANTS.CLEAR_CLASSROOM_LABEL}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium transition cursor-pointer"
            >
              Փակել
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
