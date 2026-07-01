"use client";

import { useState } from "react";
import { User, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import Select from "react-select";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  no_anggota: string;
  cabang: string;
  profesi: string;
  spesialisasi: string;
  kategoriTempatKerja: string;
  tempatKerja: string;
  instagram: string;
  bukti_profesi?: string | null;
}

export default function ProfilePageClient({ userProfile }: { userProfile: UserProfile }) {
  const router = useRouter();
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const dataToSend = new FormData();
      dataToSend.append("name", formData.name);
      dataToSend.append("phone", formData.phone);
      dataToSend.append("no_anggota", formData.no_anggota);
      dataToSend.append("cabang", formData.cabang);
      dataToSend.append("profesi", formData.profesi);
      dataToSend.append("spesialisasi", formData.spesialisasi);
      dataToSend.append("kategoriTempatKerja", formData.kategoriTempatKerja);
      dataToSend.append("tempatKerja", formData.tempatKerja);
      dataToSend.append("instagram", formData.instagram);
      if (file) {
        dataToSend.append("bukti_profesi", file);
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        body: dataToSend,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        router.refresh();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update profile." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "A connection error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar Dashboard */}
      <nav className="bg-[#003A60] text-white px-6 py-4 shadow-md sticky top-0 z-30 mb-8">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <User className="w-5 h-5 text-sky-50" />
            </div>
            <div>
              <p className="text-sm text-sky-200">Participant</p>
              <p className="font-bold">{userProfile.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-semibold text-sky-100 hover:text-white hover:border-b-2 hover:border-white/50 pb-1 transition-all">
              My Registrations
            </Link>
            <Link href="/tournaments" className="text-sm font-semibold text-sky-100 hover:text-white hover:border-b-2 hover:border-white/50 pb-1 transition-all">
              Find Tournaments
            </Link>
            <Link href="/api/auth/signout" className="flex items-center text-sm font-semibold text-red-200 hover:text-red-300 transition-colors">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 max-w-3xl pb-12">
        
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-[#003A60] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="p-8 text-center bg-gradient-to-br from-[#003A60] to-[#0260A5] text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-sky-100/80 text-sm">Update your personal and professional information</p>
          </div>

          <div className="p-8 md:p-12">
            {message.text && (
              <div className={`mb-8 p-4 rounded-xl border flex items-center ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                {message.type === 'success' && <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />}
                <span className="font-semibold text-sm">{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Account Info */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Account Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-black mb-1">Email (Cannot be changed)</label>
                    <input type="email" value={formData.email} disabled className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-1">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#003A60] transition-all bg-white text-black font-bold" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-1">WhatsApp Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#003A60] transition-all bg-white text-black font-bold" />
                  </div>
                </div>
              </div>

              {/* Professional Info */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2 mt-8">Professional Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-black mb-1">Profession</label>
                      <Select 
                        options={[
                          { value: "Dokter Umum", label: "General Practitioner" },
                          { value: "Dokter Spesialis", label: "Specialist Doctor" },
                          { value: "Dokter Gigi", label: "Dentist" },
                          { value: "Lainnya", label: "Other" }
                        ]}
                        value={formData.profesi ? { value: formData.profesi, label: formData.profesi } : null}
                        onChange={(selected: any) => setFormData({ ...formData, profesi: selected?.value || "" })}
                        placeholder="Select Profession..."
                        className="react-select-container text-black font-bold"
                        classNamePrefix="react-select"
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderRadius: '0.75rem',
                            borderColor: '#cbd5e1',
                            padding: '2px',
                            boxShadow: 'none',
                            '&:hover': {
                              borderColor: '#94a3b8'
                            }
                          })
                        }}
                      />
                    </div>
                    {formData.profesi === "Dokter Spesialis" && (
                      <div>
                        <label className="block text-sm font-bold text-black mb-1">Specialization</label>
                        <input type="text" name="spesialisasi" value={formData.spesialisasi} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#003A60] transition-all bg-white text-black font-bold" placeholder="E.g., Cardiologist" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-black mb-1">Workplace Category</label>
                      <Select 
                        options={[
                          { value: "Clinic", label: "Clinic" },
                          { value: "Hospital", label: "Hospital" },
                          { value: "University", label: "University" },
                          { value: "Other", label: "Other" }
                        ]}
                        value={formData.kategoriTempatKerja ? { value: formData.kategoriTempatKerja, label: formData.kategoriTempatKerja } : null}
                        onChange={(selected: any) => setFormData({ ...formData, kategoriTempatKerja: selected?.value || "" })}
                        placeholder="Select Category..."
                        className="react-select-container text-black font-bold"
                        classNamePrefix="react-select"
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderRadius: '0.75rem',
                            borderColor: '#cbd5e1',
                            padding: '2px',
                            boxShadow: 'none',
                            '&:hover': {
                              borderColor: '#94a3b8'
                            }
                          })
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black mb-1">Workplace Name</label>
                      <input type="text" name="tempatKerja" value={formData.tempatKerja} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#003A60] transition-all bg-white text-black font-bold" placeholder="E.g., RSUD Dr. Soetomo" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Info */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2 mt-8">Other Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-black mb-1">City (Origin)</label>
                      <input type="text" name="cabang" value={formData.cabang} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#003A60] transition-all bg-white text-black font-bold" placeholder="E.g., Jakarta" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black mb-1">Member Number (Optional)</label>
                      <input type="text" name="no_anggota" value={formData.no_anggota} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#003A60] transition-all bg-white text-black font-bold" placeholder="E.g., WD-001" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-1">Instagram Account</label>
                    <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#003A60] transition-all bg-white text-black font-bold" placeholder="@username" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-1">Upload Proof of Profession (Optional)</label>
                    <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full bg-white border border-slate-300 text-black font-bold rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#003A60] mb-2" />
                    {formData.bukti_profesi && (
                      <a href={formData.bukti_profesi} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline inline-block">
                        View current proof of profession
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#003A60] text-white rounded-xl font-bold shadow-lg shadow-sky-900/20 hover:bg-[#002B4A] transition-all disabled:opacity-50 flex justify-center items-center"
                >
                  {loading ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
