import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { RowDataPacket } from "mysql2";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');

    if (!categoryId) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    // Fetch groups
    const [groupsRaw] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM PadelGroup WHERE category_id = ? ORDER BY id ASC',
      [categoryId]
    );

    const groupIds = groupsRaw.map(g => g.id);

    let groupTeams: any[] = [];
    let matches: any[] = [];

    if (groupIds.length > 0) {
      // Fetch teams with registration info (team name, player names)
      const placeholders = groupIds.map(() => '?').join(',');
      const [teamsRaw] = await db.execute<RowDataPacket[]>(
        `SELECT gt.*, r.team_name, r.p1_name, r.p2_name 
         FROM GroupTeam gt 
         JOIN Registration r ON gt.registration_id = r.id 
         WHERE gt.group_id IN (${placeholders})
         ORDER BY gt.points DESC, (gt.games_won - gt.games_lost) DESC`,
        groupIds
      );
      groupTeams = teamsRaw as any[];

      // Fetch matches
      const [matchesRaw] = await db.execute<RowDataPacket[]>(
        `SELECT m.*, 
                t1.team_name as t1_name, t1.p1_name as t1_p1, t1.p2_name as t1_p2,
                t2.team_name as t2_name, t2.p1_name as t2_p1, t2.p2_name as t2_p2
         FROM PadelMatch m
         LEFT JOIN Registration t1 ON m.team1_id = t1.id
         LEFT JOIN Registration t2 ON m.team2_id = t2.id
         WHERE m.group_id IN (${placeholders})
         ORDER BY m.round ASC, m.id ASC`,
        groupIds
      );
      matches = matchesRaw as any[];
    }

    return NextResponse.json({
      groups: groupsRaw,
      groupTeams,
      matches
    });
  } catch (error: any) {
    console.error("GET brackets error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { action, categoryId, groupsCount } = data;

    if (action === 'generate_groups') {
      // 1. Fetch all approved registrations for this category
      const [regs] = await db.execute<RowDataPacket[]>(
        'SELECT id FROM Registration WHERE category_id = ? AND status IN ("APPROVED", "CHECKED_IN")',
        [categoryId]
      );

      if (regs.length < 2) {
        return NextResponse.json({ error: "Not enough approved participants to generate groups" }, { status: 400 });
      }

      // Shuffle teams randomly
      const shuffled = regs.sort(() => 0.5 - Math.random());
      
      // Delete existing groups for this category (CASCADE will delete GroupTeam and PadelMatch)
      await db.execute('DELETE FROM PadelGroup WHERE category_id = ?', [categoryId]);

      // Create groups
      const numGroups = Math.min(groupsCount || 2, shuffled.length);
      const groupIds: number[] = [];
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

      for (let i = 0; i < numGroups; i++) {
        const [res] = await db.execute(
          'INSERT INTO PadelGroup (category_id, name, stage) VALUES (?, ?, ?)',
          [categoryId, `Group ${alphabet[i]}`, 'ROUND_ROBIN']
        );
        groupIds.push((res as any).insertId);
      }

      // Distribute teams into groups
      const teamsInGroups: number[][] = Array.from({ length: numGroups }, () => []);
      for (let i = 0; i < shuffled.length; i++) {
        const groupId = groupIds[i % numGroups];
        const teamId = shuffled[i].id;
        teamsInGroups[i % numGroups].push(teamId);
        
        await db.execute(
          'INSERT INTO GroupTeam (group_id, registration_id) VALUES (?, ?)',
          [groupId, teamId]
        );
      }

      // Generate Round Robin matches for each group
      for (let i = 0; i < numGroups; i++) {
        const groupId = groupIds[i];
        const teams = teamsInGroups[i];
        
        for (let j = 0; j < teams.length; j++) {
          for (let k = j + 1; k < teams.length; k++) {
            await db.execute(
              'INSERT INTO PadelMatch (group_id, team1_id, team2_id, status) VALUES (?, ?, ?, ?)',
              [groupId, teams[j], teams[k], 'SCHEDULED']
            );
          }
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST brackets error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { matchId, team1Score, team2Score, status } = data;

    if (!matchId) {
      return NextResponse.json({ error: "Match ID is required" }, { status: 400 });
    }

    // Update match
    await db.execute(
      'UPDATE PadelMatch SET team1_score = ?, team2_score = ?, status = ? WHERE id = ?',
      [team1Score || 0, team2Score || 0, status || 'COMPLETED', matchId]
    );

    // After updating a match, we should recalculate the group standings
    // Find group_id of this match
    const [matchRaw] = await db.execute<RowDataPacket[]>('SELECT group_id FROM PadelMatch WHERE id = ?', [matchId]);
    if (matchRaw.length > 0) {
      const groupId = matchRaw[0].group_id;
      
      // Reset standings for all teams in this group
      await db.execute(
        'UPDATE GroupTeam SET points = 0, games_won = 0, games_lost = 0, matches_played = 0 WHERE group_id = ?',
        [groupId]
      );

      // Recalculate from all completed matches in this group
      const [completedMatches] = await db.execute<RowDataPacket[]>(
        'SELECT team1_id, team2_id, team1_score, team2_score FROM PadelMatch WHERE group_id = ? AND status = "COMPLETED"',
        [groupId]
      );

      for (const m of completedMatches) {
        if (!m.team1_id || !m.team2_id) continue;
        
        let t1Points = 0;
        let t2Points = 0;

        if (m.team1_score > m.team2_score) {
          t1Points = 3;
        } else if (m.team2_score > m.team1_score) {
          t2Points = 3;
        } else {
          t1Points = 1;
          t2Points = 1;
        }

        await db.execute(
          `UPDATE GroupTeam 
           SET points = points + ?, games_won = games_won + ?, games_lost = games_lost + ?, matches_played = matches_played + 1 
           WHERE group_id = ? AND registration_id = ?`,
          [t1Points, m.team1_score, m.team2_score, groupId, m.team1_id]
        );

        await db.execute(
          `UPDATE GroupTeam 
           SET points = points + ?, games_won = games_won + ?, games_lost = games_lost + ?, matches_played = matches_played + 1 
           WHERE group_id = ? AND registration_id = ?`,
          [t2Points, m.team2_score, m.team1_score, groupId, m.team2_id]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PUT brackets error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
