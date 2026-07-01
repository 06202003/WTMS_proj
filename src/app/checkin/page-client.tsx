"use client";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface CheckInProps {
  userName: string;
  partnerName?: string;
  tournamentName: string;
  categoryName: string;
  qrCode: string;
  noReg: string;
}

function QRCodeCard({ title, qrValue, name, icon: Icon, color }: { title: string, qrValue: string, name: string, icon: any, color: string }) {
  return (
    <div className={`p-6 border-2 rounded-3xl shadow-sm mb-6 bg-white relative overflow-hidden border-${color}-100`}>
      <div className={`absolute top-0 left-0 w-full h-2 bg-${color}-500`}></div>
      <div className="flex flex-col items-center">
        <div className={`w-12 h-12 bg-${color}-50 text-${color}-600 rounded-full flex items-center justify-center mb-3`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-900 text-lg mb-1">{title}</h3>
        <p className="text-sm font-semibold text-slate-500 mb-6 text-center">{name}</p>
        
        <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm mb-2 inline-block">
          <QRCodeSVG 
            value={qrValue} 
            size={180}
            level="Q"
            includeMargin={false}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2">Scan to claim</p>
      </div>
    </div>
  );
}

export default function CheckInClient({
  userName,
  partnerName,
  tournamentName,
  categoryName,
  qrCode,
  noReg
}: CheckInProps) {
  const [activeTab, setActiveTab] = useState<"P1" | "P2">("P1");

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-12 px-4 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">E-Tiket Turnamen</h1>
          <p className="text-slate-500 text-sm">
            {categoryName} • {tournamentName}
          </p>
        </div>

        {partnerName && (
          <div className="flex bg-slate-200 p-1 rounded-2xl mb-8">
            <button
              onClick={() => setActiveTab("P1")}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                activeTab === "P1" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-300/50"
              }`}
            >
              Player 1: {userName}
            </button>
            <button
              onClick={() => setActiveTab("P2")}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                activeTab === "P2" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-300/50"
              }`}
            >
              Player 2: {partnerName}
            </button>
          </div>
        )}

        {/* Player 1 Section */}
        {activeTab === "P1" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <QRCodeCard 
              title="Check-In & Jersey" 
              name={userName} 
              qrValue={`${qrCode}-P1-CHECKIN`} 
              icon={QrCode} 
              color="blue" 
            />
            <QRCodeCard 
              title="Kupon Konsumsi" 
              name={userName} 
              qrValue={`${qrCode}-P1-MEAL`} 
              icon={QrCode} 
              color="orange" 
            />
          </div>
        )}

        {/* Player 2 Section */}
        {activeTab === "P2" && partnerName && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <QRCodeCard 
              title="Check-In & Jersey" 
              name={partnerName} 
              qrValue={`${qrCode}-P2-CHECKIN`} 
              icon={QrCode} 
              color="blue" 
            />
            <QRCodeCard 
              title="Kupon Konsumsi" 
              name={partnerName} 
              qrValue={`${qrCode}-P2-MEAL`} 
              icon={QrCode} 
              color="orange" 
            />
          </div>
        )}

        <div className="bg-slate-50 p-6 border border-slate-200 border-dashed rounded-2xl flex justify-between text-sm mb-6 max-w-md mx-auto">
          <span className="text-slate-500 font-semibold">No. Reg:</span>
          <span className="font-mono font-bold text-slate-900">{noReg}</span>
        </div>

        <div className="text-center">
          <Link href="/dashboard" className="text-sm font-bold text-[#003A60] hover:text-blue-600 transition-colors">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
