import { api } from '@/lib/api';

// Types based on the server-side Campaign model
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  type: 'traffic' | 'revenue' | 'testing';
  settings: {
    dailyVisitTarget: number;
    maxConcurrentSessions: number;
    sessionDuration: {
      min: number;
      max: number;
    };
    clickRate: {
      min: number;
      max: number;
    };
    bounceRate: {
      min: number;
      max: number;
    };
  };
  targeting: {
    countries: string[];
    adNetworks: string[];
    adFormats: string[];
    deviceTypes: string[];
    browsers: string[];
  };
  schedule: {
    enabled: boolean;
    timezone: string;
    dailySchedule: {
      enabled: boolean;
      startTime: string;
      endTime: string;
    };
    weeklySchedule: {
      enabled: boolean;
      activeDays: number[];
    };
    dateRange: {
      enabled: boolean;
      startDate: string | null;
      endDate: string | null;
    };
  };
  targets: {
    urls: string[];
    behavior: 'random' | 'sequential' | 'weighted';
    weights: Record<string, number>;
  };
  profiles: {
    assignmentType: 'auto' | 'manual' | 'category';
    assignedProfiles: string[];
    categoryDistribution: {
      newVisitor: number;
      returningRegular: number;
      loyalUser: number;
    };
    maxProfilesPerCampaign: number;
  };
  performance: {
    totalVisits: number;
    totalClicks: number;
    totalRevenue: number;
    avgSessionDuration: number;
    avgCTR: number;
    errorRate: number;
    lastUpdated: string | null;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface CampaignCreate {
  name: string;
  description?: string;
  status?: 'draft' | 'active' | 'paused' | 'completed';
  type?: 'traffic' | 'revenue' | 'testing';
  settings?: Partial<Campaign['settings']>;
  targeting?: Partial<Campaign['targeting']>;
  schedule?: Partial<Campaign['schedule']>;
  targets?: Partial<Campaign['targets']>;
  profiles?: Partial<Campaign['profiles']>;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  createdBy?: string;
}

export interface CampaignUpdate {
  name?: string;
  description?: string;
  status?: Campaign['status'];
  type?: 'traffic' | 'revenue' | 'testing';
  settings?: Partial<Campaign['settings']>;
  targeting?: Partial<Campaign['targeting']>;
  schedule?: Partial<Campaign['schedule']>;
  targets?: Partial<Campaign['targets']>;
  profiles?: Partial<Campaign['profiles']>;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
}

export interface CampaignStats {
  total: number;
  active: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  totalVisits: number;
  totalRevenue: number;
}

export interface CampaignLaunchOptions {
  profileCount?: number;
  profileIds?: string[];
  useEnhanced?: boolean;
  useBatch?: boolean;
  useDatabaseStorage?: boolean;
  options?: Record<string, any>;
}

export interface CampaignLaunchResponse {
  success: boolean;
  message: string;
  data?: {
    campaignId: string;
    jobId?: string;
    workflow?: string;
    totalProfiles?: number;
    estimatedBatches?: number;
    estimatedDuration?: string;
  };
}

export interface CampaignProgress {
  campaignId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  totalProfiles?: number;
  completedProfiles?: number;
  failedProfiles?: number;
  estimatedCompletion?: string;
  jobId?: string;
}

export interface CampaignLaunchProgress {
  campaignId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  message: string;
  timestamp: string;
  details?: {
    totalProfiles: number;
    completedProfiles: number;
    failedProfiles: number;
    estimatedCompletion: string;
  };
}

// Local storage key for caching campaigns
const CAMPAIGNS_STORAGE_KEY = 'nyx_campaigns_cache';

// Helper functions for local storage
const saveCampaignsToLocalStorage = (campaigns: Campaign[]) => {
  try {
    localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns));
  } catch (error) {
    console.warn('Failed to save campaigns to localStorage:', error);
  }
};

const loadCampaignsFromLocalStorage = (): Campaign[] => {
  try {
    const cached = localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.warn('Failed to load campaigns from localStorage:', error);
    return [];
  }
};

const clearCampaignsFromLocalStorage = () => {
  try {
    localStorage.removeItem(CAMPAIGNS_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear campaigns from localStorage:', error);
  }
};

/**
 * Campaigns API client for interacting with the server endpoints
 */
export const campaignsApi = {
  /**
   * Get a list of campaigns
   */
  list: async (): Promise<Campaign[]> => {
    try {
      // Try to get campaigns from server
      const response = await api.get('/api/campaigns');
      const campaigns = Array.isArray(response) ? response : (response?.data || []);
      
      // Cache campaigns in localStorage
      saveCampaignsToLocalStorage(campaigns);
      
      return campaigns;
    } catch (error) {
      // If server request fails, try to load from localStorage
      console.warn('Failed to fetch campaigns from server, loading from cache:', error);
      const cachedCampaigns = loadCampaignsFromLocalStorage();
      
      if (cachedCampaigns.length > 0) {
        return cachedCampaigns;
      }
      
      // If no cached data, re-throw the error
      throw error;
    }
  },

  /**
   * Get a specific campaign by ID
   */
  get: async (campaignId: string): Promise<Campaign> => {
    try {
      const response = await api.get(`/api/campaigns/${campaignId}`);
      return response || {};
    } catch (error) {
      // Try to find in localStorage cache
      const cachedCampaigns = loadCampaignsFromLocalStorage();
      const cachedCampaign = cachedCampaigns.find(c => c.id === campaignId);
      
      if (cachedCampaign) {
        return cachedCampaign;
      }
      
      throw error;
    }
  },

  /**
   * Create a new campaign
   */
  create: async (campaignData: CampaignCreate): Promise<Campaign> => {
    try {
      const response = await api.post('/api/campaigns', campaignData);
      const newCampaign = response || campaignData;
      
      // Update localStorage cache
      const cachedCampaigns = loadCampaignsFromLocalStorage();
      cachedCampaigns.push(newCampaign);
      saveCampaignsToLocalStorage(cachedCampaigns);
      
      return newCampaign;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update a campaign with new values
   */
  update: async (
    campaignId: string,
    updateData: CampaignUpdate
  ): Promise<Campaign> => {
    try {
      const response = await api.put(`/api/campaigns/${campaignId}`, updateData);
      const updatedCampaign = response || updateData;
      
      // Update localStorage cache
      const cachedCampaigns = loadCampaignsFromLocalStorage();
      const index = cachedCampaigns.findIndex(c => c.id === campaignId);
      if (index !== -1) {
        cachedCampaigns[index] = updatedCampaign;
        saveCampaignsToLocalStorage(cachedCampaigns);
      }
      
      return updatedCampaign;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a campaign
   */
  delete: async (campaignId: string): Promise<void> => {
    try {
      await api.delete(`/api/campaigns/${campaignId}`);
    } catch (error) {
      // Even if the server returns an error, we still want to update the local cache
      // This handles cases where the campaign was already deleted on the server
      console.warn('Server delete failed, but updating local cache:', error);
    } finally {
      // Always update localStorage cache to ensure UI consistency
      try {
        const cachedCampaigns = loadCampaignsFromLocalStorage();
        const index = cachedCampaigns.findIndex(c => c.id === campaignId);
        if (index !== -1) {
          cachedCampaigns.splice(index, 1);
          saveCampaignsToLocalStorage(cachedCampaigns);
        }
      } catch (cacheError) {
        console.error('Failed to update local cache after delete:', cacheError);
      }
    }
  },

  /**
   * Get campaign statistics
   */
  getStats: async (): Promise<CampaignStats> => {
    try {
      const response = await api.get('/api/campaigns/stats');
      return response || {
        total: 0,
        active: 0,
        byStatus: {},
        byType: {},
        totalVisits: 0,
        totalRevenue: 0
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Launch a campaign
   * @param campaignId - The ID of the campaign to launch
   * @param options - Launch options including profile count and specific profile IDs
   */
  launch: async (
    campaignId: string,
    options: CampaignLaunchOptions = {}
  ): Promise<CampaignLaunchResponse> => {
    try {
      const response = await api.post(`/api/campaigns/${campaignId}/launch`, options);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get campaign progress
   * @param campaignId - The ID of the campaign to check progress for
   */
  getProgress: async (campaignId: string): Promise<CampaignProgress> => {
    try {
      const response = await api.get(`/api/campaigns/${campaignId}/progress`);
      return response || {
        campaignId,
        status: 'pending',
        progress: 0
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Clear local storage cache
   */
  /**
   * Export campaigns to JSON
   * @param campaignIds - Optional array of campaign IDs to export
   */
  export: async (campaignIds?: string[]): Promise<any> => {
    try {
      const response = await api.post('/api/campaigns/export', { campaignIds });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Import campaigns from JSON
   * @param data - Campaign data to import
   */
  import: async (data: any): Promise<any> => {
    try {
      const response = await api.post('/api/campaigns/import', data);
      return response;
    } catch (error) {
      throw error;
    }
  },
};