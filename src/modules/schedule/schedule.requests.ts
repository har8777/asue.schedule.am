import { httpClient } from '../common/http/http-client'
import { FACULTY_CONSTANTS } from '../faculty/faculty.constants'
import { INITIAL_FACULTIES_DATA } from '../faculty/faculty.seed'
import type { FacultiesState } from '../faculty/faculty.types'
import type { UpdateCellPayload, ScheduleGridState } from './schedule.types'

function getStoredFaculties(): FacultiesState {
  try {
    const raw = localStorage.getItem(FACULTY_CONSTANTS.STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Failed reading storage in schedule.requests', e)
  }
  return INITIAL_FACULTIES_DATA
}

function saveStoredFaculties(data: FacultiesState): void {
  localStorage.setItem(FACULTY_CONSTANTS.STORAGE_KEY, JSON.stringify(data))
}

/**
 * Schedule HTTP Requests implemented with Axios.
 * Implements SRP: Only schedule-related HTTP endpoint communications.
 */
export const scheduleRequests = {
  /**
   * Fetch schedule for a given faculty via Axios
   */
  async getScheduleByFaculty(facultyId: string): Promise<ScheduleGridState> {
    try {
      const response = await httpClient.get<ScheduleGridState>(`/faculties/${facultyId}/schedule`)
      return response.data
    } catch {
      const all = getStoredFaculties()
      const faculty = all[facultyId]
      return faculty ? faculty.schedule : {}
    }
  },

  /**
   * Update a specific schedule cell via Axios
   */
  async updateCell(payload: UpdateCellPayload): Promise<ScheduleGridState> {
    try {
      const response = await httpClient.put<ScheduleGridState>(
        `/faculties/${payload.facultyId}/schedule/cell`,
        payload
      )
      return response.data
    } catch {
      const all = getStoredFaculties()
      const faculty = all[payload.facultyId]
      if (!faculty) {
        throw new Error('Ֆակուլտետը չի գտնվել')
      }

      if (!faculty.schedule[payload.day]) {
        faculty.schedule[payload.day] = {}
      }

      faculty.schedule[payload.day]![payload.slot] = payload.cellData
      all[payload.facultyId] = faculty
      saveStoredFaculties(all)

      return faculty.schedule
    }
  },

  /**
   * Clear an entire slot cell via Axios
   */
  async clearCell(facultyId: string, day: string, slot: string): Promise<ScheduleGridState> {
    try {
      const response = await httpClient.delete<ScheduleGridState>(
        `/faculties/${facultyId}/schedule/${day}/${slot}`
      )
      return response.data
    } catch {
      const all = getStoredFaculties()
      const faculty = all[facultyId]
      if (faculty && faculty.schedule[day]) {
        faculty.schedule[day]![slot] = { course: '', professor: '', classroom: '' }
        all[facultyId] = faculty
        saveStoredFaculties(all)
      }
      return faculty ? faculty.schedule : {}
    }
  }
}
