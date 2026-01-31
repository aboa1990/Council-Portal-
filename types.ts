
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
  nameDh?: string; // Dhivehi Name
  code: string;
}

export interface AccessLog {
  id: string;
  action: string; 
  userId: string;
  userName: string;
  timestamp: string;
  details?: string;
  role?: UserRole;
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
  registrationNumber?: string;
  lastMaintenance?: string;
  notes?: string;
  logs?: AccessLog[];
  // New fields for Land & Buildings
  assetSize?: string;
  constructedDate?: string;
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
  gemsEntryNumber?: string; // New GEMS Entry No field
  issueDate: string;
  status: 'Issued' | 'Void' | 'Pending Upload';
  
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
  notes?: string;

  logs?: AccessLog[];
  signedPermitData?: string;
}

export interface RequisitionItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface RequisitionForm {
  id: string; // Format: RF258/2026/01
  date: string;
  department: string;
  requestedBy: string;
  purpose: string;
  items: RequisitionItem[];
  status: 'Pending' | 'Approved' | 'Rejected';
  totalAmount: number;
  createdAt: string;
}

export interface TemplateFieldPos {
  top: number;
  left: number;
  fontSize: number;
  visible: boolean;
  fontWeight?: string;
  textAlign?: 'left' | 'right' | 'center';
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

export type UserRole = 'Admin' | 'Executive' | 'Senior Management' | 'Staff';

export interface UserPermissions {
  dashboard: boolean;
  requests: boolean;
  hudha: boolean;
  houses: boolean;
  assets: boolean;
  garage: boolean;
  analytics: boolean;
  settings: boolean;
  // Specific Actions
  manage_users: boolean;
  delete_records: boolean;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  permissions?: UserPermissions; // Optional for backward compatibility
  avatar?: string;
  email: string;
  password?: string;
  sex?: 'Male' | 'Female';
  rcNo?: string;
  designation?: string;
  idNo?: string;
  address?: string;
  joinedDate?: string;
}

export interface SystemConfig {
  councilName: string;
  secretariatName: string;
  inventoryPrefix?: string;
  garagePermitTemplate: GaragePermitTemplate;
  // Branding
  councilLogo?: string;
  loginTitle?: string;
  loginHighlight?: string;
  loginSubtitle?: string;
  // Custom Fonts
  customDhivehiFont?: string; // Base64 data string
  customDhivehiFontName?: string; // Name of the uploaded file
}

export type ViewState = 'dashboard' | 'requests' | 'assets' | 'houses' | 'garage' | 'analytics' | 'settings' | 'hudha';
