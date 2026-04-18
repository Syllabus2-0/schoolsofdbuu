import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function Analytics() {
  const { currentUser, token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/dashboard/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error("Analytics fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [token]);

  if (!currentUser) return null;
  if (loading) return <div className="p-8">Loading analytics...</div>;
  if (!data) return <div className="p-8">No analytics data available</div>;

  const { programs, chartData, totalPrograms } = data;

  // Calculate total intake
  const totalIntake = chartData.reduce((sum: number, d: any) => sum + d.students, 0);

  // Calculate growth rate (compare last 2 available years if possible)
  let growthRate = "0.0";
  if (chartData.length >= 2) {
    const last = chartData[chartData.length - 1].students;
    const prev = chartData[chartData.length - 2].students;
    if (prev > 0) {
      growthRate = (((last - prev) / prev) * 100).toFixed(1);
    }
  }

  const latestYear = chartData.length > 0 ? chartData[chartData.length-1].year : 'N/A';
  const latestCount = chartData.length > 0 ? chartData[chartData.length-1].students : 0;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">University Analytics</h1>
          <p className="text-slate-600">Real-time student enrollment trends across your scoped programs</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="text-sm text-slate-600 mb-1">Total Programs</div>
            <div className="text-3xl font-bold text-slate-900">{totalPrograms}</div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="text-sm text-slate-600 mb-1">Total Intake (All Years)</div>
            <div className="text-3xl font-bold text-slate-900">{totalIntake}</div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="text-sm text-slate-600 mb-1">Latest Year ({latestYear})</div>
            <div className="text-3xl font-bold text-slate-900">{latestCount}</div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              Recent Growth
            </div>
            <div className={`text-3xl font-bold ${parseFloat(growthRate) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {parseFloat(growthRate) >= 0 ? '+' : ''}{growthRate}%
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 font-display">
            Year-over-Year Enrollment Trends
          </h2>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
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
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '14px',
                }}
              />
              <Bar dataKey="students" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Program-wise Breakdown */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 font-display">
            Program Breakdown
          </h2>

          <div className="space-y-4">
            {programs.map((program: any) => {
              const stats = program.intakeStats || [];
              const lastCount = stats.length > 0 ? stats[stats.length - 1].count : 0;
              
              return (
                <div
                  key={program.id}
                  className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-slate-50 transition-all group"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{program.name}</div>
                    <div className="text-sm text-slate-500 mt-1">
                       {program.school} • {program.department} • {program.level}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">{lastCount}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">latest intake</div>
                    </div>
                  </div>
                </div>
              );
            })}

            {programs.length === 0 && (
              <div className="py-8 text-center text-slate-500 italic">
                No programs found in your current scope.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
