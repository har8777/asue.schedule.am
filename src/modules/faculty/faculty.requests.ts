import { httpClient } from '../common/http/http-client'
import { FACULTY_CONSTANTS } from './faculty.constants'
import { INITIAL_FACULTIES_DATA } from './faculty.seed'
import type { FacultyData, FacultiesState, CreateFacultyDto } from './faculty.types'

/**
 * Storage synchronization helper for offline/mock Axios operations.
 */
function getLocalFaculties(): FacultiesState {
  try {
    const raw = localStorage.getItem(FACULTY_CONSTANTS.STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (e) {
    console.error('Failed reading faculties from storage', e)
  }
  localStorage.setItem(FACULTY_CONSTANTS.STORAGE_KEY, JSON.stringify(INITIAL_FACULTIES_DATA))
  return INITIAL_FACULTIES_DATA
}

function saveLocalFaculties(data: FacultiesState): void {
  localStorage.setItem(FACULTY_CONSTANTS.STORAGE_KEY, JSON.stringify(data))
}

/**
 * Faculty Requests implemented with Axios.
 * SRP: Pure API abstraction for Faculty data operations.
 */
export const facultyRequests = {
  /**
   * Fetch all faculties
   */
  async getAll(): Promise<FacultiesState> {
    try {
      const response = await httpClient.get<FacultiesState>('/faculties')
      return response.data
    } catch {
      // Axios fallback to stored state
      return getLocalFaculties()
    }
  },

  /**
   * Fetch a single faculty by ID
   */
  async getById(facultyId: string): Promise<FacultyData> {
    try {
      const response = await httpClient.get<FacultyData>(`/faculties/${facultyId}`)
      return response.data
    } catch {
      const all = getLocalFaculties()
      const faculty = all[facultyId]
      if (!faculty) {
        throw new Error(`Ֆակուլտետը չի գտնվել: ${facultyId}`)
      }
      return faculty
    }
  },

  /**
   * Create a new faculty (Super Admin privilege)
   */
  async create(dto: CreateFacultyDto): Promise<FacultyData> {
    try {
      const response = await httpClient.post<FacultyData>('/faculties', dto)
      return response.data
    } catch {
      const all = getLocalFaculties()
      const newId = `faculty_${Date.now()}`
      
      const newClassrooms: Record<string, string[]> = {}
      for (let i = 1; i <= dto.floorsCount; i++) {
        newClassrooms[`floor_${i}`] = [`${i}01`, `${i}02`, `${i}03`]
      }

      const newFaculty: FacultyData = {
        id: newId,
        name: dto.name,
        buildingName: dto.buildingName || 'Նոր մասնաշենք',
        floorsCount: dto.floorsCount,
        professors: [],
        courses: [],
        classrooms: newClassrooms,
        schedule: {
          monday: {},
          tuesday: {},
          wednesday: {},
          thursday: {},
          friday: {},
        }
      }

      all[newId] = newFaculty
      saveLocalFaculties(all)
      return newFaculty
    }
  },

  /**
   * Update faculty details
   */
  async update(facultyId: string, updates: Partial<FacultyData>): Promise<FacultyData> {
    try {
      const response = await httpClient.put<FacultyData>(`/faculties/${facultyId}`, updates)
      return response.data
    } catch {
      const all = getLocalFaculties()
      if (!all[facultyId]) {
        throw new Error('Ֆակուլտետը գոյություն չունի')
      }
      const updated = { ...all[facultyId], ...updates }
      all[facultyId] = updated
      saveLocalFaculties(all)
      return updated
    }
  },

  /**
   * Delete a faculty (Super Admin privilege)
   */
  async delete(facultyId: string): Promise<void> {
    try {
      await httpClient.delete(`/faculties/${facultyId}`)
    } catch {
      const all = getLocalFaculties()
      delete all[facultyId]
      saveLocalFaculties(all)
    }
  },

  /**
   * Reset data back to default university seed
   */
  async resetDefaults(): Promise<FacultiesState> {
    try {
      const response = await httpClient.post<FacultiesState>('/faculties/reset')
      return response.data
    } catch {
      saveLocalFaculties(INITIAL_FACULTIES_DATA)
      return INITIAL_FACULTIES_DATA
    }
  }
}
