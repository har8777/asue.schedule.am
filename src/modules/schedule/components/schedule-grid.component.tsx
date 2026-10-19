import React from 'react'
import { Clock, Calendar } from 'lucide-react'
import { ScheduleCell } from './schedule-cell.component'
import {
  SCHEDULE_DAYS,
  SCHEDULE_TIME_SLOTS,
  type ScheduleDayKey,
  type ScheduleSlotKey,
} from '../schedule.constants'
import type { ScheduleCellData, ScheduleConflict, ScheduleGridState } from '../schedule.types'
import type { FacultyData } from '../../faculty/faculty.types'

interface ScheduleGridProps {
  schedule: ScheduleGridState
  faculty: FacultyData
  canEdit: boolean
  conflicts: ScheduleConflict[]
  onUpdateCell: (day: ScheduleDayKey, slot: ScheduleSlotKey, cellData: ScheduleCellData) => void
  onLearnProfessor: (prof: string) => void
  onLearnCourse: (course: string) => void
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  schedule,
  faculty,
  canEdit,
  conflicts,
  onUpdateCell,
  onLearnProfessor,
  onLearnCourse,
}) => {
  const isCellConflicted = (day: ScheduleDayKey, slot: ScheduleSlotKey) => {
    return conflicts.some((c) => c.day === day && c.slot === slot)
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs custom-scrollbar">
      <table className="w-full min-w-[900px] border-collapse text-left">
        <thead>
          <tr className="bg-slate-100/80 border-b border-slate-200">
            <th className="w-32 py-3 px-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-500 border-r border-slate-200">
              <div className="flex items-center justify-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Ժամ / Զույգ</span>
              </div>
            </th>
            {SCHEDULE_DAYS.map((day) => (
              <th
                key={day.key}
                className="py-3 px-4 text-center text-xs font-bold text-slate-800 uppercase tracking-wider border-r border-slate-200 last:border-r-0"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>{day.label}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-xs">
          {SCHEDULE_TIME_SLOTS.map((slot, slotIdx) => (
            <tr
              key={slot.key}
              className={slotIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}
            >
              {/* Time slot header cell */}
              <td className="py-3 px-3 text-center border-r border-slate-200 align-top bg-slate-50/70">
                <div className="font-bold text-slate-900 text-xs">{slot.label}</div>
                <div className="text-[11px] text-slate-500 mt-1 font-mono">{slot.time}</div>
              </td>

              {/* Day cells */}
              {SCHEDULE_DAYS.map((day) => {
                const cellData = schedule[day.key]?.[slot.key]
                const hasConflict = isCellConflicted(day.key, slot.key)

                return (
                  <td
                    key={`${day.key}-${slot.key}`}
                    className="p-2 border-r border-slate-200 last:border-r-0 align-top transition-colors"
                  >
                    <ScheduleCell
                      day={day.key}
                      slot={slot.key}
                      data={cellData}
                      faculty={faculty}
                      canEdit={canEdit}
                      hasConflict={hasConflict}
                      onUpdate={(updatedData) => onUpdateCell(day.key, slot.key, updatedData)}
                      onLearnProfessor={onLearnProfessor}
                      onLearnCourse={onLearnCourse}
                    />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
