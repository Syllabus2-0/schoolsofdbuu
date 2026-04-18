import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, MessageSquare, ArrowLeft } from 'lucide-react';
import { updateSyllabus, addComment } from '../data/universityData';

export default function SyllabusReview() {
  const { subjectId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');

  // Local state for editable course content
  const [courseDetails, setCourseDetails] = useState({
    title: 'Cloud Computing', level: 'Undergraduate', credits: '3', category: 'PC',
    prerequisite: 'Nil', corequisite: 'Nil', nature: 'Theory',
    L: '3', T: '0', P: '0', C: '3'
  });

  const [clos, setClos] = useState([
    { code: 'CLO 1.', desc: 'Apply cloud computing concepts and service models to analyze scalable applications and real-world platforms like Netflix.' },
    { code: 'CLO 2.', desc: 'Apply virtualization and container concepts to design scalable applications using modern tools like Docker and Kubernetes.' },
    { code: 'CLO 3.', desc: 'Apply cloud architecture concepts to design scalable, secure systems and evaluate platforms like AWS and Azure.' },
    { code: 'CLO 4.', desc: 'Apply SLA and monitoring concepts to ensure scalability, reliability, and performance in cloud systems using tools like AWS CloudWatch.' },
    { code: 'CLO 5.', desc: 'Apply modern cloud techniques such as auto-scaling, fault tolerance, and edge computing to design efficient real-world applications.' }
  ]);

  const [cos, setCos] = useState([
    { code: 'CO 1.', desc: 'Understand cloud computing models, architectures, and performance aspects for scalable system design.' },
    { code: 'CO 2.', desc: 'Analyze virtualization and containerization technologies for efficient resource management in cloud environments.' },
    { code: 'CO 3.', desc: 'Analyze cloud architecture and data center design for efficient resource management and secure cloud operations.' },
    { code: 'CO 4.', desc: 'Evaluate cloud service performance using QoS metrics and Service Level Agreements (SLA).' },
    { code: 'CO 5.', desc: 'Analyze advanced cloud architectures and emerging technologies for building scalable and resilient systems.' },
  ]);

  const [units, setUnits] = useState([
    { title: 'Unit I: Introduction to Cloud Computing', desc: 'Overview of Cloud Computing, Evolution of Cloud Computing, Grid Computing, Cluster Computing, Service Models (IaaS, PaaS, SaaS), Deployment Models (Public, Private, Hybrid, Community).' },
    { title: 'Unit II: Virtualization and Containers', desc: 'Introduction to Virtualization, Types of Virtualization, Hypervisors, Containerization concepts, Docker architecture and commands, Orchestration basics with Kubernetes.' },
    { title: 'Unit III: Advanced Cloud Architecture', desc: 'Microservices paradigm, Serverless computing, Fault tolerance, Load Balancing, Cloud Security models, Multi-cloud and edge computing networks.' },
  ]);

  const [references, setReferences] = useState([
    'Rajkumar Buyya, James Broberg, Andrzej Goscinski, "Cloud Computing Principles and Paradigms".',
    'Distributed and Cloud Computing, Kai Hwang, Geoffery C. Fox, Jack J. Dongarra.'
  ]);

  const [matrix, setMatrix] = useState([
    { co: 'CO 1', po: ['2', '1', '2', '1', '1', '', '', '', '', '', '', ''], pso: ['2', '', '2'] },
    { co: 'CO 2', po: ['2', '1', '1', '', '1', '', '', '', '', '', '', ''], pso: ['2', '', '1'] },
    { co: 'CO 3', po: ['2', '1', '2', '1', '', '', '', '', '', '', '', ''], pso: ['', '', '1'] },
    { co: 'CO 4', po: ['', '1', '2', '1', '', '', '', '', '', '', '', ''], pso: ['1', '', ''] },
    { co: 'CO 5', po: ['2', '1', '', '2', '1', '', '', '', '', '', '', ''], pso: ['2', '', '1'] }
  ]);

  if (!currentUser) return null;

  const isFaculty = currentUser.role === 'Faculty';
  const isAuthority = currentUser.role === 'HOD' || currentUser.role === 'Dean' || currentUser.role === 'SuperAdmin';
  // Check if actually dean or super admin. 
  // HOD -> Dean -> SuperAdmin -> Published

  const handleApprove = () => {
    if (isAuthority && subjectId) {
       let newStatus: any = 'Published';
       if (currentUser.role === 'HOD') newStatus = 'Pending Dean Approval';
       if (currentUser.role === 'Dean') newStatus = 'Published';
       if (currentUser.role === 'SuperAdmin') newStatus = 'Published';
       
       updateSyllabus(subjectId, { status: newStatus });
       navigate('/approvals');
    }
  };

  const handleReject = () => {
    if (isAuthority && subjectId && commentText) {
       updateSyllabus(subjectId, { status: 'Draft' });
       addComment(subjectId, {
         id: `comment-${Date.now()}`,
         userId: currentUser.id,
         userName: currentUser.name,
         text: `Rejected: ${commentText}`,
         timestamp: new Date().toISOString()
       });
       navigate('/approvals');
    }
  };

  const handleSubmitSyllabus = () => {
    navigate('/');
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
               navigate(`/syllabus/edit/${subjectId}?step=matrix`);
            } else {
               navigate(-1);
            }
          }} 
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* 1. Course Details Section */}
        <div>
          <div className="grid grid-cols-2 mb-8 border border-[#444]">
             <div className="bg-[#964B00] border-r border-[#444] p-4 flex items-center">
                <input 
                  value={courseDetails.title} 
                  onChange={e => setCourseDetails({...courseDetails, title: e.target.value})}
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
                  <input value={courseDetails.L} onChange={e => setCourseDetails({...courseDetails, L: e.target.value})} className={`font-bold text-center text-white ${inputStyles}`} />
                </div>
                <div className="flex items-center justify-center border-r border-[#444] p-3">
                  <input value={courseDetails.T} onChange={e => setCourseDetails({...courseDetails, T: e.target.value})} className={`font-bold text-center text-white ${inputStyles}`} />
                </div>
                <div className="flex items-center justify-center border-r border-[#444] p-3">
                  <input value={courseDetails.P} onChange={e => setCourseDetails({...courseDetails, P: e.target.value})} className={`font-bold text-center text-white ${inputStyles}`} />
                </div>
                <div className="flex items-center justify-center p-3">
                  <input value={courseDetails.C} onChange={e => setCourseDetails({...courseDetails, C: e.target.value})} className={`font-bold text-center text-white ${inputStyles}`} />
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
                         value={(courseDetails as any)[row.key]}
                         onChange={e => setCourseDetails({...courseDetails, [row.key]: e.target.value})}
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
                        value={item.code} 
                        onChange={(e) => {
                          const newArr = [...clos]; newArr[i].code = e.target.value; setClos(newArr);
                        }}
                        className={`font-bold text-base ${inputStyles}`}
                      />
                    </div>
                    <div className="px-4 flex-1 text-white">
                      <textarea 
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
                        value={item.code} 
                        onChange={(e) => {
                          const newArr = [...cos]; newArr[i].code = e.target.value; setCos(newArr);
                        }}
                        className={`font-bold text-base ${inputStyles}`}
                      />
                    </div>
                    <div className="px-4 flex-1 text-white">
                      <textarea 
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
                   value={unit.title}
                   onChange={e => {
                     const newU = [...units]; newU[i].title = e.target.value; setUnits(newU);
                   }}
                   className={`text-[#FFBC00] font-semibold mb-1 text-lg ${inputStyles}`}
                 />
                 <textarea
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
                   <th className="border border-white/20 p-2 font-semibold text-xs border-t-0">S<br/>N</th>
                   <th className="border border-white/20 p-3 font-semibold text-sm border-t-0">Course<br/>Outcome</th>
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
