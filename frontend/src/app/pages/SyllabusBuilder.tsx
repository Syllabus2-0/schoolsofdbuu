import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  FileText, Upload, BrainCircuit, CheckCircle, ArrowRight,
  FileCheck, BookOpen, Settings, Loader2, Table
} from "lucide-react";

type Step = "upload" | "generating" | "verify" | "matrix";

interface COCLORow {
  id: string;
  type: "CO" | "CLO";
  code: string;
  description: string;
}

interface POPSODoc {
  _id: string;
  id?: string;
  type: string;
  fileName: string;
}

interface Assignment {
  _id: string;
  subjectId?: any; // populated subject
  programId?: any; // populated program
}

export default function SyllabusBuilder() {
  const { currentUser, token } = useAuth();
  const navigate = useNavigate();

  const [assignedSubjects, setAssignedSubjects] = useState<Assignment[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  
  const [step, setStep] = useState<Step>("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [outcomes, setOutcomes] = useState<COCLORow[]>([]);
  const [popsoDocs, setPopsoDocs] = useState<POPSODoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch Assignments
  useEffect(() => {
    if (!token || !currentUser) return;
    const fetchAssignments = async () => {
      try {
        const res = await fetch("/api/faculty-assignments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setAssignedSubjects(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [token, currentUser]);

  const selectedAssignment = assignedSubjects.find((a) => {
    const sid = typeof a.subjectId === "object" ? a.subjectId?._id : a.subjectId;
    return sid === selectedSubjectId;
  });
  const selectedSubject = selectedAssignment?.subjectId;
  const selectedProgram = selectedSubject?.programId;

  // 2. Fetch PO/PSO for selected subject
  useEffect(() => {
    if (!token || !selectedSubject) {
      setPopsoDocs([]);
      return;
    }
    const fetchDocs = async () => {
      try {
        const dObj = selectedProgram?.departmentId || selectedSubject?.departmentId;
        const deptId = dObj?._id || dObj;
        if (!deptId) return;
        const res = await fetch(`/api/popso?departmentId=${deptId.toString()}&yearOrder=${selectedSubject.yearOrder || 1}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setPopsoDocs(await res.json());
      } catch (err) {
        console.error("Error fetching PO/PSO", err);
      }
    };
    fetchDocs();
  }, [selectedSubject, token]);

  useEffect(() => {
    if (step === "generating") {
      const timer = setTimeout(() => {
        setOutcomes([
          { id: "1", type: "CO", code: "CO 1.", description: "Understand cloud computing models, architectures, and performance aspects for scalable system design." },
          { id: "2", type: "CO", code: "CO 2.", description: "Analyze virtualization and container technologies for efficient resource management." },
          { id: "3", type: "CO", code: "CO 3.", description: "Analyze cloud architecture and data center design for scalable operations." },
          { id: "4", type: "CO", code: "CO 4.", description: "Evaluate cloud service performance using QoS metrics and SLAs." },
          { id: "5", type: "CO", code: "CO 5.", description: "Analyze advanced cloud architectures representing emerging technologies." },
          { id: "6", type: "CLO", code: "CLO 1.", description: "Apply cloud computing concepts and service models to analyze scalable applications." },
          { id: "7", type: "CLO", code: "CLO 2.", description: "Apply virtualization concepts to design scalable applications using Docker." },
        ]);
        setStep("verify");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const updateOutcome = (id: string, newDesc: string) => {
    setOutcomes((prev) => prev.map((o) => (o.id === id ? { ...o, description: newDesc } : o)));
  };

  const handleSubmitDraft = async () => {
    if (!selectedSubject) return;
    try {
      setError(null);
      
      const closParams = outcomes.filter(o => o.type === "CLO").map(o => ({ code: o.code, desc: o.description }));
      const cosParams = outcomes.filter(o => o.type === "CO").map(o => ({ code: o.code, desc: o.description }));
      
      const mockMatrix = cosParams.map((co, i) => ({
        co: co.code,
        po: ['2', '1', i%2===0?'2':'', '1', '1', '', '', '', '', '', '', ''],
        pso: ['2', '', '1']
      }));

      const res = await fetch("/api/syllabi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          programId: selectedProgram?._id || selectedSubject.programId,
          subjectId: selectedSubject._id,
          courseDetails: {
            title: selectedSubject.name || "Cloud Computing",
            level: "Undergraduate",
            credits: "3", category: "PC", prerequisite: "Nil", corequisite: "Nil", nature: "Theory",
            L: "3", T: "0", P: "0", C: "3"
          },
          clos: closParams,
          cos: cosParams,
          units: [
            { title: 'Unit I: Core', desc: 'Auto generated module content 1' },
            { title: 'Unit II: Advanced', desc: 'Auto generated module content 2' }
          ],
          references: ['Textbook A', 'Textbook B'],
          matrix: mockMatrix
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create draft");
      
      navigate(`/syllabus/review/${data._id}`);
    } catch (err: any) {
      setError(err.message || "Submission failed");
    }
  };

  if (!currentUser || currentUser.role !== "Faculty") {
    return <div className="p-8">Access denied</div>;
  }

  if (loading) return <div className="p-8 flex items-center gap-3"><Loader2 className="animate-spin text-indigo-600" /> Loading assignments...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Syllabus AI Builder</h1>
        <p className="text-slate-600">Select an assigned subject and use AI to generate the syllabus draft.</p>
      </div>

      {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-sm">
        <label htmlFor="subject-select" className="block text-sm font-medium text-slate-700 mb-2">Select Your Assigned Subject</label>
        <select
          id="subject-select"
          title="Select Your Assigned Subject"
          value={selectedSubjectId}
          onChange={(e) => { setSelectedSubjectId(e.target.value); setStep("upload"); setUploadedFile(null); setOutcomes([]); setPopsoDocs([]); }}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Choose a subject...</option>
          {assignedSubjects.map((asn) => {
            const sid = typeof asn.subjectId === "object" ? asn.subjectId?._id : asn.subjectId;
            const sname = typeof asn.subjectId === "object" ? asn.subjectId?.name : "Unknown Subject";
            const pname = typeof asn.programId === "object" ? asn.programId?.name : "";
            return <option key={asn._id} value={sid}>{sname} {pname ? `— ${pname}` : ""}</option>;
          })}
        </select>
        {assignedSubjects.length === 0 && <p className="text-sm text-slate-500 mt-2">No subjects assigned.</p>}
      </div>

      {selectedSubject && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {step === "upload" && (
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
                    <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.doc,.docx" aria-label="Upload file" />
                    <button onClick={() => fileInputRef.current?.click()} className="px-6 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors">Browse Files</button>
                  </div>
                ) : (
                  <div className="text-center p-8 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">File Selected</h3>
                    <p className="text-slate-600 mb-8">{uploadedFile.name}</p>
                    <button onClick={() => setStep("generating")} className="flex justify-center items-center gap-2 w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90">
                      <BrainCircuit className="w-5 h-5" />
                      Create CO & CLO using AI
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === "generating" && (
              <div className="bg-white rounded-xl border border-slate-200 p-12 shadow-sm text-center">
                <Loader2 className="w-12 h-12 text-indigo-600 mx-auto mb-6 animate-spin" />
                <h2 className="text-xl font-semibold text-slate-900 mb-2">AI is Analyzing the Syllabus...</h2>
                <p className="text-slate-500">Extracting and generating Outcomes.</p>
              </div>
            )}

            {step === "verify" && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold">Verify Generated Outcomes</h2>
                </div>
                <div className="p-8 space-y-6">
                  {outcomes.map(item => (
                    <div key={item.id} className="flex flex-col mb-4">
                      <span className="font-bold text-slate-900">{item.code}</span>
                      <textarea value={item.description} onChange={e => updateOutcome(item.id, e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded" rows={2} />
                    </div>
                  ))}
                </div>
                <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end">
                  <button onClick={() => setStep("matrix")} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg"><Table className="w-4 h-4"/> Create Matrix</button>
                </div>
              </div>
            )}

            {step === "matrix" && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3"><Table className="w-5 h-5 text-indigo-600" /><h2 className="text-lg font-semibold">CO-PO Alignment Matrix Generated</h2></div>
                </div>
                <div className="p-8">
                  <div className="bg-indigo-50 text-indigo-900 p-4 rounded mb-6">
                    Mocks correlation completed based on HOD PO/PSO directives. Proceed to finalize drafting.
                  </div>
                </div>
                <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end">
                  <button onClick={handleSubmitDraft} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">
                    <ArrowRight className="w-5 h-5" /> Submit Draft
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-6 shadow-sm text-white">
              <div className="flex items-center gap-2 mb-4 text-indigo-200"><Settings className="w-5 h-5" /><h3 className="font-semibold text-sm">HOD Directives</h3></div>
              {popsoDocs.length > 0 ? (
                <div className="space-y-3">
                  {popsoDocs.map(doc => (
                    <div key={doc._id || doc.id} className="bg-white/10 rounded-lg p-3 flex items-start gap-3 border border-white/20">
                      <FileCheck className="w-5 h-5 text-indigo-300 shrink-0" />
                      <div>
                        <div className="font-medium text-sm">{doc.type} Document</div>
                        <div className="text-indigo-200 text-xs truncate max-w-[200px]">{doc.fileName}</div>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-indigo-200 mt-4 leading-relaxed">These definitions act as the baseline reference for the AI.</p>
                </div>
              ) : (
                <div className="bg-white/5 rounded-lg p-4"><p className="text-sm text-indigo-200">No PO/PSO documents uploaded.</p></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
