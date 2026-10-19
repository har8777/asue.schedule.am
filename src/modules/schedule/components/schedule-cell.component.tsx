import React, { useState } from 'react'
import { BookOpen, User, DoorClosed, Sparkles, XCircle } from 'lucide-react'
import { SmartCombobox } from './smart-combobox.component'
import { ClassroomModal } from './classroom-modal.component'
import { SCHEDULE_CONSTANTS, type ScheduleDayKey, type ScheduleSlotKey } from '../schedule.constants'
import { FACULTY_CONSTANTS } from '../../faculty/faculty.constants'
import type { ScheduleCellData } from '../schedule.types'
import type { FacultyData } from '../../faculty/faculty.types'

interface ScheduleCellProps {
  day: ScheduleDayKey
  slot: ScheduleSlotKey
  data?: ScheduleCellData
  faculty: FacultyData
  canEdit: boolean
  onUpdate: (updatedCell: ScheduleCellData) => void
  onLearnProfessor: (name: string) => void
  onLearnCourse: (name: string) => void
  hasConflict?: boolean
}

export const ScheduleCell: React.FC<ScheduleCellProps> = ({
  day,
  slot,
  data,
  faculty,
  canEdit,
  onUpdate,
  onLearnProfessor,
  onLearnCourse,
  hasConflict = false,
}) => {
  const [isClassroomModalOpen, setIsClassroomModalOpen] = useState(false)

  const currentCourse = data?.course || ''
  const currentProfessor = data?.professor || ''
  const currentClassroom = data?.classroom || ''

  const isEmpty = !currentCourse && !currentProfessor && !currentClassroom

  const handleCourseChange = (newCourse: string) => {
    onUpdate({
      course: newCourse,
      professor: currentProfessor,
      classroom: currentClassroom,
    })
  }

  const handleProfessorChange = (newProf: string) => {
    onUpdate({
      course: currentCourse,
      professor: newProf,
      classroom: currentClassroom,
    })
  }

  const handleClassroomSelect = (newRoom: string) => {
    onUpdate({
      course: currentCourse,
      professor: currentProfessor,
      classroom: newRoom,
    })
  }

  const handleClearClassroom = () => {
    onUpdate({
      course: currentCourse,
      professor: currentProfessor,
      classroom: '',
    })
  }

  const handleClearAll = () => {
    onUpdate({
      course: '',
      professor: '',
      classroom: '',
    })
  }

  const isSpecialRoom =
    currentClassroom.toLowerCase() ===
    SCHEDULE_CONSTANTS.SPECIAL_ROOM_CHINESE.toLowerCase()

  // READ-ONLY / VIEWER MODE
  if (!canEdit) {
    if (isEmpty) {
      return (
        <div className="h-full min-h-[105px] flex items-center justify-center p-3 rounded-xl bg-slate-50/60 border border-slate-100 text-slate-300 text-xs italic">
          {SCHEDULE_CONSTANTS.EMPTY_CELL_LABEL}
        </div>
      )
    }

    return (
      <div
        className={`h-full min-h-[105px] p-2.5 rounded-xl border transition flex flex-col justify-between ${
          hasConflict
            ? 'bg-amber-50/80 border-amber-300 shadow-xs'
            : 'bg-white border-slate-200/90 shadow-2xs hover:shadow-xs'
        }`}
      >
        <div className="space-y-1.5">
          {/* Course */}
          {currentCourse && (
            <div className="flex items-start gap-1.5 text-xs font-bold text-slate-900 leading-snug">
              <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{currentCourse}</span>
            </div>
          )}

          {/* Professor */}
          {currentProfessor && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
              <User className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{currentProfessor}</span>
            </div>
          )}
        </div>

        {/* Classroom badge */}
        {currentClassroom && (
          <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                isSpecialRoom
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {isSpecialRoom ? (
                <Sparkles className="w-3 h-3 text-amber-300" />
              ) : (
                <DoorClosed className="w-3 h-3 text-slate-400" />
              )}
              <span>{currentClassroom}</span>
            </span>
          </div>
        )}
      </div>
    )
  }

  // EDITABLE / ADMIN MODE
  return (
    <div
      className={`relative p-2.5 rounded-xl border transition-all space-y-2 group ${
        hasConflict
          ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300'
          : isEmpty
          ? 'bg-white hover:bg-slate-50/70 border-dashed border-slate-200'
          : 'bg-white border-slate-200 shadow-xs hover:border-blue-400'
      }`}
    >
      {/* Clear cell button on hover if not empty */}
      {!isEmpty && (
        <button
          type="button"
          onClick={handleClearAll}
          title="Մաքրել ամբողջ վանդակը"
          className="absolute -top-2 -right-2 p-1 bg-white text-slate-400 hover:text-red-600 rounded-full shadow-md border border-slate-200 transition opacity-0 group-hover:opacity-100 cursor-pointer z-10"
        >
          <XCircle className="w-3.5 h-3.5" />
        </button>
      )}

      {/* 1. Course Combobox */}
      <SmartCombobox
        value={currentCourse}
        options={faculty.courses}
        placeholder="Դասընթաց..."
        icon={<BookOpen className="w-3 h-3 text-blue-600" />}
        onSelect={handleCourseChange}
        onLearnNewItem={onLearnCourse}
      />

      {/* 2. Professor Combobox */}
      <SmartCombobox
        value={currentProfessor}
        options={faculty.professors}
        placeholder="Դասախոս..."
        icon={<User className="w-3 h-3 text-emerald-600" />}
        onSelect={handleProfessorChange}
        onLearnNewItem={onLearnProfessor}
      />

      {/* 3. Classroom Selector Button (Modal Trigger - standard dropdown forbidden) */}
      <div>
        <button
          type="button"
          onClick={() => setIsClassroomModalOpen(true)}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
            isSpecialRoom
              ? 'bg-red-600 text-white border-red-700 shadow-xs'
              : currentClassroom
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              : 'bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 border-dashed border-blue-200'
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            {isSpecialRoom ? (
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            ) : (
              <DoorClosed className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            )}
            <span className="truncate">
              {currentClassroom || '+ Ընտրել Լսարան'}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-400">
            {currentClassroom ? 'Փոխել' : 'Մոդալ'}
          </span>
        </button>
      </div>

      {/* Specialized Classroom Modal */}
      <ClassroomModal
        isOpen={isClassroomModalOpen}
        onClose={() => setIsClassroomModalOpen(false)}
        currentValue={currentClassroom}
        classroomsByFloor={faculty.classrooms}
        facultyName={faculty.name}
        onSelectClassroom={handleClassroomSelect}
        onClearClassroom={handleClearClassroom}
      />
    </div>
  )
}
