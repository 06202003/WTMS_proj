"use client";
import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { CheckCircle, AlertTriangle, Utensils, QrCode } from "lucide-react";

export default function MealScanClient() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");
  const [message, setMessage] = useState("");
  
  const [participants, setParticipants] = useState<any[]>([]);
  
  const fetchParticipants = async () => {
    try {
      const res = await fetch("/api/admin/checkin/list");
      if (res.ok) {
        const data = await res.json();
        setParticipants(data.participants);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const handleScan = async (text: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setScanResult(text);
    
    try {
      // The backend API handles the auto-scan logic via dryRun
      const res = await fetch("/api/admin/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: text, dryRun: true })
      });
      
      const data = await res.json();
      
      if (res.ok && data.autoSuccess) {
        setStatus("SUCCESS");
        setMessage(data.message || "Meal scanned successfully!");
        fetchParticipants();
        setTimeout(() => {
            setStatus("IDLE");
            setScanResult(null);
            setMessage("");
        }, 3500);
      } else {
        setStatus("ERROR");
        // If it's not an auto-success, it's either an error or they scanned the wrong QR code (e.g., Check-in QR instead of Meal QR)
        setMessage(data.error || "Please scan a Meal Coupon (Kupon Konsumsi) QR Code.");
        setTimeout(() => {
          setStatus("IDLE");
          setScanResult(null);
          setMessage("");
        }, 3000);
      }
    } catch (e) {
      setStatus("ERROR");
      setMessage("Network error occurred.");
      setTimeout(() => {
        setStatus("IDLE");
        setScanResult(null);
        setMessage("");
      }, 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Meal Verification Scanner</h1>
          <p className="text-slate-500 mt-1">Scan participant's Meal QR Code to distribute food.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-orange-400"></div>
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 mt-2">
            <Utensils className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-6">Scan Meal QR Code</h2>
          
          <div className="max-w-xs mx-auto overflow-hidden rounded-2xl border-4 border-slate-100 relative bg-slate-900 aspect-square">
             {status === "IDLE" ? (
               <Scanner 
                  onScan={(result) => {
                    handleScan(result[0].rawValue);
                  }}
                  onError={(error) => console.log(error?.message)}
               />
             ) : (
               <div className="absolute inset-0 flex items-center justify-center">
                 <QrCode className="w-16 h-16 text-slate-700 animate-pulse" />
               </div>
             )}
             {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-10">
                  <div className="text-white font-bold animate-pulse">Processing...</div>
                </div>
             )}
          </div>
          <p className="text-sm text-slate-500 mt-6">Point the camera at the "Kupon Konsumsi" QR Code on the participant's E-Ticket.</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-center">
          <h2 className="text-xl font-bold text-slate-900 mb-6 text-center border-b pb-4">Verification Result</h2>
          
          {status === "IDLE" && (
             <div className="text-center text-slate-400 py-12">
               <QrCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
               <p>Waiting for scan result...</p>
             </div>
          )}

          {status === "SUCCESS" && (
             <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
               <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CheckCircle className="w-10 h-10" />
               </div>
               <h3 className="text-2xl font-bold text-green-700 mb-2">Meal Taken Successfully</h3>
               <p className="text-lg font-medium text-slate-800 mb-6">{message}</p>
             </div>
          )}

          {status === "ERROR" && (
             <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
               <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <AlertTriangle className="w-10 h-10" />
               </div>
               <h3 className="text-2xl font-bold text-red-700 mb-2">Failed</h3>
               <p className="text-lg font-medium text-red-600 mb-6">{message}</p>
             </div>
          )}
        </div>
      </div>

      {/* Verification Result Datatable */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
          <h2 className="text-xl font-bold text-slate-900">Meal Distribution Status</h2>
          <button onClick={fetchParticipants} className="text-sm font-bold text-orange-600 hover:text-orange-800">
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-widest font-bold">
                <th className="px-6 py-5 rounded-tl-xl">Category / Reg No</th>
                <th className="px-6 py-5 border-l border-slate-200">Player 1 Name</th>
                <th className="px-6 py-5">Workplace (P1)</th>
                <th className="px-6 py-5">Meal P1</th>
                <th className="px-6 py-5 border-l border-slate-200">Player 2 Name</th>
                <th className="px-6 py-5">Workplace (P2)</th>
                <th className="px-6 py-5 rounded-tr-xl">Meal P2</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {participants.map((p) => (
                <tr key={p.registration_id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-medium text-slate-700">
                    <div className="font-bold text-slate-900">{p.category_name}</div>
                    <div className="text-xs font-mono text-slate-500 mt-1">{p.no_registrasi}</div>
                  </td>
                  
                  {/* Player 1 */}
                  <td className="p-4 font-bold text-slate-900 border-l border-slate-100 bg-slate-50/30">
                    {p.p1_name}
                  </td>
                  <td className="p-4 text-sm text-slate-600 bg-slate-50/30">
                    {p.p1_tempat_kerja || "-"}
                  </td>
                  <td className="p-4 text-center bg-slate-50/30">
                    {p.p1_meal_taken ? (
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                          <CheckCircle className="w-3 h-3 mr-1" /> Taken
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {new Date(p.p1_meal_taken_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                        Not Taken
                      </span>
                    )}
                  </td>

                  {/* Player 2 */}
                  <td className="p-4 font-bold text-slate-900 border-l border-slate-100">
                    {p.p2_name || <span className="text-slate-400 font-normal italic">No Partner</span>}
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {p.p2_tempat_kerja || (p.p2_name ? "-" : "")}
                  </td>
                  <td className="p-4 text-center">
                    {p.p2_name ? (
                      p.p2_meal_taken ? (
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                            <CheckCircle className="w-3 h-3 mr-1" /> Taken
                          </span>
                          <div className="text-[10px] text-slate-500 mt-1">
                            {new Date(p.p2_meal_taken_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                          Not Taken
                        </span>
                      )
                    ) : null}
                  </td>
                </tr>
              ))}
              {participants.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    No participants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
