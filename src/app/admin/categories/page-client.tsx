"use client";
import Swal from "sweetalert2";
import { useState } from "react";
import { Plus, Edit, Trash2, X as XIcon, Save, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import Select from "react-select";

interface Category {
  id: number;
  name: string;
  quota: number;
  price: number;
  tournament_id: number;
  tournament_name: string;
}

interface Tournament {
  id: number;
  name: string;
}

export default function CategoriesClient({ initialCategories, tournaments }: { initialCategories: Category[], tournaments: Tournament[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    quota: 0,
    price: 0,
    tournament_id: tournaments.length > 0 ? tournaments[0].id : 0
  });

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: "",
      quota: 0,
      price: 0,
      tournament_id: tournaments.length > 0 ? tournaments[0].id : 0
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      quota: cat.quota,
      price: cat.price,
      tournament_id: cat.tournament_id
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { id: editingId, ...formData } : formData;

      const res = await fetch("/api/admin/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setIsModalOpen(false);
        router.refresh();
        window.location.reload();
      } else {
        Swal.fire("Failed to save category.");
      }
    } catch (e) {
      Swal.fire("Error saving category.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category? This might affect existing registrations.")) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        router.refresh();
        window.location.reload();
      } else {
        Swal.fire("Failed to delete category.");
      }
    } catch (e) {
      Swal.fire("Error deleting category.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Master Categories</h1>
          <p className="text-slate-500 mt-1">Manage tournament categories, quotas, and pricing.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center px-6 py-3 bg-[#003A60] text-white font-bold rounded-xl hover:bg-[#002B4A] shadow-lg shadow-sky-900/20 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-widest font-bold">
                <th className="px-6 py-5 rounded-tl-xl">ID</th>
                <th className="px-6 py-5">Tournament</th>
                <th className="px-6 py-5">Category Name</th>
                <th className="px-6 py-5">Quota</th>
                <th className="px-6 py-5">Price (Rp)</th>
                <th className="px-6 py-5 text-right rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-6 font-mono font-bold text-slate-900">{cat.id}</td>
                  <td className="p-6 font-bold">{cat.tournament_name}</td>
                  <td className="p-6 font-semibold">{cat.name}</td>
                  <td className="p-6">{cat.quota}</td>
                  <td className="p-6 font-mono">Rp {cat.price.toLocaleString("id-ID")}</td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(cat)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    No categories found. Click "Add Category" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-blue-600" />
                {editingId ? "Edit Category" : "Add Category"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 p-2 rounded-full border border-slate-200 transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tournament</label>
                <Select 
                  value={formData.tournament_id ? { value: formData.tournament_id, label: tournaments.find(t => t.id === formData.tournament_id)?.name } : null}
                  onChange={(selected: any) => setFormData({...formData, tournament_id: selected?.value ? parseInt(selected.value) : 0})}
                  options={tournaments.map(t => ({ value: t.id, label: t.name }))}
                  placeholder="-- Select Tournament --"
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
                <label className="block text-sm font-bold text-slate-700 mb-2">Category Name</label>
                <input 
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Men's Double Advanced"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Quota (Teams)</label>
                  <input 
                    required
                    type="number"
                    min="1"
                    value={formData.quota}
                    onChange={e => setFormData({...formData, quota: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Price (Rp)</label>
                  <input 
                    required
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6 mt-6 border-t border-slate-100 gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isProcessing || !formData.tournament_id || !formData.name}
                  className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isProcessing ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
