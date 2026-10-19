import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Building2, X, PlusCircle, Check } from 'lucide-react'
import { useFaculty } from '../faculty.context'
import type { CreateFacultyDto } from '../faculty.types'

interface FacultyFormModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FormInputs {
  name: string
  buildingName: string
  floorsCount: number
}

export const FacultyFormModal: React.FC<FacultyFormModalProps> = ({ isOpen, onClose }) => {
  const { createFaculty } = useFaculty()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      name: '',
      buildingName: '',
      floorsCount: 3,
    },
  })

  if (!isOpen) return null

  const onSubmit = async (data: FormInputs) => {
    setIsSubmitting(true)
    setErrorMsg(null)
    try {
      await createFaculty({
        name: data.name.trim(),
        buildingName: data.buildingName.trim() || undefined,
        floorsCount: Number(data.floorsCount),
      })
      reset()
      onClose()
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Չհաջողվեց ավելացնել ֆակուլտետը')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-faculty-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Building2 className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 id="create-faculty-title" className="text-base font-bold text-white">
                Նոր Ֆակուլտետի Ստեղծում
              </h2>
              <p className="text-xs text-blue-200">
                Մուտքագրեք տվյալները նոր ֆակուլտետի ավելացման համար
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition"
            aria-label="Փակել"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Ֆակուլտետի Անվանումը *
            </label>
            <input
              type="text"
              placeholder="Օրինակ՝ Իրավագիտության ֆակուլտետ"
              {...register('name', { required: 'Ֆակուլտետի անվանումը պարտադիր է' })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Մասնաշենք (Շենքի անվանում / համար)
            </label>
            <input
              type="text"
              placeholder="Օրինակ՝ Գլխավոր Մասնաշենք (կամ Մասնաշենք 4)"
              {...register('buildingName')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Հարկերի Քանակը (1-ից մինչև 9 հարկ)
            </label>
            <select
              {...register('floorsCount', { valueAsNumber: true })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <option key={num} value={num}>
                  {num} հարկ (ավտոմատ կգեներացվեն {num}01-{num}03 լսարաններ)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              Չեղարկել
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Պահպանվում է...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Ստեղծել Ֆակուլտետ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
