import type { Stream } from "../providers/types";

export const parseQualityResolution = (quality?: string, server?: string): number => {
  const check = (str?: string): number => {
    if (!str) return 0;
    const lower = str.toLowerCase().trim();
    const match = lower.match(/(\d{3,4})p?/);
    if (match) {
      const val = parseInt(match[1], 10);
      if ([240, 360, 480, 540, 720, 1080, 1440, 2160].includes(val)) return val;
      if (val >= 240 && val <= 4320) return val;
    }
    if (lower.includes("4k") || lower.includes("2160")) return 2160;
    if (lower.includes("2k") || lower.includes("1440")) return 1440;
    if (lower.includes("fhd") || lower.includes("1080")) return 1080;
    if (lower.includes("hd") || lower.includes("720")) return 720;
    if (lower.includes("sd") || lower.includes("480")) return 480;
    return 0;
  };

  const getBonus = (str?: string): number => {
    if (!str) return 0;
    const lower = str.toLowerCase();
    let bonus = 0;
    if (lower.includes("remux")) bonus += 0.8;
    if (lower.includes("dovi") || lower.includes("dv ") || lower.includes("dv-") || lower.includes("dolby vision")) bonus += 0.7;
    if (lower.includes("hdr")) bonus += 0.6;
    if (lower.includes("hevc") || lower.includes("h265") || lower.includes("h.265")) bonus += 0.5;
    if (lower.includes("av1")) bonus += 0.4;
    if (lower.includes("10bit")) bonus += 0.2;
    return bonus;
  };

  const resFromQuality = check(quality);
  if (resFromQuality > 0) return resFromQuality + getBonus(quality) + getBonus(server);
  
  const resFromServer = check(server);
  if (resFromServer > 0) return resFromServer + getBonus(server) + getBonus(quality);
  
  return getBonus(quality) + getBonus(server);
};

export const findBestMatchingStream = (
  streams: Stream[],
  targetQuality?: string,
  targetServer?: string,
): Stream => {
  if (!streams || streams.length === 0) {
    throw new Error("No streams available");
  }
  if (!targetQuality) {
    return streams[0];
  }

  const targetRes = parseQualityResolution(targetQuality);

  // 1. Exact resolution & server match
  if (targetRes > 0 && targetServer) {
    const exactServerMatch = streams.find(
      (s) =>
        parseQualityResolution(s.quality, s.server) === targetRes &&
        s.server?.toLowerCase().trim() === targetServer.toLowerCase().trim(),
    );
    if (exactServerMatch) return exactServerMatch;
  }

  // 2. Exact resolution match (any server)
  if (targetRes > 0) {
    const exactResMatch = streams.find(
      (s) => parseQualityResolution(s.quality, s.server) === targetRes,
    );
    if (exactResMatch) return exactResMatch;
  }

  // 3. Exact string match on quality or type
  const targetLower = targetQuality.toLowerCase().trim();
  const exactStringMatch = streams.find(
    (s) => (s.quality || s.type)?.toLowerCase().trim() === targetLower,
  );
  if (exactStringMatch) return exactStringMatch;

  // 4. "Top near quality" selection: Find closest resolution
  if (targetRes > 0) {
    const streamsWithRes = streams
      .map((s) => ({
        stream: s,
        res: parseQualityResolution(s.quality, s.server),
      }))
      .filter((item) => item.res > 0);

    if (streamsWithRes.length > 0) {
      streamsWithRes.sort((a, b) => {
        const diffA = Math.abs(a.res - targetRes);
        const diffB = Math.abs(b.res - targetRes);

        // Nearest distance first
        if (diffA !== diffB) {
          return diffA - diffB;
        }

        // On tied distance, prefer higher resolution ("top")
        if (b.res !== a.res) {
          return b.res - a.res;
        }

        // Prefer same server if available
        if (targetServer) {
          const aMatch = a.stream.server?.toLowerCase().trim() === targetServer.toLowerCase().trim();
          const bMatch = b.stream.server?.toLowerCase().trim() === targetServer.toLowerCase().trim();
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
        }

        return 0;
      });

      return streamsWithRes[0].stream;
    }
  }

  // 5. Server match fallback
  if (targetServer) {
    const sameServerMatch = streams.find(
      (s) => s.server?.toLowerCase().trim() === targetServer.toLowerCase().trim(),
    );
    if (sameServerMatch) return sameServerMatch;
  }

  // 6. Default to first stream
  return streams[0];
};
