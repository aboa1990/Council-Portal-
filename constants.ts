
import { CitizenRequest, RequestPriority, RequestStatus, Asset, House, AssetCategory, AssetStatusConfig, GaragePermit, User } from './types';

export const DEFAULT_ASSET_CATEGORIES: AssetCategory[] = [
  { id: 'cat_fac', name: 'Facilities', code: '01' },
  { id: 'cat_fur', name: 'Furniture', code: '02' },
  { id: 'cat_it', name: 'IT Hardware', code: '03' },
  { id: 'cat_flt', name: 'Fleet', code: '04' },
  { id: 'cat_tls', name: 'Tools & Equipment', code: '05' },
  { id: 'cat_oth', name: 'Other', code: '99' },
];

export const DEFAULT_ASSET_STATUSES: AssetStatusConfig[] = [
  { id: 'sts_op', name: 'Operational', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'sts_maint', name: 'Maintenance', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'sts_rep', name: 'Repair Needed', color: 'bg-red-100 text-red-800 border-red-200' },
  { id: 'sts_ret', name: 'Retired', color: 'bg-slate-100 text-slate-800 border-slate-200' },
  { id: 'sts_sold', name: 'Sold', color: 'bg-blue-100 text-blue-800 border-blue-200' },
];

export const MOCK_STAFF: User[] = [
  {
    id: 'USR-001',
    name: 'Ahmed Riza',
    role: 'Admin',
    email: 'riza@hanimaadhoo.gov.mv',
    designation: 'Director of IT',
    rcNo: 'RC-2024-001',
    address: 'H. Noon Villa, Male',
    idNo: 'A101010',
    joinedDate: '2023-01-15',
    password: 'password123'
  },
  {
    id: 'USR-002',
    name: 'Fathimath Nazeer',
    role: 'Executive',
    email: 'nazeer@hanimaadhoo.gov.mv',
    designation: 'Council President',
    rcNo: 'RC-2024-002',
    address: 'M. Blue Sky, Male',
    idNo: 'A202020',
    joinedDate: '2022-12-01',
    password: 'password123'
  }
];

export const MOCK_REQUESTS: CitizenRequest[] = [
  {
    id: 'REQ-2024-001',
    citizenName: 'Alice Johnson',
    title: 'Large Pothole on Main St',
    description: 'There is a very large pothole near the intersection of Main St and 4th Ave.',
    category: 'Infrastructure',
    status: RequestStatus.NEW,
    priority: RequestPriority.HIGH,
    date: '2024-05-20T09:30:00Z',
    location: 'Main St & 4th Ave'
  }
];

export const MOCK_ASSETS: Asset[] = [];
export const MOCK_HOUSES: House[] = [];

export const MOCK_GARAGE_PERMITS: GaragePermit[] = [
  {
    permitId: '258/2024/01',
    issueDate: '2024-01-15',
    status: 'Issued',
    vehicleChassisNumber: 'CHS-99887766',
    vehicleRegistryNumber: 'C-1020',
    vehicleOwnerName: 'Hassan Moosa',
    vehicleOwnerAddress: 'H. Noon Villa, Male',
    vehicleOwnerId: 'A101010',
    vehicleOwnerContact: '7771122',
    garageAddress: 'Violet Magu, Plot 44',
    garageSizeSqft: 250,
    houseRegistryNumber: 'R-1001',
    garageOwnerName: 'Ibrahim Rasheed',
    garageOwnerAddress: 'Rose Villa, Hanimaadhoo',
    garageOwnerId: 'A202020',
    garageOwnerContact: '9991122',
    checkedBy: 'Ahmed Riza',
    authorizedBy: 'Fathimath Nazeer',
    logs: [
      { id: 'log-1', action: 'Created', userId: 'USR-001', userName: 'Ahmed Riza', timestamp: '2024-01-15T10:00:00Z', details: 'Initial permit issuance.' }
    ]
  }
];
