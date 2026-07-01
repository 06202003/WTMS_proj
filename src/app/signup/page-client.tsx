"use client";

import { useState } from "react";
import { UserPlus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Select from "react-select";

export default function SignupPageClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [cabang, setCabang] = useState("");
  const [profesi, setProfesi] = useState("");
  const [spesialisasi, setSpesialisasi] = useState("");
  const [kategoriTempatKerja, setKategoriTempatKerja] = useState("");
  const [tempatKerja, setTempatKerja] = useState("");
  const [instagram, setInstagram] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama_lengkap: name,
          email,
          no_whatsapp: phone,
          password,
          cabang,
          profesi,
          spesialisasi,
          kategori_tempat_kerja: kategoriTempatKerja,
          tempat_kerja: tempatKerja,
          instagram,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account.");
        setLoading(false);
      } else {
        let nextUrl = "/login?signup=success";
        if (callbackUrl) {
          nextUrl += `&callbackUrl=${encodeURIComponent(callbackUrl)}`;
        }
        router.push(nextUrl);
      }
    } catch (err) {
      setError("A connection error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8 text-center bg-gradient-to-br from-[#003A60] to-[#216538] text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Create New Account</h1>
          <p className="text-sky-100/80 text-sm">Create an account to start registering for WTMS tournaments</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#003A60] transition-all bg-white text-black font-bold"
                placeholder="Ahmad Reza"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#003A60] transition-all bg-white text-black font-bold"
                placeholder="reza@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1">WhatsApp Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#003A60] transition-all bg-white text-black font-bold"
                placeholder="08123456789"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#003A60] transition-all bg-white text-black font-bold"
                placeholder="••••••••"
                required
              />
            </div>
            
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
                  value={profesi ? { value: profesi, label: profesi } : null}
                  onChange={(selected: any) => setProfesi(selected?.value || "")}
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
              {profesi === "Dokter Spesialis" && (
                <div>
                  <label className="block text-sm font-bold text-black mb-1">Specialization</label>
                  <input
                    type="text"
                    value={spesialisasi}
                    onChange={(e) => setSpesialisasi(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#003A60] transition-all bg-white text-black font-bold"
                    placeholder="E.g., Cardiologist"
                  />
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
                  value={kategoriTempatKerja ? { value: kategoriTempatKerja, label: kategoriTempatKerja } : null}
                  onChange={(selected: any) => setKategoriTempatKerja(selected?.value || "")}
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
                <input
                  type="text"
                  value={tempatKerja}
                  onChange={(e) => setTempatKerja(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#003A60] transition-all bg-white text-black font-bold"
                  placeholder="E.g., RSUD Dr. Soetomo"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-black mb-1">Instagram Account (Optional)</label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#003A60] transition-all bg-white text-black font-bold"
                  placeholder="@username"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">City (Origin) (Optional)</label>
                <input
                  type="text"
                  value={cabang}
                  onChange={(e) => setCabang(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#003A60] transition-all bg-white text-black font-bold"
                  placeholder="E.g., Jakarta"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#003A60] text-white rounded-xl font-bold hover:bg-[#0260A5] transition-all disabled:opacity-50 mt-4 flex justify-center items-center"
            >
              {loading ? "Processing..." : "Create Account"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href={`/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} className="text-[#0260A5] font-semibold hover:underline">
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
