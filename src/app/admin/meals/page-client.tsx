"use client";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import { Plus, Trash2, Utensils, X, QrCode } from "lucide-react";
import Link from "next/link";
import Select from "react-select";

interface Meal {
  id: number;
  name: string;
  description: string;
  tournament_id: number;
  tournament_name: string;
}

export default function MealsClient({ tournaments }: { tournaments: {id: number, name: string}[] }) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ tournament_id: "", name: "", description: "" });

  const fetchMeals = async () => {
    setIsLoading(true);
    const res = await fetch("/api/admin/meals");
    const data = await res.json();
    if (data.meals) setMeals(data.meals);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      setIsModalOpen(false);
      setFormData({ tournament_id: "", name: "", description: "" });
      fetchMeals();
    } else {
      Swal.fire("Failed to create meal");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this meal?")) return;
    const res = await fetch(`/api/admin/meals?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchMeals();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-black flex items-center gap-2">
            <Utensils className="w-6 h-6 text-blue-500" />
            Meals Management
          </h1>
          <p className="text-sm text-black mt-1">Manage food/konsumsi for each tournament</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm shadow-blue-600/20 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Meal
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-black text-sm border-b border-slate-100">
                <th className="px-6 py-4 font-semibold">Tournament</th>
                <th className="px-6 py-4 font-semibold">Meal Name</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-black">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">Loading meals...</td>
                </tr>
              ) : meals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">No meals found. Create one!</td>
                </tr>
              ) : (
                meals.map(meal => (
                  <tr key={meal.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {meal.tournament_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{meal.name}</td>
                    <td className="px-6 py-4 text-sm max-w-xs truncate">{meal.description || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(meal.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete meal"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-visible animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-black">Add New Meal</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-black hover:bg-slate-200 bg-slate-100 p-1.5 rounded-full transition-colors border border-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">Tournament</label>
                <Select
                  options={tournaments.map(t => ({ value: t.id.toString(), label: t.name }))}
                  value={
                    formData.tournament_id
                      ? {
                          value: formData.tournament_id,
                          label: tournaments.find(t => t.id.toString() === formData.tournament_id)?.name || ""
                        }
                      : null
                  }
                  onChange={(selected: any) =>
                    setFormData({ ...formData, tournament_id: selected?.value || "" })
                  }
                  placeholder="Select Tournament..."
                  className="react-select-container text-black"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: '0.75rem',
                      borderColor: '#e2e8f0',
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
                <label className="block text-sm font-medium text-black mb-1.5">Meal Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 outline-none transition-all text-black"
                  placeholder="e.g. Nasi Kotak Ayam"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1.5">Description (Optional)</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 outline-none transition-all resize-none h-24 text-black"
                  placeholder="Additional details..."
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors shadow-sm shadow-blue-600/20">
                  Save Meal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
