import { Box, MapPin, ArrowUpRight } from 'lucide-react';
import { locationForPaper, verifiedFrameUrl } from '../data/locations';

export default function VirtualLocation({ paperId }: { paperId: string }) {
  const location = locationForPaper(paperId);
  const direct = verifiedFrameUrl(location.directSpotUrl, location.directSpotUrlVerified);
  const world = verifiedFrameUrl(location.worldUrl, location.worldUrlVerified);
  const url = direct ?? world;
  return <section className="virtual-location" aria-labelledby="location-heading">
    <Box size={26} strokeWidth={1.2} aria-hidden="true" />
    <p className="eyebrow">From page to place</p>
    <h2 id="location-heading">Find in Virtual Library</h2>
    <p>Explore the research in the XR Women FrameVR library.</p>
    {location.section || location.spotName ? <dl className="location-details">{location.section ? <><dt>Library section</dt><dd>{location.section}</dd></> : null}{location.spotName ? <><dt>Paper location</dt><dd>{location.spotName}</dd></> : null}</dl> : null}
    {location.description ? <p>{location.description}</p> : null}
    {url ? <a className="button primary" href={url} target="_blank" rel="noopener noreferrer">{direct ? 'Visit in Virtual Library' : 'Enter Virtual Library'}<ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a> : <div className="unmapped-state"><MapPin size={17} aria-hidden="true" /><div><strong>Location not yet mapped</strong><span>A verified FrameVR destination will appear here when available.</span></div></div>}
    {world && !direct ? <p className="location-note">Opens the library entrance. A direct spot link for this paper is not yet available.</p> : null}
  </section>;
}
