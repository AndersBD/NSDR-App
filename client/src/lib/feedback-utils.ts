import { WellbeingOption } from './supabase';

// Define a consistent color palette that can accommodate various feedback scales
// We're using a blue -> green gradient that can work with any number of options
const COLOR_PALETTE = [
  '#90caf9', // Blue (lowest)
  '#a5d6a7', // Light green
  '#81c784', // Medium green
  '#4a7c66', // Dark green (highest)
];

// Cache for loaded wellbeing options
let cachedOptions: WellbeingOption[] | null = null;

/**
 * Get color for a feedback value based on its position in the scale
 * @param value - Numeric feedback value
 * @param options - Array of wellbeing options (optional)
 */
export function getFeedbackColor(value: number, options?: WellbeingOption[]): string {
  const opts = options || cachedOptions;

  if (!opts || opts.length === 0) {
    // Fallback for when options aren't loaded yet
    const index = Math.min(Math.max(value, 0), COLOR_PALETTE.length - 1);
    return COLOR_PALETTE[index];
  }

  // Sort options by value to ensure correct ordering
  const sortedOptions = [...opts].sort((a, b) => a.value - b.value);

  // Find the position of this value in the scale
  const valueIndex = sortedOptions.findIndex((opt) => opt.value === value);
  if (valueIndex === -1) {
    // Value not found in options, use closest
    const closestOption = sortedOptions.reduce((prev, curr) => (Math.abs(curr.value - value) < Math.abs(prev.value - value) ? curr : prev));
    const closestIndex = sortedOptions.indexOf(closestOption);
    // Map to color palette index
    const colorIndex = Math.floor((closestIndex / sortedOptions.length) * COLOR_PALETTE.length);
    return COLOR_PALETTE[Math.min(colorIndex, COLOR_PALETTE.length - 1)];
  }

  // Map option index to color palette
  // (e.g., for 4 options, indexes 0,1,2,3 map to color indexes 0,1,2,3)
  const colorIndex = Math.floor((valueIndex / sortedOptions.length) * COLOR_PALETTE.length);
  return COLOR_PALETTE[Math.min(colorIndex, COLOR_PALETTE.length - 1)];
}

/**
 * Get bar color with gradient effect based on value's position in the scale
 */
export function getFeedbackBarColor(value: number, options?: WellbeingOption[]): string {
  const opts = options || cachedOptions;

  if (!opts || opts.length === 0) {
    // Fallback gradient with default 0-3 scale
    if (value === 0) return COLOR_PALETTE[0];
    if (value <= 1) return COLOR_PALETTE[1];
    if (value <= 2) return COLOR_PALETTE[2];
    return COLOR_PALETTE[3];
  }

  // Sort options by value
  const sortedOptions = [...opts].sort((a, b) => a.value - b.value);

  // Get min and max values from options
  const minValue = sortedOptions[0].value;
  const maxValue = sortedOptions[sortedOptions.length - 1].value;
  const range = maxValue - minValue;

  // Normalize the value to a 0-1 range
  const normalizedValue = range === 0 ? 0 : (value - minValue) / range;

  // Map to color palette
  const colorIndex = Math.min(Math.floor(normalizedValue * COLOR_PALETTE.length), COLOR_PALETTE.length - 1);

  return COLOR_PALETTE[colorIndex];
}

/**
 * Get the nearest feedback label for a numeric value
 */
export function getNearestFeedbackLabel(value: number, options?: WellbeingOption[] | Record<string, string>): string {
  // Handle options as array of WellbeingOption
  if (Array.isArray(options)) {
    if (options.length === 0) return `Value ${value}`;

    // Find exact match first
    const exactMatch = options.find((opt) => opt.value === value);
    if (exactMatch) return exactMatch.label;

    // Find closest match
    const closestOption = options.reduce((prev, curr) => (Math.abs(curr.value - value) < Math.abs(prev.value - value) ? curr : prev));

    return closestOption.label;
  }

  // Handle options as Record<string, string> (legacy format)
  if (options && typeof options === 'object') {
    // Find the closest wellbeing value
    const values = Object.keys(options).map(Number);
    if (values.length === 0) return `Value ${value}`;

    const closestValue = values.reduce((prev, curr) => (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev));

    return options[closestValue] || `Value ${value}`;
  }

  return `Value ${value}`;
}

/**
 * Set cached wellbeing options for use by color functions
 */
export function setCachedWellbeingOptions(options: WellbeingOption[]): void {
  cachedOptions = options;
}

/**
 * Convert wellbeing options to a label record (for compatibility with older code)
 */
export function wellbeingOptionsToLabels(options: WellbeingOption[]): Record<string, string> {
  return Object.fromEntries(options.map((option) => [option.value.toString(), option.label]));
}

/**
 * Convert wellbeing options to a description record
 */
export function wellbeingOptionsToDescriptions(options: WellbeingOption[]): Record<string, string> {
  return Object.fromEntries(options.map((option) => [option.value.toString(), option.description]));
}
