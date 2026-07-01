"use client";
import Swal from "sweetalert2";
import { useState } from "react";
import { UploadCloud, CheckCircle, Clock, AlertTriangle, FileText, User, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";

import { useRouter } from "next/navigation";

export default function DashboardClient({ userName, registrations }: { userName: string, registrations: any[] }) {
  const router = useRouter();
  const [uploadStatuses, setUploadStatuses] = useState<Record<number, "IDLE" | "UPLOADING" | "SUCCESS">>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<number, File | null>>({});

  const handleUpload = async (regId: number) => {
    const file = selectedFiles[regId];
    if (!file) {
      Swal.fire("Please select a file first.");
      return;
    }
    setUploadStatuses(prev => ({ ...prev, [regId]: "UPLOADING" }));
    try {
      const formData = new FormData();
      formData.append("registrationId", regId.toString());
      formData.append("file", file);

      const res = await fetch("/api/upload-payment", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        setUploadStatuses(prev => ({ ...prev, [regId]: "SUCCESS" }));
        router.refresh();
      } else {
        const data = await res.json();
        setUploadStatuses(prev => ({ ...prev, [regId]: "IDLE" }));
        Swal.fire(data.error || "Upload failed.");
      }
    } catch (e) {
      setUploadStatuses(prev => ({ ...prev, [regId]: "IDLE" }));
      Swal.fire("An error occurred.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar Dashboard */}
      <nav className="bg-[#003A60] text-white px-6 py-4 shadow-md sticky top-0 z-30">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <User className="w-5 h-5 text-sky-50" />
            </div>
            <div>
              <p className="text-sm text-sky-200">Participant</p>
              <p className="font-bold">{userName}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 md:gap-6 justify-center">
            <Link href="/dashboard" className="text-sm font-bold border-b-2 border-white pb-1 transition-all">
              My Registrations
            </Link>
            <Link href="/tournaments" className="text-sm font-semibold text-sky-100 hover:text-white hover:border-b-2 hover:border-white/50 pb-1 transition-all">
              Find Tournaments
            </Link>
            <Link href="/profile" className="text-sm font-semibold text-sky-100 hover:text-white hover:border-b-2 hover:border-white/50 pb-1 transition-all">
              My Profile
            </Link>
            <Link href="/api/auth/signout" className="flex items-center text-sm font-semibold text-red-200 hover:text-red-300 transition-colors ml-2">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Your Registration Status</h1>

        {!registrations || registrations.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">No Registrations Yet</h2>
            <p className="text-slate-500 mb-8">You haven't registered for any active tournaments.</p>
            <Link href="/tournaments" className="px-6 py-3 bg-[#003A60] text-white font-bold rounded-xl shadow-lg hover:bg-[#0260A5] transition-all">
              Find Tournaments
            </Link>
          </div>
        ) : (
        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-8">
            {registrations.map(registration => {
              const uploadStatus = uploadStatuses[registration.id] || "IDLE";
              const selectedFile = selectedFiles[registration.id];
              
              return (
                <div key={registration.id} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <FileText className="w-48 h-48" />
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{registration.tournament}</h2>
                      <p className="text-slate-500 font-medium">{registration.category}</p>
                    </div>
                    <div className="text-right">
                      {registration.status === 'PENDING' && (
                        <span className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-bold text-sm">
                          <Clock className="w-4 h-4 mr-2" />
                          Awaiting Payment
                        </span>
                      )}
                      {registration.status === 'PAYMENT_UPLOADED' && (
                        <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-bold text-sm">
                          <Clock className="w-4 h-4 mr-2" />
                          In Review
                        </span>
                      )}
                      {registration.status === 'APPROVED' && (
                        <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full font-bold text-sm">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approved
                        </span>
                      )}
                      {registration.status === 'CHECKED_IN' && (
                        <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-bold text-sm">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Checked-In
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Registration No</p>
                      <p className="font-mono text-lg font-bold text-slate-800">{registration.noReg}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Submit Date</p>
                      <p className="text-lg font-bold text-slate-800">{registration.date}</p>
                    </div>
                  </div>

                  {/* Conditional Upload Section */}
                  {registration.status === 'CHECKED_IN' ? (
                    <div className="border-2 border-green-600 rounded-2xl p-8 text-center bg-green-50 relative z-10">
                      <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-600/30">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">You have Checked-In</h3>
                      <p className="text-slate-500 max-w-sm mx-auto mb-6">Welcome to Wimbledoc Padel Tournament! Your jersey and equipment have been provided at the venue.</p>
                    </div>
                  ) : registration.status === 'APPROVED' ? (
                    <div className="border-2 border-[#003A60] rounded-2xl p-8 text-center bg-sky-50 relative z-10">
                      <div className="w-16 h-16 bg-[#003A60] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">E-Ticket & QR Code Available</h3>
                      <p className="text-slate-500 max-w-sm mx-auto mb-6">Your registration has been approved. Please use this QR Code when checking in at the tournament.</p>
                      <Link href="/checkin" className="px-8 py-3 bg-[#003A60] text-white font-bold rounded-xl shadow-lg hover:bg-[#0260A5] transition-all inline-block">
                        View E-Ticket
                      </Link>
                    </div>
                  ) : registration.status === 'REJECTED' ? (
                    <div className="border-2 border-red-200 rounded-2xl p-8 text-center bg-red-50 relative z-10">
                      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Registration Rejected</h3>
                      <p className="text-slate-600 max-w-sm mx-auto mb-4">We're sorry, your registration for this tournament has been rejected.</p>
                      {registration.rejectReason && (
                        <div className="bg-white p-4 rounded-xl border border-red-100 text-red-700 text-sm text-left shadow-sm">
                          <strong>Reason for Rejection:</strong>
                          <p className="mt-1">{registration.rejectReason}</p>
                        </div>
                      )}
                    </div>
                  ) : registration.status === 'PAYMENT_UPLOADED' || uploadStatus === "SUCCESS" ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/50 relative z-10">
                      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                          <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Payment in Verification</h3>
                        <p className="text-slate-500 max-w-sm mb-6">The committee will verify your payment within 1x24 hours.</p>
                      </div>
                    </div>
                  ) : registration.status === 'EXPIRED' ? (
                    <div className="border-2 border-red-200 rounded-2xl p-8 text-center bg-red-50 relative z-10">
                      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Registration Expired</h3>
                      <p className="text-slate-600 max-w-sm mx-auto mb-4">Your 30-minute payment window has expired. Please re-register if you want to participate.</p>
                      <Link href="/tournaments" className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition-all inline-block">
                        Browse Tournaments
                      </Link>
                    </div>
                  ) : (
                    <div className={`border-2 border-dashed ${registration.status === 'PAYMENT_REJECTED' ? 'border-amber-400 bg-amber-50/30' : 'border-slate-200 bg-slate-50/50'} rounded-2xl p-8 text-center relative z-10 transition-colors`}>
                      <div className="flex flex-col items-center">
                        {registration.status === 'PAYMENT_REJECTED' && (
                          <div className="w-full bg-amber-100 text-amber-800 p-4 rounded-xl mb-6 text-sm text-left flex items-start">
                            <AlertTriangle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                            <div>
                              <strong>Payment Proof Rejected</strong>
                              <p className="mt-1">{registration.rejectReason || "Please re-upload a valid transfer receipt."}</p>
                            </div>
                          </div>
                        )}
                        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                          <UploadCloud className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">
                          {registration.status === 'PAYMENT_REJECTED' ? "Re-upload Payment Proof" : "Upload Payment Proof"}
                        </h3>
                        <p className="text-slate-500 text-sm max-w-md mb-6">
                          Complete your payment of <strong>Rp {registration.price?.toLocaleString('id-ID')}</strong> to secure your slot.
                        </p>
                        
                        <Link 
                          href={`/register/payment/${registration.id}`}
                          className="px-8 py-3 bg-[#003A60] text-white font-bold rounded-xl shadow-lg shadow-sky-900/20 hover:bg-[#002B4A] transition-all flex items-center"
                        >
                          Go to Payment Page
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
                Important Information
              </h3>
              <ul className="space-y-4 text-sm text-slate-600">
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0"></div>
                  <p>Your quota is reserved for <strong>2 hours</strong>. If payment proof is not uploaded, the registration will be canceled.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0"></div>
                  <p>Make sure the sender's name on the receipt matches or include the Registration Number as a note.</p>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
              <h3 className="font-bold text-[#003A60] mb-2">Need Help?</h3>
              <p className="text-sm text-blue-700 mb-4">Contact Wimbledoc admin via WhatsApp if you experience payment issues.</p>
              <button className="w-full py-2.5 bg-white text-blue-700 font-bold rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors text-sm">
                Contact Admin
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
