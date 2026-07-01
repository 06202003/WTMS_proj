"use client";
import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { CheckCircle, AlertTriangle, QrCode } from "lucide-react";

export default function CheckinClient() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<"IDLE" | "SUCCESS" | "ERROR" | "CONFIRM">("IDLE");
  const [message, setMessage] = useState("");
  const [regData, setRegData] = useState<any>(null);
  
  const [checkin1, setCheckin1] = useState(false);
  const [checkin2, setCheckin2] = useState(false);
  const [jersey1, setJersey1] = useState(false);
  const [jersey2, setJersey2] = useState(false);
  const [mealTaken, setMealTaken] = useState(false);
  
  const [initialState, setInitialState] = useState<any>(null);
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
      const res = await fetch("/api/admin/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: text, dryRun: true })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (data.autoSuccess) {
          setStatus("SUCCESS");
          setMessage(data.message || "Auto-scan successful");
          fetchParticipants();
          setTimeout(() => {
             setStatus("IDLE");
             setScanResult(null);
             setMessage("");
          }, 3500); // 3.5s auto reset
          return;
        }

        setRegData(data.regData);
        const p1CheckedIn = !!data.regData.p1_checked_in_at;
        const p2CheckedIn = !!data.regData.p2_checked_in_at;
        const j1Taken = !!data.regData.jersey_taken_p1;
        const j2Taken = !!data.regData.jersey_taken_p2;
        const mealTakenDB = !!data.regData.meal_taken;
        
        setCheckin1(p1CheckedIn);
        setCheckin2(p2CheckedIn);
        setJersey1(j1Taken);
        setJersey2(j2Taken);
        setMealTaken(mealTakenDB);
        
        setInitialState({
          checkin1: p1CheckedIn,
          checkin2: p2CheckedIn,
          jersey1: j1Taken,
          jersey2: j2Taken,
          mealTaken: mealTakenDB
        });
        
        setStatus("CONFIRM");
      } else {
        setStatus("ERROR");
        setMessage(data.error || "Failed to verify QR Code.");
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

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          qrCode: scanResult, 
          checkin_p1: checkin1,
          checkin_p2: checkin2,
          jersey_taken_p1: jersey1, 
          jersey_taken_p2: jersey2,
          meal_taken: mealTaken
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus("SUCCESS");
        setMessage(`Successfully processed: ${data.name} (${data.category})`);
        fetchParticipants();
        setTimeout(() => {
          setStatus("IDLE");
          setScanResult(null);
          setMessage("");
        }, 3000);
      } else {
        setStatus("ERROR");
        setMessage(data.error || "Failed to check-in.");
        setTimeout(() => {
          setStatus("IDLE");
          setScanResult(null);
          setMessage("");
        }, 3000);
      }
    } catch (e) {
      setStatus("ERROR");
      setMessage("Error occurred during check-in.");
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
          <h1 className="text-3xl font-bold text-slate-900">Participant Check-in</h1>
          <p className="text-slate-500 mt-1">Scan participant's QR Code to verify registration and jersey collection.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <QrCode className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-6">Scan QR Code</h2>
          
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
          <p className="text-sm text-slate-500 mt-6">Point the camera at the QR Code on the participant's E-Ticket.</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-center">
          <h2 className="text-xl font-bold text-slate-900 mb-6 text-center border-b pb-4">Verification Result</h2>
          
          {status === "IDLE" && (
             <div className="text-center text-slate-400 py-12">
               <QrCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
               <p>Waiting for scan result...</p>
             </div>
          )}

          {status === "CONFIRM" && regData && (
              <div className="animate-in fade-in zoom-in duration-300 space-y-4">
                {(initialState.checkin1 || initialState.checkin2) && (
                  <div className="bg-amber-100 text-amber-800 p-4 rounded-xl border border-amber-200 text-sm font-medium flex items-start">
                    <AlertTriangle className="w-5 h-5 mr-3 shrink-0 text-amber-600" />
                    <p>Participants have partially or fully checked in. You are updating attendance/jersey data.</p>
                  </div>
                )}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-lg">{regData.name} {regData.partner_name ? "& " + regData.partner_name : ""}</h3>
                  <p className="text-slate-700 text-sm font-medium">{regData.category}</p>
                </div>
                
                <div className="space-y-4 mt-4">
                  <div className="bg-white p-4 border rounded-xl shadow-sm">
                    <p className="font-bold text-slate-900 mb-3 border-b pb-2">Player 1 ({regData.name})</p>
                    <label className="flex items-center gap-3 mb-2 cursor-pointer">
                      <input type="checkbox" className="w-5 h-5" checked={checkin1} disabled={initialState.checkin1} onChange={(e) => setCheckin1(e.target.checked)} />
                      <span className="text-slate-800 font-medium">Present / Checked-In</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-5 h-5" checked={jersey1} disabled={initialState.jersey1} onChange={(e) => setJersey1(e.target.checked)} />
                      <span className="text-slate-800 font-medium">Take Jersey (Size: {regData.ukuran_jersey_p1})</span>
                    </label>
                  </div>

                  {regData.partner_name && (
                    <div className="bg-white p-4 border rounded-xl shadow-sm">
                      <p className="font-bold text-slate-900 mb-3 border-b pb-2">Player 2 ({regData.partner_name})</p>
                      <label className="flex items-center gap-3 mb-2 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5" checked={checkin2} disabled={initialState.checkin2} onChange={(e) => setCheckin2(e.target.checked)} />
                        <span className="text-slate-800 font-medium">Present / Checked-In</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5" checked={jersey2} disabled={initialState.jersey2} onChange={(e) => setJersey2(e.target.checked)} />
                        <span className="text-slate-800 font-medium">Take Jersey (Size: {regData.ukuran_jersey_p2})</span>
                      </label>
                    </div>
                  )}

                  {regData.meals && regData.meals.length > 0 && (
                    <div className="bg-orange-50 p-4 border border-orange-100 rounded-xl shadow-sm mt-4">
                      <p className="font-bold text-orange-900 mb-2">Meals (Konsumsi) for this Tournament</p>
                      <ul className="list-disc list-inside text-sm text-orange-800 mb-3">
                        {regData.meals.map((m: any, i: number) => (
                          <li key={i}>{m.name} {m.description && <span className="opacity-75">- {m.description}</span>}</li>
                        ))}
                      </ul>
                      <label className="flex items-center gap-3 cursor-pointer border-t border-orange-200 pt-3 mt-2">
                        <input type="checkbox" className="w-5 h-5" checked={mealTaken} disabled={initialState.mealTaken} onChange={(e) => setMealTaken(e.target.checked)} />
                        <span className="text-orange-900 font-medium">Meal Taken / Given to Participant</span>
                      </label>
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className="w-full mt-6 py-3 font-bold rounded-xl transition-colors disabled:opacity-50 text-white bg-green-600 hover:bg-green-700"
                >
                  Confirm Check-in
                </button>
              </div>
          )}

          {status === "SUCCESS" && (
             <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
               <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CheckCircle className="w-10 h-10" />
               </div>
               <h3 className="text-2xl font-bold text-green-700 mb-2">Check-in Successful</h3>
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
          <h2 className="text-xl font-bold text-slate-900">Recent Check-ins</h2>
          <button onClick={fetchParticipants} className="text-sm font-bold text-blue-600 hover:text-blue-800">
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
                <th className="px-6 py-5">Check-in P1</th>
                <th className="px-6 py-5 border-l border-slate-200">Player 2 Name</th>
                <th className="px-6 py-5">Workplace (P2)</th>
                <th className="px-6 py-5 rounded-tr-xl">Check-in P2</th>
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
                    {p.p1_checked_in ? (
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" /> Checked In
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {new Date(p.p1_checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                        Pending
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
                      p.p2_checked_in ? (
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" /> Checked In
                          </span>
                          <div className="text-[10px] text-slate-500 mt-1">
                            {new Date(p.p2_checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                          Pending
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
