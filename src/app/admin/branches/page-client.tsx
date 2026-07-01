"use client";
import Swal from "sweetalert2";
import { Plus, Edit2, Trash2, Search, X, MapPin } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Branch {
  id: number;
  name: string;
  location: string;
  created_at: string;
}

export default function BranchesClient({ initialBranches }: { initialBranches: Branch[] }) {
  const [branches, setBranches] = useState(initialBranches);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Branch>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const filteredBranches = branches.filter(b => b.name.toLowerCase().includes(search.toLowerCase()) || b.location.toLowerCase().includes(search.toLowerCase()));

  const openModal = (branch?: Branch) => {
    if (branch) {
      setFormData(branch);
    } else {
      setFormData({});
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const method = formData.id ? "PUT" : "POST";
    const url = formData.id ? `/api/admin/branches/${formData.id}` : "/api/admin/branches";

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
      const data = await res.json();
      Swal.fire(data.error || "Failed to save data");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this branch? (Will be rejected if the branch is being used by a tournament)")) return;
    const res = await fetch(`/api/admin/branches/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
      window.location.reload();
    } else {
      const data = await res.json();
      Swal.fire(data.error || "Failed to delete data");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Branch Master</h1>
          <p className="text-slate-500 mt-1">Manage match venue branch/location data.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center px-6 py-3 bg-gradient-to-r from-[#003A60] to-[#0260A5] text-white font-bold rounded-xl shadow-lg shadow-sky-900/20 hover:shadow-sky-900/40 hover:-translate-y-0.5 transition-all">
          <Plus className="w-5 h-5 mr-2" />
          Add Branch
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search branch or location..." 
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
                <th className="px-6 py-5 rounded-tl-xl">Branch Name</th>
                <th className="px-6 py-5">Location</th>
                <th className="px-6 py-5">Date Created</th>
                <th className="px-6 py-5 text-right rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredBranches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-6 font-bold text-slate-900 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                    {b.name}
                  </td>
                  <td className="p-6">{b.location}</td>
                  <td className="p-6">{b.created_at}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(b)} className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(b.id)} className="p-2.5 text-red-600 hover:bg-red-100 rounded-xl transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBranches.length === 0 && (
                <tr><td colSpan={4} className="p-6 text-center text-slate-500">No branch data available.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <h2 className="text-xl font-extrabold text-slate-900">{formData.id ? "Edit Branch" : "Add Branch"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 p-2 rounded-full border border-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Branch Name</label>
                <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" placeholder="e.g.: Wimbledoc SCBD" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Full Location</label>
                <textarea required value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" placeholder="e.g.: Jl. Jend. Sudirman No. Kav 52-53..."></textarea>
              </div>
              
              <div className="flex justify-end p-6 border-t border-slate-100 bg-slate-50/50 gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="px-8 py-3 bg-gradient-to-r from-[#003A60] to-[#0260A5] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-sky-900/20 hover:-translate-y-0.5 transition-all disabled:opacity-50">
                  {loading ? "Saving..." : "Save Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
