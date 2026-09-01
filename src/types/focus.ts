export type FocusStatus = "COMPLETE" | "COMPLETING" | "INCOMPLETE" | "IMPOSSIBLE";

export type FocusDTO = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: FocusStatus;
  iconUrl: string | null;
  x: number;
  y: number;
  order: number;
  isPublished: boolean;
  pathId: string;
  requirements: string[];
  completionText: string;
  incoming: string[]; // ids of focuses that are prerequisites of this one
};

export type PathDTO = {
  id: string;
  slug: string;
  name: string;
  description: string;
  color: string;
  category: "faction" | "diplomacy" | "national";
  order: number;
  isPublished: boolean;
  parentPathId: string | null;
};

export type TreeData = {
  paths: PathDTO[];
  focuses: FocusDTO[];
};
