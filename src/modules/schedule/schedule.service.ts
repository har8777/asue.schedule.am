import { scheduleRequests } from './schedule.requests'
import { facultyRequests } from '../faculty/faculty.requests'
import { SCHEDULE_DAYS, SCHEDULE_TIME_SLOTS, type ScheduleDayKey, type ScheduleSlotKey } from './schedule.constants'
import type { ScheduleCellData, ScheduleConflict, ScheduleGridState, UpdateCellPayload } from './schedule.types'
import type { FacultiesState } from '../faculty/faculty.types'

/**
 * Schedule Service managing schedule mutations, conflict detection, and business rules.
 * Adheres to SOLID Single Responsibility Principle.
 */
class ScheduleService {
  private static instance: ScheduleService

  private constructor() {}

  public static getInstance(): ScheduleService {
    if (!ScheduleService.instance) {
      ScheduleService.instance = new ScheduleService()
    }
    return ScheduleService.instance
  }

  public async getSchedule(facultyId: string): Promise<ScheduleGridState> {
    return await scheduleRequests.getScheduleByFaculty(facultyId)
  }

  public async updateCell(payload: UpdateCellPayload): Promise<ScheduleGridState> {
    return await scheduleRequests.updateCell(payload)
  }

  public async clearCell(facultyId: string, day: string, slot: string): Promise<ScheduleGridState> {
    return await scheduleRequests.clearCell(facultyId, day, slot)
  }

  /**
   * Conflict Detection Engine:
   * Cross-references all faculties to detect if a professor or room is assigned
   * concurrently at the same day & time slot.
   */
  public findConflicts(currentFacultyId: string, allFaculties: FacultiesState): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = []
    const currentFaculty = allFaculties[currentFacultyId]
    if (!currentFaculty || !currentFaculty.schedule) return conflicts

    for (const day of SCHEDULE_DAYS) {
      const currentDaySchedule = currentFaculty.schedule[day.key] || {}

      for (const slot of SCHEDULE_TIME_SLOTS) {
        const cell = currentDaySchedule[slot.key]
        if (!cell) continue

        const prof = cell.professor?.trim()
        const room = cell.classroom?.trim()

        if (!prof && !room) continue

        // Check against other faculties
        for (const [otherId, otherFaculty] of Object.entries(allFaculties)) {
          if (otherId === currentFacultyId) continue

          const otherDaySchedule = otherFaculty.schedule[day.key] || {}
          const otherCell = otherDaySchedule[slot.key]
          if (!otherCell) continue

          // 1. Professor Overlap Conflict
          if (prof && otherCell.professor?.trim().toLowerCase() === prof.toLowerCase()) {
            conflicts.push({
              day: day.key,
              slot: slot.key,
              type: 'PROFESSOR_OVERLAP',
              conflictWithFacultyName: otherFaculty.name,
              details: `Դասախոս «${prof}»-ը նույն ժամին (${slot.time}) նշանակված է նաև «${otherFaculty.name}»-ում:`,
            })
          }

          // 2. Classroom Overlap Conflict
          if (room && otherCell.classroom?.trim().toLowerCase() === room.toLowerCase()) {
            conflicts.push({
              day: day.key,
              slot: slot.key,
              type: 'CLASSROOM_OVERLAP',
              conflictWithFacultyName: otherFaculty.name,
              details: `Լսարան «${room}»-ը նույն ժամին (${slot.time}) զբաղված է «${otherFaculty.name}»-ում:`,
            })
          }
        }
      }
    }

    return conflicts
  }

  /**
   * Export schedule as a downloadable JSON file
   */
  public exportScheduleToJson(facultyName: string, schedule: ScheduleGridState): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(schedule, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `dasacucak-${facultyName.replace(/\s+/g, '_')}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }
}

export const scheduleService = ScheduleService.getInstance()
