// Local caching system for Tally data
interface CachedFormData {
  id: string;
  data: any;
  lastFetched: string;
  analytics?: any;
}

// In-memory cache - in production this would be replaced with Redis/database
const tallyCache: Map<string, CachedFormData> = new Map();

export const tallyCacheService = {
  // Cache form data with timestamp
  setFormData: (formId: string, data: any): void => {
    tallyCache.set(formId, {
      id: formId,
      data,
      lastFetched: new Date().toISOString(),
      analytics: tallyCache.get(formId)?.analytics
    });
  },

  // Cache analytics data
  setAnalytics: (formId: string, analytics: any): void => {
    const existing = tallyCache.get(formId);
    tallyCache.set(formId, {
      id: formId,
      data: existing?.data || null,
      lastFetched: existing?.lastFetched || new Date().toISOString(),
      analytics
    });
  },

  // Get cached form data
  getFormData: (formId: string): any | null => {
    return tallyCache.get(formId)?.data || null;
  },

  // Get cached analytics
  getAnalytics: (formId: string): any | null => {
    return tallyCache.get(formId)?.analytics || null;
  },

  // Check if cache is fresh (less than 5 minutes old)
  isFresh: (formId: string, maxAgeMinutes: number = 5): boolean => {
    const cached = tallyCache.get(formId);
    if (!cached) return false;
    
    const cacheAge = Date.now() - new Date(cached.lastFetched).getTime();
    return cacheAge < maxAgeMinutes * 60 * 1000;
  },

  // Get all cached forms
  getAllCachedForms: (): CachedFormData[] => {
    return Array.from(tallyCache.values());
  },

  // Clear cache for a specific form
  clearForm: (formId: string): void => {
    tallyCache.delete(formId);
  },

  // Clear all cache
  clearAll: (): void => {
    tallyCache.clear();
  }
};