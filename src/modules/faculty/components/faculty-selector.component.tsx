import React from 'react'
import { Building2, ChevronDown, Plus, Layers, ShieldCheck } from 'lucide-react'
import { useFaculty } from '../faculty.context'
import { useAuth } from '../../auth/auth.context'

interface FacultySelectorProps {
  onOpenCreateModal?: () => void
}

export const FacultySelector: React.FC<FacultySelectorProps> = ({ onOpenCreateModal }) => {
  const { faculties, currentFacultyId, setCurrentFacultyId } = useFaculty()
  const { isSuperAdmin } = useAuth()

  const facultyList = Object.values(faculties)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Ընթացիկ ֆակուլտետ
          </span>
          <div className="relative inline-block mt-0.5">
            <select
              value={currentFacultyId}
              onChange={(e) => setCurrentFacultyId(e.target.value)}
              className="appearance-none bg-transparent pr-8 py-0.5 text-base sm:text-lg font-bold text-slate-800 focus:outline-none focus:text-blue-700 cursor-pointer font-sans"
              aria-label="Ընտրել ֆակուլտետը"
            >
              {facultyList.map((faculty) => (
                <option key={faculty.id} value={faculty.id} className="text-slate-800 text-sm">
                  {faculty.name} ({faculty.buildingName || 'Մասնաշենք'})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        {/* Floor indicator badge */}
        {faculties[currentFacultyId] && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>{Object.keys(faculties[currentFacultyId].classrooms).length} հարկ</span>
          </div>
        )}

        {/* Super admin create faculty button */}
        {isSuperAdmin && onOpenCreateModal && (
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ավելացնել Ֆակուլտետ</span>
          </button>
        )}
      </div>
    </div>
  )
}
