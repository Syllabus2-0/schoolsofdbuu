import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, MessageSquare, ArrowLeft } from 'lucide-react';

export default function SyllabusReview() {
  const { syllabusId } = useParams();
  const { currentUser, token } = useAuth();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Local state for editable course content
  const [courseDetails, setCourseDetails] = useState({
    title: '', level: '', credits: '', category: '',
    prerequisite: '', corequisite: '', nature: '',
    L: '', T: '', P: '', C: ''
  });
  const [clos, setClos] = useState<any[]>([]);
  const [cos, setCos] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [references, setReferences] = useState<any[]>([]);
  const [matrix, setMatrix] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    if (!syllabusId || !token) {
      setLoading(false);
      return;
    }
    const fetchSyllabus = async () => {
      try {
        const res = await fetch(`/api/syllabi/${syllabusId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.courseDetails) setCourseDetails(data.courseDetails);
          if (data.clos) setClos(data.clos);
          if (data.cos) setCos(data.cos);
          if (data.units) setUnits(data.units);
          if (data.references) setReferences(data.references);
          if (data.matrix) setMatrix(data.matrix);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSyllabus();
  }, [syllabusId, token]);

  if (!currentUser) return null;

  const isFaculty = currentUser.role === 'Faculty';
  const isAuthority = currentUser.role === 'HOD' || currentUser.role === 'Dean' || currentUser.role === 'SuperAdmin';
  // Check if actually dean or super admin. 
  // HOD -> Dean -> SuperAdmin -> Published

  const handleApprove = async () => {
    if (isAuthority && syllabusId && token) {
      try {
        setError(null);
        const res = await fetch(`/api/syllabi/${syllabusId}/approve`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Approval failed');
        }
        navigate('/approvals');
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Approval failed');
      }
    }
  };

  const handleReject = async () => {
    if (isAuthority && syllabusId && commentText && token) {
      try {
        setError(null);
        const res = await fetch(`/api/syllabi/${syllabusId}/reject`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ comment: commentText })
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Rejection failed');
        }
        navigate('/approvals');
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Rejection failed');
      }
    }
  };

  const handleSubmitSyllabus = async () => {
    if (!isFaculty || !syllabusId || !token) return;

    try {
      setError(null);
      // Ensure we save the fields back to draft first
      await fetch(`/api/syllabi/${syllabusId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ courseDetails, clos, cos, units, references, matrix })
      });

      const res = await fetch(`/api/syllabi/${syllabusId}/submit`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Submit failed');
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Submit failed');
    }
  };

  // Helper styles for transparent inputs
  const inputStyles = "bg-transparent border-0 outline-none w-full text-inherit font-inherit ring-0 focus:ring-1 focus:ring-yellow-500/50 rounded-sm hover:bg-white/5 transition-colors p-1";

  return (
    <div className="min-h-screen bg-[#222] p-8 text-white relative">
      <div className="max-w-5xl mx-auto space-y-12 pb-32">

        {/* Header Back Button */}
        <button
          onClick={() => {
            if (isFaculty) {
              navigate('/syllabus/new');
            } else {
              navigate(-1);
            }
          }}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* 1. Course Details Section */}
        <div>
          <div className="grid grid-cols-2 mb-8 border border-[#444]">
            <div className="bg-[#964B00] border-r border-[#444] p-4 flex items-center">
              <input
                title="Course Title"
                value={courseDetails.title}
                onChange={e => setCourseDetails({ ...courseDetails, title: e.target.value })}
                className={`font-bold text-xl text-white ${inputStyles}`}
              />
            </div>
            <div className="grid grid-cols-4 bg-[#964B00]">
              <div className="flex items-center justify-center font-bold border-r border-[#444] p-3 text-white">L</div>
              <div className="flex items-center justify-center font-bold border-r border-[#444] p-3 text-white">T</div>
              <div className="flex items-center justify-center font-bold border-r border-[#444] p-3 text-white">P</div>
              <div className="flex items-center justify-center font-bold p-3 text-white">C</div>
            </div>

            {/* Dynamic rows for L T P C */}
            <div className="bg-[#804000] border-r-4 border-[#222] p-3"></div>
            <div className="grid grid-cols-4 bg-[#804000]">
              <div className="flex items-center justify-center border-r border-[#444] p-3">
                <input title="L (Lecture) value" value={courseDetails.L} onChange={e => setCourseDetails({ ...courseDetails, L: e.target.value })} className={`font-bold text-center text-white ${inputStyles}`} />
              </div>
              <div className="flex items-center justify-center border-r border-[#444] p-3">
                <input title="T (Tutorial) value" value={courseDetails.T} onChange={e => setCourseDetails({ ...courseDetails, T: e.target.value })} className={`font-bold text-center text-white ${inputStyles}`} />
              </div>
              <div className="flex items-center justify-center border-r border-[#444] p-3">
                <input title="P (Practical) value" value={courseDetails.P} onChange={e => setCourseDetails({ ...courseDetails, P: e.target.value })} className={`font-bold text-center text-white ${inputStyles}`} />
              </div>
              <div className="flex items-center justify-center p-3">
                <input title="C (Credits) value" value={courseDetails.C} onChange={e => setCourseDetails({ ...courseDetails, C: e.target.value })} className={`font-bold text-center text-white ${inputStyles}`} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { key: 'title', label: 'Course Title' },
              { key: 'level', label: 'Level' },
              { key: 'credits', label: 'Credits' },
              { key: 'category', label: 'Course Category' },
              { key: 'prerequisite', label: 'Course Prerequisite' },
              { key: 'corequisite', label: 'Course Co-requisite' },
              { key: 'nature', label: 'Course Nature' },
            ].map((row, idx) => (
              <div key={idx} className="flex border-b border-[#333] pb-3">
                <div className="w-1/3 text-slate-300 font-medium pt-1">{row.label}</div>
                <div className="w-2/3">
                  <input
                    title={row.label}
                    value={(courseDetails as Record<string, string>)[row.key]}
                    onChange={e => setCourseDetails({ ...courseDetails, [row.key]: e.target.value })}
                    className={`text-white font-semibold ${inputStyles}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. CO and CLO Sections */}
        <div className="bg-[#282828] border border-white/10 p-8 space-y-12">
          <div className="w-full">
            <div className="bg-[#FFBC00] px-6 py-3 flex items-center mb-2">
              <h3 className="font-bold text-white text-lg">Outcome Related Course Learning Objectives:</h3>
            </div>
            <div className="flex flex-col border border-t-0 border-[#3a3a3a]">
              {clos.map((item, i) => (
                <div key={i} className="flex border-t border-[#3a3a3a] py-4">
                  <div className="px-6 w-32 shrink-0 flex items-start text-white">
                    <input
                      title="CLO Code"
                      value={item.code}
                      onChange={(e) => {
                        const newArr = [...clos]; newArr[i].code = e.target.value; setClos(newArr);
                      }}
                      className={`font-bold text-base ${inputStyles}`}
                    />
                  </div>
                  <div className="px-4 flex-1 text-white">
                    <textarea
                      title="CLO Description"
                      value={item.desc}
                      onChange={(e) => {
                        const newArr = [...clos]; newArr[i].desc = e.target.value; setClos(newArr);
                      }}
                      rows={2}
                      className={`text-base leading-relaxed ${inputStyles} resize-y overflow-auto`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full">
            <div className="bg-[#FFBC00] px-6 py-3 flex items-center mb-2">
              <h3 className="font-bold text-white text-lg">Course Outcome: At the end of the course, student will be able to</h3>
            </div>
            <div className="flex flex-col border border-t-0 border-[#3a3a3a]">
              {cos.map((item, i) => (
                <div key={i} className="flex border-t border-[#3a3a3a] py-4">
                  <div className="px-6 w-32 shrink-0 flex items-start text-white">
                    <input
                      title="CO Code"
                      value={item.code}
                      onChange={(e) => {
                        const newArr = [...cos]; newArr[i].code = e.target.value; setCos(newArr);
                      }}
                      className={`font-bold text-base ${inputStyles}`}
                    />
                  </div>
                  <div className="px-4 flex-1 text-white">
                    <textarea
                      title="CO Description"
                      value={item.desc}
                      onChange={(e) => {
                        const newArr = [...cos]; newArr[i].desc = e.target.value; setCos(newArr);
                      }}
                      rows={2}
                      className={`text-base leading-relaxed ${inputStyles} resize-y overflow-auto`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Uploaded Syllabus Mock */}
        <div className="bg-[#282828] border border-white/10 p-8 space-y-6">
          <h3 className="text-xl font-bold border-b border-[#444] pb-4">Detailed Syllabus Content</h3>
          <div className="space-y-6 pt-2">
            {units.map((unit, i) => (
              <div key={i} className="group transition-opacity">
                <input
                  title="Unit Title"
                  value={unit.title}
                  onChange={e => {
                    const newU = [...units]; newU[i].title = e.target.value; setUnits(newU);
                  }}
                  className={`text-[#FFBC00] font-semibold mb-1 text-lg ${inputStyles}`}
                />
                <textarea
                  title="Unit Description"
                  value={unit.desc}
                  onChange={e => {
                    const newU = [...units]; newU[i].desc = e.target.value; setUnits(newU);
                  }}
                  rows={3}
                  className={`text-base text-slate-300 leading-relaxed ${inputStyles} resize-y overflow-auto`}
                />
              </div>
            ))}

            <div>
              <h4 className="text-white font-semibold mt-8 mb-2 px-1">Core References:</h4>
              <ul className="space-y-2">
                {references.map((refString, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-slate-300 mr-2 mt-1">•</span>
                    <input
                      title="Reference text"
                      value={refString}
                      onChange={e => {
                        const newR = [...references]; newR[i] = e.target.value; setReferences(newR);
                      }}
                      className={`text-sm text-slate-300 ${inputStyles}`}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 4. Matrix Block */}
        <div className="p-8 bg-[#282828] border border-white/10 overflow-x-auto text-white">
          <div className="border border-white/20">
            <div className="bg-[#964B00] p-3 border-b border-white/20">
              <h3 className="font-bold text-white text-lg">Course Evaluation Matrix</h3>
            </div>

            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-[#282828]">
                  <th className="border border-white/20 p-2 font-semibold text-xs border-t-0">S<br />N</th>
                  <th className="border border-white/20 p-3 font-semibold text-sm border-t-0">Course<br />Outcome</th>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(po => (
                    <th key={`po${po}`} className="border border-white/20 p-2 font-semibold text-sm border-t-0">
                      <div className="flex flex-col items-center leading-tight">
                        <span>P</span>
                        <span>O</span>
                        <span>{po}</span>
                      </div>
                    </th>
                  ))}
                  {[1, 2, 3].map(pso => (
                    <th key={`pso${pso}`} className="border border-white/20 p-2 font-semibold text-sm border-t-0">
                      <div className="flex flex-col items-center leading-tight">
                        <span>P</span>
                        <span>S</span>
                        <span>O</span>
                        <span className="mt-1">{pso}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, index) => (
                  <tr key={index} className="hover:bg-white/5 transition-colors">
                    <td className="border border-white/20 p-3 text-sm font-semibold">{index + 1}</td>
                    <td className="border border-white/20 p-3 w-28">
                      <input
                        title="Course Outcome Code"
                        value={row.co}
                        onChange={e => {
                          const arr = [...matrix]; arr[index].co = e.target.value; setMatrix(arr);
                        }}
                        className={`text-sm font-semibold text-center ${inputStyles}`}
                      />
                    </td>
                    {row.po.map((val, i) => (
                      <td key={`v-po${i}`} className="border border-white/20 p-1">
                        <input
                          title={`PO${i + 1} mapping value`}
                          value={val}
                          onChange={e => {
                            const arr = [...matrix]; arr[index].po[i] = e.target.value; setMatrix(arr);
                          }}
                          className={`text-sm text-center w-full ${inputStyles}`}
                        />
                      </td>
                    ))}
                    {row.pso.map((val, i) => (
                      <td key={`v-pso${i}`} className="border border-white/20 p-1">
                        <input
                          title={`PSO${i + 1} mapping value`}
                          value={val}
                          onChange={e => {
                            const arr = [...matrix]; arr[index].pso[i] = e.target.value; setMatrix(arr);
                          }}
                          className={`text-sm text-center w-full ${inputStyles}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between mt-8 text-sm font-semibold text-white px-4">
            <span>1 = Objective addressed slightly</span>
            <span>2= Moderately addressed</span>
            <span>3= Strongly addressed</span>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#151515] border-t border-[#333] p-6 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {isFaculty && (
            <div className="w-full flex justify-end">
              <button
                onClick={handleSubmitSyllabus}
                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow hover:bg-emerald-700 transition"
              >
                <CheckCircle className="w-5 h-5" />
                Confirm & Submit Final Syllabus
              </button>
            </div>
          )}
          {isAuthority && (
            <div className="w-full flex items-center gap-4">
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1 max-w-xl">
                  <MessageSquare className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    title="Required comment for rejection"
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add required comment to reject..."
                    className="w-full pl-10 pr-4 py-3 bg-[#333] border border-[#555] rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all"
                  />
                </div>
              </div>
              <button
                onClick={handleApprove}
                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow hover:bg-emerald-700 transition"
              >
                <CheckCircle className="w-5 h-5" />
                Approve Syllabus
              </button>
              <button
                onClick={handleReject}
                disabled={!commentText}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow hover:bg-red-700 disabled:opacity-50 transition"
              >
                <XCircle className="w-5 h-5" />
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
