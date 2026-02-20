'use client';

import { useState, useEffect } from 'react';
import { StudentCard } from './components/StudentCard';
import { Header } from './components/Header';
import { SuccessScreen } from './components/SuccessScreen';



interface Student {
  id: string;
  name: string;
  marks: number | '';
}

interface ClassInfo {
  class: string;
  subject: string;
  teacher?: string;
}

type PageState = 'loading' | 'form' | 'success' | 'error';

export default function AddResultsPage() {
  const [pageState, setPageState] = useState<PageState>('loading');
  const [token, setToken] = useState<string>('');
  const [classInfo, setClassInfo] = useState<ClassInfo>({
    class: '',
    subject: '',
  });
  const [students, setStudents] = useState<Student[]>([
    { id: '1', name: '', marks: '' },
  ]);
  const [error, setError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [viewResults, setViewResults] = useState(false);
  const [sortOption, setSortOption] = useState('highest');

  // Validate token from URL on mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('token');

        if (!urlToken) {
          setError('Token ya kozi imepotea. Tafadhali jaribu tena.');
          setPageState('error');
          return;
        }

        setToken(urlToken);

        // Validate token with backend
        const response = await fetch('/api/validate-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: urlToken }),
        });

        if (!response.ok) {
          setError('Token si sahihi au imepoteza muda. Tafadhali jaribu tena.');
          setPageState('error');
          return;
        }

        const data = await response.json();
        setClassInfo({
          class: data.class,
          subject: data.subject,
          teacher: data.teacher,
        });

        // Load saved data from localStorage if exists
        const savedData = localStorage.getItem(`matokeo_${urlToken}`);
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            setStudents(parsed);
          } catch (e) {
            console.error('Failed to parse saved data:', e);
          }
        }

        setPageState('form');
      } catch (err) {
        console.error('Token validation error:', err);
        setError('Kuna tatizo la mtandao. Tafadhali jaribu tena.');
        setPageState('error');
      }
    };

    validateToken();
  }, []);

  // Autosave to localStorage
  useEffect(() => {
    if (!token || pageState !== 'form') return;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(`matokeo_${token}`, JSON.stringify(students));
        setIsSaving(true);
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 2000);
      } catch (err) {
        console.error('Failed to save data:', err);
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [students, token, pageState]);

  const handleAddStudent = () => {
    const newStudent: Student = {
      id: Date.now().toString(),
      name: '',
      marks: '',
    };
    setStudents(prev => [...prev, newStudent]);
  };

  const handleUpdateStudent = (id: string, field: keyof Student, value: any) => {
    setStudents(
      students.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleRemoveStudent = (id: string) => {
    if (students.length > 1) {
      setStudents(students.filter((s) => s.id !== id));
    }
  };

  const sortedStudents = [...students]
    .filter(s => s.marks !== '')
    .sort((a, b) => {
      const markA = Number(a.marks);
      const markB = Number(b.marks);

      if (sortOption === 'highest') return markB - markA;
      if (sortOption === 'lowest') return markA - markB;
      if (sortOption === 'az') return a.name.localeCompare(b.name);
      return 0;
    });

  const exportToExcel = (data: Student[]) => {
    const csv = [
      ['#', 'Jina', 'Alama', 'Grade', 'Description'] // added grade columns
    ].concat(
      data.map((s, i) => {
        const marks = Number(s.marks);
        const gradeObj = gradeSystem.find(
          (g) => marks >= g.min && marks <= g.max
        );
        const grade = gradeObj ? gradeObj.grade : 'N/A';
        const label = gradeObj ? gradeObj.label : '';
        return [String(i + 1), s.name, String(s.marks), grade, label];
      })
    )
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'matokeo.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const defaultGradingSystem = [
    { grade: 'A', min: 75, max: 100, label: 'Excellent' },
    { grade: 'B', min: 65, max: 74, label: 'Very Good' },
    { grade: 'C', min: 45, max: 64, label: 'Good' },
    { grade: 'D', min: 30, max: 44, label: 'Satisfactory' },
    { grade: 'F', min: 0, max: 29, label: 'Fail' },
  ];

  const [gradeSystem, setGradeSystem] = useState(defaultGradingSystem);

  const validateForm = (): boolean => {
    for (const student of students) {
      if (!student.name.trim()) {
        setError('Jina la mwanafunzi haliwezi kuwa tupu.');
        return false;
      }

      if (student.marks === '' || student.marks === null) {
        setError('Alama lazima ziwe na thamani.');
        return false;
      }

      const marksNum = Number(student.marks);
      if (isNaN(marksNum) || marksNum < 0 || marksNum > 100) {
        setError('Alama lazima ziwe kati ya 0 na 100.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/submit-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          class: classInfo.class,
          subject: classInfo.subject,
          students,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit results');
      }

      const data = await response.json();
      localStorage.removeItem(`matokeo_${token}`);
      setPageState('success');
    } catch (err) {
      console.error('Submit error:', err);
      setError('Kupatikana tatizo wakati wa kutuma matokeo. Tafadhali jaribu tena.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl p-10 text-center border border-white/40">
          <div className="animate-spin h-14 w-14 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
          <p className="text-gray-700 text-lg font-medium tracking-wide">
            Inakagua taarifa...
          </p>
        </div>
      </div>
    );
  }


  if (pageState === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Kuna Tatizo</h1>
          <p className="text-gray-700 mb-6 max-w-sm">{error}</p>
          <button
            onClick={() => window.location.href = 'https://wa.me'}
            className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600"
          >
            🔙 Rudi WhatsApp
          </button>
        </div>
      </div>
    );
  }

  if (pageState === 'success') {
    return <SuccessScreen token={token} />;
  }
  const averageScore =
    students.filter(s => s.marks !== '').length > 0
      ? (
        students
          .filter(s => s.marks !== '')
          .reduce((sum, s) => sum + Number(s.marks), 0) /
        students.filter(s => s.marks !== '').length
      ).toFixed(1)
      : '0';
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-40">

      {/* Top Header Area */}
      <div className="sticky top-0 z-10 backdrop-blur-lg bg-white/70 border-b border-white/30 shadow-sm">
        <Header
          class={classInfo.class}
          subject={classInfo.subject}
          teacher={classInfo.teacher}
          gradeSystem={gradeSystem}
          onChangeGradeSystem={setGradeSystem}
        />
      </div>

      <main className="max-w-2xl mx-auto px-6 pt-8">

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl shadow-sm animate-fade-in">
            {error}
          </div>
        )}

        {/* Autosave Alert */}
        {savedMessage && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-sm text-center shadow-sm">
            💾 Data imehifadhiwa kiotomatiki
          </div>
        )}

        {/* Student Cards */}
        <div className="space-y-6">
          {students.map((student) => (
            <div
              key={student.id}
              className="bg-white shadow-xl rounded-3xl p-6 border border-gray-100 hover:shadow-2xl transition duration-300"
            >
              <StudentCard
                student={student}
                onUpdate={handleUpdateStudent}
                onRemove={handleRemoveStudent}
                canRemove={students.length > 1}
              />
            </div>
          ))}
        </div>

        {/* Add Student Button */}
        <button
          onClick={handleAddStudent}
          className="w-full py-4 rounded-3xl border border-[#dcdcdc] 
             bg-white text-[#111] font-medium 
             active:scale-[0.98] transition"
        >
          ➕ Ongeza Mwanafunzi
        </button>

      </main>

      {/* Floating Submit Section */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6">
        <div className="bg-white shadow-2xl rounded-3xl p-4 border border-gray-100">
          <button
            onClick={() => setViewResults(true)}
            className="w-full py-4 bg-black text-white rounded-full font-medium"
          >
            Tazama Matokeo
          </button>
        </div>
      </div>

      {/* Results View Modal */}
      {viewResults && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end justify-center z-50">

          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 space-y-6 animate-slide-up shadow-2xl">

            {/* Drag Handle */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto"></div>

            {/* Header */}
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-gray-800">
                Matokeo ya Wanafunzi
              </h2>
              <p className="text-sm text-gray-500">
                Jumla: {sortedStudents.length} • Average: {averageScore}%
              </p>
            </div>

            {/* Sort Options */}
            <div>
              <label className="text-sm font-semibold text-gray-800">
                Panga kwa:
              </label>

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="mt-2 w-full bg-white border border-gray-300 
               rounded-xl px-4 py-3 text-gray-900 font-medium
               focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="highest" className="text-gray-900">
                  Alama Juu → Chini
                </option>
                <option value="lowest" className="text-gray-900">
                  Alama Chini → Juu
                </option>
                <option value="az" className="text-gray-900">
                  A → Z
                </option>
              </select>
            </div>

            {/* Student List */}
            <div className="max-h-64 overflow-y-auto space-y-3">

              {sortedStudents.map((s, i) => {
                const marks = Number(s.marks);
                const gradeObj = gradeSystem.find(
                  (g) => marks >= g.min && marks <= g.max
                );
                const grade = gradeObj ? gradeObj.grade : 'N/A';
                const label = gradeObj ? gradeObj.label : '';

                return (
                  <div
                    key={s.id}
                    className="bg-gray-50 rounded-2xl p-4 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">
                        {i + 1}. {s.name}
                      </span>

                      <span className="text-base font-bold text-black">
                        {s.marks}% • {grade} ({label})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Export Section */}
            <div className="space-y-3 pt-2">

              <button
                onClick={() => exportToExcel(sortedStudents)}
                className="w-full py-3 bg-green-600 text-white 
                     rounded-full font-semibold 
                     active:scale-95 transition"
              >
                📊 Export Excel
              </button>

              <button
                onClick={() => window.print()}
                className="w-full py-3 bg-black text-white 
                     rounded-full font-semibold 
                     active:scale-95 transition"
              >
                🖨 Print PDF
              </button>

            </div>

            {/* Close */}
            <button
              onClick={() => setViewResults(false)}
              className="w-full py-3 text-gray-500 font-medium"
            >
              Close
            </button>

          </div>
        </div>
      )}
    </div>
  );

}
