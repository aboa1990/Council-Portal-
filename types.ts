export enum RequestStatus {
  NEW = 'New',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  ARCHIVED = 'Archived'
}

export enum RequestPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface CitizenRequest {
  id: string;
  citizenName: string;
  title: string;
  description: string;
  category: string;
  status: RequestStatus;
  priority: RequestPriority;
  date: string; // ISO Date string
  location?: string;
  aiAnalysis?: string; // Stored summary from AI
  suggestedResponse?: string;
}

// Removed AssetStatus enum in favor of dynamic strings
export interface AssetStatusConfig {
  id: string;
  name: string;
  color: string; // e.g. 'bg-emerald-100 text-emerald-800'
}

export interface AssetCategory {
  id: string;
  name: string;
  code: string;
}

export interface AccessLog {
  id: string;
  action: string; // 'Created', 'Updated', 'Maintenance', 'Status Change'
  userId: string;
  userName: string;
  timestamp: string;
  details?: string;
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  status: string; // Now a dynamic string
  location: string;
  purchaseDate: string;
  entryDate: string; // Date entered into system
  value: number;
  // New Fields
  modelNumber?: string;
  serialNumber?: string;
  // Maintenance only for vehicles
  lastMaintenance?: string;
  notes?: string;
  logs?: AccessLog[];
}

export type RegistryType = 'Bandara Goathi' | 'Amilla Goathi' | 'Government Plot' | 'Agriculture Plot' | 'Industrial Plot';

export interface House {
  id: string;
  houseName: string;
  registryNumber: string; // New
  houseOrderNumber: string; // New
  registryType: RegistryType; // New
  ownerName: string;
  address: string;
  plotLocation: string; // New specific location
  islandZone: string;
  inhabitants: number;
  permitStatus: 'Valid' | 'Expired' | 'Pending';
  constructionDate?: string;
  contactNumber: string;
}

export interface DashboardStats {
  totalRequests: number;
  resolvedToday: number;
  criticalPending: number;
  avgResponseTimeHours: number;
}

export type UserRole = 'Admin' | 'Secretary General' | 'Supervisor' | 'Staff';

export interface User {
  id: string; // System ID
  name: string;
  role: UserRole;
  avatar?: string;
  email?: string;
  // Extended Details
  password?: string;
  sex?: 'Male' | 'Female';
  rcNo?: string;
  designation?: string;
  idNo?: string; // National ID / Card ID
}

export interface SystemConfig {
  councilName: string;
  secretariatName: string;
}

export type ViewState = 'dashboard' | 'requests' | 'assets' | 'houses' | 'analytics' | 'settings';