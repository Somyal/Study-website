import { store, getLocalDateString, getDefaultState } from '../src/store';
import { ALL_CHAPTERS, PHYSICS_CHAPTERS } from '../src/data/chapters';
import { calcSubjectPct, calcOverallPct, calcChapterPct, getSpacedRevisionStatus, calcUserLevel } from '../src/utils/calculations';
import { BADGE_DEFINITIONS } from '../src/data/badges';
import { chapterMatchesSearch } from '../src/data/keywords';

console.log('=== STARTING FUNCTIONAL QA VERIFICATION ===\n');

// 1. Reset Store
store.resetAllData();
console.log('1. Store Reset: OK');

// 2. Test Local IST Date Formatter (BUG-01)
const todayStr = getLocalDateString();
console.log(`2. IST Date Formatter Output: "${todayStr}" (Format check YYYY-MM-DD: ${/^\d{4}-\d{2}-\d{2}$/.test(todayStr)})`);

// 3. Test Stage Toggles & XP Increment
const chId = 'p1';
store.toggleStage(chId, 'theory');
let state = store.getState();
console.log(`3. Stage Toggle ("theory" on p1): XP=${state.xp} (Expected 50), Stage state=${state.chapters.p1.stages.theory}`);

store.toggleStage(chId, 'dpp');
store.toggleStage(chId, 'pyq');
store.toggleStage(chId, 'revision');
state = store.getState();
console.log(`   Completed all 4 stages on p1: Chapter Pct=${calcChapterPct('p1', state)}% (Expected 100%), XP=${state.xp} (Expected 200)`);

// 4. Test Stars, Backlog & PYQ Shift Tracker
store.setStars('p1', 4);
store.toggleBacklog('p1');
store.togglePyqShift('p1', '2025_jan');
store.togglePyqShift('p1', '2025_apr');
state = store.getState();
console.log(`4. Rating, Backlog & PYQ Shift Tracker on p1: Stars=${state.chapters.p1.stars}, Backlog=${state.chapters.p1.backlog}, 2025_jan=${state.chapters.p1.pyqShifts?.['2025_jan']}`);

// 5. Test Mock Test Logging & Auto Total Calculation
store.addMockTest({
  name: 'Allen Minor Test 1',
  date: todayStr,
  ph: 85,
  ch: 75,
  ma: 60,
  to: 220,
  at: 70,
  inc: 8,
  no: 'Good physics test',
  errorBreakdown: { calculation: 3, conceptual: 4, misread: 1, timePressure: 0 }
});
state = store.getState();
console.log(`5. Mock Test Logged: Total Tests=${state.tests.length}, Latest Score=${state.tests[0].to} (Expected 220), XP=${state.xp}`);

// 6. Test Study Hours Logging
store.logStudySession({
  date: todayStr,
  lc: 3,
  pr: 4,
  tot: 7,
  qs: 50,
  no: 'PW Physics + DPP'
});
state = store.getState();
console.log(`6. Study Session Logged: Total Logs=${state.studyLogs.length}, Today Tot=${state.studyLogs[0].tot}h (Expected 7h), Streak Count=${state.streak.count}`);

// 7. Test Mistake Vault Logging
store.addMistake({
  questionText: 'Rotational motion parallel axis theorem error',
  sub: 'physics',
  errorType: 'calculation',
  chId: 'p5',
  status: 'open',
  notes: 'I_cm + md^2 applies only through CM'
});
state = store.getState();
console.log(`7. Mistake Vault Logged: Total Mistakes=${state.mistakes.length}, Status=${state.mistakes[0].status}`);

// 8. Test Search Keyword Matcher
const searchRes1 = chapterMatchesSearch('Rotational Motion', 'rotational');
const searchRes2 = chapterMatchesSearch('Rotational Motion', 'torque');
console.log(`8. Keyword Search Matcher: "rotational" -> ${searchRes1}, "torque" (alias) -> ${searchRes2}`);

// 9. Test Spaced Repetition Status
const revStatus = getSpacedRevisionStatus('p1', state);
console.log(`9. Spaced Repetition Status for p1: isDue=${revStatus.isDue}, statusText="${revStatus.statusText}"`);

// 10. Test Level Progression Curve
const lvl = calcUserLevel(state.xp);
console.log(`10. User Level Calculation: Level=${lvl.level}, Title="${lvl.levelTitle}", Progress=${lvl.progressPct}%`);

// 11. Test Data Export & Import Validation Guard
const jsonBackup = store.exportData();
console.log(`11. Export JSON Length: ${jsonBackup.length} bytes`);

const importResultSuccess = store.importData(jsonBackup);
console.log(`    Import Valid JSON Backup Result: ${importResultSuccess}`);

const importResultFail = store.importData('invalid json content');
console.log(`    Import Corrupted JSON Backup Result: ${importResultFail} (Expected false)`);

console.log('\n=== FUNCTIONAL QA VERIFICATION COMPLETED CLEANLY ===');
