"use client";

import { useState } from "react";
import { Search, Trophy, CalendarDays, MapPin, ArrowRight, User, LogOut } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface TournamentData {
  id: number;
  name: string;
  description: string;
  date: Date;
  location: string;
  categories: { name: string; quota: number; availableSlots: number; isFull: boolean }[];
}

interface TournamentsPageClientProps {
  userName: string;
  tournaments: TournamentData[];
}

export default function TournamentsPageClient({
  userName,
  tournaments
}: TournamentsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTournaments = tournaments.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-semibold text-sky-100 hover:text-white hover:border-b-2 hover:border-white/50 pb-1 transition-all">
              My Registrations
            </Link>
            <Link href="/tournaments" className="text-sm font-bold border-b-2 border-white pb-1 transition-all">
              Find Tournaments
            </Link>
            <Link href="/api/auth/signout" className="flex items-center text-sm font-semibold text-red-200 hover:text-red-300 transition-colors">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Find Padel Tournaments</h1>
            <p className="text-slate-500 mt-1">Find active tournaments and register your team now.</p>
          </div>
          
          <div className="relative w-full md:w-auto min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tournaments or locations..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 text-black font-bold rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Tournaments Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTournaments.map((tourney) => (
            <div 
              key={tourney.id}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-sky-50 text-[#003A60] rounded-xl group-hover:bg-[#003A60] group-hover:text-white transition-colors">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-1 rounded-md text-[10px] font-bold tracking-wide bg-blue-100 text-blue-700">
                    REGISTRATION OPEN
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">{tourney.name}</h3>
                <p className="text-slate-500 text-xs mb-4 line-clamp-2">{tourney.description}</p>
                
                <div className="space-y-2 mb-5">
                  <div className="flex items-center text-slate-600 text-xs font-semibold">
                    <CalendarDays className="w-4 h-4 mr-2 text-slate-400" />
                    {format(tourney.date, "dd MMM yyyy")}
                  </div>
                  <div className="flex items-center text-slate-600 text-xs font-semibold">
                    <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                    {tourney.location}
                  </div>
                </div>

                <div className="mb-5">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Categories</p>
                  <div className="flex flex-col gap-1.5">
                    {tourney.categories.map((cat: any) => (
                      <div key={cat.name} className="flex justify-between items-center px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold">
                        <span className="text-slate-700">{cat.name}</span>
                        {cat.isFull ? (
                          <span className="text-red-600 bg-red-100 px-2 py-0.5 rounded-lg text-xs">FULL</span>
                        ) : (
                          <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded-lg text-xs">AVAILABLE</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                {tourney.categories.every((c: any) => c.isFull) ? (
                  <button 
                    disabled
                    className="w-full flex justify-center items-center py-2 px-3 bg-slate-300 text-slate-500 rounded-lg font-bold text-sm cursor-not-allowed"
                  >
                    Category Full
                  </button>
                ) : (
                  <Link 
                    href={`/register?tournamentId=${tourney.id}`} 
                    className="w-full flex justify-center items-center py-2 px-3 bg-[#003A60] text-white rounded-lg font-bold text-sm hover:bg-[#0260A5] transition-colors"
                  >
                    Register Now
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                )}
                <Link 
                  href={`/tournaments/${tourney.id}`} 
                  className="block w-full text-center py-2 px-3 bg-slate-100 text-slate-700 rounded-lg font-bold text-xs hover:bg-slate-200 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
          
          {filteredTournaments.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl p-12 border border-slate-100 text-center shadow-sm">
              <p className="text-slate-500 font-bold">No tournaments found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
