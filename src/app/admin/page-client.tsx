"use client";

import { Users, CreditCard, Activity, ArrowUpRight } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import Select from "react-select";

interface ClientProps {
  tournaments: any[];
  categories: any[];
  registrations: any[];
  checkIns: any[];
}

export default function AdminDashboardClient({
  tournaments,
  categories,
  registrations,
  checkIns = []
}: ClientProps) {
  
  const [selectedTournament, setSelectedTournament] = useState<string>("ALL");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredRegistrations = useMemo(() => {
    if (selectedTournament === "ALL") return registrations;
    return registrations.filter(r => r.tournament_id.toString() === selectedTournament);
  }, [registrations, selectedTournament]);

  const totalRegistrations = filteredRegistrations.length;

  const pendingCount = filteredRegistrations.filter(
    r => ["PENDING", "PAYMENT_UPLOADED", "IN_REVIEW"].includes(r.status)
  ).length;

  const revenue = filteredRegistrations
    .filter(r => r.status === "APPROVED" || r.status === "CHECKED_IN")
    .reduce((sum, r) => sum + Number(r.price), 0);

  const recentRegistrations = filteredRegistrations.slice(0, 5).map(r => ({
    id: r.id,
    noReg: r.no_registrasi,
    name: `${r.u1_name} & ${r.u2_name || "No Partner"}`,
    category: r.category_name,
    status: r.status
  }));

  const categoryCapacities = useMemo(() => {
    const catsToProcess = selectedTournament === "ALL" 
      ? categories 
      : categories.filter(c => c.tournament_id.toString() === selectedTournament);

    return catsToProcess.map(c => {
      const regCount = filteredRegistrations.filter(r => 
        r.category_id === c.id && (r.status === "APPROVED" || r.status === "CHECKED_IN")
      ).length;
      return {
        name: c.name,
        registered: regCount,
        quota: c.quota,
        pending: filteredRegistrations.filter(r => r.category_id === c.id && ["PENDING", "PAYMENT_UPLOADED", "IN_REVIEW"].includes(r.status)).length
      };
    });
  }, [categories, filteredRegistrations, selectedTournament]);

  // Calculate new metrics
  const approvedRegistrations = filteredRegistrations.filter(r => r.status === "APPROVED" || r.status === "CHECKED_IN");
  const checkedInRegistrations = approvedRegistrations.filter(r => r.status === "CHECKED_IN");
  const attendanceRate = approvedRegistrations.length > 0 ? (checkedInRegistrations.length / approvedRegistrations.length) * 100 : 0;
  
  // Calculate meal distribution
  const relatedRegIds = new Set(filteredRegistrations.map(r => r.id));
  const relevantCheckIns = checkIns.filter(c => relatedRegIds.has(c.registration_id));
  const mealsDistributed = relevantCheckIns.filter(c => c.meal_taken).length;
  const mealRate = checkedInRegistrations.length > 0 ? (mealsDistributed / checkedInRegistrations.length) * 100 : 0;

  // Most popular category
  const popularCategory = [...categoryCapacities].sort((a, b) => b.registered - a.registered)[0];


  const registrationTrends = useMemo(() => {
    // Last 7 days
    const trends: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      trends[dateStr] = 0;
    }

    filteredRegistrations.forEach(r => {
      const d = new Date(r.submitted_at);
      // Check if it's within last 7 days
      const diffTime = Math.abs(new Date().getTime() - d.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      if (diffDays <= 7) {
        const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        if (trends[dateStr] !== undefined) {
          trends[dateStr]++;
        }
      }
    });

    return Object.keys(trends).map(k => ({ date: k, count: trends[k] }));
  }, [filteredRegistrations]);

  const stats = [
    { 
      name: "Total Registrants", 
      value: totalRegistrations.toString(), 
      change: "Active", 
      icon: Users, 
      color: "text-blue-100", 
      bg: "bg-gradient-to-br from-blue-500 to-blue-700",
      changeColor: "text-blue-100 bg-blue-900/30"
    },
    { 
      name: "Pending / Needs Action", 
      value: pendingCount.toString(), 
      change: "Action Needed", 
      icon: Activity, 
      color: "text-amber-100", 
      bg: "bg-gradient-to-br from-amber-500 to-orange-600",
      changeColor: "text-amber-100 bg-amber-900/30"
    },
    { 
      name: "Revenue (Approved)", 
      value: `Rp ${revenue.toLocaleString("id-ID")}`, 
      change: "Income", 
      icon: CreditCard, 
      color: "text-green-100", 
      bg: "bg-gradient-to-br from-emerald-500 to-green-700",
      changeColor: "text-green-100 bg-green-900/30"
    },
  ];

  const advancedStats = [
    {
      label: "Attendance Rate",
      value: `${attendanceRate.toFixed(1)}%`,
      subtext: `${checkedInRegistrations.length} of ${approvedRegistrations.length} Checked In`
    },
    {
      label: "Meal Distribution",
      value: `${mealRate.toFixed(1)}%`,
      subtext: `${mealsDistributed} distributed (vs Checked In)`
    },
    {
      label: "Most Popular Category",
      value: popularCategory?.registered > 0 ? popularCategory.name : "N/A",
      subtext: `${popularCategory?.registered || 0} teams registered`
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Main Dashboard</h1>
          <p className="text-slate-500 mt-1">Real-time operational summary of Wimbledoc Padel Tournament.</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex items-center">
          <label className="text-sm font-bold text-slate-500 mr-3 ml-2">Tournament:</label>
          <Select
            value={{ value: selectedTournament, label: selectedTournament === "ALL" ? "All Tournaments" : tournaments.find(t => t.id.toString() === selectedTournament)?.name }}
            onChange={(selected: any) => setSelectedTournament(selected?.value || "ALL")}
            options={[
              { value: "ALL", label: "All Tournaments" },
              ...tournaments.map(t => ({ value: t.id.toString(), label: t.name }))
            ]}
            className="react-select-container text-black font-semibold min-w-[200px]"
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: '0.5rem',
                borderColor: 'transparent',
                backgroundColor: '#f8fafc',
                padding: '2px',
                boxShadow: 'none',
                '&:hover': {
                  borderColor: '#cbd5e1'
                }
              })
            }}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className={`${stat.bg} p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group`}>
              {/* Decorative circle */}
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-3 rounded-2xl bg-white/20 backdrop-blur-md ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-md ${stat.changeColor}`}>
                  {stat.change}
                </span>
              </div>
              <div className="relative z-10">
                <h3 className={`text-sm font-semibold mb-1 ${stat.color}`}>{stat.name}</h3>
                <p className="text-3xl font-black text-white">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advanced Metrics */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 mt-8">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Logistics & Insight</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {advancedStats.map((astat, idx) => (
            <div key={idx} className="p-4 md:px-6 flex flex-col justify-center items-center text-center">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">{astat.label}</p>
              <p className="text-2xl font-black text-slate-800">{astat.value}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">{astat.subtext}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        
        {/* Trend Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Registration Trend (Last 7 Days)</h3>
          <div className="h-72 w-full">
            {!mounted ? null : registrationTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={registrationTrends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="count" name="Registrants" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">Trend data is not yet available.</div>
            )}
          </div>
        </div>

        {/* Capacity Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Category Distribution</h3>
          <div className="h-72 w-full">
            {!mounted ? null : categoryCapacities.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryCapacities} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={120} />
                  <RechartsTooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="registered" name="Registered (Approved)" stackId="a" fill="#0ea5e9" radius={[0, 0, 0, 0]} barSize={20} />
                  <Bar dataKey="pending" name="Pending" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
                  <Bar dataKey="quota" name="Total Quota" fill="#e2e8f0" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">Category data is not yet available.</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mt-8">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Registrations</h3>
        <div className="space-y-4">
          {recentRegistrations.map((reg) => (
            <div key={reg.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-500 text-sm">
                  {reg.noReg.slice(-4)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm md:text-base">{reg.name}</p>
                  <p className="text-xs text-slate-400 font-medium">{reg.category}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${
                reg.status === "APPROVED" || reg.status === "CHECKED_IN"
                  ? "bg-green-100 text-green-700" 
                  : reg.status === "PAYMENT_UPLOADED" || reg.status === "IN_REVIEW"
                  ? "bg-blue-100 text-blue-700"
                  : reg.status === "REJECTED" || reg.status === "PAYMENT_REJECTED"
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
              }`}>
                {reg.status === "PAYMENT_UPLOADED" ? "NEEDS REVIEW" : reg.status.replace("_", " ")}
              </span>
            </div>
          ))}
          {recentRegistrations.length === 0 && (
            <p className="text-center py-8 text-slate-400 text-sm">No registrations yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
