"use client";
import Swal from "sweetalert2";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, CheckCircle, Clock, AlertTriangle, ChevronLeft, Building } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface RegistrationData {
  id: number;
  tournamentName: string;
  categoryName: string;
  price: number;
  secondsLeft: number;
  status: string;
}

export default function PaymentClient({ registration }: { registration: RegistrationData }) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number>(Math.max(0, registration.secondsLeft)); 
  const [isExpired, setIsExpired] = useState(registration.secondsLeft <= 0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"IDLE" | "UPLOADING" | "SUCCESS">("IDLE");

  useEffect(() => {
    const calculateTimeLeft = () => {
      setTimeLeft(prev => {
        const next = prev - 1;
        if (next <= 0) {
          setIsExpired(true);
          if (registration.status === 'PENDING' && !isExpired) {
            fetch(`/api/register/expire`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ registrationId: registration.id })
            });
          }
          return 0;
        }
        return next;
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [registration]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploadStatus("UPLOADING");

    try {
      const formData = new FormData();
      formData.append("registrationId", registration.id.toString());
      formData.append("file", selectedFile);

      const res = await fetch("/api/upload-payment", {
        method: "POST",
        body: formData
      });
      
      if (res.ok) {
        setUploadStatus("SUCCESS");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 2000);
      } else {
        const data = await res.json();
        Swal.fire(data.error || "Upload failed");
        setUploadStatus("IDLE");
      }
    } catch (e) {
      Swal.fire("Error uploading payment proof");
      setUploadStatus("IDLE");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-[#003A60] transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-[#003A60] p-8 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-extrabold text-white mb-2">Complete Your Payment</h1>
              <p className="text-sky-200">Upload your payment proof to secure your slot</p>
            </div>
            {/* Decorative background */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          </div>

          <div className="p-8 md:p-12">
            {uploadStatus === "SUCCESS" ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Payment Uploaded!</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                  Your payment proof has been successfully submitted and is awaiting verification by the admin.
                </p>
                <p className="text-sm text-slate-400">Redirecting to dashboard...</p>
              </motion.div>
            ) : isExpired ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Payment Time Expired</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                  The 30-minute window for uploading your payment proof has expired. Please create a new registration if you still wish to participate.
                </p>
                <Link href={`/tournaments`} className="px-8 py-3 bg-[#003A60] text-white rounded-xl font-bold inline-block hover:bg-[#002B4A] transition-colors">
                  Browse Tournaments
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-12">
                {/* Details Section */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                    <Building className="w-5 h-5 mr-2 text-blue-500" />
                    Payment Details
                  </h3>
                  
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6">
                    <p className="text-sm text-slate-500 mb-1">Total Payment</p>
                    <p className="text-3xl font-extrabold text-[#003A60] mb-6">
                      Rp {registration.price.toLocaleString('id-ID')}
                    </p>

                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between border-b border-slate-200 pb-4">
                        <span className="text-slate-500">Bank</span>
                        <span className="font-bold text-slate-900">BCA</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-4">
                        <span className="text-slate-500">Account Number</span>
                        <span className="font-bold text-slate-900">123456789</span>
                      </div>
                      <div className="flex justify-between pb-2">
                        <span className="text-slate-500">Account Name</span>
                        <span className="font-bold text-slate-900">Wimbledoc Padel</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-800 text-sm">
                    <Clock className="w-6 h-6 shrink-0 text-amber-500" />
                    <div>
                      <p className="font-bold">Time remaining to pay:</p>
                      <p className="text-2xl font-mono font-bold tracking-tight">{formatTime(timeLeft)}</p>
                    </div>
                  </div>
                </div>

                {/* Upload Section */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Upload Proof</h3>
                  
                  <div className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl p-8 text-center transition-colors hover:border-blue-400">
                    <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4">
                      <UploadCloud className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-sm text-slate-500 mb-4">
                      Upload your transfer receipt here. Make sure the total matches exactly.
                    </p>
                    <input 
                      type="file" 
                      accept=".jpg,.jpeg,.png,.pdf" 
                      className="mb-6 block w-full text-sm text-slate-500
                        file:mr-4 file:py-2.5 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-bold
                        file:bg-blue-100 file:text-blue-700
                        hover:file:bg-blue-200 cursor-pointer"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      disabled={uploadStatus === "UPLOADING"}
                    />
                    
                    <button 
                      onClick={handleUpload}
                      disabled={!selectedFile || uploadStatus === "UPLOADING"}
                      className="w-full flex justify-center items-center py-4 bg-[#003A60] text-white rounded-xl font-bold text-lg hover:bg-[#002B4A] transition-colors shadow-lg shadow-sky-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadStatus === "UPLOADING" ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                          Processing...
                        </>
                      ) : (
                        "Submit Payment"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
