import { CitizenRequest, RequestPriority, RequestStatus, Asset, House, AssetCategory, AssetStatusConfig } from './types';

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

export const MOCK_REQUESTS: CitizenRequest[] = [
  {
    id: 'REQ-2024-001',
    citizenName: 'Alice Johnson',
    title: 'Large Pothole on Main St',
    description: 'There is a very large pothole near the intersection of Main St and 4th Ave. It caused a flat tire on my sedan. Please fix immediately.',
    category: 'Infrastructure',
    status: RequestStatus.NEW,
    priority: RequestPriority.HIGH,
    date: '2024-05-20T09:30:00Z',
    location: 'Main St & 4th Ave'
  },
  {
    id: 'REQ-2024-002',
    citizenName: 'Bob Smith',
    title: 'Missed Recycling Pickup',
    description: 'My recycling bin was skipped this Tuesday. This is the second time this month.',
    category: 'Waste Management',
    status: RequestStatus.IN_PROGRESS,
    priority: RequestPriority.MEDIUM,
    date: '2024-05-19T14:15:00Z',
    location: '123 Oak Lane'
  },
  {
    id: 'REQ-2024-003',
    citizenName: 'Charlie Davis',
    title: 'Noise Complaint - Construction',
    description: 'Construction work starting at 5 AM on the new apartment complex. City ordinance says 7 AM.',
    category: 'Noise Control',
    status: RequestStatus.NEW,
    priority: RequestPriority.MEDIUM,
    date: '2024-05-21T05:10:00Z',
    location: 'Sunset Blvd Construction Site'
  },
  {
    id: 'REQ-2024-004',
    citizenName: 'Diana Prince',
    title: 'Street Light Outage',
    description: 'The street light in front of the elementary school is flickering and goes dark frequently.',
    category: 'Infrastructure',
    status: RequestStatus.RESOLVED,
    priority: RequestPriority.HIGH,
    date: '2024-05-15T20:00:00Z',
    location: 'Lincoln Elementary'
  },
  {
    id: 'REQ-2024-005',
    citizenName: 'Evan Wright',
    title: 'Park Bench Broken',
    description: 'One of the benches in Central Park has a broken slat. Could be dangerous for kids.',
    category: 'Parks & Rec',
    status: RequestStatus.NEW,
    priority: RequestPriority.LOW,
    date: '2024-05-21T11:45:00Z',
    location: 'Central Park, North Entrance'
  }
];

// Office Code: 258
// Facilities (01), Furniture (02), IT (03), Fleet (04), Tools (05)
export const MOCK_ASSETS: Asset[] = [
  {
    id: '258-2020-04-01',
    name: 'Garbage Truck #42',
    category: 'Fleet',
    status: 'Operational',
    location: 'Central Depot',
    purchaseDate: '2020-03-15',
    entryDate: '2020-03-20',
    value: 250000,
    lastMaintenance: '2024-04-10',
    modelNumber: 'GT-5000-X',
    serialNumber: 'VIN99887766',
    logs: [
        { id: 'l1', action: 'Created', userId: 'USR-001', userName: 'Ahmed Riza', timestamp: '2020-03-20T10:00:00Z', details: 'Asset registered.' },
        { id: 'l2', action: 'Maintenance', userId: 'USR-002', userName: 'Fathimath Nazeer', timestamp: '2024-04-10T14:30:00Z', details: 'Routine oil change and brake check.' }
    ]
  },
  {
    id: '258-2019-01-01',
    name: 'Community Center Generator',
    category: 'Facilities',
    status: 'Maintenance',
    location: 'Westside Community Center',
    purchaseDate: '2019-11-20',
    entryDate: '2019-11-25',
    value: 45000,
    modelNumber: 'GEN-CAT-200',
    serialNumber: 'SN-223344',
    notes: 'Scheduled for annual servicing.',
    logs: [
         { id: 'l3', action: 'Created', userId: 'USR-001', userName: 'Ahmed Riza', timestamp: '2019-11-25T09:00:00Z', details: 'Asset registered.' },
         { id: 'l4', action: 'Status Change', userId: 'USR-003', userName: 'Ali Shiyam', timestamp: '2024-05-20T08:15:00Z', details: 'Changed status to Maintenance.' }
    ]
  },
  {
    id: '258-2022-03-01',
    name: 'Council Main Server Rack A',
    category: 'IT Hardware',
    status: 'Operational',
    location: 'City Hall Basement',
    purchaseDate: '2022-06-01',
    entryDate: '2022-06-05',
    value: 85000,
    modelNumber: 'DELL-R750',
    serialNumber: 'SRV-001-HA',
    logs: [
        { id: 'l5', action: 'Created', userId: 'USR-001', userName: 'Ahmed Riza', timestamp: '2022-06-05T11:00:00Z', details: 'Asset registered.' }
    ]
  },
  {
    id: '258-2023-03-01',
    name: 'MacBook Pro - Mayor Office',
    category: 'IT Hardware',
    status: 'Operational',
    location: 'City Hall - Floor 3',
    purchaseDate: '2023-09-15',
    entryDate: '2023-09-16',
    value: 2500,
    modelNumber: 'M2-MAX',
    serialNumber: 'FVFG6788',
    logs: [
        { id: 'l6', action: 'Created', userId: 'USR-002', userName: 'Fathimath Nazeer', timestamp: '2023-09-16T13:45:00Z', details: 'Handover to Mayor.' }
    ]
  },
  {
    id: '258-2021-05-01',
    name: 'Industrial Lawn Mower ZT',
    category: 'Tools & Equipment',
    status: 'Repair Needed',
    location: 'North Park Shed',
    purchaseDate: '2021-04-10',
    entryDate: '2021-04-15',
    value: 12000,
    modelNumber: 'DEERE-Z500',
    serialNumber: 'LM-9988-AA',
    notes: 'Blade assembly rattling.',
    logs: [
        { id: 'l7', action: 'Created', userId: 'USR-003', userName: 'Ali Shiyam', timestamp: '2021-04-15T10:00:00Z' },
        { id: 'l8', action: 'Status Change', userId: 'USR-003', userName: 'Ali Shiyam', timestamp: '2024-05-01T16:20:00Z', details: 'Reported rattling noise.' }
    ]
  },
  {
    id: '258-2023-04-01',
    name: 'Utility Van (Electric)',
    category: 'Fleet',
    status: 'Operational',
    location: 'Central Depot',
    purchaseDate: '2023-01-10',
    entryDate: '2023-01-12',
    value: 55000,
    lastMaintenance: '2024-01-10',
    modelNumber: 'FORD-E-TRANSIT',
    serialNumber: 'VIN-EL-8833',
    logs: [
        { id: 'l9', action: 'Created', userId: 'USR-001', userName: 'Ahmed Riza', timestamp: '2023-01-12T09:30:00Z' }
    ]
  }
];

export const MOCK_HOUSES: House[] = [
    {
        id: 'H-001',
        houseName: 'Rose Villa',
        registryNumber: 'R-1001',
        houseOrderNumber: '001',
        registryType: 'Bandara Goathi',
        ownerName: 'Ibrahim Rasheed',
        address: 'Violet Magu',
        plotLocation: 'Block 4, Plot 12',
        islandZone: 'North',
        inhabitants: 5,
        permitStatus: 'Valid',
        contactNumber: '777-1234',
        constructionDate: '1998-05-12'
    },
    {
        id: 'H-002',
        houseName: 'Ocean Breeze',
        registryNumber: 'R-1002',
        houseOrderNumber: '002',
        registryType: 'Amilla Goathi',
        ownerName: 'Mariyam Faiza',
        address: 'Bodu Magu',
        plotLocation: 'Beachfront, Lot 5',
        islandZone: 'West',
        inhabitants: 3,
        permitStatus: 'Valid',
        contactNumber: '999-5678',
        constructionDate: '2010-11-20'
    },
    {
        id: 'H-003',
        houseName: 'Sun Set',
        registryNumber: 'R-1003',
        houseOrderNumber: '003',
        registryType: 'Bandara Goathi',
        ownerName: 'Ahmed Niyaz',
        address: 'Ameenee Magu',
        plotLocation: 'Plot 22A',
        islandZone: 'South',
        inhabitants: 8,
        permitStatus: 'Expired',
        contactNumber: '765-4321',
        constructionDate: '2005-03-15'
    },
    {
        id: 'H-004',
        houseName: 'Palm Shade',
        registryNumber: 'R-1004',
        houseOrderNumber: '004',
        registryType: 'Government Plot',
        ownerName: 'Fathimath Didi',
        address: 'Orchid Magu',
        plotLocation: 'Sector 7, Plot 9',
        islandZone: 'East',
        inhabitants: 4,
        permitStatus: 'Pending',
        contactNumber: '988-1122',
        constructionDate: '2023-01-10'
    }
];