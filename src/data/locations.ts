/** Separate, maintained FrameVR mapping. Only set a verification flag after testing its URL. */
export type FrameLocation = {
  worldUrl?: string;
  worldUrlVerified?: boolean;
  section?: string;
  spotName?: string;
  directSpotUrl?: string;
  directSpotUrlVerified?: boolean;
  description?: string;
};

export const virtualLibrary: Pick<FrameLocation, 'worldUrl' | 'worldUrlVerified'> = {};
export const paperLocations: Record<string, FrameLocation | undefined> = {};

// Do not accept a DOI, arbitrary host, or non-HTTPS URL as a virtual destination.
export function verifiedFrameUrl(value: string | undefined, verified: boolean | undefined): string | undefined {
  if (!verified || !value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (url.hostname === 'framevr.io' || url.hostname.endsWith('.framevr.io')) && !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
}

export function locationForPaper(id: string): FrameLocation {
  return { ...virtualLibrary, ...paperLocations[id] };
}
