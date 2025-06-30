import { create } from "zustand";
import type { StoreState } from "./types";

export const useStore = create<StoreState>((set, get) => ({
  // Current user
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  // Users management
  users: [],
  setUsers: (users) => set({ users }),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  updateUser: (userId, updates) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId ? { ...user, ...updates } : user
      ),
    })),
  deleteUser: (userId) =>
    set((state) => ({
      users: state.users.filter((user) => user.id !== userId),
    })),

  // Groups management
  groups: [],
  setGroups: (groups) => set({ groups }),
  addGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),
  updateGroup: (groupId, updates) =>
    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === groupId ? { ...group, ...updates } : group
      ),
    })),
  deleteGroup: (groupId) =>
    set((state) => ({
      groups: state.groups.filter((group) => group.id !== groupId),
    })),

  // Transactions
  transactions: [],
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) =>
    set((state) => ({ transactions: [...state.transactions, transaction] })),
  updateUserBalance: (userId, newBalance) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId ? { ...user, balance: newBalance } : user
      ),
      currentUser:
        state.currentUser?.id === userId
          ? { ...state.currentUser, balance: newBalance }
          : state.currentUser,
    })),

  // Marketplace
  marketplaceItems: [],
  setMarketplaceItems: (items) => set({ marketplaceItems: items }),
  addMarketplaceItem: (item) =>
    set((state) => ({ marketplaceItems: [...state.marketplaceItems, item] })),
  updateMarketplaceItem: (itemId, updates) =>
    set((state) => ({
      marketplaceItems: state.marketplaceItems.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    })),
  deleteMarketplaceItem: (itemId) =>
    set((state) => ({
      marketplaceItems: state.marketplaceItems.filter(
        (item) => item.id !== itemId
      ),
    })),

  // Purchase records
  purchaseRecords: [],
  setPurchaseRecords: (records) => set({ purchaseRecords: records }),
  addPurchaseRecord: (record) =>
    set((state) => ({ purchaseRecords: [...state.purchaseRecords, record] })),
  updatePurchaseRecord: (recordId, updates) =>
    set((state) => ({
      purchaseRecords: state.purchaseRecords.map((record) =>
        record.id === recordId ? { ...record, ...updates } : record
      ),
    })),

  // Activities and Expenses
  activities: [],
  setActivities: (activities) => set({ activities }),
  addActivity: (activity) =>
    set((state) => ({ activities: [...state.activities, activity] })),
  updateActivity: (activityId, updates) =>
    set((state) => ({
      activities: state.activities.map((activity) =>
        activity.id === activityId ? { ...activity, ...updates } : activity
      ),
    })),
  deleteActivity: (activityId) =>
    set((state) => ({
      activities: state.activities.filter(
        (activity) => activity.id !== activityId
      ),
    })),

  expenses: [],
  setExpenses: (expenses) => set({ expenses }),
  addExpense: (expense) =>
    set((state) => ({ expenses: [...state.expenses, expense] })),
  updateExpense: (expenseId, updates) =>
    set((state) => ({
      expenses: state.expenses.map((expense) =>
        expense.id === expenseId ? { ...expense, ...updates } : expense
      ),
    })),
  deleteExpense: (expenseId) =>
    set((state) => ({
      expenses: state.expenses.filter((expense) => expense.id !== expenseId),
    })),

  // Logs and actions
  recentActions: [],
  addRecentAction: (action) =>
    set((state) => ({ recentActions: [...state.recentActions, action] })),

  securityLogs: [],
  addSecurityLog: (log) =>
    set((state) => ({ securityLogs: [...state.securityLogs, log] })),

  auditLogs: [],
  setAuditLogs: (logs) => set({ auditLogs: logs }),
  addAuditLog: (log) =>
    set((state) => ({ auditLogs: [...state.auditLogs, log] })),
}));