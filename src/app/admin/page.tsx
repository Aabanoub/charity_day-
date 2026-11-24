'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { AdminItemSummary, AdminMessage } from '@/lib/types';
import { CLASS_OPTIONS } from '@/lib/constants';
import {
  Lock,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Download,
  Search,
  Filter,
  Send,
  Eye,
  ChevronDown,
  ChevronUp,
  Phone,
  MessageSquare,
  Award,
  Layers,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  X,
  ExternalLink,
} from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Admin Data States
  const [items, setItems] = useState<AdminItemSummary[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [adminToken, setAdminToken] = useState<string>('');

  // UI Tabs & Filters
  const [activeTab, setActiveTab] = useState<'dashboard' | 'items' | 'messages'>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Item Modal (Add / Edit)
  const [itemModalOpen, setItemModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<AdminItemSummary | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formPhotoUrl, setFormPhotoUrl] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formActive, setFormActive] = useState<boolean>(true);
  const [isSavingItem, setIsSavingItem] = useState<boolean>(false);

  // Delete Confirmation Modal
  const [itemToDelete, setItemToDelete] = useState<AdminItemSummary | null>(null);

  // Broadcast Message Form
  const [msgTitle, setMsgTitle] = useState<string>('');
  const [msgBody, setMsgBody] = useState<string>('');
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<boolean>(false);

  // Check existing session token
  useEffect(() => {
    const savedToken = localStorage.getItem('mtd_admin_token');
    if (savedToken) {
      setAdminToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch all admin data
  const fetchAdminData = async (token = adminToken) => {
    setIsLoadingData(true);
    try {
      const headers = { 'x-admin-token': token };

      const [itemsRes, msgsRes] = await Promise.all([
        fetch('/api/admin/items', { headers }),
        fetch('/api/admin/messages', { headers }),
      ]);

      if (itemsRes.status === 401 || msgsRes.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem('mtd_admin_token');
        return;
      }

      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        setItems(itemsData.items || []);
      }

      if (msgsRes.ok) {
        const msgsData = await msgsRes.json();
        setMessages(msgsData.messages || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData(adminToken);
    }
  }, [isAuthenticated, adminToken]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAdminToken(data.token);
        localStorage.setItem('mtd_admin_token', data.token);
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || 'Invalid admin password');
      }
    } catch (err: any) {
      setLoginError('Could not connect to authentication server');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    localStorage.removeItem('mtd_admin_token');
    setAdminToken('');
    setIsAuthenticated(false);
  };

  // Open Add Item Modal
  const openAddItemModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormPhotoUrl('');
    setFormDescription('');
    setFormActive(true);
    setItemModalOpen(true);
  };

  // Open Edit Item Modal
  const openEditItemModal = (item: AdminItemSummary) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormPhotoUrl(item.photoUrl);
    setFormDescription(item.description || '');
    setFormActive(item.active);
    setItemModalOpen(true);
  };

  // Save Item (Add or Edit)
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhotoUrl.trim()) return;

    setIsSavingItem(true);
    try {
      const isEditing = Boolean(editingItem);
      const url = '/api/admin/items';
      const method = isEditing ? 'PUT' : 'POST';
      const body = {
        id: editingItem?.id,
        name: formName.trim(),
        photoUrl: formPhotoUrl.trim(),
        description: formDescription.trim(),
        active: formActive,
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setItemModalOpen(false);
        fetchAdminData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save item');
      }
    } catch (err) {
      console.error('Error saving item:', err);
    } finally {
      setIsSavingItem(false);
    }
  };

  // Delete Item
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`/api/admin/items?id=${itemToDelete.id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken },
      });

      if (res.ok) {
        setItemToDelete(null);
        fetchAdminData();
      }
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  // Broadcast Message
  const handleBroadcastMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgTitle.trim() || !msgBody.trim()) return;

    setIsBroadcasting(true);
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({
          title: msgTitle.trim(),
          message: msgBody.trim(),
        }),
      });

      if (res.ok) {
        setMsgTitle('');
        setMsgBody('');
        setBroadcastSuccess(true);
        setTimeout(() => setBroadcastSuccess(false), 3000);
        fetchAdminData();
      }
    } catch (err) {
      console.error('Error broadcasting message:', err);
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Delete Broadcast Message
  const handleDeleteMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/messages?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken },
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  // Filter Items for Dashboard
  const filteredItems = items.filter((item) => {
    // Search query check (item name, lowest bidder name, lowest bidder phone)
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.lowestBidder?.name && item.lowestBidder.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.lowestBidder?.phone && item.lowestBidder.phone.includes(searchQuery));

    // Class filter check
    const matchesClass =
      selectedClassFilter === 'ALL' ||
      item.lowestBidder?.className === selectedClassFilter ||
      item.allSubmissions.some((s) => s.userClass === selectedClassFilter);

    return matchesSearch && matchesClass;
  });

  // Calculate Total Submissions
  const totalSubmissionsCount = items.reduce((acc, i) => acc + i.pricesCount, 0);

  // =========================================================================
  // VIEW 1: ADMIN LOGIN SCREEN
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-black flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-sm bg-brand-black border border-[#123A66] rounded-[16px] p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_0_1px_rgba(169,200,238,0.2)] text-white relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#B22026]/20 rounded-full blur-2xl pointer-events-none" />

          {/* Logo in Admin Login */}
          <div className="flex flex-col items-center text-center mb-6">
            <Logo size="lg" showText={false} />
            <h1 className="text-xl font-medium tracking-tight text-white mt-4">
              Admin Portal
            </h1>
            <p className="text-xs text-[#A9C8EE] mt-1 font-normal opacity-85">
              Make Their Day • Organizer Access
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="adminPassword" className="block text-xs font-medium text-gray-200 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A9C8EE]/70">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="adminPassword"
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  placeholder="Enter administrator password"
                  className="w-full pl-10 pr-4 py-3 bg-[#123A66]/30 border border-[#123A66] focus:border-[#A9C8EE] rounded-[12px] text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-[#A9C8EE] transition-all duration-200"
                />
              </div>
              {loginError && (
                <p className="flex items-center gap-1 text-[#B22026] text-xs mt-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {loginError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full min-h-[46px] py-2.5 px-4 bg-[#B22026] hover:bg-[#c9252c] text-white font-medium text-sm rounded-[12px] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(178,32,38,0.35)] transition-all duration-200 tap-active"
            >
              {isLoggingIn ? 'Verifying...' : 'Sign In as Admin'}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-[#A9C8EE] hover:text-white transition-colors duration-200"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Main Charity Page</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED ADMIN DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen bg-brand-black text-white flex flex-col">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-40 w-full bg-brand-black/95 backdrop-blur-md border-b border-[#123A66]/80">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:opacity-90">
              <Logo size="sm" showText={false} />
            </Link>
            <div>
              <h1 className="text-base font-medium tracking-tight text-white flex items-center gap-2">
                <span>Make Their Day</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#B22026] text-white font-medium uppercase tracking-wider">
                  Admin
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1 text-xs text-[#A9C8EE] hover:text-white px-2.5 py-1.5 rounded-lg border border-[#123A66] hover:bg-[#123A66]/40 transition-colors"
            >
              <span>User View</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#123A66]/40 hover:bg-[#123A66] border border-[#123A66] text-xs text-white transition-colors duration-200 tap-active"
            >
              <LogOut className="w-3.5 h-3.5 text-[#B22026]" />
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-4xl mx-auto px-4 flex border-t border-[#123A66]/40">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`py-2.5 px-4 text-xs font-medium border-b-2 transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'border-[#B22026] text-white font-medium'
                : 'border-transparent text-[#A9C8EE]/70 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Dashboard & Lowest Prices</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('items')}
            className={`py-2.5 px-4 text-xs font-medium border-b-2 transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === 'items'
                ? 'border-[#B22026] text-white font-medium'
                : 'border-transparent text-[#A9C8EE]/70 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage Items ({items.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('messages')}
            className={`py-2.5 px-4 text-xs font-medium border-b-2 transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === 'messages'
                ? 'border-[#B22026] text-white font-medium'
                : 'border-transparent text-[#A9C8EE]/70 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Pop-up Messages</span>
          </button>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        {/* =============================================================== */}
        {/* TAB 1: DASHBOARD (Lowest price, owner, phone, comment, tap to expand) */}
        {/* =============================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-[16px] bg-[#0b1d33] border border-[#123A66]">
                <span className="text-[11px] text-[#A9C8EE] block uppercase tracking-wider">Active Items</span>
                <span className="text-2xl font-medium text-white mt-1 block">{items.length}</span>
              </div>
              <div className="p-4 rounded-[16px] bg-[#0b1d33] border border-[#123A66]">
                <span className="text-[11px] text-[#A9C8EE] block uppercase tracking-wider">Total Prices In</span>
                <span className="text-2xl font-medium text-[#A9C8EE] mt-1 block">{totalSubmissionsCount}</span>
              </div>
              <div className="col-span-2 sm:col-span-1 p-4 rounded-[16px] bg-[#0b1d33] border border-[#123A66]">
                <span className="text-[11px] text-[#A9C8EE] block uppercase tracking-wider">Items Priced</span>
                <span className="text-2xl font-medium text-green-400 mt-1 block">
                  {items.filter((i) => i.lowestPrice !== null).length} / {items.length}
                </span>
              </div>
            </div>

            {/* Controls Bar: Search, Class Filter, Export CSV */}
            <div className="bg-[#0b1d33]/80 border border-[#123A66] rounded-[16px] p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#A9C8EE] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search item, bidder name, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#123A66]/30 border border-[#123A66] focus:border-[#A9C8EE] rounded-[10px] text-xs text-white placeholder-gray-400 focus:outline-none"
                />
              </div>

              {/* Class Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#A9C8EE] shrink-0" />
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="bg-[#0d2745] border border-[#123A66] text-xs text-white rounded-[10px] px-3 py-2 focus:outline-none focus:border-[#A9C8EE]"
                >
                  <option value="ALL">All Classes</option>
                  {CLASS_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {/* Export to CSV Button */}
                <a
                  href={`/api/admin/export?class=${encodeURIComponent(selectedClassFilter)}`}
                  download
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#B22026] hover:bg-[#c9252c] text-white text-xs font-medium rounded-[10px] transition-colors duration-200 tap-active shadow-md shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </a>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-4">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 border border-[#123A66] rounded-[16px] bg-[#0b1d33]/40 text-gray-400 text-xs">
                  No items match the current search or class filter.
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isExpanded = expandedItemId === item.id;
                  const hasBids = item.lowestPrice !== null && item.lowestBidder !== null;

                  return (
                    <div
                      key={item.id}
                      className="bg-[#0b1d33]/90 border border-[#123A66] rounded-[16px] overflow-hidden transition-all duration-200"
                    >
                      {/* Item Main Row */}
                      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Item Photo & Title */}
                        <div className="flex items-center gap-3.5">
                          <img
                            src={item.photoUrl}
                            alt={item.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-[12px] object-cover bg-black/50 border border-[#123A66] shrink-0"
                          />
                          <div>
                            <h3 className="font-medium text-white text-base leading-tight">
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-[#A9C8EE] bg-[#123A66]/50 px-2 py-0.5 rounded-full border border-[#123A66]">
                                {item.pricesCount} {item.pricesCount === 1 ? 'price' : 'prices'} received
                              </span>
                              {!item.active && (
                                <span className="text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
                                  Inactive
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Lowest Price and Bidder Card */}
                        <div className="bg-[#071526] border border-[#123A66] rounded-[12px] p-3 sm:min-w-[260px] flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] uppercase tracking-wider text-[#A9C8EE] font-medium flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-[#B22026]" />
                              Lowest Price
                            </span>
                            {hasBids ? (
                              <span className="text-lg font-medium text-white bg-[#B22026] px-2.5 py-0.5 rounded-md shadow-sm">
                                ${item.lowestPrice?.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500 italic">No prices yet</span>
                            )}
                          </div>

                          {hasBids && item.lowestBidder ? (
                            <div className="text-xs space-y-1 pt-1 border-t border-[#123A66]/60">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-white">{item.lowestBidder.name}</span>
                                <span className="text-[11px] text-[#A9C8EE]">({item.lowestBidder.className})</span>
                              </div>

                              <div className="flex items-center gap-1 text-[11px] text-gray-300">
                                <Phone className="w-3 h-3 text-[#A9C8EE]" />
                                <a
                                  href={`tel:${item.lowestBidder.phone}`}
                                  className="hover:underline text-[#A9C8EE]"
                                >
                                  {item.lowestBidder.phone}
                                </a>
                              </div>

                              {item.lowestBidder.comment && (
                                <p className="text-[11px] text-gray-400 italic line-clamp-1">
                                  &ldquo;{item.lowestBidder.comment}&rdquo;
                                </p>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* Drilldown Trigger: Tap an item to see all prices from low to high */}
                      <button
                        type="button"
                        onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                        className="w-full py-2.5 px-4 bg-[#071526]/80 hover:bg-[#071526] border-t border-[#123A66] flex items-center justify-between text-xs text-[#A9C8EE] hover:text-white transition-colors duration-200"
                      >
                        <span className="font-medium">
                          {isExpanded
                            ? 'Hide price breakdown'
                            : `Tap to see all ${item.pricesCount} prices (Low to High)`}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {/* Expanded View: All prices from low to high */}
                      {isExpanded && (
                        <div className="p-4 bg-black/60 border-t border-[#123A66] animate-fadeIn">
                          <h4 className="text-xs font-medium text-white uppercase tracking-wider mb-2">
                            All Submissions for {item.name}
                          </h4>

                          {item.allSubmissions.length === 0 ? (
                            <p className="text-xs text-gray-500 italic py-2">No prices submitted yet for this item.</p>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-[#123A66] text-[#A9C8EE] text-[11px]">
                                    <th className="py-2 px-2 font-normal">Rank</th>
                                    <th className="py-2 px-2 font-normal">Price</th>
                                    <th className="py-2 px-2 font-normal">User Name</th>
                                    <th className="py-2 px-2 font-normal">Class</th>
                                    <th className="py-2 px-2 font-normal">Phone</th>
                                    <th className="py-2 px-2 font-normal">Comment</th>
                                    <th className="py-2 px-2 font-normal">Time</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.allSubmissions.map((sub, idx) => (
                                    <tr
                                      key={sub.id}
                                      className={`border-b border-[#123A66]/30 ${
                                        idx === 0 ? 'bg-[#B22026]/15 font-medium' : 'hover:bg-[#123A66]/20'
                                      }`}
                                    >
                                      <td className="py-2 px-2">
                                        {idx === 0 ? (
                                          <span className="px-1.5 py-0.5 rounded bg-[#B22026] text-white text-[10px] font-medium">
                                            #1 Lowest
                                          </span>
                                        ) : (
                                          <span className="text-gray-400">#{idx + 1}</span>
                                        )}
                                      </td>
                                      <td className="py-2 px-2 font-medium text-white">
                                        ${sub.price.toFixed(2)}
                                      </td>
                                      <td className="py-2 px-2 text-white">{sub.userName}</td>
                                      <td className="py-2 px-2 text-[#A9C8EE]">{sub.userClass}</td>
                                      <td className="py-2 px-2">
                                        <a href={`tel:${sub.userPhone}`} className="text-[#A9C8EE] hover:underline">
                                          {sub.userPhone}
                                        </a>
                                      </td>
                                      <td className="py-2 px-2 text-gray-300 max-w-xs truncate">
                                        {sub.comment || '-'}
                                      </td>
                                      <td className="py-2 px-2 text-gray-500 text-[10px]">
                                        {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 2: MANAGE ITEMS (Add, Edit, Delete, Photos) */}
        {/* =============================================================== */}
        {activeTab === 'items' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-white">Charity Catalogue</h2>
                <p className="text-xs text-[#A9C8EE]">
                  Add, update or remove items available for pricing.
                </p>
              </div>

              <button
                type="button"
                onClick={openAddItemModal}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#B22026] hover:bg-[#c9252c] text-white text-xs font-medium rounded-[12px] shadow-md transition-all duration-200 tap-active"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#0b1d33] border border-[#123A66] rounded-[16px] p-4 flex gap-3.5 items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.photoUrl}
                      alt={item.name}
                      className="w-14 h-14 rounded-[12px] object-cover bg-black shrink-0 border border-[#123A66]"
                    />
                    <div className="min-w-0">
                      <h4 className="font-medium text-white text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-[#A9C8EE]/80 mt-0.5 line-clamp-1">{item.description || 'No description'}</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {item.pricesCount} prices submitted
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditItemModal(item)}
                      title="Edit Item"
                      className="p-2 rounded-lg bg-[#123A66]/50 hover:bg-[#123A66] text-[#A9C8EE] hover:text-white transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setItemToDelete(item)}
                      title="Delete Item"
                      className="p-2 rounded-lg bg-[#B22026]/20 hover:bg-[#B22026] text-[#B22026] hover:text-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 3: POP-UP MESSAGES (Send realtime popups, keep history) */}
        {/* =============================================================== */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            {/* Compose Card */}
            <div className="bg-[#0b1d33] border border-[#123A66] rounded-[16px] p-5">
              <h2 className="text-base font-medium text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-[#B22026]" />
                <span>Send Pop-up Message to All Users</span>
              </h2>
              <p className="text-xs text-[#A9C8EE] mt-1 mb-4 leading-relaxed">
                This message will immediately appear as an interactive modal pop-up on all active users&apos; screens with a &ldquo;Got it&rdquo; button.
              </p>

              <form onSubmit={handleBroadcastMessage} className="space-y-3.5">
                <div>
                  <label htmlFor="msgTitle" className="block text-xs font-medium text-gray-200 mb-1">
                    Announcement Title
                  </label>
                  <input
                    id="msgTitle"
                    type="text"
                    required
                    value={msgTitle}
                    onChange={(e) => setMsgTitle(e.target.value)}
                    placeholder="e.g. 15 Minutes Remaining to Submit Prices!"
                    className="w-full px-3.5 py-2.5 bg-[#123A66]/30 border border-[#123A66] focus:border-[#A9C8EE] rounded-[12px] text-white text-xs placeholder-gray-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="msgBody" className="block text-xs font-medium text-gray-200 mb-1">
                    Message Body
                  </label>
                  <textarea
                    id="msgBody"
                    required
                    rows={3}
                    value={msgBody}
                    onChange={(e) => setMsgBody(e.target.value)}
                    placeholder="e.g. We have received over 50 bids so far! Check the items again and adjust your prices to support the cause."
                    className="w-full px-3.5 py-2.5 bg-[#123A66]/30 border border-[#123A66] focus:border-[#A9C8EE] rounded-[12px] text-white text-xs placeholder-gray-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  {broadcastSuccess ? (
                    <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Broadcasted successfully! Reaching online users.</span>
                    </span>
                  ) : <div />}

                  <button
                    type="submit"
                    disabled={isBroadcasting}
                    className="px-5 py-2.5 bg-[#B22026] hover:bg-[#c9252c] text-white text-xs font-medium rounded-[12px] flex items-center gap-2 shadow-md transition-all duration-200 tap-active"
                  >
                    {isBroadcasting ? 'Broadcasting...' : 'Broadcast Pop-up'}
                  </button>
                </div>
              </form>
            </div>

            {/* Message History */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3">Broadcast History</h3>
              {messages.length === 0 ? (
                <div className="text-center py-8 border border-[#123A66] rounded-[16px] bg-[#0b1d33]/40 text-xs text-gray-400">
                  No announcements broadcasted yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className="bg-[#0b1d33] border border-[#123A66] rounded-[14px] p-4 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white text-sm">{m.title}</h4>
                          <span className="text-[10px] text-gray-400">
                            {new Date(m.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-[#A9C8EE] whitespace-pre-wrap">{m.message}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(m.id)}
                        title="Delete Announcement"
                        className="text-gray-400 hover:text-[#B22026] p-1.5 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* =============================================================== */}
      {/* MODAL: ADD / EDIT ITEM */}
      {/* =============================================================== */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-brand-black border border-[#123A66] rounded-[16px] p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#123A66]">
              <h3 className="font-medium text-base text-white">
                {editingItem ? 'Edit Charity Item' : 'Add New Charity Item'}
              </h3>
              <button
                type="button"
                onClick={() => setItemModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-200 mb-1">
                  Item Name <span className="text-[#B22026]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Handmade Knitted Wool Scarf"
                  className="w-full px-3.5 py-2.5 bg-[#123A66]/30 border border-[#123A66] focus:border-[#A9C8EE] rounded-[12px] text-white text-xs placeholder-gray-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-200 mb-1">
                  Photo URL <span className="text-[#B22026]">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={formPhotoUrl}
                  onChange={(e) => setFormPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-[#123A66]/30 border border-[#123A66] focus:border-[#A9C8EE] rounded-[12px] text-white text-xs placeholder-gray-500 focus:outline-none"
                />
                {formPhotoUrl && (
                  <div className="mt-2 w-20 h-20 rounded-[10px] overflow-hidden border border-[#123A66] bg-black">
                    <img src={formPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-200 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Short description of the item"
                  className="w-full px-3.5 py-2.5 bg-[#123A66]/30 border border-[#123A66] focus:border-[#A9C8EE] rounded-[12px] text-white text-xs placeholder-gray-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formActive"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="rounded text-[#B22026] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="formActive" className="text-xs text-gray-300 cursor-pointer">
                  Item is active and visible for price collection
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#123A66]">
                <button
                  type="button"
                  onClick={() => setItemModalOpen(false)}
                  className="px-4 py-2 bg-transparent hover:bg-[#123A66]/40 text-xs text-gray-300 rounded-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingItem}
                  className="px-5 py-2 bg-[#B22026] hover:bg-[#c9252c] text-white text-xs font-medium rounded-[10px] shadow transition-colors"
                >
                  {isSavingItem ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* =============================================================== */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-brand-black border border-[#B22026]/60 rounded-[16px] p-6 shadow-2xl text-white">
            <h3 className="font-medium text-base text-white flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-[#B22026]" />
              <span>Confirm Delete Item</span>
            </h3>
            <p className="text-xs text-[#A9C8EE] mt-2 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">&ldquo;{itemToDelete.name}&rdquo;</strong>? All submitted prices for this item will also be removed.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-3.5 py-2 text-xs text-gray-300 hover:text-white rounded-[10px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteItem}
                className="px-4 py-2 bg-[#B22026] hover:bg-[#c9252c] text-white text-xs font-medium rounded-[10px]"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
