const KEY = "match-up-dice-settings";
const VERSION = 1;

export interface Settings {
  version: number;
  sound: boolean;
  names: string[];
}

const defaults: Settings = {
  version: VERSION,
  sound: true,
  names: ["You"],
};

export function loadSettings(): Settings {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      ...defaults,
      ...parsed,
      version: VERSION,
      names: Array.isArray(parsed.names) && parsed.names.length > 0 ? parsed.names : defaults.names,
    };
  } catch {
    return defaults;
  }
}

export function saveSettings(patch: Partial<Settings>) {
  if (typeof window === "undefined") return;
  try {
    const next = { ...loadSettings(), ...patch, version: VERSION };
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // private mode / quota — keep playing
  }
}
