import type {
  QiFlowConfig,
  MeridianFlowState,
  PathologyType,
  PathologyMarker,
  TreatedPoint,
  PathologyState,
  VisualizationData,
} from './types';

// ============================================================
// QI FLOW ENGINE
// Manages the before/after qi flow visualization states
// ============================================================

/** Default healthy meridian state — smooth, balanced flow */
const HEALTHY_STATE: MeridianFlowState = {
  flow_speed: 0.7,
  intensity: 0.6,
  pathologies: [],
};

/** Pathology visual mappings */
export const PATHOLOGY_VISUALS: Record<PathologyType, {
  colour: string;
  glow_colour: string;
  particle_speed_modifier: number;
  intensity_modifier: number;
  particle_size_modifier: number;
  description: string;
}> = {
  stagnation: {
    colour: '#8B4513',
    glow_colour: '#654321',
    particle_speed_modifier: 0.1,
    intensity_modifier: 0.3,
    particle_size_modifier: 1.5,
    description: 'Qi blocked — flow restricted, energy pools and stagnates',
  },
  deficiency: {
    colour: '#87CEEB',
    glow_colour: '#B0C4DE',
    particle_speed_modifier: 0.4,
    intensity_modifier: 0.2,
    particle_size_modifier: 0.5,
    description: 'Qi weak — thin, faint flow with insufficient energy',
  },
  excess: {
    colour: '#FF6347',
    glow_colour: '#FF4500',
    particle_speed_modifier: 1.6,
    intensity_modifier: 1.4,
    particle_size_modifier: 1.8,
    description: 'Qi excess — congested, overly bright, turbulent flow',
  },
  heat: {
    colour: '#FF2200',
    glow_colour: '#FF0000',
    particle_speed_modifier: 1.3,
    intensity_modifier: 1.2,
    particle_size_modifier: 1.2,
    description: 'Heat — red glow, accelerated and agitated movement',
  },
  cold: {
    colour: '#4682B4',
    glow_colour: '#1E90FF',
    particle_speed_modifier: 0.3,
    intensity_modifier: 0.4,
    particle_size_modifier: 0.8,
    description: 'Cold — blue tint, sluggish and constricted flow',
  },
  dampness: {
    colour: '#9ACD32',
    glow_colour: '#6B8E23',
    particle_speed_modifier: 0.3,
    intensity_modifier: 0.5,
    particle_size_modifier: 2.0,
    description: 'Dampness — heavy, murky, slow-moving accumulation',
  },
  phlegm: {
    colour: '#BDB76B',
    glow_colour: '#808000',
    particle_speed_modifier: 0.2,
    intensity_modifier: 0.6,
    particle_size_modifier: 2.5,
    description: 'Phlegm — thick, turbid obstruction in the channels',
  },
  wind: {
    colour: '#98FB98',
    glow_colour: '#00FF7F',
    particle_speed_modifier: 2.0,
    intensity_modifier: 0.8,
    particle_size_modifier: 0.7,
    description: 'Wind — erratic, rapidly shifting, unpredictable movement',
  },
};

/** Organ-to-meridian mapping */
const ORGAN_MERIDIAN_MAP: Record<string, string> = {
  'lung': 'lung',
  'large_intestine': 'large-intestine',
  'stomach': 'stomach',
  'spleen': 'spleen',
  'heart': 'heart',
  'small_intestine': 'small-intestine',
  'bladder': 'bladder',
  'kidney': 'kidney',
  'pericardium': 'pericardium',
  'san_jiao': 'san-jiao',
  'gallbladder': 'gallbladder',
  'liver': 'liver',
};

/**
 * Generate the "before treatment" qi flow configuration
 * based on the pathology state
 */
export function generateBeforeState(pathologyState: PathologyState): QiFlowConfig {
  const meridian_states: Record<string, MeridianFlowState> = {};

  // Set all meridians to default healthy state
  const allMeridians = [
    'lung', 'large-intestine', 'stomach', 'spleen',
    'heart', 'small-intestine', 'bladder', 'kidney',
    'pericardium', 'san-jiao', 'gallbladder', 'liver',
    'du-mai', 'ren-mai',
  ];

  for (const m of allMeridians) {
    meridian_states[m] = { ...HEALTHY_STATE, pathologies: [] };
  }

  // Apply pathologies to affected organ meridians
  for (const organ of pathologyState.affected_organs) {
    const meridianId = ORGAN_MERIDIAN_MAP[organ.toLowerCase().replace(/\s+/g, '_')];
    if (!meridianId) continue;

    const pathologies: PathologyMarker[] = pathologyState.pathology_type.map((type, i) => ({
      type,
      location: 0.3 + (i * 0.2), // distribute along meridian
      severity: 0.7 + (Math.random() * 0.3),
    }));

    // Compute aggregate modifiers from all pathologies
    let speedMod = 0;
    let intensityMod = 0;
    for (const p of pathologyState.pathology_type) {
      const vis = PATHOLOGY_VISUALS[p];
      speedMod += vis.particle_speed_modifier;
      intensityMod += vis.intensity_modifier;
    }
    const count = pathologyState.pathology_type.length || 1;

    meridian_states[meridianId] = {
      flow_speed: Math.max(0.05, Math.min(1, speedMod / count)),
      intensity: Math.max(0.1, Math.min(1.5, intensityMod / count)),
      pathologies,
    };
  }

  // Slightly affect paired/related meridians
  for (const organ of pathologyState.affected_organs) {
    const meridianId = ORGAN_MERIDIAN_MAP[organ.toLowerCase().replace(/\s+/g, '_')];
    if (!meridianId || !meridian_states[meridianId]) continue;

    const state = meridian_states[meridianId];
    // Find interior-exterior pair and apply mild disruption
    const pairMap: Record<string, string> = {
      'lung': 'large-intestine', 'large-intestine': 'lung',
      'stomach': 'spleen', 'spleen': 'stomach',
      'heart': 'small-intestine', 'small-intestine': 'heart',
      'bladder': 'kidney', 'kidney': 'bladder',
      'pericardium': 'san-jiao', 'san-jiao': 'pericardium',
      'gallbladder': 'liver', 'liver': 'gallbladder',
    };
    const pairedId = pairMap[meridianId];
    if (pairedId && meridian_states[pairedId].pathologies.length === 0) {
      meridian_states[pairedId] = {
        flow_speed: HEALTHY_STATE.flow_speed * 0.8,
        intensity: HEALTHY_STATE.intensity * 0.85,
        pathologies: [{
          type: state.pathologies[0]?.type || 'stagnation',
          location: 0.5,
          severity: 0.3,
        }],
      };
    }
  }

  return {
    global_intensity: 0.5,
    meridian_states,
  };
}

/**
 * Generate the "after treatment" qi flow configuration
 * showing restored, harmonious flow
 */
export function generateAfterState(
  beforeState: QiFlowConfig,
  treatedPoints: TreatedPoint[]
): QiFlowConfig {
  const meridian_states: Record<string, MeridianFlowState> = {};

  // Start from before state and improve
  for (const [meridianId, state] of Object.entries(beforeState.meridian_states)) {
    const pointsOnMeridian = treatedPoints.filter(p => p.meridian_id === meridianId);
    const wasTreated = pointsOnMeridian.length > 0;

    if (wasTreated) {
      // Directly treated — fully restored
      meridian_states[meridianId] = {
        flow_speed: 0.7,
        intensity: 0.7,
        pathologies: [], // pathologies resolved
      };
    } else if (state.pathologies.length > 0) {
      // Not directly treated but had issues — partially improved
      meridian_states[meridianId] = {
        flow_speed: Math.min(0.7, state.flow_speed + 0.2),
        intensity: Math.min(0.7, state.intensity + 0.15),
        pathologies: state.pathologies.map(p => ({
          ...p,
          severity: Math.max(0, p.severity - 0.4),
        })).filter(p => p.severity > 0.1),
      };
    } else {
      // Was healthy — stays healthy, slightly energised from treatment
      meridian_states[meridianId] = {
        flow_speed: 0.7,
        intensity: 0.65,
        pathologies: [],
      };
    }
  }

  return {
    global_intensity: 0.8,
    meridian_states,
  };
}

/**
 * Build complete visualization data from pathology + treatment info
 */
export function buildVisualizationData(
  pathologyState: PathologyState,
  treatedPoints: TreatedPoint[]
): VisualizationData {
  const beforeState = generateBeforeState(pathologyState);
  const afterState = generateAfterState(beforeState, treatedPoints);

  // Determine which meridians are affected
  const meridiansAffected = new Set<string>();
  for (const organ of pathologyState.affected_organs) {
    const mid = ORGAN_MERIDIAN_MAP[organ.toLowerCase().replace(/\s+/g, '_')];
    if (mid) meridiansAffected.add(mid);
  }
  for (const pt of treatedPoints) {
    meridiansAffected.add(pt.meridian_id);
  }

  return {
    meridians_affected: Array.from(meridiansAffected),
    qi_flow_before: beforeState,
    qi_flow_after: afterState,
  };
}

/**
 * Interpolate between two qi flow states for smooth animation transitions
 */
export function interpolateFlowStates(
  from: QiFlowConfig,
  to: QiFlowConfig,
  t: number // 0 = from, 1 = to
): QiFlowConfig {
  const clamped = Math.max(0, Math.min(1, t));
  const meridian_states: Record<string, MeridianFlowState> = {};

  const allKeys = Array.from(new Set([
    ...Object.keys(from.meridian_states),
    ...Object.keys(to.meridian_states),
  ]));

  for (const key of allKeys) {
    const fromState = from.meridian_states[key] || HEALTHY_STATE;
    const toState = to.meridian_states[key] || HEALTHY_STATE;

    meridian_states[key] = {
      flow_speed: lerp(fromState.flow_speed, toState.flow_speed, clamped),
      intensity: lerp(fromState.intensity, toState.intensity, clamped),
      pathologies: clamped < 0.5 ? fromState.pathologies : toState.pathologies,
    };
  }

  return {
    global_intensity: lerp(from.global_intensity, to.global_intensity, clamped),
    meridian_states,
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Get the dominant pathology colour for a meridian's current state
 */
export function getMeridianPathologyColour(state: MeridianFlowState): string | null {
  if (state.pathologies.length === 0) return null;

  // Return the colour of the most severe pathology
  const worst = state.pathologies.reduce((a, b) =>
    b.severity > a.severity ? b : a
  );
  return PATHOLOGY_VISUALS[worst.type].colour;
}

/**
 * Get particle animation parameters for a given flow state
 */
export function getParticleParams(state: MeridianFlowState, baseColour: string) {
  if (state.pathologies.length === 0) {
    return {
      speed: state.flow_speed,
      size: 0.008,
      colour: baseColour,
      glowColour: baseColour,
      opacity: state.intensity,
      count: 20,
    };
  }

  const worst = state.pathologies.reduce((a, b) =>
    b.severity > a.severity ? b : a
  );
  const vis = PATHOLOGY_VISUALS[worst.type];

  return {
    speed: state.flow_speed,
    size: 0.008 * vis.particle_size_modifier,
    colour: vis.colour,
    glowColour: vis.glow_colour,
    opacity: Math.min(1, state.intensity * 1.2),
    count: Math.round(20 * vis.particle_size_modifier),
  };
}
