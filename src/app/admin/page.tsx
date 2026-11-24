'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import AdminReportModal from '@/components/AdminReportModal';
import { AdminItemSummary, AdminMessage, SiteStatusSettings } from '@/lib/types';
import { CLASS_OPTIONS } from '@/lib/constants';
import {
  Lock,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Send,
  Eye,
  EyeOff,
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
  UploadCloud,
  ImageIcon,
  Camera,
  Loader2,
  RefreshCw,
  Power,
  Radio,
  FileText,
} from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Admin Data States
  const [items, setItems] = useState<AdminItemSummary[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [adminToken, setAdminToken] = useState<string>('');

  // UI Tabs & Filters
  const [activeTab, setActiveTab] = useState<'dashboard' | 'items' | 'messages' | 'closure'>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Site Closure Settings State
  const [siteSettings, setSiteSettings] = useState<SiteStatusSettings>({
    isClosed: false,
    title: 'Charity Day Has Concluded',
    message:
      'Thank you for your incredible support! Price submissions are currently closed while organizers review the results.',
  });
  const [closureTitleInput, setClosureTitleInput] = useState<string>('Charity Day Has Concluded');
  const [closureMsgInput, setClosureMsgInput] = useState<string>(
    'Thank you for your incredible support! Price submissions are currently closed while organizers review the results.'
  );
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [settingsSuccess, setSettingsSuccess] = useState<boolean>(false);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);

  // Item Modal (Add / Edit)
  const [itemModalOpen, setItemModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<AdminItemSummary | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formPhotoUrl, setFormPhotoUrl] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formActive, setFormActive] = useState<boolean>(true);
  const [isSavingItem, setIsSavingItem] = useState<boolean>(false);

  // Direct Image Upload States
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlFallback, setShowUrlFallback] = useState<boolean>(false);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit');
      return;
    }

    setUploadError(null);
    setIsUploadingImage(true);

    // Fast local preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormPhotoUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'x-admin-token': adminToken },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setFormPhotoUrl(data.url);
      } else {
        console.warn('Upload API note:', data.error);
      }
    } catch (err: any) {
      console.warn('Network upload note, using data URL preview:', err);
    } finally {
      setIsUploadingImage(false);
      // Reset input value so re-selecting same file triggers onChange
      if (e.target) e.target.value = '';
    }
  };

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

      const [itemsRes, msgsRes, settingsRes] = await Promise.all([
        fetch('/api/admin/items', { headers }),
        fetch('/api/admin/messages', { headers }),
        fetch('/api/settings'),
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

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData.settings) {
          setSiteSettings(settingsData.settings);
          setClosureTitleInput(settingsData.settings.title);
          setClosureMsgInput(settingsData.settings.message);
        }
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleUpdateSiteSettings = async (updated: SiteStatusSettings) => {
    setIsSavingSettings(true);
    setSettingsSuccess(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        const data = await res.json();
        setSiteSettings(data.settings);
        setClosureTitleInput(data.settings.title);
        setClosureMsgInput(data.settings.message);
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving site settings:', err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleToggleSiteClosure = async () => {
    await handleUpdateSiteSettings({
      isClosed: !siteSettings.isClosed,
      title: closureTitleInput,
      message: closureMsgInput,
    });
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
    setUploadError(null);
    setShowUrlFallback(false);
    setItemModalOpen(true);
  };

  // Open Edit Item Modal
  const openEditItemModal = (item: AdminItemSummary) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormPhotoUrl(item.photoUrl);
    setFormDescription(item.description || '');
    setFormActive(item.active);
    setUploadError(null);
    setShowUrlFallback(false);
    setItemModalOpen(true);
  };

  // Save Item (Add or Edit)
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Please enter an item name');
      return;
    }

    if (!formPhotoUrl.trim()) {
      setUploadError('Please choose or upload a photo for the item');
      return;
    }

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
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  placeholder="Enter administrator password"
                  className="w-full pl-10 pr-11 py-3 bg-[#123A66]/30 border border-[#123A66] focus:border-[#A9C8EE] rounded-[12px] text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-[#A9C8EE] transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A9C8EE]/70 hover:text-white transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
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

          <button
            type="button"
            onClick={() => setActiveTab('closure')}
            className={`py-2.5 px-4 text-xs font-medium border-b-2 transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === 'closure'
                ? 'border-[#B22026] text-white font-medium'
                : siteSettings.isClosed
                ? 'border-transparent text-[#B22026] hover:text-white font-medium'
                : 'border-transparent text-[#A9C8EE]/70 hover:text-white'
            }`}
          >
            <Power className={`w-3.5 h-3.5 ${siteSettings.isClosed ? 'text-[#B22026] animate-pulse' : 'text-[#A9C8EE]'}`} />
            <span>Event Status {siteSettings.isClosed ? '(CLOSED)' : ''}</span>
          </button>
        </div>
      </header>

      {/* Persistent Closed Alert Banner */}
      {siteSettings.isClosed && (
        <div className="bg-[#B22026]/20 border-b border-[#B22026]/60 px-4 py-2.5 text-xs text-white flex items-center justify-between max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B22026] animate-ping shrink-0" />
            <span>
              <strong>Website is currently CLOSED to the public.</strong> Visitors see your custom closure popup.
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggleSiteClosure}
            className="px-2.5 py-1 rounded bg-[#B22026] hover:bg-[#c9252c] text-white font-medium text-[11px] transition-colors"
          >
            Re-open Now
          </button>
        </div>
      )}

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
                  placeholder="Search item, participant name, or phone..."
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
                  {Array.from(
                    new Set([
                      ...CLASS_OPTIONS,
                      ...items.flatMap((i) => i.allSubmissions.map((s) => s.userClass).filter(Boolean)),
                    ])
                  )
                    .sort()
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>

                {/* PDF Sheet Report Button */}
                <button
                  type="button"
                  onClick={() => setReportModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#B22026] hover:bg-[#c9252c] text-white text-xs font-medium rounded-[10px] transition-colors duration-200 tap-active shadow-md shrink-0"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>PDF Sheet</span>
                </button>
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
                                <p className="text-[11px] text-gray-400 italic line-clamp-2">
                                  <span className="text-[#A9C8EE] not-italic font-medium">Info:</span> &ldquo;{item.lowestBidder.comment}&rdquo;
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
                This message will immediately appear as an interactive modal pop-up on all active users&apos; screens.
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
                    placeholder="e.g. We have received over 50 price quotes so far! If you found lower prices or store locations, feel free to update your items."
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

        {/* =============================================================== */}
        {/* TAB 4: EVENT CLOSURE & SITE STATUS */}
        {/* =============================================================== */}
        {activeTab === 'closure' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Status Control Card */}
            <div
              className={`rounded-[16px] p-6 border transition-all duration-200 ${
                siteSettings.isClosed
                  ? 'bg-[#B22026]/10 border-[#B22026] shadow-[0_0_30px_rgba(178,32,38,0.2)]'
                  : 'bg-[#0b1d33] border-[#123A66]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#123A66]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        siteSettings.isClosed ? 'bg-[#B22026] animate-pulse' : 'bg-green-400'
                      }`}
                    />
                    <h2 className="text-lg font-medium text-white">
                      Website Status: {siteSettings.isClosed ? 'CLOSED TO PUBLIC' : 'OPEN & ACCEPTING PRICES'}
                    </h2>
                  </div>
                  <p className="text-xs text-[#A9C8EE]">
                    {siteSettings.isClosed
                      ? 'The public website is currently blocked by your custom closure popup. Organizers can still access /admin.'
                      : 'The website is active. Participants can browse items, register, and submit prices.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleToggleSiteClosure}
                  disabled={isSavingSettings}
                  className={`px-6 py-3 rounded-[12px] font-medium text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-200 tap-active shrink-0 ${
                    siteSettings.isClosed
                      ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/40'
                      : 'bg-[#B22026] hover:bg-[#c9252c] text-white shadow-[0_4px_16px_rgba(178,32,38,0.4)]'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>{siteSettings.isClosed ? 'Re-open Website Now' : 'Close Website to Public'}</span>
                </button>
              </div>

              {/* Customizable Message Form */}
              <div className="pt-6 space-y-4">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <Edit className="w-4 h-4 text-[#A9C8EE]" />
                  <span>Customize the Closure Popup Message</span>
                </h3>
                <p className="text-xs text-[#A9C8EE]/80">
                  When the website is closed, visitors will see a full-screen pop-up with your custom message.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-200 mb-1">
                      Popup Headline / Title
                    </label>
                    <input
                      type="text"
                      value={closureTitleInput}
                      onChange={(e) => setClosureTitleInput(e.target.value)}
                      placeholder="e.g. Charity Day Has Concluded ❤️"
                      className="w-full px-3.5 py-2.5 bg-[#123A66]/30 border border-[#123A66] focus:border-[#A9C8EE] rounded-[12px] text-white text-xs placeholder-gray-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-200 mb-1">
                      Popup Message / Announcement Body
                    </label>
                    <textarea
                      rows={4}
                      value={closureMsgInput}
                      onChange={(e) => setClosureMsgInput(e.target.value)}
                      placeholder="e.g. Thank you for making their day! Price submissions are now officially closed. Results will be announced shortly."
                      className="w-full px-3.5 py-2.5 bg-[#123A66]/30 border border-[#123A66] focus:border-[#A9C8EE] rounded-[12px] text-white text-xs placeholder-gray-500 focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {settingsSuccess ? (
                      <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Settings saved & updated across all devices!</span>
                      </span>
                    ) : (
                      <div />
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateSiteSettings({
                          isClosed: siteSettings.isClosed,
                          title: closureTitleInput,
                          message: closureMsgInput,
                        })
                      }
                      disabled={isSavingSettings}
                      className="px-5 py-2.5 bg-[#123A66] hover:bg-[#18497d] border border-[#A9C8EE]/40 text-white text-xs font-medium rounded-[12px] transition-colors"
                    >
                      {isSavingSettings ? 'Saving...' : 'Save Message'}
                    </button>
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="pt-6 border-t border-[#123A66]/60">
                  <span className="text-xs uppercase tracking-wider text-[#A9C8EE] font-medium block mb-3">
                    Live Visitor Preview
                  </span>
                  <div className="p-6 bg-black border border-[#123A66] rounded-[16px] max-w-sm mx-auto text-center shadow-inner">
                    <div className="flex justify-center mb-3">
                      <Logo size="md" showText={false} />
                    </div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#B22026]/20 border border-[#B22026]/40 text-[10px] font-medium text-[#B22026] mb-2">
                      <Lock className="w-3 h-3" />
                      <span>Submissions Closed</span>
                    </div>
                    <h4 className="text-base font-medium text-white mb-2">
                      {closureTitleInput || 'Charity Day Has Concluded'}
                    </h4>
                    <p className="text-xs text-[#A9C8EE] leading-relaxed whitespace-pre-wrap">
                      {closureMsgInput || 'Thank you for your support! Price submissions are now closed.'}
                    </p>
                  </div>
                </div>
              </div>
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

              {/* Image Upload Section */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-gray-200">
                    Item Photo <span className="text-[#B22026]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUrlFallback(!showUrlFallback)}
                    className="text-[11px] text-[#A9C8EE] hover:underline"
                  >
                    {showUrlFallback ? '← Upload photo from device' : 'Or paste image link'}
                  </button>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {!showUrlFallback ? (
                  <div>
                    {formPhotoUrl ? (
                      /* Image Preview with Change / Remove controls */
                      <div className="relative border border-[#123A66] rounded-[12px] bg-[#071526] p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-16 h-16 rounded-[10px] overflow-hidden bg-black border border-[#123A66] shrink-0">
                            <img src={formPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-medium text-white block truncate">Photo selected</span>
                            <span className="text-[11px] text-green-400 flex items-center gap-1 mt-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Ready
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1.5 rounded-[8px] bg-[#123A66] hover:bg-[#18497d] text-white text-xs font-medium transition-colors"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormPhotoUrl('')}
                            className="p-1.5 rounded-[8px] hover:bg-[#B22026]/20 text-gray-400 hover:text-[#B22026] transition-colors"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Drag & Drop / Click Upload Box */
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="group cursor-pointer border-2 border-dashed border-[#123A66] hover:border-[#A9C8EE]/60 rounded-[12px] p-5 text-center bg-[#123A66]/15 hover:bg-[#123A66]/25 transition-all duration-200"
                      >
                        {isUploadingImage ? (
                          <div className="flex flex-col items-center justify-center py-2 space-y-2">
                            <Loader2 className="w-7 h-7 text-[#A9C8EE] animate-spin" />
                            <span className="text-xs text-[#A9C8EE]">Processing image...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-2 space-y-2">
                            <div className="w-12 h-12 rounded-full bg-[#123A66]/50 flex items-center justify-center text-[#A9C8EE] group-hover:scale-110 transition-transform duration-200">
                              <UploadCloud className="w-6 h-6" />
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-xs font-medium text-white block">
                                Click or tap to upload photo
                              </span>
                              <span className="text-[11px] text-[#A9C8EE]/70 block">
                                PNG, JPG, WEBP, HEIC from device (up to 10MB)
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {uploadError && (
                      <p className="flex items-center gap-1 text-[#B22026] text-xs mt-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {uploadError}
                      </p>
                    )}
                  </div>
                ) : (
                  /* URL Fallback Input */
                  <div>
                    <input
                      type="url"
                      value={formPhotoUrl}
                      onChange={(e) => setFormPhotoUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2.5 bg-[#123A66]/30 border border-[#123A66] focus:border-[#A9C8EE] rounded-[12px] text-white text-xs placeholder-gray-500 focus:outline-none"
                    />
                    {formPhotoUrl && (
                      <div className="mt-2 w-16 h-16 rounded-[10px] overflow-hidden border border-[#123A66] bg-black">
                        <img src={formPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
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

      {/* =============================================================== */}
      {/* MODAL: EXECUTIVE PDF REPORT SHEET */}
      {/* =============================================================== */}
      <AdminReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        items={items}
      />
    </div>
  );
}
