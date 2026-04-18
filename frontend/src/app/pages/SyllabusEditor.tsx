import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  FileText,
  Upload,
  BrainCircuit,
  CheckCircle,
  ArrowRight,
  FileCheck,
  BookOpen,
  Settings,
  ChevronRight,
  Loader2,
  Table,
} from "lucide-react";

type Step = "upload" | "generating" | "verify" | "matrix";

interface COCLORow {
  id: string;
  type: "CO" | "CLO";
  code: string;
  description: string;
}

interface Subject {
  _id: string;
  name: string;
  yearLabel: string;
  yearOrder: number;
  programId: string | { _id: string; name: string };
  departmentId: string | { _id: string; name: string };
}

interface Program {
  _id: string;
  name: string;
}

interface Department {
  _id: string;
  name: string;
}

interface Assignment {
  _id: string;
  subjectId: string | { _id: string };
  departmentId: string;
}

interface POPSODoc {
  _id: string;
  id?: string;
  type: string;
  fileName: string;
}

export default function SyllabusEditor() {
  const { subjectId } = useParams();
  const { currentUser, token } = useAuth();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const initialStep = (searchParams.get("step") as Step) || "upload";
  const [step, setStep] = useState<Step>(initialStep);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data States
  const [outcomes, setOutcomes] = useState<COCLORow[]>([]);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [dept, setDept] = useState<Department | null>(null);
  const [popsoDocs, setPopsoDocs] = useState<POPSODoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !subjectId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const auth = { Authorization: `Bearer ${token}` };

        // 1. Fetch Subject
        const subRes = await fetch(`/api/subjects/${subjectId}`, {
          headers: auth,
        });
        if (!subRes.ok) throw new Error("Subject not found");
        const subData = await subRes.json();
        setSubject(subData);

        // 2. Fetch Program (if populated as ID)
        const progId =
          typeof subData.programId === "object"
            ? subData.programId._id
            : subData.programId;
        const progRes = await fetch(`/api/programs/${progId}`, {
          headers: auth,
        });
        if (progRes.ok) setProgram(await progRes.json());

        // 3. Fetch Department (if populated as ID)
        const deptId =
          typeof subData.departmentId === "object"
            ? subData.departmentId._id
            : subData.departmentId;
        const deptRes = await fetch(`/api/departments/${deptId}`, {
          headers: auth,
        });
        if (deptRes.ok) setDept(await deptRes.json());

        // 4. Fetch assignments to verify access
        const assignRes = await fetch(`/api/faculty-assignments`, {
          headers: auth,
        });
        if (assignRes.ok) {
          const assignments: Assignment[] = await assignRes.json();
          const hasAccess = assignments.some((a) => {
            const sid =
              typeof a.subjectId === "object" ? a.subjectId._id : a.subjectId;
            return sid === subjectId;
          });
          if (
            !hasAccess &&
            currentUser?.role !== "SuperAdmin" &&
            currentUser?.role !== "Dean" &&
            currentUser?.role !== "HOD"
          ) {
            throw new Error("You do not have access to this subject");
          }
        }

        // 5. Fetch PO/PSO docs
        const popsoRes = await fetch(
          `/api/popso?departmentId=${deptId}&year=${subData.yearOrder || 1}`,
          { headers: auth },
        );
        if (popsoRes.ok) setPopsoDocs(await popsoRes.json());
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, subjectId, currentUser]);

  useEffect(() => {
    // Generate some mock outcomes after upload transition (Keeping the AI simulation for now as requested)
    if (step === "generating") {
      const timer = setTimeout(() => {
        setOutcomes([
          {
            id: "1",
            type: "CO",
            code: "CO 1.",
            description:
              "Understand cloud computing models, architectures, and performance aspects for scalable system design.",
          },
          {
            id: "2",
            type: "CO",
            code: "CO 2.",
            description:
              "Analyze virtualization and containerization technologies for efficient resource management in cloud environments.",
          },
          {
            id: "3",
            type: "CO",
            code: "CO 3.",
            description:
              "Analyze cloud architecture and data center design for efficient resource management and secure cloud operations.",
          },
          {
            id: "4",
            type: "CO",
            code: "CO 4.",
            description:
              "Evaluate cloud service performance using QoS metrics and Service Level Agreements (SLA).",
          },
          {
            id: "5",
            type: "CO",
            code: "CO 5.",
            description:
              "Analyze advanced cloud architectures and emerging technologies for building scalable and resilient systems.",
          },
          {
            id: "6",
            type: "CLO",
            code: "CLO 1.",
            description:
              "Apply cloud computing concepts and service models to analyze scalable applications and real-world platforms like Netflix.",
          },
          {
            id: "7",
            type: "CLO",
            code: "CLO 2.",
            description:
              "Apply virtualization and container concepts to design scalable applications using modern tools like Docker and Kubernetes.",
          },
          {
            id: "8",
            type: "CLO",
            code: "CLO 3.",
            description:
              "Apply cloud architecture concepts to design scalable, secure systems and evaluate platforms like AWS and Azure.",
          },
          {
            id: "9",
            type: "CLO",
            code: "CLO 4.",
            description:
              "Apply SLA and monitoring concepts to ensure scalability, reliability, and performance in cloud systems using tools like AWS CloudWatch.",
          },
          {
            id: "10",
            type: "CLO",
            code: "CLO 5.",
            description:
              "Apply modern cloud techniques such as auto-scaling, fault tolerance, and edge computing to design efficient real-world applications.",
          },
        ]);
        setStep("verify");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  if (loading)
    return (
      <div className="p-8 flex items-center gap-3">
        <Loader2 className="animate-spin" /> Loading editor...
      </div>
    );
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  if (
    !currentUser ||
    (currentUser.role !== "Faculty" &&
      currentUser.role !== "HOD" &&
      currentUser.role !== "SuperAdmin")
  ) {
    return <div className="p-8">Access denied</div>;
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const updateOutcome = (id: string, newDesc: string) => {
    setOutcomes((prev) =>
      prev.map((o) => (o.id === id ? { ...o, description: newDesc } : o)),
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header Info */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/syllabus/new")}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-4 inline-flex items-center gap-1"
        >
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to Subject
          Selection
        </button>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Syllabus Editor
        </h1>
        {subject && program && (
          <div className="mt-4 p-4 bg-white border border-slate-200 rounded-xl flex gap-6 text-sm shadow-sm flex-wrap items-center">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">Subject:</span>
              <span className="font-semibold text-slate-900">
                {subject.name}
              </span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Program:</span>
              <span className="font-medium text-slate-900">{program.name}</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Year:</span>
              <span className="font-medium text-slate-900">
                {subject.yearLabel}
              </span>
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
          {step === "upload" && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Upload Syllabus Content
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Upload a document to automatically generate CO and CLO
                  </p>
                </div>
              </div>

              {!uploadedFile ? (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-slate-50 transition-colors">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">
                    Drag and drop your syllabus file here, or click to browse
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx"
                    aria-label="Upload syllabus file"
                    title="Upload syllabus file (.pdf, .doc, .docx)"
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
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    File Selected
                  </h3>
                  <p className="text-slate-600 mb-8">{uploadedFile.name}</p>

                  <button
                    onClick={() => setStep("generating")}
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
          {step === "generating" && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 shadow-sm text-center">
              <Loader2 className="w-12 h-12 text-indigo-600 mx-auto mb-6 animate-spin" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                AI is Analyzing the Syllabus...
              </h2>
              <p className="text-slate-500">
                Extracting and generating Course Outcomes & Learning Outcomes.
              </p>
            </div>
          )}

          {/* STEP 3: Verify */}
          {step === "verify" && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Verify Generated Outcomes
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Review manually edit the AI generated data below.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#282828] px-8 py-10 space-y-12 overflow-x-auto">
                {/* CLO Section */}
                <div className="w-full">
                  <div className="bg-[#FFBC00] px-6 py-3 flex items-center">
                    <h3 className="font-bold text-white text-lg tracking-wide">
                      Outcome Related Course Learning Objectives:
                    </h3>
                  </div>
                  <div className="flex flex-col border-b border-[#3a3a3a]">
                    {outcomes
                      .filter((o) => o.type === "CLO")
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex border-t border-[#3a3a3a] hover:bg-[#333] transition-colors"
                        >
                          <div className="px-6 py-4 w-28 shrink-0 flex items-start pt-5 font-bold text-white text-base">
                            {item.code}
                          </div>
                          <div className="px-4 py-4 flex-1">
                            <textarea
                              value={item.description}
                              onChange={(e) =>
                                updateOutcome(item.id, e.target.value)
                              }
                              className="w-full bg-transparent border-transparent resize-none focus:outline-none focus:ring-1 focus:ring-[#FFBC00] rounded p-1 text-white text-base leading-relaxed"
                              rows={3}
                              placeholder="Describe the CLO here"
                              aria-label={`CLO ${item.code} description`}
                              title={`CLO ${item.code} description`}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* CO Section */}
                <div className="w-full">
                  <div className="bg-[#FFBC00] px-6 py-3 flex items-center">
                    <h3 className="font-bold text-white text-lg tracking-wide">
                      Course Outcome: At the end of the course, student will be
                      able to
                    </h3>
                  </div>
                  <div className="flex flex-col border-b border-[#3a3a3a]">
                    {outcomes
                      .filter((o) => o.type === "CO")
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex border-t border-[#3a3a3a] hover:bg-[#333] transition-colors"
                        >
                          <div className="px-6 py-4 w-28 shrink-0 flex items-start pt-5 font-bold text-white text-base">
                            {item.code}
                          </div>
                          <div className="px-4 py-4 flex-1">
                            <textarea
                              value={item.description}
                              onChange={(e) =>
                                updateOutcome(item.id, e.target.value)
                              }
                              className="w-full bg-transparent border-transparent resize-none focus:outline-none focus:ring-1 focus:ring-[#FFBC00] rounded p-1 text-white text-base leading-relaxed"
                              rows={2}
                              placeholder="Describe the CO here"
                              aria-label={`CO ${item.code} description`}
                              title={`CO ${item.code} description`}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-4">
                <button
                  onClick={() => setStep("matrix")}
                  className="flex justify-center items-center gap-2 px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <Table className="w-4 h-4 ml-1" />
                  Create CO-PO Matrix
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Matrix */}
          {step === "matrix" && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <Table className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      CO-PO Alignment Matrix
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Generated mapped correlation based on HOD criteria.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-[#282828] overflow-x-auto text-white">
                <div className="border border-white/20">
                  {/* Table Header Section */}
                  <div className="bg-[#964B00] p-3 border-b border-white/20">
                    <h3 className="font-bold text-white text-lg">
                      Course Evaluation Matrix
                    </h3>
                  </div>

                  <table className="w-full text-center border-collapse">
                    <thead>
                      <tr className="bg-[#282828]">
                        <th className="border border-white/20 p-2 font-semibold text-xs border-t-0">
                          S<br />N
                        </th>
                        <th className="border border-white/20 p-3 font-semibold text-sm border-t-0">
                          Course
                          <br />
                          Outcome
                        </th>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((po) => (
                          <th
                            key={`po${po}`}
                            className="border border-white/20 p-2 font-semibold text-sm border-t-0"
                          >
                            <div className="flex flex-col items-center leading-tight">
                              <span>P</span>
                              <span>O</span>
                              <span>{po}</span>
                            </div>
                          </th>
                        ))}
                        {[1, 2, 3].map((pso) => (
                          <th
                            key={`pso${pso}`}
                            className="border border-white/20 p-2 font-semibold text-sm border-t-0"
                          >
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
                      {[
                        {
                          co: "CO 1",
                          po: [2, 1, 2, 1, 1, "", "", "", "", "", "", ""],
                          pso: [2, "", 2],
                        },
                        {
                          co: "CO 2",
                          po: [2, 1, 1, "", 1, "", "", "", "", "", "", ""],
                          pso: [2, "", 1],
                        },
                        {
                          co: "CO 3",
                          po: [2, 1, 2, 1, "", "", "", "", "", "", "", ""],
                          pso: ["", "", 1],
                        },
                        {
                          co: "CO 4",
                          po: ["", 1, 2, 1, "", "", "", "", "", "", "", ""],
                          pso: [1, "", ""],
                        },
                        {
                          co: "CO 5",
                          po: [2, 1, "", 2, 1, "", "", "", "", "", "", ""],
                          pso: [2, "", 1],
                        },
                      ].map((row, index) => (
                        <tr
                          key={row.co}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="border border-white/20 p-3 text-sm font-semibold">
                            {index + 1}
                          </td>
                          <td className="border border-white/20 p-3 text-sm font-semibold">
                            {row.co}
                          </td>
                          {row.po.map((val, i) => (
                            <td
                              key={`v-po${i}`}
                              className="border border-white/20 p-3 text-sm"
                            >
                              {val}
                            </td>
                          ))}
                          {row.pso.map((val, i) => (
                            <td
                              key={`v-pso${i}`}
                              className="border border-white/20 p-3 text-sm"
                            >
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Legend */}
                <div className="flex justify-between mt-8 text-sm font-semibold text-white px-4">
                  <span>1 = Objective addressed slightly</span>
                  <span>2= Moderately addressed</span>
                  <span>3= Strongly addressed</span>
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-4">
                <button
                  onClick={() => navigate(`/syllabus/review/${subjectId}`)}
                  className="flex justify-center items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <ArrowRight className="w-5 h-5" />
                  Review Syllabus
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
              <h3 className="font-semibold text-sm uppercase tracking-wider">
                HOD Directives
              </h3>
            </div>

            {popsoDocs.length > 0 ? (
              <div className="space-y-3">
                {popsoDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white/10 rounded-lg p-3 flex items-start gap-3 border border-white/20"
                  >
                    <FileCheck className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white font-medium text-sm">
                        {doc.type} Document
                      </div>
                      <div
                        className="text-indigo-200 text-xs truncate max-w-[200px]"
                        title={doc.fileName}
                      >
                        {doc.fileName}
                      </div>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-indigo-200 mt-4 leading-relaxed">
                  These definitions act as the baseline reference when
                  generating the CO-PO matrix in Step 4.
                </p>
              </div>
            ) : (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-sm text-indigo-200">
                  No PO or PSO documents have been uploaded by the HOD for this
                  program year.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
