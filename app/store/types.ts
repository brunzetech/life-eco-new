export interface User {
  id: string;
  email: string;
  full_name: string;
  balance: number;
  role: string;
  created_at: string;
  group_id?: string;
  is_suspended: boolean;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  type?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  created_at: string;
  type: string;
  narration?: string;
  debit?: number;
  credit?: number;
  balance_after: number;
  sender_id?: string;
  receiver_id?: string;
  description?: string;
  status?: string;
}

export interface MarketplaceItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  stock?: number;
  status: string;
  deleted: boolean;
  deleted_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseRecord {
  id: string;
  item_id?: string;
  user_id: string;
  quantity: number;
  total_price: number;
  price_per_item_snapshot: number;
  item_name_snapshot: string;
  purchase_date: string;
  status: string;
  delivery_date?: string;
}

export interface Activity {
  id: string;
  name: string;
  description?: string;
  pay: number;
  frequency: string;
  slots_available?: number;
  created_at: string;
  created_by?: string;
}

export interface Expense {
  id: string;
  name: string;
  description?: string;
  cost: number;
  frequency: string;
  created_at: string;
  created_by?: string;
}

export interface AuditLog {
  id: string;
  action_type: string;
  target_modules: string[];
  file_name?: string;
  performed_by?: string;
  timestamp: string;
  status: string;
  details?: string;
}

export interface RecentAction {
  id: string;
  action: string;
  timestamp: string;
  user?: string;
  details?: string;
}

export interface SecurityLog {
  id: string;
  action: string;
  user_id: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  details?: string;
}

export interface StoreState {
  // Current user
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Users management
  users: User[];
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;

  // Groups management
  groups: Group[];
  setGroups: (groups: Group[]) => void;
  addGroup: (group: Group) => void;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  deleteGroup: (groupId: string) => void;

  // Transactions
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateUserBalance: (userId: string, newBalance: number) => void;

  // Marketplace
  marketplaceItems: MarketplaceItem[];
  setMarketplaceItems: (items: MarketplaceItem[]) => void;
  addMarketplaceItem: (item: MarketplaceItem) => void;
  updateMarketplaceItem: (itemId: string, updates: Partial<MarketplaceItem>) => void;
  deleteMarketplaceItem: (itemId: string) => void;

  // Purchase records
  purchaseRecords: PurchaseRecord[];
  setPurchaseRecords: (records: PurchaseRecord[]) => void;
  addPurchaseRecord: (record: PurchaseRecord) => void;
  updatePurchaseRecord: (recordId: string, updates: Partial<PurchaseRecord>) => void;

  // Activities and Expenses
  activities: Activity[];
  setActivities: (activities: Activity[]) => void;
  addActivity: (activity: Activity) => void;
  updateActivity: (activityId: string, updates: Partial<Activity>) => void;
  deleteActivity: (activityId: string) => void;

  expenses: Expense[];
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (expenseId: string, updates: Partial<Expense>) => void;
  deleteExpense: (expenseId: string) => void;

  // Logs and actions
  recentActions: RecentAction[];
  addRecentAction: (action: RecentAction) => void;

  securityLogs: SecurityLog[];
  addSecurityLog: (log: SecurityLog) => void;

  auditLogs: AuditLog[];
  setAuditLogs: (logs: AuditLog[]) => void;
  addAuditLog: (log: AuditLog) => void;
}