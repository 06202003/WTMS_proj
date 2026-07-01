"use client";
import { Download, FileSpreadsheet, Search } from "lucide-react";
import * as XLSX from "xlsx";
import { useState, useMemo } from "react";
import Select from "react-select";

export default function ExportClient({ initialData }: { initialData: any[] }) {
  const [search, setSearch] = useState("");
  const [selectedTournament, setSelectedTournament] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const tournaments = useMemo(() => {
    const unique = new Set(initialData.map(item => item["Turnamen"]));
    return Array.from(unique);
  }, [initialData]);

  const categories = useMemo(() => {
    let filtered = initialData;
    if (selectedTournament !== "ALL") {
      filtered = filtered.filter(item => item["Turnamen"] === selectedTournament);
    }
    const unique = new Set(filtered.map(item => item["Kategori"]));
    return Array.from(unique);
  }, [initialData, selectedTournament]);

  const filteredData = useMemo(() => {
    return initialData.filter(row => {
      const matchSearch = Object.values(row).some(val => 
        String(val).toLowerCase().includes(search.toLowerCase())
      );
      const matchTournament = selectedTournament === "ALL" || row["Turnamen"] === selectedTournament;
      const matchCategory = selectedCategory === "ALL" || row["Kategori"] === selectedCategory;
      const matchStatus = selectedStatus === "ALL" || row["Status"] === selectedStatus;
      return matchSearch && matchTournament && matchCategory && matchStatus;
    });
  }, [initialData, search, selectedTournament, selectedCategory, selectedStatus]);

  // Reset category if tournament changes and current category not in new list
  const handleTournamentChange = (t: string) => {
    setSelectedTournament(t);
    setSelectedCategory("ALL");
  };

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
    XLSX.writeFile(workbook, "Wimbledoc_Registrations_Export.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Participant List / Export Data</h1>
          <p className="text-slate-500 mt-1">Lihat dan unduh data peserta turnamen.</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center px-6 py-3 bg-[#003A60] text-white font-bold rounded-xl shadow-lg shadow-sky-900/20 hover:bg-[#002B4A] transition-all"
        >
          <Download className="w-5 h-5 mr-2" />
          Download Excel ({filteredData.length} Data)
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Filter Turnamen</label>
            <Select
              value={{ value: selectedTournament, label: selectedTournament === "ALL" ? "Semua Turnamen" : selectedTournament }}
              onChange={(selected: any) => handleTournamentChange(selected?.value || "ALL")}
              options={[
                { value: "ALL", label: "Semua Turnamen" },
                ...tournaments.map(t => ({ value: t as string, label: t as string }))
              ]}
              className="react-select-container text-black font-semibold"
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: '0.75rem',
                  borderColor: '#e2e8f0',
                  padding: '4px',
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: '#cbd5e1'
                  }
                })
              }}
            />
          </div>
          
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Filter Kategori</label>
            <Select
              value={{ value: selectedCategory, label: selectedCategory === "ALL" ? "Semua Kategori" : selectedCategory }}
              onChange={(selected: any) => setSelectedCategory(selected?.value || "ALL")}
              isDisabled={selectedTournament === "ALL"}
              options={[
                { value: "ALL", label: "Semua Kategori" },
                ...categories.map(c => ({ value: c as string, label: c as string }))
              ]}
              className="react-select-container text-black font-semibold"
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: '0.75rem',
                  borderColor: '#e2e8f0',
                  padding: '4px',
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: '#cbd5e1'
                  }
                })
              }}
            />
          </div>
          
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Filter Status</label>
            <Select
              value={{ value: selectedStatus, label: selectedStatus === "ALL" ? "Semua Status" : selectedStatus }}
              onChange={(selected: any) => setSelectedStatus(selected?.value || "ALL")}
              options={[
                { value: "ALL", label: "Semua Status" },
                { value: "APPROVED", label: "APPROVED" },
                { value: "PENDING", label: "PENDING" },
                { value: "IN_REVIEW", label: "IN_REVIEW" },
                { value: "PAYMENT_REJECTED", label: "PAYMENT_REJECTED" },
                { value: "REJECTED", label: "REJECTED" },
                { value: "CHECKED_IN", label: "CHECKED_IN" },
                { value: "EXPIRED", label: "EXPIRED" }
              ]}
              className="react-select-container text-black font-semibold"
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: '0.75rem',
                  borderColor: '#e2e8f0',
                  padding: '4px',
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: '#cbd5e1'
                  }
                })
              }}
            />
          </div>
          
          <div className="flex-1 w-full relative">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Pencarian</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari nama, no reg..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center">
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <FileSpreadsheet className="w-6 h-6 mr-2 text-blue-600" />
            Preview Data ({filteredData.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="p-4">No Reg</th>
                <th className="p-4">Turnamen</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Pemain 1 (Jersey)</th>
                <th className="p-4">Pemain 2 (Jersey)</th>
                <th className="p-4">Status</th>
                <th className="p-4">Waktu Daftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {filteredData.slice(0, 100).map((row, idx) => (
                <tr key={idx} className="hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => setSelectedRow(row)}>
                  <td className="p-4 font-mono font-bold text-slate-900">{row["No. Registrasi"]}</td>
                  <td className="p-4">{row["Turnamen"]}</td>
                  <td className="p-4 font-medium">{row["Kategori"]}</td>
                  <td className="p-4">{row["Pemain 1"]} <br/><span className="text-slate-400 text-xs">{row["Jersey P1"]}</span></td>
                  <td className="p-4">{row["Pemain 2"]} {row["Pemain 2"] !== "-" && <><br/><span className="text-slate-400 text-xs">{row["Jersey P2"]}</span></>}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${
                      row["Status"] === "APPROVED" || row["Status"] === "CHECKED_IN"
                        ? "bg-green-100 text-green-700" 
                        : row["Status"] === "REJECTED" || row["Status"] === "PAYMENT_REJECTED"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {row["Status"].replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-500">{row["Waktu Daftar"]}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    Tidak ada data registrasi yang sesuai pencarian.
                  </td>
                </tr>
              )}
              {filteredData.length > 100 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-sm text-slate-500 bg-slate-50">
                    Menampilkan 100 dari {filteredData.length} data. Silakan download Excel untuk melihat seluruhnya.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Row */}
      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedRow(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Detail Peserta</h3>
                <p className="text-sm text-slate-500 font-mono mt-1">{selectedRow["No. Registrasi"]}</p>
              </div>
              <button 
                onClick={() => setSelectedRow(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 hover:text-slate-700 transition-colors font-bold"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Turnamen</p>
                  <p className="font-semibold text-slate-800">{selectedRow["Turnamen"]}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Kategori</p>
                  <p className="font-semibold text-slate-800">{selectedRow["Kategori"]}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">Status Pendaftaran</h4>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider ${
                    selectedRow["Status"] === "APPROVED" || selectedRow["Status"] === "CHECKED_IN"
                      ? "bg-green-100 text-green-700" 
                      : selectedRow["Status"] === "REJECTED" || selectedRow["Status"] === "PAYMENT_REJECTED"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {selectedRow["Status"].replace('_', ' ')}
                  </span>
                  <span className="text-sm text-slate-500">{selectedRow["Waktu Daftar"]}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">Pemain & Jersey</h4>
                <div className="space-y-3">
                  <div className="flex flex-col p-4 border border-slate-100 rounded-xl bg-white space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{selectedRow["Pemain 1"]}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Ukuran Jersey: {selectedRow["Jersey P1"].split(' ')[0]}</p>
                      </div>
                      {selectedRow["Jersey P1"].includes('(Sudah)') ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-md">JERSEY SUDAH DIAMBIL</span>
                      ) : (
                        <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md">JERSEY BELUM DIAMBIL</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-2 border-t border-slate-50 pt-2">
                      <div><span className="font-semibold">Profesi:</span> {selectedRow["Profesi P1"]}</div>
                      <div><span className="font-semibold">Spesialisasi:</span> {selectedRow["Spesialisasi P1"]}</div>
                      <div><span className="font-semibold">Tempat Kerja:</span> {selectedRow["Tempat Kerja P1"]}</div>
                      <div><span className="font-semibold">Instagram:</span> {selectedRow["Instagram P1"]}</div>
                    </div>
                  </div>

                  {selectedRow["Pemain 2"] !== "-" && (
                    <div className="flex flex-col p-4 border border-slate-100 rounded-xl bg-white space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{selectedRow["Pemain 2"]}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Ukuran Jersey: {selectedRow["Jersey P2"].split(' ')[0]}</p>
                        </div>
                        {selectedRow["Jersey P2"].includes('(Sudah)') ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-md">JERSEY SUDAH DIAMBIL</span>
                        ) : (
                          <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md">JERSEY BELUM DIAMBIL</span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-2 border-t border-slate-50 pt-2">
                        <div><span className="font-semibold">Profesi:</span> {selectedRow["Profesi P2"]}</div>
                        <div><span className="font-semibold">Spesialisasi:</span> {selectedRow["Spesialisasi P2"]}</div>
                        <div><span className="font-semibold">Tempat Kerja:</span> {selectedRow["Tempat Kerja P2"]}</div>
                        <div><span className="font-semibold">Instagram:</span> {selectedRow["Instagram P2"]}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setSelectedRow(null)}
                className="px-6 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
