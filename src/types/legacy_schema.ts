export interface ConfigBuilding {
  id: string;
  name: string;
  description: string | null;
  cost_armaments: number;
  cost_munitions: number;
  cost_dollars: number;
  base_duration: number;
  base_production: number;
  points: number;
  created_at?: string;
}

// Flat structure returned by get_base_buildings RPC
export interface BaseBuildingRPC {
  id: string; // base_building id
  base_id: string;
  building_id: string;
  level: number;
  created_at?: string;

  // Joined Config Fields
  name: string;
  description: string | null;
  cost_armaments: number;
  cost_munitions: number;
  cost_dollars: number;
  base_duration: number;
  base_production: number;
  points: number;
}

export interface ConstructionQueueItem {
  id: string;
  base_id: string;
  building_id: string;
  target_level: number;
  start_time: string;
  end_time: string;
  created_at?: string;
  // Joined fields
  building_name?: string;
}

export interface Base {
  id: string;
  user_id: string;
  name: string | null;
  coord_x: number;
  coord_y: number;
  coord_z: number;
  resources_armaments: number;
  resources_munitions: number;
  resources_alcohol: number;
  resources_dollars: number;
  points: number;
  last_updated_at?: string;
  created_at?: string;
}
