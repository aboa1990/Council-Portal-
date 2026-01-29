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
  date: string; 
  location?: string;
  aiAnalysis?: string; 
  suggestedResponse?: string;
}

export interface AssetStatusConfig {
  id: string;
  name: string;
  color: string; 
}

export interface AssetCategory {
  id: string;
  name: string;
  code: string;
}

export interface AccessLog {
  id: string;
  action: string; 
  userId: string;
  userName: string;
  timestamp: string;
  details?: string;
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  status: string; 
  location: string;
  purchaseDate: string;
  entryDate: string; 
  value: number;
  modelNumber?: string;
  serialNumber?: string;
  lastMaintenance?: string;
  notes?: string;
  logs?: AccessLog[];
}

export type RegistryType = 'Bandara Goathi' | 'Amilla Goathi' | 'Government Plot' | 'Agriculture Plot' | 'Industrial Plot';

export interface House {
  id: string;
  houseName: string;
  registryNumber: string;
  houseOrderNumber: string;
  registryType: RegistryType;
  ownerName: string;
  address: string;
  plotLocation: string;
  islandZone: string;
  inhabitants: number;
  permitStatus: 'Valid' | 'Expired' | 'Pending';
  constructionDate?: string;
  contactNumber: string;
}

export interface GaragePermit {
  permitId: string;
  issueDate: string;
  status: 'Issued' | 'Void';
  
  vehicleChassisNumber: string;
  vehicleRegistryNumber: string;
  
  vehicleOwnerName: string;
  vehicleOwnerAddress: string;
  vehicleOwnerId: string;
  vehicleOwnerContact: string;

  garageAddress: string;
  garageSizeSqft: number;
  houseRegistryNumber: string;

  garageOwnerName: string;
  garageOwnerAddress: string;
  garageOwnerId: string;
  garageOwnerContact: string;

  checkedBy?: string;
  authorizedBy?: string;

  logs?: AccessLog[];
}

export interface TemplateFieldPos {
  top: number;
  left: number;
  fontSize: number;
  visible: boolean;
  fontWeight?: string;
}

export interface GaragePermitTemplate {
  header: string;
  footer: string;
  title: string;
  declaration: string;
  useCustomTemplate: boolean;
  backgroundImage?: string;
  fieldPositions: Record<string, TemplateFieldPos>;
}

export type UserRole = 'Admin' | 'Secretary General' | 'Supervisor' | 'Staff';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  email?: string;
  password?: string;
  sex?: 'Male' | 'Female';
  rcNo?: string;
  designation?: string;
  idNo?: string;
}

export interface SystemConfig {
  councilName: string;
  secretariatName: string;
  garagePermitTemplate: GaragePermitTemplate;
}

export type ViewState = 'dashboard' | 'requests' | 'assets' | 'houses' | 'garage' | 'analytics' | 'settings';