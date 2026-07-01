import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays, MapPin, Users, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { auth } from "@/auth";

export default async function TournamentDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const { id } = await params;
  const t_id = parseInt(id);
  if (isNaN(t_id)) return notFound();

  const [tournaments] = await db.execute<RowDataPacket[]>(
    'SELECT * FROM Tournament WHERE id = ?',
    [t_id]
  );
  const tournament = tournaments[0];

  const [categoriesRaw] = await db.execute<RowDataPacket[]>(
    `SELECT c.name, c.quota, 
            (SELECT COUNT(*) FROM Registration r WHERE r.category_id = c.id AND r.status != 'REJECTED' AND r.status != 'CANCELLED') as filled_slots 
     FROM Category c 
     WHERE c.tournament_id = ?`,
    [t_id]
  );
  
  const categories = categoriesRaw.map(c => ({
    name: c.name,
    availableSlots: Math.max(0, c.quota - c.filled_slots),
    isFull: c.filled_slots >= c.quota
  }));

  if (!tournament) return notFound();

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="bg-[#003A60] text-white py-16">
        <div className="container mx-auto px-6">
          <Link href="/" className="text-sky-300 hover:text-white transition-colors text-sm font-semibold flex items-center mb-6">
            &larr; Back to Home
          </Link>
          <span className="inline-block py-1 px-3 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-100 text-sm font-medium mb-4">
            {tournament.status === 'ACTIVE' ? 'Registration Open' : 'Upcoming'}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{tournament.name}</h1>
          <p className="text-sky-100 text-lg max-w-2xl">{tournament.description || "Official Wimbledoc Padel Tournament."}</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Event Details</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CalendarDays className="w-6 h-6 text-[#0260A5] mr-4 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-900">Event Date</p>
                    <p className="text-slate-600">{format(new Date(tournament.event_date), "dd MMMM yyyy")}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-6 h-6 text-[#0260A5] mr-4 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-900">Location</p>
                    <p className="text-slate-600">Wimbledoc Arena, Jakarta</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="w-6 h-6 text-[#0260A5] mr-4 mt-1" />
                  <div className="w-full">
                    <p className="font-semibold text-slate-900 mb-2">Available Categories</p>
                    <div className="flex flex-col gap-2">
                      {categories.map((cat: any) => (
                        <div key={cat.name} className="flex justify-between items-center px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold max-w-sm">
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
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Rules & Info</h2>
              <p className="text-slate-600 leading-relaxed">
                Registration is binding. Payment must be completed within 48 hours after registration to secure your team's slot. The tournament will use a group stage format followed by a knockout stage.
              </p>
            </div>
          </div>

          <div>
            <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-[#0260A5]/10 sticky top-8">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Interested?</h3>
              <p className="text-slate-500 text-sm mb-6">Secure your team's slot before they run out!</p>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Registration Deadline</span>
                  <span className="font-semibold text-slate-900">{format(new Date(tournament.reg_end), "dd MMM")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Registration Fee</span>
                  <span className="font-bold text-[#003A60]">Rp 500.000 <span className="font-normal text-slate-500 text-xs">/team</span></span>
                </div>
              </div>

              {categories.every(c => c.isFull) ? (
                <button 
                  disabled
                  className="w-full flex justify-center items-center py-4 bg-slate-300 text-slate-500 rounded-xl font-bold text-lg cursor-not-allowed"
                >
                  Category Full
                </button>
              ) : (
                <Link 
                  href={isLoggedIn ? `/register?tournamentId=${tournament.id}` : `/login?callbackUrl=/register?tournamentId=${tournament.id}`}
                  className="w-full flex justify-center items-center py-4 bg-[#003A60] text-white rounded-xl font-bold text-lg hover:bg-[#0260A5] transition-colors"
                >
                  Register for this Tournament
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
