export const FACULTY_CONSTANTS = {
  DEFAULT_FACULTY_ID: 'faculty_management',
  STORAGE_KEY: 'academic_schedule_faculties_v1',
  SPECIAL_ROOMS: [
    {
      name: 'Չինական լսարան',
      tag: 'Հատուկ լսարան',
      color: 'bg-red-600 text-white border-red-700 shadow-red-200',
      badgeColor: 'bg-red-100 text-red-700 border-red-300',
    },
    {
      name: 'Լաբորատորիա 104',
      tag: 'Համակարգչային',
      color: 'bg-indigo-600 text-white border-indigo-700 shadow-indigo-200',
      badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    }
  ],
  FLOOR_LABELS: {
    floor_1: '1-ին հարկ',
    floor_2: '2-րդ հարկ',
    floor_3: '3-րդ հարկ',
    floor_4: '4-րդ հարկ',
    floor_5: '5-րդ հարկ',
    floor_6: '6-րդ հարկ',
    floor_7: '7-րդ հարկ',
    floor_8: '8-րդ հարկ',
    floor_9: '9-րդ հարկ',
  } as Record<string, string>,
} as const
