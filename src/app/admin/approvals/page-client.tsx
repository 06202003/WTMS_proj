"use client";
import Swal from "sweetalert2";
import { Check, X as XIcon, Search, FileText, AlertCircle, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";

interface RegData {
  id: string;
  rawId: number;
  name: string;
  category: string;
  tournament?: string;
  date: string;
  status: string;
  proofUploaded: boolean;
  proofUrl: string | null;
  p1Name?: string;
  p1Phone?: string;
  p1Email?: string;
  p1Kerja?: string;
  p1Jersey?: string;
  p2Name?: string;
  p2Phone?: string;
  p2Email?: string;
  p2Kerja?: string;
  p2Jersey?: string;
  club?: string;
}

export default function ApprovalsClient({ initialRegistrations }: { initialRegistrations: RegData[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("PAYMENT_UPLOADED");
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectType, setRejectType] = useState<"REJECTED" | "PAYMENT_REJECTED">("PAYMENT_REJECTED");
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState<RegData | null>(null);

  const [selectedTournament, setSelectedTournament] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const tournaments = Array.from(new Set(initialRegistrations.map(r => r.tournament).filter(Boolean)));
  const categories = Array.from(new Set(initialRegistrations.map(r => r.category).filter(Boolean)));

  const handleApprove = async (rawId: number) => {
    if (!confirm("Approve this registration?")) return;
    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: rawId, status: "APPROVED" })
      });
      if (res.ok) {
        router.refresh();
      } else {
        Swal.fire("Failed to approve.");
      }
    } catch (e) {
      Swal.fire("An error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const submitReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectId || !rejectReason.trim()) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          registrationId: rejectId, 
          status: rejectType,
          reason: rejectReason
        })
      });
      if (res.ok) {
        setRejectModalOpen(false);
        setRejectReason("");
        router.refresh();
      } else {
        Swal.fire("Failed to reject.");
      }
    } catch (e) {
      Swal.fire("An error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredData = initialRegistrations.filter(r => {
    if (activeTab === "PENDING" && r.status !== "PENDING") return false;
    if (activeTab === "PAYMENT_UPLOADED" && r.status !== "PAYMENT_UPLOADED" && r.status !== "IN_REVIEW") return false;
    if (activeTab === "APPROVED" && r.status !== "APPROVED") return false;
    if (activeTab === "REJECTED" && r.status !== "REJECTED" && r.status !== "PAYMENT_REJECTED") return false;
    
    if (selectedTournament && r.tournament !== selectedTournament) return false;
    if (selectedCategory && r.category !== selectedCategory) return false;
    
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Registration Approvals</h1>
          <p className="text-slate-500 mt-1">Verify payment proofs and approve participants.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2 xl:pb-0">
            {["PENDING", "PAYMENT_UPLOADED", "APPROVED", "REJECTED"].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-gradient-to-r from-[#003A60] to-[#0260A5] text-white shadow-lg shadow-sky-900/20' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                {tab === "PAYMENT_UPLOADED" ? "NEEDS REVIEW" : tab === "REJECTED" ? "REJECTED" : tab}
              </button>
            ))}
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
            <Select
              value={selectedTournament ? { value: selectedTournament, label: selectedTournament } : null}
              onChange={(selected: any) => setSelectedTournament(selected?.value || "")}
              options={[{ value: "", label: "All Tournaments" }, ...tournaments.map(t => ({ value: t, label: t }))]}
              placeholder="All Tournaments"
              className="react-select-container text-black font-semibold min-w-[200px]"
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

            <Select
              value={selectedCategory ? { value: selectedCategory, label: selectedCategory } : null}
              onChange={(selected: any) => setSelectedCategory(selected?.value || "")}
              options={[{ value: "", label: "All Categories" }, ...categories.map(c => ({ value: c, label: c }))]}
              placeholder="All Categories"
              className="react-select-container text-black font-semibold min-w-[200px]"
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

            <div className="relative flex-1 md:w-auto min-w-[250px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search registration no. / name..." 
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-widest font-bold">
                <th className="px-6 py-5 rounded-tl-xl">Registration No</th>
                <th className="px-6 py-5">Team / Pair</th>
                <th className="px-6 py-5">Category</th>
                <th className="px-6 py-5">Transfer Proof</th>
                <th className="px-6 py-5 text-right rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredData.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-6 font-mono font-bold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => { setSelectedReg(reg); setDetailsModalOpen(true); }}>
                    {reg.id}
                  </td>
                  <td className="p-6 font-bold cursor-pointer" onClick={() => { setSelectedReg(reg); setDetailsModalOpen(true); }}>{reg.name}</td>
                  <td className="p-6 cursor-pointer" onClick={() => { setSelectedReg(reg); setDetailsModalOpen(true); }}>{reg.category}</td>
                  <td className="p-6">
                    {reg.proofUploaded && reg.proofUrl ? (
                      <a href={reg.proofUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                        <FileText className="w-4 h-4 mr-2" />
                        View Receipt
                      </a>
                    ) : (
                      <span className="flex items-center text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg font-medium text-sm w-fit">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Not Uploaded
                      </span>
                    )}
                  </td>
                  <td className="p-6">
                    {(reg.status === 'PENDING' || reg.status === 'PAYMENT_UPLOADED' || reg.status === 'IN_REVIEW') && (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleApprove(reg.rawId)}
                          disabled={isProcessing}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                          title="Approve"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => { setRejectId(reg.rawId); setRejectModalOpen(true); }}
                          disabled={isProcessing}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Reject / Revise"
                        >
                          <XIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    {(reg.status === 'REJECTED' || reg.status === 'PAYMENT_REJECTED') && (
                      <div className="flex items-center justify-end">
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 uppercase">
                          {reg.status.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                    {reg.status === 'APPROVED' && (
                      <div className="flex items-center justify-end">
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 uppercase">
                          APPROVED
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    No registration data with status <strong>{activeTab}</strong>.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <h2 className="text-xl font-extrabold text-slate-900">Reject Registration</h2>
              <button onClick={() => setRejectModalOpen(false)} className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 p-2 rounded-full border border-slate-200 transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitReject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Rejection Type</label>
                <Select 
                  value={rejectType ? { value: rejectType, label: rejectType === "PAYMENT_REJECTED" ? "Invalid Transfer Proof (Needs Re-upload)" : "Reject Completely (Registration Cancelled)" } : null} 
                  onChange={(selected: any) => setRejectType(selected?.value)}
                  options={[
                    { value: "PAYMENT_REJECTED", label: "Invalid Transfer Proof (Needs Re-upload)" },
                    { value: "REJECTED", label: "Reject Completely (Registration Cancelled)" }
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
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1.5" />
                  Reason for Rejection
                </label>
                <textarea 
                  required
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Enter the reason for rejection that will be sent to the registrant..."
                  className="w-full px-4 py-3 border rounded-xl h-32 resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end p-6 border-t border-slate-100 bg-slate-50/50 gap-3 -mx-6 -mb-6 mt-6">
                <button type="button" onClick={() => setRejectModalOpen(false)} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={isProcessing} className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-900/20 hover:shadow-red-900/40 hover:-translate-y-0.5 transition-all disabled:opacity-50">
                  {isProcessing ? "Saving..." : "Reject Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailsModalOpen && selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 sticky top-0">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Registration Details</h2>
                <p className="text-sm font-mono text-slate-500 mt-1">{selectedReg.id}</p>
              </div>
              <button onClick={() => setDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 p-2 rounded-full border border-slate-200 transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Player 1 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">1</div>
                    <h3 className="font-bold text-lg text-slate-900">Player 1</h3>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Name</p>
                      <p className="font-semibold text-slate-900">{selectedReg.p1Name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contact</p>
                      <p className="font-semibold text-slate-900">{selectedReg.p1Phone || '-'}</p>
                      <p className="text-sm text-slate-500">{selectedReg.p1Email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Workplace Category</p>
                      <p className="font-semibold text-slate-900">{selectedReg.p1Kerja || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Jersey Size</p>
                      <p className="font-semibold text-slate-900">{selectedReg.p1Jersey}</p>
                    </div>
                  </div>
                </div>

                {/* Player 2 */}
                {selectedReg.p2Name ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold">2</div>
                      <h3 className="font-bold text-lg text-slate-900">Player 2 (Partner)</h3>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Name</p>
                        <p className="font-semibold text-slate-900">{selectedReg.p2Name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contact</p>
                        <p className="font-semibold text-slate-900">{selectedReg.p2Phone || '-'}</p>
                        <p className="text-sm text-slate-500">{selectedReg.p2Email || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Workplace Category</p>
                        <p className="font-semibold text-slate-900">{selectedReg.p2Kerja || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Jersey Size</p>
                        <p className="font-semibold text-slate-900">{selectedReg.p2Jersey || '-'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center bg-slate-50 border border-slate-100 border-dashed rounded-3xl p-6 h-full min-h-[200px]">
                    <p className="text-slate-400 font-medium">Single Player (No Partner)</p>
                  </div>
                )}
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <h3 className="font-bold text-lg text-slate-900 mb-4">Registration Meta</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tournament</p>
                    <p className="font-semibold text-slate-900">{selectedReg.tournament}</p>
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Category</p>
                    <p className="font-semibold text-slate-900">{selectedReg.category}</p>
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Club / Branch</p>
                    <p className="font-semibold text-slate-900">{selectedReg.club || '-'}</p>
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                    <p className="font-semibold text-slate-900">{selectedReg.date}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center sticky bottom-0">
              <div className="flex gap-2">
                {selectedReg.proofUploaded && selectedReg.proofUrl ? (
                  <a href={selectedReg.proofUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors inline-flex items-center">
                    <FileText className="w-4 h-4 mr-2" /> View Payment Proof
                  </a>
                ) : (
                  <span className="px-5 py-2.5 bg-slate-100 text-slate-400 font-bold rounded-xl inline-flex items-center cursor-not-allowed">
                    <AlertCircle className="w-4 h-4 mr-2" /> No Payment Proof
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {(selectedReg.status === 'PENDING' || selectedReg.status === 'PAYMENT_UPLOADED' || selectedReg.status === 'IN_REVIEW') && (
                  <>
                    <button 
                      onClick={() => { setRejectId(selectedReg.rawId); setDetailsModalOpen(false); setRejectModalOpen(true); }}
                      className="px-5 py-2.5 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => { setDetailsModalOpen(false); handleApprove(selectedReg.rawId); }}
                      className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20"
                    >
                      Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
