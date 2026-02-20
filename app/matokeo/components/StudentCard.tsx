'use client';

import { useState } from 'react';

interface Student {
  id: string;
  name: string;
  marks: number | '';
}

interface StudentCardProps {
  student: Student;
  index: number;
  grade: string | null; // ← receive from parent
  onUpdate: (id: string, field: keyof Student, value: any) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

export function StudentCard({
  student,
  index,
  grade,
  onUpdate,
  onRemove,
  canRemove,
}: StudentCardProps) {
  const [showDelete, setShowDelete] = useState(false);

  const handleMarksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '') {
      onUpdate(student.id, 'marks', '');
    } else {
      const num = parseInt(value, 10);
      if (!isNaN(num) && num >= 0 && num <= 100) {
        onUpdate(student.id, 'marks', num);
      }
    }
  };

  return (
    <div className="relative group transition-all duration-300">

      {/* Swipe Delete Background */}
      {canRemove && (
        <div className="absolute inset-0 flex justify-end items-center pr-4">
          <button
            onClick={() => onRemove(student.id)}
            className="bg-red-500 text-white px-4 py-2 rounded-xl shadow"
          >
            Futa
          </button>
        </div>
      )}

      {/* Main Card */}
      <div
        className={`bg-white rounded-3xl border border-gray-200 p-6 space-y-6 transition-transform duration-300 ${
          showDelete ? '-translate-x-20' : ''
        }`}
        onTouchStart={() => setShowDelete(true)}
        onMouseLeave={() => setShowDelete(false)}
      >

        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-700 text-sm">
            Mwanafunzi
             {/* #{index + 1} */}
          </h3>

          {grade && (
            <span className="text-white text-xs font-bold px-3 py-1 rounded-full bg-black">
              {grade}
            </span>
          )}
        </div>

        {/* Floating Name Input */}
        <div className="relative">
          <input
            type="text"
            value={student.name}
            onChange={(e) => onUpdate(student.id, 'name', e.target.value)}
            placeholder=" "
            className="peer w-full bg-gray-100 border border-gray-200
                       rounded-2xl px-4 pt-6 pb-2 text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-black transition"
          />
          <label
            className="absolute left-4 top-2 text-xs text-gray-600 transition-all
                       peer-placeholder-shown:top-4
                       peer-placeholder-shown:text-sm
                       peer-placeholder-shown:text-gray-400"
          >
            Jina la Mwanafunzi
          </label>
        </div>

        {/* Floating Marks Input */}
        <div className="relative">
          <input
            type="number"
            value={student.marks}
            onChange={handleMarksChange}
            placeholder=" "
            min="0"
            max="100"
            className="peer w-full bg-gray-100 border border-gray-200
                       rounded-2xl px-4 pt-6 pb-2 text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-black transition"
          />
          <label
            className="absolute left-4 top-2 text-xs text-gray-600 transition-all
                       peer-placeholder-shown:top-4
                       peer-placeholder-shown:text-sm
                       peer-placeholder-shown:text-gray-400"
          >
            Alama (0–100)
          </label>
        </div>

        {/* Progress Bar */}
        {student.marks !== '' && (
          <div className="space-y-1">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-500"
                style={{ width: `${student.marks}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 text-right">
              {student.marks}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}