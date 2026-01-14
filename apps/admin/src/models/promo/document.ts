import { Document } from 'mongoose';

export interface PromoConfigDocument extends Document {
  // Code promo actuel
  current: {
    code: string;
    token: string;
    description: string;
    discount_type: 'percentage' | 'fixed' | 'free_item';
    discount_value: number;
    valid_from: Date;
    valid_until: Date;
    max_uses: number;
    current_uses: number;
    is_active: boolean;
    created_at: Date;
  };

  // Historique des codes
  history: Array<{
    code: string;
    token: string;
    description: string;
    discount_type: 'percentage' | 'fixed' | 'free_item';
    discount_value: number;
    valid_from: Date;
    valid_until: Date;
    total_uses: number;
    deactivated_at: Date;
  }>;

  // Stats générales
  stats: {
    total_views: number;
    total_copies: number;
    views_today: number;
    copies_today: number;
  };

  // Stats de scan détaillées
  scan_stats: {
    total_scans: number;
    total_reveals: number;
    total_copies: number;
    conversion_rate_reveal: number;
    conversion_rate_copy: number;
    scans_by_day: Map<string, number>;
    scans_by_hour: Map<string, number>;
    average_time_to_reveal: number;
  };

  // Contenu marketing
  marketing: {
    title: string;
    message: string;
    image_url?: string;
    cta_text: string;
  };

  // Événements de tracking
  events: Array<{
    timestamp: Date;
    type: 'scan' | 'reveal' | 'copy';
    session_id: string;
  }>;

  createdAt: Date;
  updatedAt: Date;
}
