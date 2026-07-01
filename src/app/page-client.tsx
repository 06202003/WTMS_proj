"use client";

import { motion } from "framer-motion";
import { CalendarDays, MapPin, ArrowRight, Trophy } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface TournamentData {
  id: number;
  name: string;
  date: Date;
  location: string;
  status: string;
  categories: string[];
}

export default function LandingPageClient({ 
  tournaments, 
  isLoggedIn 
}: { 
  tournaments: TournamentData[]; 
  isLoggedIn: boolean; 
}) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Section */}
      <section className="relative min-h-screen pt-32 pb-20 flex items-center bg-[#003A60] overflow-hidden">
        {/* Dynamic Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-3/4 h-full bg-[#0260A5] opacity-20 -skew-x-12 translate-x-1/4 rounded-bl-[100px]"></div>
        <div className="absolute -bottom-32 left-10 w-96 h-96 bg-[#216538] opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-sky-400 opacity-20 rounded-full blur-3xl mix-blend-screen"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl text-white">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sky-200 font-semibold tracking-wide text-sm mb-6 backdrop-blur-md">
                  Padel Tournament Management
                </span>
                <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
                  WIMBLEDOC <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-white">INDONESIA TOUR</span>
                </h1>
                <p className="text-lg md:text-xl text-sky-100 mb-10 leading-relaxed font-light">
                  Join the most prestigious Padel Medical tournament series in Indonesia. Seamlessly register, manage your teams, and compete at the highest level.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  {isLoggedIn ? (
                    <Link href="/dashboard" className="inline-flex justify-center items-center px-8 py-4 bg-white text-[#003A60] rounded-full font-bold text-lg hover:bg-sky-50 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                      To My Dashboard
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  ) : (
                    <>
                      <Link href="/signup" className="inline-flex justify-center items-center px-8 py-4 bg-white text-[#003A60] rounded-full font-bold text-lg hover:bg-sky-50 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        Create New Account
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Link>
                      <Link href="/login" className="inline-flex justify-center items-center px-8 py-4 bg-transparent border-2 border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all">
                        Login
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1622279457486-640c4a3119df?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-[#003A60]/80 via-transparent to-transparent"></div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Active Tournaments</p>
                  <p className="text-xl font-black text-[#003A60]">Jakarta & Surabaya</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* About Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#003A60] mb-6 leading-tight">
                Established in 2024 <br/>
                <span className="text-[#0A7ECC]">For Medical Professionals</span>
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Wimbledoc was established in Bandung as a premier padel community exclusively for medical professionals. Our members include general practitioners, dentists, residents, specialists, and professors.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                We are actively organizing various padel tournaments for doctors, with previous experience including tournaments for PERKI, IDAI, and IAUI. Wimbledoc serves as a platform for sport, networking, and professional collaboration.
              </p>
              
              <div className="flex gap-4">
                <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100">
                  <h4 className="text-2xl font-bold text-[#003A60] mb-1">2024</h4>
                  <p className="text-sm text-slate-500 font-medium">Established</p>
                </div>
                <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100">
                  <h4 className="text-2xl font-bold text-[#003A60] mb-1">National</h4>
                  <p className="text-sm text-slate-500 font-medium">Scale Tour</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-square md:aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl relative">
                <div className="absolute inset-0 bg-[#003A60]/20 mix-blend-overlay z-10"></div>
                <img src="https://images.unsplash.com/photo-1622279457486-640c4a3119df?q=80&w=1200&auto=format&fit=crop" alt="Padel Medical Community" className="object-cover w-full h-full" />
              </div>
              
              {/* Floating Stat Card */}
              <div className="absolute -bottom-8 -left-8 md:bottom-8 md:-left-12 bg-white p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,58,96,0.15)] border border-slate-100 hover:-translate-y-2 transition-transform duration-500">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#0A7ECC] to-[#003A60] rounded-2xl flex items-center justify-center text-white">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Grand Final</p>
                    <p className="text-xl font-extrabold text-slate-900">Jakarta 2026</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Demographics Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Our Community Profile</h2>
            <p className="text-lg text-slate-600">
              Previous Wimbledoc tournaments have attracted a highly targeted doctor's community, ranging from general practitioners to specialists across various medical fields.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { label: "Specialist", value: 56.7, color: "from-[#003A60] to-[#0260A5]" },
              { label: "General Practitioner", value: 33.2, color: "from-[#0260A5] to-[#0A7ECC]" },
              { label: "Dentist", value: 10.1, color: "from-[#0A7ECC] to-[#38bdf8]" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-white rounded-[2rem] p-8 text-center shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                <div className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#003A60] to-[#0A7ECC] mb-4">
                  <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5 }}
                  >
                    {stat.value}%
                  </motion.span>
                </div>
                <h3 className="text-xl font-bold text-slate-700">{stat.label}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-24 bg-[#003A60] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#0A7ECC]/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">2026 Indonesia Tour</h2>
            <p className="text-sky-200 text-lg max-w-2xl mx-auto">
              Bringing an exclusive series to major cities across Indonesia. Winners from each city will be flown to Jakarta for the ultimate Grand Final showdown.
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto px-4">
            {/* Horizontal Line for Desktop */}
            <div className="hidden md:block absolute top-8 left-12 right-12 h-1 bg-gradient-to-r from-sky-500/20 via-sky-400 to-sky-500/20 rounded-full"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-12 md:gap-4 relative z-10">
              {[
                { city: "Bandung", date: "12 Apr", status: "Opening" },
                { city: "Surabaya", date: "7 Jun", status: "Done" },
                { city: "Palembang", date: "19 Jul", status: "Next" },
                { city: "Bali", date: "2 Aug", status: "Upcoming" },
                { city: "Jakarta", date: "6 Dec", status: "Grand Final" },
              ].map((stop, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15 }}
                  className="flex flex-col items-center text-center w-full md:w-auto"
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-[#003A60] shadow-[0_0_0_4px_rgba(10,126,204,0.3)] mb-6 bg-white z-10 transition-transform hover:scale-110 ${stop.status === 'Next' ? 'shadow-[0_0_20px_rgba(10,126,204,0.8)] scale-110' : ''}`}>
                    <MapPin className={`w-6 h-6 ${stop.status === 'Next' ? 'text-[#0A7ECC]' : 'text-slate-400'}`} />
                  </div>
                  <h4 className="text-xl font-bold mb-2">{stop.city}</h4>
                  <p className="text-sky-300 font-medium mb-3">{stop.date}</p>
                  <span className={`text-xs px-4 py-1.5 rounded-full font-bold shadow-lg ${
                    stop.status === 'Next' ? 'bg-[#0A7ECC] text-white shadow-blue-500/30' : 
                    stop.status === 'Grand Final' ? 'bg-amber-500 text-white shadow-amber-500/30' :
                    'bg-white/10 text-sky-200'
                  }`}>
                    {stop.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tournaments Section */}
      <section className="py-24 container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Active Tournaments</h2>
          <p className="text-slate-500 text-lg">Join and be a champion in our latest tournaments.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tournaments.map((tourney, idx) => (
            <motion.div 
              key={tourney.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(26,77,44,0.1)] transition-all group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-sky-50 text-[#003A60] rounded-2xl group-hover:bg-[#003A60] group-hover:text-white transition-colors">
                  <Trophy className="w-6 h-6" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${tourney.status === 'OPEN' ? 'bg-blue-100 text-blue-700' : 'bg-blue-100 text-blue-700'}`}>
                  {tourney.status === 'OPEN' ? 'REGISTRATION OPEN' : 'COMING SOON'}
                </span>
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-3 line-clamp-2">{tourney.name}</h3>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-slate-500 text-sm">
                  <CalendarDays className="w-4 h-4 mr-3 text-slate-400" />
                  {format(tourney.date, "dd MMMM yyyy")}
                </div>
                <div className="flex items-center text-slate-500 text-sm">
                  <MapPin className="w-4 h-4 mr-3 text-slate-400" />
                  {tourney.location}
                </div>
              </div>

              <div className="mb-8">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {tourney.categories.map(cat => (
                    <span key={cat} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link href={`/tournaments/${tourney.id}`} className="text-center py-3 px-2 bg-slate-100 text-slate-800 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">
                  View Details
                </Link>
                <Link 
                  href={isLoggedIn ? `/register?tournamentId=${tourney.id}` : `/login?callbackUrl=/register?tournamentId=${tourney.id}`} 
                  className="text-center py-3 px-2 bg-[#003A60] text-white rounded-xl font-bold text-sm hover:bg-[#0260A5] transition-colors"
                >
                  Register
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer / Sponsorship CTA */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold mb-6">WIMBLEDOC INDONESIA TOUR</h3>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            An active doctors' community using padel as a platform for sport, networking, and professional collaboration.
          </p>
          <div className="inline-flex flex-col md:flex-row items-center justify-center gap-6 p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
            <div className="text-center md:text-right md:border-r md:border-slate-700 md:pr-6">
              <p className="text-sm text-slate-400 uppercase tracking-wider font-bold mb-1">Sponsorship</p>
              <p className="text-lg text-sky-400 font-bold">0821-4063-4317 (ELING)</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-sm text-slate-400 uppercase tracking-wider font-bold mb-1">Partnership</p>
              <p className="text-lg text-sky-400 font-bold">0811-959-9489 (DYAH)</p>
            </div>
          </div>
          <div className="mt-12 text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Wimbledoc. All rights reserved. Follow us on Instagram <a href="#" className="text-sky-400 hover:underline">@wimbledoc_</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
