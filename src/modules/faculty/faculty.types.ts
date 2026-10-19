export interface ClassroomFloorMap {
  [floorKey: string]: string[]
}

export interface ScheduleSlot {
  course: string
  professor: string
  classroom: string
}

export interface DaySchedule {
  [slotTime: string]: ScheduleSlot
}

export interface WeeklySchedule {
  monday?: DaySchedule
  tuesday?: DaySchedule
  wednesday?: DaySchedule
  thursday?: DaySchedule
  friday?: DaySchedule
  [dayKey: string]: DaySchedule | undefined
}

export interface FacultyData {
  id: string
  name: string
  description?: string
  buildingName?: string
  floorsCount?: number
  professors: string[]
  courses: string[]
  classrooms: ClassroomFloorMap
  schedule: WeeklySchedule
}

export interface FacultiesState {
  [facultyId: string]: FacultyData
}

export interface CreateFacultyDto {
  name: string
  buildingName?: string
  floorsCount: number
}
