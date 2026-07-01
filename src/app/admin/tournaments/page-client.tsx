"use client";
import Swal from "sweetalert2";
import { Plus, Edit2, Trash2, Search, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";

interface Tournament {
  id: number;
  name: string;
  status: string;
  date: string;
  branch: string;
  branch_id: number;
  description: string;
  event_date: string;
  reg_start: string;
  reg_end: string;
  categories?: { id?: number; name: string; quota: number; price: number }[];
}

interface Branch {
  id: number;
  name: string;
}

export default function TournamentsClient({ initialTournaments, branches, allCategories = [] }: { initialTournaments: Tournament[], branches: Branch[], allCategories?: string[] }) {
  const [tournaments, setTournaments] = useState(initialTournaments);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Tournament>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const filteredTournaments = tournaments.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  const openModal = (tournament?: Tournament) => {
    if (tournament) {
      setFormData({
        ...tournament,
        status: tournament.status.toUpperCase(),
        event_date: new Date(tournament.event_date).toISOString().slice(0, 16),
        reg_start: new Date(tournament.reg_start).toISOString().slice(0, 16),
        reg_end: new Date(tournament.reg_end).toISOString().slice(0, 16),
      });
    } else {
      setFormData({
        status: "DRAFT",
        branch_id: branches[0]?.id,
        categories: []
      });
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const method = formData.id ? "PUT" : "POST";
    const url = formData.id ? `/api/admin/tournaments/${formData.id}` : "/api/admin/tournaments";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    setLoading(false);
    if (res.ok) {
      setModalOpen(false);
      router.refresh();
      window.location.reload(); 
    } else {
      Swal.fire("Failed to save data");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this tournament?")) return;
    const res = await fetch(`/api/admin/tournaments/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
      window.location.reload();
    } else {
      Swal.fire("Failed to delete data");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tournament Management</h1>
          <p className="text-slate-500 mt-1">Manage tournament data and match categories.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center px-6 py-3 bg-gradient-to-r from-[#003A60] to-[#0260A5] text-white font-bold rounded-xl shadow-lg shadow-sky-900/20 hover:shadow-sky-900/40 hover:-translate-y-0.5 transition-all">
          <Plus className="w-5 h-5 mr-2" />
          Create New Tournament
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tournaments..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-widest font-bold">
                <th className="px-6 py-5 rounded-tl-xl">Tournament Name</th>
                <th className="px-6 py-5">Branch</th>
                <th className="px-6 py-5">Event Date</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTournaments.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-6 font-bold text-slate-900">{t.name}</td>
                  <td className="p-6">{t.branch}</td>
                  <td className="p-6">{t.date}</td>
                  <td className="p-6">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${t.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(t)} className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="p-2.5 text-red-600 hover:bg-red-100 rounded-xl transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTournaments.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-slate-500">No data available.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <h2 className="text-xl font-extrabold text-slate-900">{formData.id ? "Edit Tournament" : "Add Tournament"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 p-2 rounded-full border border-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Tournament Name</label>
                  <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                  <textarea required value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2 rounded-xl h-24 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Branch</label>
                  <Select 
                    value={formData.branch_id ? { value: formData.branch_id, label: branches.find(b => b.id === formData.branch_id)?.name } : null}
                    onChange={(selected: any) => setFormData({...formData, branch_id: selected?.value ? parseInt(selected.value) : undefined})}
                    options={branches.map(b => ({ value: b.id, label: b.name }))}
                    placeholder="Select Branch"
                    className="react-select-container text-black font-semibold"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: '0.75rem',
                        borderColor: '#e2e8f0',
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
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                  <Select 
                    value={formData.status ? { value: formData.status, label: formData.status.charAt(0).toUpperCase() + formData.status.slice(1).toLowerCase() } : null}
                    onChange={(selected: any) => setFormData({...formData, status: selected?.value || ""})}
                    options={[
                      { value: "ACTIVE", label: "Active" },
                      { value: "DRAFT", label: "Draft" },
                      { value: "COMPLETED", label: "Completed" }
                    ]}
                    className="react-select-container text-black font-semibold"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: '0.75rem',
                        borderColor: '#e2e8f0',
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
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Registration Start</label>
                    <input required type="datetime-local" value={formData.reg_start || ''} onChange={e => setFormData({...formData, reg_start: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Registration End</label>
                    <input required type="datetime-local" value={formData.reg_end || ''} onChange={e => setFormData({...formData, reg_end: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Event Date</label>
                    <input required type="datetime-local" value={formData.event_date || ''} onChange={e => setFormData({...formData, event_date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  </div>
                </div>
              </div>

              {/* Category UI */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Categories & Registration Slots</h3>
                  <button 
                    type="button" 
                    onClick={() => {
                      const newCat = { name: "", quota: 16, price: 500000 };
                      setFormData({...formData, categories: [...(formData.categories || []), newCat]});
                    }}
                    className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Category
                  </button>
                </div>
                
                <div className="space-y-3">
                  {(!formData.categories || formData.categories.length === 0) && (
                    <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center text-slate-500 text-sm">
                      No registration categories yet. Click Add Category.
                    </div>
                  )}
                  {formData.categories?.map((cat, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-3 items-end bg-slate-50 p-4 rounded-xl border border-slate-200 relative">
                      <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Category Name</label>
                        <input required type="text" list="category-options" value={cat.name} onChange={e => {
                          const newCats = [...formData.categories!];
                          newCats[idx].name = e.target.value;
                          setFormData({...formData, categories: newCats});
                        }} className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g.: Men's Double" />
                        <datalist id="category-options">
                          {allCategories.map((c, i) => <option key={i} value={c} />)}
                        </datalist>
                      </div>
                      <div className="w-full md:w-24">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Quota (Teams)</label>
                        <input required type="number" min="1" value={cat.quota} onChange={e => {
                          const newCats = [...formData.categories!];
                          newCats[idx].quota = parseInt(e.target.value);
                          setFormData({...formData, categories: newCats});
                        }} className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                      </div>
                      <div className="w-full md:w-40">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Price (Rp)</label>
                        <input required type="number" min="0" value={cat.price} onChange={e => {
                          const newCats = [...formData.categories!];
                          newCats[idx].price = parseInt(e.target.value);
                          setFormData({...formData, categories: newCats});
                        }} className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                      </div>
                      <button type="button" onClick={() => {
                        const newCats = formData.categories!.filter((_, i) => i !== idx);
                        setFormData({...formData, categories: newCats});
                      }} className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end p-6 border-t border-slate-100 bg-slate-50/50 gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="px-8 py-3 bg-gradient-to-r from-[#003A60] to-[#0260A5] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-sky-900/20 hover:-translate-y-0.5 transition-all disabled:opacity-50">
                  {loading ? "Saving..." : "Save Tournament"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
