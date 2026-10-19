import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export const EditCellModal = ({ cellData, onClose, onSave, onDelete }: any) => {
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    reset({
      subject: cellData.subject || '',
      professor: cellData.professor || '',
      room: cellData.room || ''
    });
  }, [cellData, reset]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-bold">
            {cellData.day} ({cellData.time}) - {cellData.stream}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">✕</button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Դասընթաց (Materia)</label>
            <input {...register('subject')} className="w-full p-2 border rounded" placeholder="Es. Միկրոէկոնոմիկա" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Դասախոս (Professore)</label>
            <input {...register('professor')} className="w-full p-2 border rounded" placeholder="Es. Պրոֆ. Ա. Սարգսյան" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Լսարան (Aula)</label>
            <input {...register('room')} className="w-full p-2 border rounded" placeholder="Es. 201" />
          </div>
          <div className="flex gap-2 pt-4 mt-4 border-t">
            <button type="button" onClick={onDelete} className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 flex-1">
              🗑️ Ջնջել (Elimina)
            </button>
            <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 flex-1">
              💾 Պահպանել (Salva)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};