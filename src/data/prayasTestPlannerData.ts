export interface ScheduledTest {
  id: string;
  name: string;
  date: string;
  testType: 'Part Test' | 'Full Test';
  pattern: 'JEE Main' | 'JEE Advanced';
  syllabus: {
    physics: string;
    chemistry: string;
    maths: string;
  };
}

export const PRAYAS_TEST_SCHEDULE: ScheduledTest[] = [
  { id: 'test-1', name: 'JEE Main-1', date: '2026-06-28', testType: 'Part Test', pattern: 'JEE Main', syllabus: { physics: 'Mathematical Tools, Motion in a Straight Line', chemistry: 'Some Basic Concepts of Chemistry', maths: 'Basic Mathematics, Quadratic Equations' } },
  { id: 'test-2', name: 'JEE Main-2', date: '2026-07-12', testType: 'Part Test', pattern: 'JEE Main', syllabus: { physics: 'Motion in a Plane', chemistry: 'Some Basic Concepts, Redox Reaction', maths: 'Basic Maths, Quadratic Equations' } },
  { id: 'test-3', name: 'JEE Advanced-1', date: '2026-07-28', testType: 'Part Test', pattern: 'JEE Advanced', syllabus: { physics: 'Math Tools, Motion in Line & Plane', chemistry: 'Mole Concept, Redox Reactions', maths: 'Basic Maths, Quadratic Equations' } },
  { id: 'test-4', name: 'AITS-1', date: '2026-08-09', testType: 'Part Test', pattern: 'JEE Main', syllabus: { physics: 'Laws of Motion, Work Energy Power', chemistry: 'Structure of Atom, Periodicity', maths: 'Sequence & Series, Trigonometry' } },
  { id: 'test-5', name: 'JEE Main-3', date: '2026-08-23', testType: 'Part Test', pattern: 'JEE Main', syllabus: { physics: 'Circular Motion, Centre of Mass', chemistry: 'Chemical Bonding, Solutions', maths: 'Permutations & Combinations' } },
  { id: 'test-6', name: 'JEE Main-4', date: '2026-09-06', testType: 'Part Test', pattern: 'JEE Main', syllabus: { physics: 'Rotational Motion', chemistry: 'Chemical Kinetics', maths: 'Binomial Theorem' } },
  { id: 'test-7', name: 'AITS-2', date: '2026-09-20', testType: 'Part Test', pattern: 'JEE Main', syllabus: { physics: 'Fluids, Solids, COM, Rotation', chemistry: 'Thermodynamics, Equilibrium, Electrochemistry', maths: 'Trigonometry, Determinants, Sets' } },
  { id: 'test-8', name: 'AITS-3', date: '2026-09-27', testType: 'Part Test', pattern: 'JEE Advanced', syllabus: { physics: 'Kinematics, NLM, WEP, COM, Rotation', chemistry: 'Physical Chemistry 11th & 12th Topics', maths: 'Algebra & Trigonometry' } },
  { id: 'test-9', name: 'JEE Advanced-2', date: '2026-10-11', testType: 'Part Test', pattern: 'JEE Advanced', syllabus: { physics: 'Thermal Physics, Mechanics Complete', chemistry: 'Inorganic & Physical Chemistry Complete', maths: 'Coordinate Geometry, Binomial, P&C' } },
  { id: 'test-10', name: 'AITS-4', date: '2026-11-01', testType: 'Part Test', pattern: 'JEE Main', syllabus: { physics: 'Fluids, SHM, Gravitation', chemistry: 'IUPAC, Isomerism, GOC, Electrochemistry', maths: 'Conics, Matrices, Relations & Functions' } },
  { id: 'test-11', name: 'JEE Main-5', date: '2026-11-22', testType: 'Part Test', pattern: 'JEE Main', syllabus: { physics: 'Electrostatics, Waves, Current Electricity', chemistry: 'Hydrocarbons, Haloalkanes, Organic 12th', maths: 'Calculus Complete (Limits to Differential Eq)' } },
  { id: 'test-12', name: 'AITS-5', date: '2026-12-13', testType: 'Part Test', pattern: 'JEE Main', syllabus: { physics: 'Magnetism, EMI, AC, EM Waves', chemistry: 'Coordination Compounds, Organic Complete', maths: 'Vectors, 3D Geometry, Integral Calculus' } },
  { id: 'test-13', name: 'AITS-6', date: '2026-12-20', testType: 'Part Test', pattern: 'JEE Advanced', syllabus: { physics: 'Full Physics 11th + 12th Part 1', chemistry: 'Full Organic + Inorganic Chemistry', maths: 'Full Algebra + Calculus' } },
  { id: 'test-14', name: 'JEE Main-6', date: '2027-01-03', testType: 'Part Test', pattern: 'JEE Main', syllabus: { physics: 'Ray Optics, Magnetism, Current Elec', chemistry: 'Aldehydes, Ketones, Amines, Coordination', maths: 'Vectors, 3D, Probability, Matrices' } },
  { id: 'test-15', name: 'AITS-7', date: '2027-01-10', testType: 'Part Test', pattern: 'JEE Main', syllabus: { physics: 'Modern Physics, Wave Optics, Semiconductors', chemistry: 'Biomolecules, Salt Analysis, p-Block', maths: 'Complex Numbers, Probability, Statistics' } },
  { id: 'test-16', name: 'AITS-8 (Full Test 1)', date: '2027-01-13', testType: 'Full Test', pattern: 'JEE Main', syllabus: { physics: 'Full Syllabus NTA JEE Main', chemistry: 'Full Syllabus NTA JEE Main', maths: 'Full Syllabus NTA JEE Main' } },
  { id: 'test-17', name: 'AITS-9 (Full Test 2)', date: '2027-01-17', testType: 'Full Test', pattern: 'JEE Main', syllabus: { physics: 'Full Syllabus NTA JEE Main', chemistry: 'Full Syllabus NTA JEE Main', maths: 'Full Syllabus NTA JEE Main' } },
];
