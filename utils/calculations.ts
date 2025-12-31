
import { Match, Team, MatchResult, ScoringConfig } from '../types';

export const calculateMatchPoints = (result: MatchResult, scoring: ScoringConfig) => {
  const placementPoints = scoring.placementPoints[result.placement] || 0;
  const killPoints = result.kills * scoring.pointsPerKill;
  return placementPoints + killPoints - (result.penalty || 0);
};

export const getTournamentStandings = (tournamentId: string, matches: Match[], teams: Team[], scoring?: ScoringConfig) => {
  const tournamentMatches = matches.filter(m => m.tournamentId === tournamentId && m.status === 'COMPLETED');
  
  // Default scoring if not provided (should be provided from state)
  const activeScoring = scoring || {
    placementPoints: { 1: 12, 2: 9, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2, 10: 1, 11: 0, 12: 0 },
    pointsPerKill: 1
  };

  const standings = teams.map(team => {
    let totalPlacementPoints = 0;
    let totalKillPoints = 0;
    let totalPenalty = 0;
    let booyahs = 0;
    let matchesPlayed = 0;

    tournamentMatches.forEach(match => {
      const result = match.results.find(r => r.teamId === team.id);
      if (result) {
        matchesPlayed++;
        totalPlacementPoints += activeScoring.placementPoints[result.placement] || 0;
        totalKillPoints += result.kills * activeScoring.pointsPerKill;
        totalPenalty += result.penalty;
        if (result.placement === 1) booyahs++;
      }
    });

    return {
      team,
      matchesPlayed,
      placementPoints: totalPlacementPoints,
      killPoints: totalKillPoints,
      penalty: totalPenalty,
      totalPoints: totalPlacementPoints + totalKillPoints - totalPenalty,
      booyahs
    };
  });

  return standings.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.placementPoints !== a.placementPoints) return b.placementPoints - a.placementPoints;
    if (b.killPoints !== a.killPoints) return b.killPoints - a.killPoints;
    return b.booyahs - a.booyahs;
  });
};

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
  const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
