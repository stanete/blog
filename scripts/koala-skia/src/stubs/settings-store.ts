export const useSettingsStore = (pick: (state: { stripes: number; belt: string }) => unknown) => pick({ stripes: 0, belt: 'white' });
