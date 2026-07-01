"use client";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import { Trophy, RefreshCw, Save, Activity, Users } from "lucide-react";
import Select from "react-select";

interface Category {
  id: number;
  name: string;
}

interface Tournament {
  id: number;
  name: string;
  categories: Category[];
}

interface MatchData {
  id: number;
  group_id: number;
  team1_id: number;
  team2_id: number;
  team1_score: number;
  team2_score: number;
  status: string;
  t1_name: string;
  t2_name: string;
}

interface GroupTeam {
  id: number;
  group_id: number;
  registration_id: number;
  points: number;
  games_won: number;
  games_lost: number;
  matches_played: number;
  team_name: string;
}

interface PadelGroup {
  id: number;
  name: string;
  stage: string;
}

export default function BracketsClient({ initialTournaments }: { initialTournaments: Tournament[] }) {
  const [selectedTournament, setSelectedTournament] = useState<number | "">(initialTournaments[0]?.id || "");
  const [selectedCategory, setSelectedCategory] = useState<number | "">("");

  const [groups, setGroups] = useState<PadelGroup[]>([]);
  const [groupTeams, setGroupTeams] = useState<GroupTeam[]>([]);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(false);
  const [groupsCount, setGroupsCount] = useState(2);

  const [activeTab, setActiveTab] = useState<number | null>(null);

  const availableCategories = initialTournaments.find(t => t.id === selectedTournament)?.categories || [];

  useEffect(() => {
    if (selectedCategory) {
      fetchBrackets();
    } else {
      setGroups([]);
      setGroupTeams([]);
      setMatches([]);
    }
  }, [selectedCategory]);

  const fetchBrackets = async () => {
    if (!selectedCategory) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/brackets?categoryId=${selectedCategory}`);
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
        setGroupTeams(data.groupTeams || []);
        setMatches(data.matches || []);
        if (data.groups && data.groups.length > 0 && !activeTab) {
          setActiveTab(data.groups[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (!selectedCategory) return;
    if (!confirm(`Are you sure you want to generate ${groupsCount} group(s)? This will overwrite existing groups for this category.`)) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/brackets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_groups", categoryId: selectedCategory, groupsCount })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchBrackets();
      } else {
        Swal.fire(data.error || "Failed to generate groups");
      }
    } catch (e) {
      Swal.fire("Error generating groups");
    }
    setLoading(false);
  };

  const handleUpdateMatch = async (matchId: number, t1Score: number, t2Score: number, status: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/brackets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, team1Score: t1Score, team2Score: t2Score, status })
      });
      if (res.ok) {
        fetchBrackets();
      } else {
        Swal.fire("Failed to update match");
      }
    } catch (e) {
      Swal.fire("Error updating match");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tournament Brackets</h1>
          <p className="text-slate-500 mt-1">Manage round-robin groups and playoff matches.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Tournament</label>
            <Select 
              value={selectedTournament ? { value: selectedTournament, label: initialTournaments.find(t => t.id === selectedTournament)?.name } : null}
              onChange={(selected: any) => {
                setSelectedTournament(selected?.value ? parseInt(selected.value) : "");
                setSelectedCategory("");
              }}
              options={initialTournaments.map(t => ({ value: t.id, label: t.name }))}
              placeholder="-- Choose Tournament --"
              className="react-select-container text-black font-semibold"
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: '0.75rem',
                  borderColor: '#e2e8f0',
                  backgroundColor: '#f8fafc',
                  padding: '4px',
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: '#cbd5e1'
                  }
                })
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Category</label>
            <Select 
              value={selectedCategory ? { value: selectedCategory, label: availableCategories.find(c => c.id === selectedCategory)?.name } : null}
              onChange={(selected: any) => setSelectedCategory(selected?.value ? parseInt(selected.value) : "")}
              options={availableCategories.map(c => ({ value: c.id, label: c.name }))}
              isDisabled={!selectedTournament}
              placeholder="-- Choose Category --"
              className="react-select-container text-black font-semibold"
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: '0.75rem',
                  borderColor: '#e2e8f0',
                  backgroundColor: '#f8fafc',
                  padding: '4px',
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: '#cbd5e1'
                  }
                })
              }}
            />
          </div>
        </div>
      </div>

      {selectedCategory !== "" && !loading && groups.length === 0 && (
        <div className="bg-blue-50 rounded-3xl border border-blue-100 p-8 text-center flex flex-col items-center justify-center">
          <Trophy className="w-16 h-16 text-blue-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Bracket Data Found</h2>
          <p className="text-slate-600 mb-6 max-w-md">There are no groups generated for this category yet. You can generate them based on approved registrations.</p>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center px-4">
              <label className="text-sm font-bold text-slate-700 mr-3">Number of Groups:</label>
              <input 
                type="number" 
                min="1" 
                max="8" 
                value={groupsCount}
                onChange={e => setGroupsCount(parseInt(e.target.value) || 2)}
                className="w-16 bg-slate-50 border border-slate-200 text-center rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button 
              onClick={handleGenerate}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Generate Groups
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center p-12">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {!loading && groups.length > 0 && (
        <div className="space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {groups.map(g => (
              <button 
                key={g.id}
                onClick={() => setActiveTab(g.id)}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === g.id ? 'bg-gradient-to-r from-[#003A60] to-[#0260A5] text-white shadow-lg shadow-sky-900/20' : 'bg-white text-slate-500 hover:text-slate-700 border border-slate-200'}`}
              >
                {g.name}
              </button>
            ))}
          </div>

          {groups.map(g => {
            if (activeTab !== g.id) return null;
            const teams = groupTeams.filter(t => t.group_id === g.id);
            const grpMatches = matches.filter(m => m.group_id === g.id);

            return (
              <div key={g.id} className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-in fade-in duration-300">
                
                {/* Standings Table */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center">
                    <Activity className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-bold text-slate-900 text-lg">Group Standings</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                          <th className="p-4">Pos</th>
                          <th className="p-4">Team</th>
                          <th className="p-4 text-center">P</th>
                          <th className="p-4 text-center">W</th>
                          <th className="p-4 text-center">L</th>
                          <th className="p-4 text-center">Pts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {teams.map((t, idx) => (
                          <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-bold text-slate-900">{idx + 1}</td>
                            <td className="p-4 font-bold text-blue-700">{t.team_name}</td>
                            <td className="p-4 text-center text-slate-600">{t.matches_played}</td>
                            <td className="p-4 text-center text-green-600 font-semibold">{t.games_won}</td>
                            <td className="p-4 text-center text-red-600">{t.games_lost}</td>
                            <td className="p-4 text-center font-black text-slate-900 text-lg">{t.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Match Schedule */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center">
                    <Users className="w-5 h-5 text-purple-600 mr-2" />
                    <h3 className="font-bold text-slate-900 text-lg">Matches & Scores</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {grpMatches.map((m, idx) => (
                      <MatchCard key={m.id} match={m} onUpdate={handleUpdateMatch} index={idx} />
                    ))}
                    {grpMatches.length === 0 && (
                      <p className="text-center text-slate-500 py-4">No matches scheduled.</p>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MatchCard({ match, onUpdate, index }: { match: MatchData, onUpdate: any, index: number }) {
  const [s1, setS1] = useState(match.team1_score);
  const [s2, setS2] = useState(match.team2_score);
  const [status, setStatus] = useState(match.status);
  const [isEditing, setIsEditing] = useState(false);

  const isCompleted = match.status === 'COMPLETED';

  return (
    <div className={`border rounded-2xl p-4 transition-all ${isCompleted && !isEditing ? 'bg-slate-50 border-slate-100' : 'bg-white border-blue-100 shadow-sm'}`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Match {index + 1}</span>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {isCompleted && !isEditing ? 'Finished' : status}
        </span>
      </div>
      
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-right">
          <p className="font-bold text-slate-900 text-sm md:text-base">{match.t1_name || 'TBD'}</p>
        </div>
        
        <div className="flex items-center gap-2 font-black text-xl bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
          {isEditing ? (
            <>
              <input type="number" min="0" value={s1} onChange={e => setS1(parseInt(e.target.value) || 0)} className="w-10 text-center bg-white border border-slate-300 rounded text-blue-700 focus:outline-none" />
              <span className="text-slate-400 text-sm">-</span>
              <input type="number" min="0" value={s2} onChange={e => setS2(parseInt(e.target.value) || 0)} className="w-10 text-center bg-white border border-slate-300 rounded text-blue-700 focus:outline-none" />
            </>
          ) : (
            <>
              <span className={s1 > s2 ? "text-blue-700" : "text-slate-700"}>{s1}</span>
              <span className="text-slate-400 text-sm">-</span>
              <span className={s2 > s1 ? "text-blue-700" : "text-slate-700"}>{s2}</span>
            </>
          )}
        </div>

        <div className="flex-1 text-left">
          <p className="font-bold text-slate-900 text-sm md:text-base">{match.t2_name || 'TBD'}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-center border-t border-slate-100 pt-3">
        {isEditing ? (
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-4 py-1.5 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                onUpdate(match.id, s1, s2, "COMPLETED");
                setStatus("COMPLETED");
                setIsEditing(false);
              }}
              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center"
            >
              <Save className="w-3 h-3 mr-1" /> Save Score
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Update Score
          </button>
        )}
      </div>
    </div>
  );
}
