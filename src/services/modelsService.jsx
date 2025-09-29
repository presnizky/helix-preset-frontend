import { apiService } from "./api";

// Cache for models data
let modelsCache = null;
let modelsByTypeCache = null;

/**
 * Fetch all models from the API
 */
export const fetchAllModels = async () => {
  try {
    const response = await apiService.getModels();
    return response.data;
  } catch (error) {
    console.error("Error fetching models:", error);
    throw error;
  }
};

/**
 * Get models organized by type
 */
export const getModelsByType = async () => {
  // Return cached data if available
  if (modelsByTypeCache) {
    return modelsByTypeCache;
  }

  try {
    // Fetch models if not cached
    if (!modelsCache) {
      modelsCache = await fetchAllModels();
    }

    // Organize models by type
    const modelsByType = {};

    modelsCache.forEach((model) => {
      const type = model.model_type || "other";

      if (!modelsByType[type]) {
        modelsByType[type] = [];
      }

      modelsByType[type].push({
        id: model.id,
        name: model.name,
        symbolic_id: model.symbolic_id,
        category: model.category,
      });
    });


    // Sort each type's models alphabetically
    Object.keys(modelsByType).forEach((type) => {
      modelsByType[type].sort((a, b) => {
        const nameA = a.name || a.symbolic_id || '';
        const nameB = b.name || b.symbolic_id || '';
        return nameA.localeCompare(nameB);
      });
    });

    // Cache the result
    modelsByTypeCache = modelsByType;

    return modelsByType;
  } catch (error) {
    console.error("Error organizing models by type:", error);
    throw error;
  }
};

/**
 * Get available model types in the specified order
 */
export const getModelTypes = async () => {
  try {
    const modelsByType = await getModelsByType();
    const availableTypes = Object.keys(modelsByType);
    
    // Define the preferred order
    const preferredOrder = [
      'amp',
      'preamp', 
      'cab',
      'dynamics',
      'distortion',
      'modulation',
      'pitch',
      'synth',
      'delay',
      'reverb',
      'filter',
      'wah'
    ];
    
    // Sort types according to preferred order, then alphabetically for any remaining types
    const orderedTypes = [];
    
    // Add types in preferred order if they exist
    preferredOrder.forEach(type => {
      if (availableTypes.includes(type)) {
        orderedTypes.push(type);
      }
    });
    
    // Add remaining types alphabetically
    const remainingTypes = availableTypes
      .filter(type => !preferredOrder.includes(type))
      .sort();
    
    return [...orderedTypes, ...remainingTypes];
  } catch (error) {
    console.error("Error getting model types:", error);
    throw error;
  }
};

/**
 * Get models for a specific type
 */
export const getModelsForType = async (type) => {
  try {
    const modelsByType = await getModelsByType();
    return modelsByType[type] || [];
  } catch (error) {
    console.error(`Error getting models for type ${type}:`, error);
    throw error;
  }
};

/**
 * Clear the models cache (useful for refreshing data)
 */
export const clearModelsCache = () => {
  modelsCache = null;
  modelsByTypeCache = null;
};

/**
 * Sort model details by preferred type order
 */
export const sortModelDetailsByType = (modelDetails) => {
  const typeOrder = ['amp', 'preamp', 'cab', 'dynamics', 'distortion', 'modulation', 'pitch', 'synth', 'delay', 'reverb', 'filter', 'wah'];
  
  return modelDetails.sort((a, b) => {
    const aIndex = typeOrder.indexOf(a.model_type);
    const bIndex = typeOrder.indexOf(b.model_type);
    
    // If both types are in the preferred order, sort by their position
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    // If only one is in the preferred order, prioritize it
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    // If neither is in the preferred order, sort alphabetically
    return a.model_type.localeCompare(b.model_type);
  });
};

/**
 * Sort model details by signal chain order (DSP, then Position, then Path)
 */
export const sortModelDetailsBySignalChain = (modelDetails) => {
  return modelDetails.sort((a, b) => {
    // First sort by DSP number
    if (a.dsp_number !== b.dsp_number) {
      return a.dsp_number - b.dsp_number;
    }
    
    // Then sort by Position
    if (a.position !== b.position) {
      return a.position - b.position;
    }
    
    // Finally sort by Path number
    return a.path_number - b.path_number;
  });
};

/**
 * Get model type display name (capitalize and format)
 */
export const getModelTypeDisplayName = (type) => {
  if (!type) return "Other";

  // Handle special cases
  const specialCases = {
    amp: "Amplifiers",
    cab: "Cabinets",
    dist: "Distortions",
    delay: "Delays",
    reverb: "Reverbs",
    chorus: "Chorus",
    flanger: "Flangers",
    phaser: "Phasers",
    tremolo: "Tremolos",
    comp: "Compressors",
    eq: "Equalizers",
    gate: "Gates",
    wah: "Wah",
    pitch: "Pitch",
    synth: "Synthesizers",
    filter: "Filters",
    vol: "Volume",
    fx: "Effects",
    preamp: "Preamps",
    rotary: "Rotary",
    vibrato: "Vibrato",
    ring: "Ring Modulators",
    send: "Sends",
    return: "Returns",
    dl4: "DL4 Effects",
    dm4: "DM4 Effects",
    fm4: "FM4 Effects",
    mm4: "MM4 Effects",
    vic: "Victoria Effects",
    l6spb: "Line 6 SPB Effects",
    victoria: "Victoria Effects",
    fixed: "System Parameters",
  };

  return (
    specialCases[type.toLowerCase()] ||
    type.charAt(0).toUpperCase() + type.slice(1)
  );
};
