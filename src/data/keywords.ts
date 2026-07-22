export const CH_KEYWORDS: Record<string, string> = {
  // Physics
  'units': 'physical world', 'dimensions': 'physical world', 'measurement': 'physical world',
  'motion': 'kinematics', 'displacement': 'kinematics', 'velocity': 'kinematics', 'acceleration': 'kinematics',
  'newton': 'laws of motion', 'friction': 'laws of motion', 'force': 'laws of motion',
  'energy': 'work, energy', 'power': 'work, energy', 'ke': 'work, energy', 'pe': 'work, energy',
  'rotation': 'rotational', 'torque': 'rotational', 'moment of inertia': 'rotational', 'angular': 'rotational',
  'gravity': 'gravitation', 'satellite': 'gravitation', 'kepler': 'gravitation', 'orbit': 'gravitation',
  'fluid': 'properties of solids', 'viscosity': 'properties of solids', 'surface tension': 'properties of solids',
  'heat': 'thermodynamics', 'entropy': 'thermodynamics', 'carnot': 'thermodynamics',
  'ideal gas': 'kinetic theory', 'boltzmann': 'kinetic theory', 'rms': 'kinetic theory',
  'shm': 'oscillations', 'pendulum': 'oscillations', 'spring': 'oscillations',
  'sound': 'waves', 'doppler': 'waves', 'interference': 'waves',
  'charge': 'electrostatics', 'coulomb': 'electrostatics', 'capacitor': 'electrostatics', 'electric field': 'electrostatics',
  'resistance': 'current electricity', 'ohm': 'current electricity', 'circuit': 'current electricity', 'kirchhoff': 'current electricity',
  'ampere': 'magnetic effects', 'biot': 'magnetic effects', 'lorentz': 'magnetic effects',
  'faraday': 'electromagnetic induction', 'lenz': 'electromagnetic induction', 'emf': 'electromagnetic induction',
  'ac': 'alternating current', 'transformer': 'alternating current', 'lcr': 'alternating current',
  'em wave': 'electromagnetic waves', 'maxwell': 'electromagnetic waves',
  'mirror': 'ray optics', 'lens': 'ray optics', 'refraction': 'ray optics', 'prism': 'ray optics',
  'huygens': 'wave optics', 'diffraction': 'wave optics', 'polarisation': 'wave optics', 'young': 'wave optics',
  'photoelectric': 'dual nature', 'photon': 'dual nature', 'de broglie': 'dual nature',
  'bohr': 'atoms', 'radioactive': 'nuclei', 'nuclear': 'atoms', 'half life': 'atoms',
  'diode': 'semiconductor', 'transistor': 'semiconductor', 'logic gate': 'semiconductor',

  // Chemistry - Physical
  'mole': 'basic concepts', 'stoichiometry': 'basic concepts', 'atomic mass': 'basic concepts',
  'gas law': 'states of matter', 'van der waals': 'states of matter',
  'quantum': 'atomic structure', 'orbital': 'atomic structure', 'schrodinger': 'atomic structure', 'heisenberg': 'atomic structure',
  'vsepr': 'chemical bonding', 'hybridisation': 'chemical bonding', 'hybridization': 'chemical bonding', 'ionic': 'chemical bonding',
  'enthalpy': 'thermodynamics', 'hess': 'thermodynamics', 'gibbs': 'thermodynamics',
  'buffer': 'equilibrium', 'le chatelier': 'equilibrium', 'kp': 'equilibrium', 'kc': 'equilibrium', 'ph': 'equilibrium', 'acid base': 'equilibrium',
  'oxidation': 'redox', 'reduction': 'redox', 'balancing': 'redox',
  'molarity': 'solutions', 'colligative': 'solutions', 'osmosis': 'solutions', 'raoult': 'solutions',
  'cell': 'electrochemistry', 'nernst': 'electrochemistry', 'galvanic': 'electrochemistry', 'electrolysis': 'electrochemistry',
  'rate': 'chemical kinetics', 'order': 'chemical kinetics', 'arrhenius': 'chemical kinetics',
  'colloid': 'surface chemistry', 'adsorption': 'surface chemistry', 'catalyst': 'surface chemistry',
  'crystal': 'solid state', 'lattice': 'solid state', 'unit cell': 'solid state', 'defect': 'solid state',

  // Chemistry - Organic
  'iupac': 'basic principles', 'isomerism': 'basic principles', 'reaction mechanism': 'basic principles', 'inductive': 'basic principles',
  'alkane': 'hydrocarbons', 'alkene': 'hydrocarbons', 'alkyne': 'hydrocarbons', 'benzene': 'hydrocarbons', 'aromatic': 'hydrocarbons',
  'halide': 'haloalkanes', 'grignard': 'haloalkanes', 'sn1': 'haloalkanes', 'sn2': 'haloalkanes',
  'alcohol': 'alcohols, phenols', 'phenol': 'alcohols, phenols', 'ether': 'alcohols, phenols',
  'aldehyde': 'aldehydes', 'ketone': 'aldehydes', 'carboxylic': 'aldehydes', 'ester': 'aldehydes',
  'amine': 'amines', 'diazonium': 'amines',
  'carbohydrate': 'biomolecules', 'protein': 'biomolecules', 'dna': 'biomolecules',
  'polymer': 'polymers', 'addition polymer': 'polymers',

  // Chemistry - Inorganic
  'periodicity': 'classification of elements', 'period': 'classification of elements', 'group': 'classification of elements',
  'alkali': 's-block', 'sodium': 's-block', 'potassium': 's-block', 'calcium': 's-block', 'magnesium': 's-block',
  'boron': 'p-block', 'carbon': 'p-block', 'silicon': 'p-block', 'aluminium': 'p-block',
  'nitrogen': 'p-block', 'oxygen': 'p-block', 'sulphur': 'p-block', 'sulfur': 'p-block', 'halogen': 'p-block', 'noble gas': 'p-block',
  'transition': 'd & f block', 'lanthanide': 'd & f block', 'actinide': 'd & f block', 'chromium': 'd & f block', 'iron': 'd & f block',
  'ligand': 'coordination', 'cfse': 'coordination', 'werner': 'coordination', 'edta': 'coordination',
  'metallurgy': 'general principles', 'ore': 'general principles', 'slag': 'general principles',

  // Mathematics
  'set': 'sets, relations', 'relation': 'sets, relations', 'function': 'sets, relations',
  'complex': 'complex numbers', 'argand': 'complex numbers', 'euler': 'complex numbers',
  'quadratic': 'quadratic equations', 'discriminant': 'quadratic equations', 'roots': 'quadratic equations',
  'ap': 'sequences', 'gp': 'sequences', 'hp': 'sequences', 'arithmetic': 'sequences', 'geometric': 'sequences', 'harmonic': 'sequences',
  'line': 'straight lines', 'slope': 'straight lines', 'distance': 'straight lines', 'pair of lines': 'straight lines',
  'circle': 'circles', 'chord': 'circles', 'tangent': 'circles',
  'parabola': 'conic', 'ellipse': 'conic', 'hyperbola': 'conic', 'focus': 'conic', 'directrix': 'conic',
  'combination': 'permutations', 'factorial': 'permutations', 'nPr': 'permutations', 'nCr': 'permutations',
  'binomial': 'binomial theorem', 'pascal': 'binomial theorem', 'expansion': 'binomial theorem',
  'pmi': 'mathematical induction', 'induction': 'mathematical induction',
  'trig': 'trigonometric functions', 'sine': 'trigonometric functions', 'cosine': 'trigonometric functions', 'tan': 'trigonometric functions',
  'inverse trig': 'inverse trigonometric', 'arcsin': 'inverse trigonometric', 'arctan': 'inverse trigonometric',
  'limit': 'limits & derivatives', 'derivative': 'limits & derivatives', 'differentiation': 'limits & derivatives',
  'mean': 'statistics', 'variance': 'statistics', 'standard deviation': 'statistics', 'bayes': 'statistics',
  '3d': '3d geometry', 'plane': '3d geometry', 'skew': '3d geometry',
  'matrix': 'matrices', 'determinant': 'matrices', 'cramer': 'matrices', 'adjoint': 'matrices',
  'continuous': 'continuity', 'differentiable': 'continuity', 'rolle': 'continuity', 'mvt': 'continuity',
  'maxima': 'application of derivatives', 'minima': 'application of derivatives',
  'integration': 'integrals', 'integral': 'integrals', 'antiderivative': 'integrals', 'substitution': 'integrals', 'parts': 'integrals',
  'definite': 'integrals (definite)', 'riemann': 'integrals (definite)', 'newton leibniz': 'integrals (definite)',
  'area': 'application of integrals', 'area between curves': 'application of integrals',
  'ode': 'differential equations',
  'vector': 'vector algebra', 'dot product': 'vector algebra', 'cross product': 'vector algebra', 'scalar triple': 'vector algebra',
  'lpp': 'linear programming', 'feasible': 'linear programming',
  'conditional': 'probability (12)', 'bayes theorem': 'probability (12)',
};

export function chapterMatchesSearch(chapterName: string, query: string): boolean {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  const nameLower = chapterName.toLowerCase();

  if (nameLower.includes(q)) return true;

  for (const [kw, target] of Object.entries(CH_KEYWORDS)) {
    if (kw.includes(q) || q.includes(kw)) {
      if (nameLower.includes(target)) return true;
    }
  }
  return false;
}
