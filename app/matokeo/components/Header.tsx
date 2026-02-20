'use client';

import { useState } from 'react';

interface GradeRange {
  grade: string;
  min: number;
  max: number;
  label: string;
}

interface HeaderProps {
  class: string;
  subject: string;
  teacher?: string;
  gradeSystem: GradeRange[];
  onChangeGradeSystem: (system: GradeRange[]) => void;
}

export function Header({
  class: className,
  subject,
  teacher,
  gradeSystem,
  onChangeGradeSystem,
}: HeaderProps) {

  const [showGrades, setShowGrades] = useState(false);

  const updateGrade = (
    index: number,
    field: keyof GradeRange,
    value: string | number
  ) => {
    const updated = [...gradeSystem];
    updated[index] = {
      ...updated[index],
      [field]: field === 'min' || field === 'max'
        ? Number(value)
        : value,
    };
    onChangeGradeSystem(updated);
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-b-3xl space-y-4">

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold">📊 Ongeza Matokeo</h1>
        <p className="text-blue-100">
          {className} • {subject}
        </p>
        {teacher && (
          <p className="text-sm text-blue-200">
            Mwalimu: {teacher}
          </p>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setShowGrades(!showGrades)}
        className="bg-white/20 hover:bg-white/30 transition px-4 py-2 rounded-xl text-sm font-medium"
      >
        🎓 {showGrades ? 'Funga Grading System' : 'Edit Grading System'}
      </button>

      {/* Editable Grading System */}
      {showGrades && (
        <div className="bg-white text-gray-800 rounded-2xl p-5 space-y-4 shadow-lg">

          <div className="grid grid-cols-4 text-xs font-semibold text-gray-500">
            <span>Grade</span>
            <span>Min</span>
            <span>Max</span>
            <span>Description</span>
          </div>

          {gradeSystem.map((g, index) => (
            <div
              key={index}
              className="grid grid-cols-4 gap-3 items-center"
            >
              <input
                type="text"
                value={g.grade}
                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) =>
                  updateGrade(index, 'grade', e.target.value)
                }
              />

              <input
                type="number"
                value={g.min}
                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) =>
                  updateGrade(index, 'min', e.target.value)
                }
              />

              <input
                type="number"
                value={g.max}
                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) =>
                  updateGrade(index, 'max', e.target.value)
                }
              />

              <input
                type="text"
                value={g.label}
                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) =>
                  updateGrade(index, 'label', e.target.value)
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}