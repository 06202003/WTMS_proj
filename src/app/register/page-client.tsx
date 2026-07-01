"use client";
import Swal from "sweetalert2";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ChevronRight, ChevronLeft, User, Users, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Select from "react-select";
import { indonesianCities } from "@/lib/cities";
import { doctorSpecializations } from "@/lib/specializations";

const steps = [
  { id: 1, name: "Tournament & Category", icon: Trophy },
  { id: 2, name: "Player 1 Data", icon: User },
  { id: 3, name: "Player 2 Data", icon: Users },
  { id: 4, name: "Confirmation", icon: CheckCircle }
];

interface TournamentData {
  id: number;
  name: string;
  categories: string[];
}

interface CurrentUser {
  name: string;
  email: string;
  phone: string;
  profesi: string;
  spesialisasi: string;
  kategoriTempatKerja?: string;
  tempatKerja: string;
  instagram: string;
}

const customStyles = {
  control: (base: any, state: any) => ({
    ...base,
    background: '#ffffff',
    borderColor: state.isFocused ? '#3b82f6' : '#cbd5e1',
    borderRadius: '0.75rem',
    padding: '0.25rem',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
    '&:hover': {
      borderColor: '#3b82f6'
    }
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected ? '#003A60' : state.isFocused ? '#eff6ff' : 'white',
    color: state.isSelected ? 'white' : '#0f172a',
    fontWeight: state.isSelected ? '700' : '500',
    '&:active': {
      backgroundColor: '#003A60',
      color: 'white'
    }
  }),
  menu: (base: any) => ({
    ...base,
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    zIndex: 50
  }),
  singleValue: (base: any) => ({
    ...base,
    color: '#0f172a',
    fontWeight: '700'
  })
};

const professionOptions = [
  { value: "General Practitioner", label: "General Practitioner" },
  { value: "Specialist Doctor", label: "Specialist Doctor" },
  { value: "Dentist", label: "Dentist" },
  { value: "Other", label: "Other" }
];

const jerseyOptions = [
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "XXL", label: "XXL" }
];

const workplaceOptions = [
  { value: "Clinic", label: "Clinic" },
  { value: "Hospital", label: "Hospital" },
  { value: "Pharmacy", label: "Pharmacy" },
  { value: "University", label: "University" },
  { value: "Other", label: "Other" }
];

export default function RegisterPageClient({ tournaments, currentUser }: { tournaments: TournamentData[], currentUser?: CurrentUser | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTournament = searchParams.get("tournamentId") || "";
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    tournament: defaultTournament,
    category: "",
    province: "",
    club: "",
    p1Name: "", p1Email: "", p1Phone: "", p1Jersey: "", p1Profesi: "", p1Spesialisasi: "", p1TempatKerja: "", p1TempatKerjaName: "", p1Instagram: "",
    p2Name: "", p2Email: "", p2Phone: "", p2Jersey: "", p2Profesi: "", p2Spesialisasi: "", p2TempatKerja: "", p2TempatKerjaName: "", p2Instagram: ""
  });
  const [p1Bukti, setP1Bukti] = useState<File | null>(null);
  const [p2Bukti, setP2Bukti] = useState<File | null>(null);

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.tournament || !formData.category || !formData.province || !formData.club) {
        Swal.fire("Please fill all required fields in this step.");
        return false;
      }
    } else if (step === 2) {
      if (!formData.p1Name || !formData.p1Email || !formData.p1Phone || !formData.p1Jersey || !formData.p1Profesi || !formData.p1TempatKerja || !formData.p1TempatKerjaName) {
        Swal.fire("Please fill all required fields (except Instagram and proof).");
        return false;
      }
      if (formData.p1Profesi === "Specialist Doctor" && !formData.p1Spesialisasi) {
        Swal.fire("Please select specialization.");
        return false;
      }
    } else if (step === 3) {
      if (!formData.p2Name || !formData.p2Phone || !formData.p2Jersey || !formData.p2Profesi || !formData.p2TempatKerja || !formData.p2TempatKerjaName) {
        Swal.fire("Please fill all required fields for Player 2.");
        return false;
      }
      if (formData.p2Profesi === "Specialist Doctor" && !formData.p2Spesialisasi) {
        Swal.fire("Please select specialization.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const form = new FormData();
      form.append("tournamentId", formData.tournament);
      form.append("category", formData.category);
      form.append("club", `${formData.club}, ${formData.province}`);
      
      form.append("p1Name", formData.p1Name);
      form.append("p1Email", formData.p1Email);
      form.append("p1Phone", formData.p1Phone);
      form.append("p1Jersey", formData.p1Jersey);
      form.append("p1Profesi", formData.p1Profesi);
      form.append("p1Spesialisasi", formData.p1Spesialisasi);
      form.append("p1TempatKerja", `${formData.p1TempatKerja} - ${formData.p1TempatKerjaName}`);
      form.append("p1Instagram", formData.p1Instagram);
      if (p1Bukti) form.append("p1Bukti", p1Bukti);
      
      form.append("p2Name", formData.p2Name);
      form.append("p2Email", formData.p2Email);
      form.append("p2Phone", formData.p2Phone);
      form.append("p2Jersey", formData.p2Jersey);
      form.append("p2Profesi", formData.p2Profesi);
      form.append("p2Spesialisasi", formData.p2Spesialisasi);
      form.append("p2TempatKerja", `${formData.p2TempatKerja} - ${formData.p2TempatKerjaName}`);
      form.append("p2Instagram", formData.p2Instagram);
      if (p2Bukti) form.append("p2Bukti", p2Bukti);

      const res = await fetch("/api/register", {
        method: "POST",
        body: form
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/register/payment/" + data.registrationId);
        router.refresh();
      } else {
        Swal.fire(data.error || "Registration failed.");
      }
    } catch (e) {
      console.error(e);
      Swal.fire("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tournamentOptions = tournaments.map(t => ({ value: t.id.toString(), label: t.name }));
  const selectedTournamentData = tournaments.find(t => t.id.toString() === formData.tournament);
  const categoryOptions = selectedTournamentData?.categories?.map(c => ({ value: c, label: c })) || [];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-4">
          <Link href="/tournaments" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-[#003A60] transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Tournaments
          </Link>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-[#003A60] mb-3">Tournament Registration</h1>
          <p className="text-slate-500">Complete the form below to register your team.</p>
        </div>

        <div className="mb-12">
          <div className="flex justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 -translate-y-1/2 rounded-full"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-blue-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
            
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep >= step.id;
              const isCurrent = currentStep === step.id;
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-300 ${isActive ? 'bg-blue-500 border-blue-100 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`mt-2 text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-[#003A60]' : 'text-slate-400'}`}>
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-visible relative min-h-[400px] pb-20">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 md:p-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Select Tournament & Category</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">Tournament</label>
                    <Select
                      styles={customStyles}
                      options={tournamentOptions}
                      placeholder="Select Tournament..."
                      value={tournamentOptions.find(o => o.value === formData.tournament) || null}
                      onChange={(opt: any) => setFormData({...formData, tournament: opt ? opt.value : "", category: ""})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">Match Category</label>
                    <Select
                      styles={customStyles}
                      options={categoryOptions}
                      placeholder="Select Category..."
                      value={categoryOptions.find(o => o.value === formData.category) || null}
                      onChange={(opt: any) => setFormData({...formData, category: opt ? opt.value : ""})}
                      noOptionsMessage={() => formData.tournament ? "No categories found" : "Select a tournament first"}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Province</label>
                      <Select
                        styles={customStyles}
                        options={indonesianCities.map(p => ({ label: p.label, value: p.label }))}
                        placeholder="Select Province..."
                        value={formData.province ? { label: formData.province, value: formData.province } : null}
                        onChange={(opt: any) => setFormData({...formData, province: opt ? opt.value : "", club: ""})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">City</label>
                      <Select
                        styles={customStyles}
                        options={indonesianCities.find(p => p.label === formData.province)?.options || []}
                        placeholder="Select City..."
                        value={formData.club ? { label: formData.club, value: formData.club } : null}
                        onChange={(opt: any) => setFormData({...formData, club: opt ? opt.value : ""})}
                        isDisabled={!formData.province}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 md:p-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Player 1 Data (Captain)</h2>
                {currentUser && (
                  <div className="flex items-center mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <input 
                      type="checkbox" 
                      id="autofill" 
                      className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            p1Name: currentUser.name || prev.p1Name,
                            p1Email: currentUser.email || prev.p1Email,
                            p1Phone: currentUser.phone || prev.p1Phone,
                            p1Profesi: currentUser.profesi || prev.p1Profesi,
                            p1Spesialisasi: currentUser.spesialisasi || prev.p1Spesialisasi,
                            p1TempatKerja: currentUser.kategoriTempatKerja || prev.p1TempatKerja,
                            p1TempatKerjaName: currentUser.tempatKerja || prev.p1TempatKerjaName,
                            p1Instagram: currentUser.instagram || prev.p1Instagram
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            p1Name: "", p1Email: "", p1Phone: "", p1Profesi: "", p1Spesialisasi: "", p1TempatKerja: "", p1TempatKerjaName: "", p1Instagram: ""
                          }));
                        }
                      }}
                    />
                    <label htmlFor="autofill" className="ml-3 font-semibold text-blue-900 cursor-pointer">
                      Autofill with my profile data
                    </label>
                  </div>
                )}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">Full Name</label>
                    <input type="text" value={formData.p1Name} onChange={e=>setFormData({...formData, p1Name: e.target.value})} className="w-full bg-white border border-slate-300 text-black font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003A60]" placeholder="Full Name" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Email</label>
                      <input type="email" value={formData.p1Email} onChange={e=>setFormData({...formData, p1Email: e.target.value})} className="w-full bg-white border border-slate-300 text-black font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003A60]" placeholder="address@email.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">WhatsApp No.</label>
                      <input type="tel" value={formData.p1Phone} onChange={e=>setFormData({...formData, p1Phone: e.target.value})} className="w-full bg-white border border-slate-300 text-black font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003A60]" placeholder="081234567890" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Profession</label>
                      <Select
                        styles={customStyles}
                        options={professionOptions}
                        placeholder="Select Profession..."
                        value={professionOptions.find(o => o.value === formData.p1Profesi) || (formData.p1Profesi ? { label: formData.p1Profesi, value: formData.p1Profesi } : null)}
                        onChange={(opt: any) => setFormData({...formData, p1Profesi: opt ? opt.value : ""})}
                      />
                    </div>
                    {formData.p1Profesi === "Specialist Doctor" && (
                      <div>
                        <label className="block text-sm font-bold text-black mb-2">Specialization</label>
                        <Select
                          styles={customStyles}
                          options={doctorSpecializations}
                          placeholder="Select Specialization..."
                          value={doctorSpecializations.find(o => o.value === formData.p1Spesialisasi) || (formData.p1Spesialisasi ? { label: formData.p1Spesialisasi, value: formData.p1Spesialisasi } : null)}
                          onChange={(opt: any) => setFormData({...formData, p1Spesialisasi: opt ? opt.value : ""})}
                        />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Workplace Category</label>
                      <Select
                        styles={customStyles}
                        options={workplaceOptions}
                        placeholder="Select Category..."
                        value={workplaceOptions.find(o => o.value === formData.p1TempatKerja) || (formData.p1TempatKerja ? { label: formData.p1TempatKerja, value: formData.p1TempatKerja } : null)}
                        onChange={(opt: any) => setFormData({...formData, p1TempatKerja: opt ? opt.value : ""})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Workplace Name</label>
                      <input type="text" value={formData.p1TempatKerjaName} onChange={e=>setFormData({...formData, p1TempatKerjaName: e.target.value})} className="w-full bg-white border border-slate-300 text-black font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003A60]" placeholder="E.g., RS Medika" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Instagram Account</label>
                      <input type="text" value={formData.p1Instagram} onChange={e=>setFormData({...formData, p1Instagram: e.target.value})} className="w-full bg-white border border-slate-300 text-black font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003A60]" placeholder="@username" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Jersey Size</label>
                      <Select
                        styles={customStyles}
                        options={jerseyOptions}
                        placeholder="Select Size..."
                        value={jerseyOptions.find(o => o.value === formData.p1Jersey) || null}
                        onChange={(opt: any) => setFormData({...formData, p1Jersey: opt ? opt.value : ""})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">Upload Profession Proof (Optional)</label>
                    <input type="file" onChange={e=>setP1Bukti(e.target.files?.[0] || null)} className="w-full bg-white border border-slate-300 text-black font-bold rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#003A60]" />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 md:p-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Player 2 Data (Partner)</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">Full Name</label>
                    <input type="text" value={formData.p2Name} onChange={e=>setFormData({...formData, p2Name: e.target.value})} className="w-full bg-white border border-slate-300 text-black font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003A60]" placeholder="Partner's Full Name" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Email (Optional)</label>
                      <input type="email" value={formData.p2Email} onChange={e=>setFormData({...formData, p2Email: e.target.value})} className="w-full bg-white border border-slate-300 text-black font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003A60]" placeholder="address@email.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">WhatsApp No.</label>
                      <input type="tel" value={formData.p2Phone} onChange={e=>setFormData({...formData, p2Phone: e.target.value})} className="w-full bg-white border border-slate-300 text-black font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003A60]" placeholder="081234567890" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Profession</label>
                      <Select
                        styles={customStyles}
                        options={professionOptions}
                        placeholder="Select Profession..."
                        value={professionOptions.find(o => o.value === formData.p2Profesi) || (formData.p2Profesi ? { label: formData.p2Profesi, value: formData.p2Profesi } : null)}
                        onChange={(opt: any) => setFormData({...formData, p2Profesi: opt ? opt.value : ""})}
                      />
                    </div>
                    {formData.p2Profesi === "Specialist Doctor" && (
                      <div>
                        <label className="block text-sm font-bold text-black mb-2">Specialization</label>
                        <Select
                          styles={customStyles}
                          options={doctorSpecializations}
                          placeholder="Select Specialization..."
                          value={doctorSpecializations.find(o => o.value === formData.p2Spesialisasi) || (formData.p2Spesialisasi ? { label: formData.p2Spesialisasi, value: formData.p2Spesialisasi } : null)}
                          onChange={(opt: any) => setFormData({...formData, p2Spesialisasi: opt ? opt.value : ""})}
                        />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Workplace Category</label>
                      <Select
                        styles={customStyles}
                        options={workplaceOptions}
                        placeholder="Select Category..."
                        value={workplaceOptions.find(o => o.value === formData.p2TempatKerja) || (formData.p2TempatKerja ? { label: formData.p2TempatKerja, value: formData.p2TempatKerja } : null)}
                        onChange={(opt: any) => setFormData({...formData, p2TempatKerja: opt ? opt.value : ""})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Workplace Name</label>
                      <input type="text" value={formData.p2TempatKerjaName} onChange={e=>setFormData({...formData, p2TempatKerjaName: e.target.value})} className="w-full bg-white border border-slate-300 text-black font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003A60]" placeholder="E.g., RS Medika" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Instagram Account</label>
                      <input type="text" value={formData.p2Instagram} onChange={e=>setFormData({...formData, p2Instagram: e.target.value})} className="w-full bg-white border border-slate-300 text-black font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003A60]" placeholder="@username" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Jersey Size</label>
                      <Select
                        styles={customStyles}
                        options={jerseyOptions}
                        placeholder="Select Size..."
                        value={jerseyOptions.find(o => o.value === formData.p2Jersey) || null}
                        onChange={(opt: any) => setFormData({...formData, p2Jersey: opt ? opt.value : ""})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">Upload Profession Proof (Optional)</label>
                    <input type="file" onChange={e=>setP2Bukti(e.target.files?.[0] || null)} className="w-full bg-white border border-slate-300 text-black font-bold rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#003A60]" />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="p-8 md:p-12 text-center">
                <div className="w-20 h-20 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Registration Confirmation</h2>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                  Make sure all your team's data is correct. After submitting, your registration will be in <strong>PENDING</strong> status and you will be directed to upload payment proof.
                </p>
                <div className="bg-slate-50 p-6 rounded-2xl text-left border border-slate-100 max-w-lg mx-auto">
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex justify-between"><span className="font-semibold text-slate-900">Tournament:</span> <span>{tournaments.find(t => t.id.toString() === formData.tournament)?.name || "Not selected"}</span></li>
                    <li className="flex justify-between"><span className="font-semibold text-slate-900">Category:</span> <span>{formData.category || "Not selected"}</span></li>
                    <li className="flex justify-between"><span className="font-semibold text-slate-900">Location:</span> <span>{formData.club ? `${formData.club}, ${formData.province}` : "Not selected"}</span></li>
                    <hr className="my-2 border-slate-200" />
                    <li className="flex justify-between"><span className="font-semibold text-slate-900">Player 1:</span> <span>{formData.p1Name || "Data not filled"}</span></li>
                    <li className="flex justify-between"><span className="font-semibold text-slate-900">Player 2:</span> <span>{formData.p2Name || "Data not filled"}</span></li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-0 left-0 right-0 bg-slate-50 border-t border-slate-100 p-6 md:px-12 flex justify-between items-center rounded-b-3xl">
            <button onClick={prevStep} disabled={currentStep === 1} className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:bg-slate-200'}`}>
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </button>
            
            {currentStep < steps.length ? (
              <button onClick={nextStep} className="flex items-center px-8 py-3 bg-[#003A60] text-white rounded-xl font-bold shadow-lg shadow-sky-900/20 hover:bg-[#002B4A] transition-colors">
                Next
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center px-8 py-3 bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-colors disabled:opacity-50">
                {isSubmitting ? "Processing..." : "Submit Registration"}
                <CheckCircle className="w-5 h-5 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
