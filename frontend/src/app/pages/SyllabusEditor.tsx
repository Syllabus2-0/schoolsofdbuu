import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import {
  getSubjectById,
  getProgramById,
  getDepartmentById,
  getFacultyAssignments,
  getPOPSODocuments,
} from '../data/universityData';
import {
  FileText,
  Upload,
  BrainCircuit,
  CheckCircle,
  ArrowRight,
  FileCheck,
  Save,
  BookOpen,
  Settings,
  ChevronRight,
  Loader2,
  Table,
} from 'lucide-react';

type Step = 'upload' | 'generating' | 'verify' | 'matrix';

interface COCLORow {
  id: string;
  type: 'CO' | 'CLO';
  code: string;
  description: string;
}

export default function SyllabusEditor() {
  const { subjectId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock Data States
  const [outcomes, setOutcomes] = useState<COCLORow[]>([]);

  useEffect(() => {
    // Generate some mock outcomes after upload transition
    if (step === 'generating') {
      const timer = setTimeout(() => {
        setOutcomes([
          { id: '1', type: 'CO', code: 'CO1', description: 'Understand the fundamental concepts of the subject.' },
          { id: '2', type: 'CO', code: 'CO2', description: 'Analyze complex problems using structured methodologies.' },
          { id: '3', type: 'CLO', code: 'CLO1', description: 'Apply theoretical knowledge to practical scenarios.' },
          { id: '4', type: 'CLO', code: 'CLO2', description: 'Design modern solutions considering ethical implications.' },
        ]);
        setStep('verify');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  if (!currentUser || currentUser.role !== 'Faculty') {
    return <div className="p-8">Access denied</div>;
  }

  // Load context data
  const assignments = getFacultyAssignments(currentUser.id);
  const assignment = assignments.find((a) => a.subjectId === subjectId);
  if (!assignment || !subjectId) {
    return <div className="p-8">Subject not found or you don't have access.</div>;
  }

  const subject = getSubjectById(subjectId);
  const program = subject ? getProgramById(subject.programId) : null;
  const dept = getDepartmentById(assignment.departmentId);

  // Get HOD documents for PO & PSO
  const popsoDocs = getPOPSODocuments(assignment.departmentId, subject?.yearOrder || 1);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const updateOutcome = (id: string, newDesc: string) => {
    setOutcomes((prev) => prev.map((o) => (o.id === id ? { ...o, description: newDesc } : o)));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header Info */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/syllabus/new')}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-4 inline-flex items-center gap-1"
        >
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to Subject Selection
        </button>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Syllabus Editor</h1>
        {subject && program && (
          <div className="mt-4 p-4 bg-white border border-slate-200 rounded-xl flex gap-6 text-sm shadow-sm flex-wrap items-center">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">Subject:</span>
              <span className="font-semibold text-slate-900">{subject.name}</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Program:</span>
              <span className="font-medium text-slate-900">{program.name}</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Year:</span>
              <span className="font-medium text-slate-900">{subject.yearLabel}</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Department:</span>
              <span className="font-medium text-slate-900">{dept?.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Workspace */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: Upload */}
          {step === 'upload' && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Upload Syllabus Content</h2>
                  <p className="text-slate-500 text-sm">Upload a document to automatically generate CO and CLO</p>
                </div>
              </div>

              {!uploadedFile ? (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-slate-50 transition-colors">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">Drag and drop your syllabus file here, or click to browse</p>
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx"
                  />
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Browse Files
                    </button>
                    <button className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                      Enter Manually
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">File Selected</h3>
                  <p className="text-slate-600 mb-8">{uploadedFile.name}</p>

                  <button
                    onClick={() => setStep('generating')}
                    className="flex justify-center items-center gap-2 w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <BrainCircuit className="w-5 h-5" />
                    Create CO & CLO using AI
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Generating */}
          {step === 'generating' && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 shadow-sm text-center">
              <Loader2 className="w-12 h-12 text-indigo-600 mx-auto mb-6 animate-spin" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">AI is Analyzing the Syllabus...</h2>
              <p className="text-slate-500">Extracting and generating Course Outcomes & Learning Outcomes.</p>
            </div>
          )}

          {/* STEP 3: Verify */}
          {step === 'verify' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Verify Generated Outcomes</h2>
                    <p className="text-slate-500 text-sm">Review manually edit the AI generated data below.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-3 px-4 text-sm font-semibold text-slate-900">Type</th>
                      <th className="py-3 px-4 text-sm font-semibold text-slate-900">Code</th>
                      <th className="py-3 px-4 text-sm font-semibold text-slate-900 w-full">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outcomes.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 group">
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded-md font-medium text-xs ${item.type === 'CO' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-900 whitespace-nowrap">
                          {item.code}
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateOutcome(item.id, e.target.value)}
                            className="w-full bg-transparent border-transparent px-2 py-1.5 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 rounded-md transition-all text-sm text-slate-700"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-4">
                <button
                  onClick={() => setStep('matrix')}
                  className="flex justify-center items-center gap-2 px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <Table className="w-4 h-4 ml-1" />
                  Create CO-PO Matrix
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Matrix */}
          {step === 'matrix' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <Table className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">CO-PO Alignment Matrix</h2>
                    <p className="text-slate-500 text-sm">Generated mapped correlation based on HOD criteria.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-x-auto">
                 <table className="w-full text-center border-collapse border border-slate-200">
                   <thead>
                     <tr className="bg-slate-50 print:bg-slate-100">
                       <th className="border border-slate-200 p-3 text-sm font-semibold text-slate-900">CO Code</th>
                       {/* Mock PO Columns */}
                       {[1, 2, 3, 4, 5, 6].map(po => (
                          <th key={`po${po}`} className="border border-slate-200 p-3 text-xs font-semibold text-slate-600">PO{po}</th>
                       ))}
                       {/* Mock PSO Columns */}
                       {[1, 2].map(pso => (
                          <th key={`pso${pso}`} className="border border-slate-200 p-3 text-xs font-semibold text-slate-600">PSO{pso}</th>
                       ))}
                     </tr>
                   </thead>
                   <tbody>
                      {outcomes.filter(o => o.type === 'CO').map(co => (
                        <tr key={co.id}>
                          <td className="border border-slate-200 p-2 text-sm font-medium text-slate-900">{co.code}</td>
                          {[1, 2, 3, 4, 5, 6].map(po => (
                            <td key={`v-po${po}`} className="border border-slate-200 p-2 text-sm text-slate-600">{Math.floor(Math.random() * 3) + 1}</td>
                          ))}
                          {[1, 2].map(pso => (
                            <td key={`v-pso${pso}`} className="border border-slate-200 p-2 text-sm text-slate-600">{Math.floor(Math.random() * 3) + 1}</td>
                          ))}
                        </tr>
                      ))}
                   </tbody>
                 </table>
              </div>

              <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-4">
                 <button
                   onClick={() => navigate('/')}
                   className="flex justify-center items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                 >
                   <Save className="w-5 h-5" />
                   Submit Final Syllabus
                 </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: HOD Context */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-6 shadow-sm text-white">
            <div className="flex items-center gap-2 mb-4 text-indigo-200">
              <Settings className="w-5 h-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">HOD Directives</h3>
            </div>
            
            {popsoDocs.length > 0 ? (
               <div className="space-y-3">
                 {popsoDocs.map((doc) => (
                   <div key={doc.id} className="bg-white/10 rounded-lg p-3 flex items-start gap-3 border border-white/20">
                     <FileCheck className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" />
                     <div>
                       <div className="text-white font-medium text-sm">{doc.type} Document</div>
                       <div className="text-indigo-200 text-xs truncate max-w-[200px]" title={doc.fileName}>{doc.fileName}</div>
                     </div>
                   </div>
                 ))}
                 <p className="text-xs text-indigo-200 mt-4 leading-relaxed">
                   These definitions act as the baseline reference when generating the CO-PO matrix in Step 4.
                 </p>
               </div>
            ) : (
               <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                 <p className="text-sm text-indigo-200">No PO or PSO documents have been uploaded by the HOD for this program year.</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
