import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { FACULTY_CONSTANTS } from './faculty.constants'
import { facultyService } from './faculty.service'
import type { FacultyData, FacultiesState, CreateFacultyDto } from './faculty.types'

interface FacultyContextValue {
  faculties: FacultiesState
  currentFaculty: FacultyData | null
  currentFacultyId: string
  setCurrentFacultyId: (id: string) => void
  isLoading: boolean
  error: string | null
  refreshFaculties: () => Promise<void>
  createFaculty: (dto: CreateFacultyDto) => Promise<FacultyData>
  deleteFaculty: (id: string) => Promise<void>
  resetAll: () => Promise<void>
  learnProfessor: (prof: string) => Promise<void>
  learnCourse: (course: string) => Promise<void>
  addClassroom: (floorKey: string, room: string) => Promise<void>
}

const FacultyContext = createContext<FacultyContextValue | undefined>(undefined)

export const FacultyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [faculties, setFaculties] = useState<FacultiesState>({})
  const [currentFacultyId, setCurrentFacultyId] = useState<string>(() => {
    return localStorage.getItem('schedule_current_faculty_id') || FACULTY_CONSTANTS.DEFAULT_FACULTY_ID
  })
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadFaculties = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await facultyService.getFaculties()
      setFaculties(data)
      // Check if current ID exists, otherwise fallback to first
      const keys = Object.keys(data)
      if (keys.length > 0 && !data[currentFacultyId]) {
        setCurrentFacultyId(keys[0])
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Չհաջողվեց բեռնել ֆակուլտետները')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFaculties()
  }, [])

  const handleSelectFaculty = (id: string) => {
    setCurrentFacultyId(id)
    localStorage.setItem('schedule_current_faculty_id', id)
  }

  const handleCreateFaculty = async (dto: CreateFacultyDto): Promise<FacultyData> => {
    const created = await facultyService.createFaculty(dto)
    await loadFaculties()
    handleSelectFaculty(created.id)
    return created
  }

  const handleDeleteFaculty = async (id: string): Promise<void> => {
    await facultyService.deleteFaculty(id)
    await loadFaculties()
  }

  const handleResetAll = async (): Promise<void> => {
    await facultyService.resetFaculties()
    await loadFaculties()
    handleSelectFaculty(FACULTY_CONSTANTS.DEFAULT_FACULTY_ID)
  }

  const handleLearnProfessor = async (prof: string): Promise<void> => {
    if (!currentFacultyId) return
    const updated = await facultyService.learnProfessor(currentFacultyId, prof)
    setFaculties(prev => ({ ...prev, [currentFacultyId]: updated }))
  }

  const handleLearnCourse = async (course: string): Promise<void> => {
    if (!currentFacultyId) return
    const updated = await facultyService.learnCourse(currentFacultyId, course)
    setFaculties(prev => ({ ...prev, [currentFacultyId]: updated }))
  }

  const handleAddClassroom = async (floorKey: string, room: string): Promise<void> => {
    if (!currentFacultyId) return
    const updated = await facultyService.addClassroom(currentFacultyId, floorKey, room)
    setFaculties(prev => ({ ...prev, [currentFacultyId]: updated }))
  }

  const currentFaculty = faculties[currentFacultyId] || null

  const value: FacultyContextValue = {
    faculties,
    currentFaculty,
    currentFacultyId,
    setCurrentFacultyId: handleSelectFaculty,
    isLoading,
    error,
    refreshFaculties: loadFaculties,
    createFaculty: handleCreateFaculty,
    deleteFaculty: handleDeleteFaculty,
    resetAll: handleResetAll,
    learnProfessor: handleLearnProfessor,
    learnCourse: handleLearnCourse,
    addClassroom: handleAddClassroom,
  }

  return <FacultyContext.Provider value={value}>{children}</FacultyContext.Provider>
}

export const useFaculty = (): FacultyContextValue => {
  const context = useContext(FacultyContext)
  if (!context) {
    throw new Error('useFaculty must be used within a FacultyProvider')
  }
  return context
}
