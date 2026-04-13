import { useAuth } from '../context/AuthContext';
import { programs, schools, departments, getDepartmentsBySchool, getProgramsByDepartment } from '../data/universityData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function Analytics() {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  // Filter programs based on role
  let visiblePrograms = programs;

  if (currentUser.role === 'Dean' && currentUser.schoolId) {
    const schoolDepts = getDepartmentsBySchool(currentUser.schoolId);
    visiblePrograms = programs.filter(p =>
      schoolDepts.some(d => d.id === p.departmentId)
    );
  } else if (currentUser.role === 'HOD' && currentUser.departmentId) {
    visiblePrograms = getProgramsByDepartment(currentUser.departmentId);
  } else if (currentUser.role === 'Faculty' && currentUser.departmentId) {
    visiblePrograms = getProgramsByDepartment(currentUser.departmentId);
  }

  // Aggregate intake data by year
  const intakeByYear = visiblePrograms.reduce((acc, program) => {
    program.intakeStats.forEach(stat => {
      if (!acc[stat.year]) {
        acc[stat.year] = 0;
      }
      acc[stat.year] += stat.count;
    });
    return acc;
  }, {} as Record<number, number>);

  const chartData = Object.entries(intakeByYear)
    .map(([year, count]) => ({
      year: year,
      students: count,
    }))
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));

  // Calculate total intake
  const totalIntake = Object.values(intakeByYear).reduce((sum, count) => sum + count, 0);

  // Calculate growth rate
  const years = Object.keys(intakeByYear).sort();
  const firstYear = intakeByYear[parseInt(years[0])];
  const lastYear = intakeByYear[parseInt(years[years.length - 1])];
  const growthRate = ((lastYear - firstYear) / firstYear * 100).toFixed(1);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Intake Analytics</h1>
          <p className="text-slate-600">Student enrollment trends (2021-2025)</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="text-sm text-slate-600 mb-1">Total Programs</div>
            <div className="text-3xl font-bold text-slate-900">{visiblePrograms.length}</div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="text-sm text-slate-600 mb-1">Total Intake (5 years)</div>
            <div className="text-3xl font-bold text-slate-900">{totalIntake}</div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="text-sm text-slate-600 mb-1">Latest Year (2025)</div>
            <div className="text-3xl font-bold text-slate-900">{intakeByYear[2025] || 0}</div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              Growth Rate
            </div>
            <div className="text-3xl font-bold text-emerald-600">+{growthRate}%</div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Year-over-Year Intake Trends
          </h2>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="year"
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              />
              <Bar dataKey="students" fill="#4f46e5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Program-wise Breakdown */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Program-wise Intake (2025)
          </h2>

          <div className="space-y-4">
            {visiblePrograms
              .sort((a, b) => {
                const aIntake = a.intakeStats.find(s => s.year === 2025)?.count || 0;
                const bIntake = b.intakeStats.find(s => s.year === 2025)?.count || 0;
                return bIntake - aIntake;
              })
              .map(program => {
                const intake2025 = program.intakeStats.find(s => s.year === 2025)?.count || 0;
                const intake2024 = program.intakeStats.find(s => s.year === 2024)?.count || 0;
                const change = intake2024 > 0 ? ((intake2025 - intake2024) / intake2024 * 100).toFixed(1) : 0;
                const dept = departments.find(d => d.id === program.departmentId);
                const school = dept ? schools.find(s => s.id === dept.schoolId) : null;

                return (
                  <div
                    key={program.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{program.name}</div>
                      <div className="text-sm text-slate-500 mt-1">
                        {school?.code} • {dept?.name} • {program.level}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">{intake2025}</div>
                        <div className="text-xs text-slate-500">students</div>
                      </div>

                      <div className={`text-sm font-medium ${
                        parseFloat(change as string) >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {parseFloat(change as string) >= 0 ? '+' : ''}{change}%
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
