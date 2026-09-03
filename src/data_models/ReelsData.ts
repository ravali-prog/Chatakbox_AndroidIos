export interface ReelsItem {
  id: string;
  title: string;
  subtitle?: string;
  poster: string;
  mediaUrl: string;
  clipDetails?: any;
  seriesId?: string;
  cid?: string;
  contentgroup?: string;
  resume?: string;
}

export interface ReelsSeries {
  id: string;
  title: string;
  subtitle?: string;
  poster: string;
  episodes: ReelsItem[];
}

const DEMO_HLS =
  "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8";
const DEMO_MP4 =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

const POSTER_BASE = "https://picsum.photos/seed";

const episode = (
  id: string,
  seriesLabel: string,
  ep: number,
  title: string,
  posterSeed: string,
  mediaUrl: string,
): ReelsItem => ({
  id,
  title,
  subtitle: `${seriesLabel} E${ep} · ${(ep % 3) + 2} min`,
  poster: `${POSTER_BASE}/${posterSeed}/360/640`,
  mediaUrl,
});

export const REELS_DEMO_SERIES: ReelsSeries[] = [
  {
    id: "series-01",
    title: "City Lights",
    subtitle: "Romance · U/A 13+",
    poster: `${POSTER_BASE}/citylights/360/640`,
    episodes: [
      episode("city-e1", "S1", 1, "First Meet", "city1", DEMO_HLS),
      episode("city-e2", "S1", 2, "The Secret", "city2", DEMO_MP4),
      episode("city-e3", "S1", 3, "After Midnight", "city3", DEMO_HLS),
      episode("city-e4", "S1", 4, "Goodbye Letter", "city4", DEMO_MP4),
    ],
  },
  {
    id: "series-02",
    title: "Broken Promises",
    subtitle: "Drama · U/A 16+",
    poster: `${POSTER_BASE}/brokenpromises/360/640`,
    episodes: [
      episode("bp-e1", "S1", 1, "The Betrayal", "bp1", DEMO_MP4),
      episode("bp-e2", "S1", 2, "Unspoken Words", "bp2", DEMO_HLS),
      episode("bp-e3", "S1", 3, "The Reunion", "bp3", DEMO_MP4),
    ],
  },
  {
    id: "series-03",
    title: "Unspoken Words",
    subtitle: "Thriller · U/A 16+",
    poster: `${POSTER_BASE}/unspokenwords/360/640`,
    episodes: [
      episode("uw-e1", "S1", 1, "The Letter", "uw1", DEMO_HLS),
      episode("uw-e2", "S1", 2, "Hidden Truth", "uw2", DEMO_MP4),
      episode("uw-e3", "S1", 3, "The Chase", "uw3", DEMO_HLS),
      episode("uw-e4", "S1", 4, "Final Call", "uw4", DEMO_MP4),
    ],
  },
  {
    id: "series-04",
    title: "After Dark",
    subtitle: "Comedy · U/A 13+",
    poster: `${POSTER_BASE}/afterdark/360/640`,
    episodes: [
      episode("ad-e1", "S1", 1, "Late Shift", "ad1", DEMO_MP4),
      episode("ad-e2", "S1", 2, "Midnight Snack", "ad2", DEMO_HLS),
    ],
  },
];
