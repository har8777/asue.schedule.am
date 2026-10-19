import { facultyRequests } from './faculty.requests'
import { FACULTY_CONSTANTS } from './faculty.constants'
import type { FacultyData, FacultiesState, CreateFacultyDto } from './faculty.types'

/**
 * Service managing Faculty domain logic.
 * SOLID Principle: Single Responsibility for Faculty business workflows.
 */
class FacultyService {
  private static instance: FacultyService

  private constructor() {}

  public static getInstance(): FacultyService {
    if (!FacultyService.instance) {
      FacultyService.instance = new FacultyService()
    }
    return FacultyService.instance
  }

  public async getFaculties(): Promise<FacultiesState> {
    return await facultyRequests.getAll()
  }

  public async getFacultyById(id: string): Promise<FacultyData> {
    return await facultyRequests.getById(id)
  }

  public async createFaculty(dto: CreateFacultyDto): Promise<FacultyData> {
    return await facultyRequests.create(dto)
  }

  public async deleteFaculty(id: string): Promise<void> {
    return await facultyRequests.delete(id)
  }

  public async resetFaculties(): Promise<FacultiesState> {
    return await facultyRequests.resetDefaults()
  }

  /**
   * "Smart" dynamic learning: Add professor to faculty if not already present.
   * Data isolation guarantee: appended ONLY to this specific faculty.
   */
  public async learnProfessor(facultyId: string, professorName: string): Promise<FacultyData> {
    const trimmed = professorName.trim()
    if (!trimmed) throw new Error('Դասախոսի անունը դատարկ է')

    const faculty = await facultyRequests.getById(facultyId)
    if (!faculty.professors.includes(trimmed)) {
      const updatedProfessors = [...faculty.professors, trimmed].sort((a, b) => a.localeCompare(b, 'hy'))
      return await facultyRequests.update(facultyId, { professors: updatedProfessors })
    }
    return faculty
  }

  /**
   * "Smart" dynamic learning: Add course to faculty if not already present.
   * Data isolation guarantee: appended ONLY to this specific faculty.
   */
  public async learnCourse(facultyId: string, courseName: string): Promise<FacultyData> {
    const trimmed = courseName.trim()
    if (!trimmed) throw new Error('Առարկայի անունը դատարկ է')

    const faculty = await facultyRequests.getById(facultyId)
    if (!faculty.courses.includes(trimmed)) {
      const updatedCourses = [...faculty.courses, trimmed].sort((a, b) => a.localeCompare(b, 'hy'))
      return await facultyRequests.update(facultyId, { courses: updatedCourses })
    }
    return faculty
  }

  /**
   * Add a new classroom to a specific floor of a faculty
   */
  public async addClassroom(facultyId: string, floorKey: string, roomNumber: string): Promise<FacultyData> {
    const trimmed = roomNumber.trim()
    if (!trimmed) throw new Error('Լսարանի համարը դատարկ է')

    const faculty = await facultyRequests.getById(facultyId)
    const floorRooms = faculty.classrooms[floorKey] || []

    if (!floorRooms.includes(trimmed)) {
      const updatedFloor = [...floorRooms, trimmed].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      const updatedClassrooms = {
        ...faculty.classrooms,
        [floorKey]: updatedFloor,
      }
      return await facultyRequests.update(facultyId, { classrooms: updatedClassrooms })
    }

    return faculty
  }
}

export const facultyService = FacultyService.getInstance()
