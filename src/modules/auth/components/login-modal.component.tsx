import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Lock, ShieldAlert, KeyRound, Check, X, ShieldCheck } from 'lucide-react'
import { useAuth } from '../auth.context'
import { AUTH_CONSTANTS, AUTH_ROLES, type AuthRole } from '../auth.constants'

interface LoginFormInputs {
  password: string
  selectedRole?: AuthRole
}

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, quickSwitchRole, role } = useAuth()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      password: '',
    },
  })

  if (!isOpen) return null

  const onSubmit = async (data: LoginFormInputs) => {
    setErrorMessage(null)
    setIsSubmitting(true)
    try {
      await login({ password: data.password })
      reset()
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('Տեղի է ունեցել սխալ')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRoleQuickSelect = (targetRole: AuthRole) => {
    quickSwitchRole(targetRole)
    reset()
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-800 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs">
              <Lock className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <h2 id="login-dialog-title" className="text-lg font-bold text-white">
                Մուտք Համակարգ
              </h2>
              <p className="text-xs text-blue-200">
                Մուտքագրեք գաղտնաբառը կամ ընտրեք դերը
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Փակել պատուհանը"
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form managed via react-hook-form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
              >
                Ադմինիստրատորի Գաղտնաբառ
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Օրինակ՝ admin կամ superadmin"
                  {...register('password', {
                    required: 'Գաղտնաբառը պարտադիր է',
                  })}
                  className="w-full px-4 py-3 pl-11 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm text-slate-800 transition"
                />
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.password.message}</p>
              )}
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Ադմին: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">admin</code></span>
                <span>Սուպեր ադմին: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">superadmin</code></span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-medium text-sm shadow-md shadow-blue-700/20 transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Ստուգվում է...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Բացել Հասանելիությունը</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Role Switcher for seamless testing */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Արագ Փոխարկում (Role Quick Select)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleQuickSelect(AUTH_ROLES.VIEWER)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                  role === AUTH_ROLES.VIEWER
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span>Դիտորդ</span>
                <span className="text-[10px] text-slate-400 font-normal">Viewer</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickSelect(AUTH_ROLES.ADMIN)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                  role === AUTH_ROLES.ADMIN
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span>Ադմին</span>
                <span className="text-[10px] text-slate-400 font-normal">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickSelect(AUTH_ROLES.SUPER_ADMIN)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                  role === AUTH_ROLES.SUPER_ADMIN
                    ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span>Սուպեր</span>
                <span className="text-[10px] text-slate-400 font-normal">Super Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
