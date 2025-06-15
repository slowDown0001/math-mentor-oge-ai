
export interface SubtitleSegment {
  start: number;
  end: number;
  text: string;
}

export const parseVTT = (vttContent: string): SubtitleSegment[] => {
  const segments: SubtitleSegment[] = [];
  const lines = vttContent.split('\n');
  
  let currentSegment: Partial<SubtitleSegment> = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and headers
    if (!line || line.startsWith('WEBVTT') || line.startsWith('NOTE')) {
      continue;
    }
    
    // Check if line contains timestamp
    if (line.includes('-->')) {
      const [startTime, endTime] = line.split('-->').map(t => t.trim());
      currentSegment.start = parseTimestamp(startTime);
      currentSegment.end = parseTimestamp(endTime);
    } else if (currentSegment.start !== undefined && currentSegment.end !== undefined) {
      // This is subtitle text
      currentSegment.text = line;
      segments.push(currentSegment as SubtitleSegment);
      currentSegment = {};
    }
  }
  
  return segments;
};

const parseTimestamp = (timestamp: string): number => {
  const parts = timestamp.split(':');
  const seconds = parts[parts.length - 1].split(',')[0]; // Remove milliseconds
  const minutes = parts[parts.length - 2] || '0';
  const hours = parts[parts.length - 3] || '0';
  
  return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
};

export const findSubtitleAtTimestamp = (
  segments: SubtitleSegment[], 
  timestamp: number, 
  bufferSeconds: number = 5
): string => {
  // Find segments within the buffer range
  const relevantSegments = segments.filter(segment => 
    (segment.start <= timestamp + bufferSeconds && segment.end >= timestamp - bufferSeconds)
  );
  
  if (relevantSegments.length === 0) {
    return "No subtitles available for this timestamp.";
  }
  
  // Return the most relevant segment (closest to timestamp)
  const closestSegment = relevantSegments.reduce((closest, current) => {
    const closestDistance = Math.min(
      Math.abs(closest.start - timestamp),
      Math.abs(closest.end - timestamp)
    );
    const currentDistance = Math.min(
      Math.abs(current.start - timestamp),
      Math.abs(current.end - timestamp)
    );
    
    return currentDistance < closestDistance ? current : closest;
  });
  
  return closestSegment.text;
};

export const fetchSubtitlesFromSupabase = async (videoId: string): Promise<SubtitleSegment[]> => {
  // This would fetch VTT files from Supabase storage
  // For now, return empty array as placeholder
  console.log(`Fetching subtitles for video: ${videoId}`);
  return [];
};
