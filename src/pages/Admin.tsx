import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Activity, LayoutDashboard, Users, TrendingUp, BarChart2, Settings, LogOut,
    Bell, Search, Filter, UserPlus, Edit2, Trash2, Clock, DollarSign, X, AlertTriangle,
    Lock, Check, Eye, EyeOff, Gift, Package
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { usePlanConfig } from '../hooks/usePlanConfig';
import './Dashboard.css';

const countryCodes = [
    { code: '+1', country: 'United States', flag: '🇺🇸' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+351', country: 'Portugal', flag: '🇵🇹' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+7', country: 'Russia', flag: '🇷🇺' },
    { code: '+27', country: 'South Africa', flag: '🇿🇦' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽' },
    { code: '+54', country: 'Argentina', flag: '🇦🇷' },
    { code: '+56', country: 'Chile', flag: '🇨🇱' },
    { code: '+57', country: 'Colombia', flag: '🇨🇴' },
    { code: '+51', country: 'Peru', flag: '🇵🇪' },
];

const countriesList = [...new Set(countryCodes.map(c => c.country))].sort();

export default function Admin() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [planFilter, setPlanFilter] = useState('All Plans');

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    // Delete Flow State
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<any>(null);
    const [adminPassword, setAdminPassword] = useState('');
    const [toastMessage, setToastMessage] = useState('');

    // Add User Flow State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [showAddPassword, setShowAddPassword] = useState(false);
    const [showAddConfirm, setShowAddConfirm] = useState(false);
    const [addForm, setAddForm] = useState({
        firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
        phoneCode: '+1', phone: '', country: ''
    });

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'users' | 'plans'>('users');

    // Plan config state
    const { plans: planConfigs, fetchPlans } = usePlanConfig();
    const [editingPlan, setEditingPlan] = useState<any>(null);
    const [savingPlan, setSavingPlan] = useState(false);

    // Admin override modal state
    const [overrideModal, setOverrideModal] = useState<{ show: boolean; user: any } | null>(null);
    const [overrideForm, setOverrideForm] = useState({ plan: 'Premium', durationValue: '7', durationUnit: 'days' });
    const [isGranting, setIsGranting] = useState(false);

    // Toast helper
    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 3000);
    };

    // ---------- SUPABASE: Fetch all profiles ----------
    const fetchProfiles = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mapped = (data || []).map(p => ({
                id: p.id,
                firstName: p.first_name || '',
                lastName: p.last_name || '',
                email: p.email || '',
                plan: p.plan || 'Free',
                status: p.status || 'Active',
                initials: ((p.first_name || '?')[0] + (p.last_name || '?')[0]).toUpperCase(),
                phoneCode: p.phone_code || '+1',
                phone: p.phone_number || '',
                country: p.country || '',
                stripeCustomerId: p.stripe_customer_id || '',
                stripeSubscriptionId: p.stripe_subscription_id || '',
                stripePriceId: p.stripe_price_id || '',
                planExpiresAt: p.plan_expires_at || '',
                billingInterval: p.billing_interval || 'monthly',
                trialEnd: p.trial_end || '',
                // Keep raw fields for updates
                _raw: p
            }));
            setUsers(mapped);
        } catch (err: any) {
            console.error('Error fetching profiles:', err);
            showToast(`Error loading profiles: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    // ---------- SUPABASE: Update profile ----------
    const handleUpdateProfile = async (user: any) => {
        try {
            // Atualiza public.profiles
            // Nota: Conforme a nova regra, o email não pode ser alterado no modal geral.
            // Para atualizar o e-mail, deve-se usar a Server Action / Vercel API específica.
            const { error } = await supabase
                .from('profiles')
                .update({
                    first_name: user.firstName,
                    last_name: user.lastName,
                    email: user.email,
                    plan: user.plan,
                    status: user.status,
                    phone_code: user.phoneCode,
                    phone_number: user.phone,
                    country: user.country,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;

            // Update local state
            setUsers(prev => prev.map(u => u.id === user.id ? { ...user, initials: (user.firstName[0] + (user.lastName[0] || '?')).toUpperCase() } : u));
            showToast('Profile updated successfully.');
        } catch (err: any) {
            console.error('Error updating profile:', err);
            showToast(`Error updating profile: ${err.message}`);
        }
    };

    // ---------- SUPABASE: Delete profile ----------
    const handleDeleteProfile = async (userId: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (error) throw error;
            setUsers(prev => prev.filter(u => u.id !== userId));
            showToast('User deleted successfully.');
        } catch (err: any) {
            console.error('Error deleting profile:', err);
            showToast(`Error deleting user: ${err.message}`);
        }
    };

    // ---------- SUPABASE: Add new user ----------
    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (addForm.password !== addForm.confirmPassword) {
            showToast('Passwords do not match');
            return;
        }

        setIsAdding(true);
        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: addForm.email,
                password: addForm.password,
            });

            if (authError) throw authError;

            if (authData?.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: authData.user.id,
                        first_name: addForm.firstName,
                        last_name: addForm.lastName,
                        email: addForm.email,
                        phone_code: addForm.phoneCode,
                        phone_number: addForm.phone,
                        country: addForm.country,
                        plan: 'Free',
                        status: 'Active',
                        updated_at: new Date().toISOString()
                    });

                if (profileError) throw profileError;
                showToast('User added successfully');
                setIsAddModalOpen(false);
                setAddForm({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phoneCode: '+1', phone: '', country: '' });
                fetchProfiles();
            }
        } catch (err: any) {
            console.error('Error adding user:', err);
            showToast(`Error adding user: ${err.message}`);
        } finally {
            setIsAdding(false);
        }
    };

    // ---------- SUPABASE: Suspend profile via Edge Function ----------
    const handleSuspendProfile = async (userId: string) => {
        if (!confirm('Tem a certeza que deseja suspender este usuário? Isso pode bloquear os serviços dele caso o plano não seja Free.')) return;
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const { data, error } = await supabase.functions.invoke('admin-suspend-user', {
                body: { targetUserId: userId },
                headers: {
                    Authorization: `Bearer ${session?.access_token}`
                }
            });

            if (error || data?.error) throw new Error(error?.message || data?.error || 'Failed to suspend');
            
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'Suspended' } : u));
            showToast('User suspended successfully.');
        } catch (err: any) {
            console.error('Error suspending profile:', err);
            showToast(`Error suspending user: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // ---------- SUPABASE: Reactivate profile ----------
    const handleReactivateProfile = async (userId: string) => {
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ status: 'Active', updated_at: new Date().toISOString() })
                .eq('id', userId);

            if (error) throw error;
            
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'Active' } : u));
            showToast('User reactivated successfully.');
        } catch (err: any) {
            console.error('Error reactivating profile:', err);
            showToast(`Error reactivating user: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // ---------- SUPABASE: Quick plan change ----------
    const handlePlanChange = async (id: string, newPlan: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ plan: newPlan, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            setUsers(prev => prev.map(u => u.id === id ? { ...u, plan: newPlan } : u));
        } catch (err: any) {
            showToast(`Error updating plan: ${err.message}`);
        }
    };

    // ---------- ADMIN: Grant temporary plan override ----------
    const handleGrantOverride = async () => {
        if (!overrideModal?.user) return;
        setIsGranting(true);
        try {
            const { data, error } = await supabase.functions.invoke('admin-override-plan', {
                body: {
                    targetUserId: overrideModal.user.id,
                    overridePlan: overrideForm.plan,
                    durationValue: parseInt(overrideForm.durationValue, 10),
                    durationUnit: overrideForm.durationUnit
                }
            });
            if (error) throw error;
            if (data?._isError) throw new Error(data.error);
            setUsers(prev => prev.map(u => u.id === overrideModal.user.id
                ? { ...u, plan: overrideForm.plan, status: 'Active' } : u));
            showToast(`Successfully granted ${overrideForm.plan} for ${overrideForm.durationValue} ${overrideForm.durationUnit}!`);
            setOverrideModal(null);
        } catch (err: any) {
            showToast(`Error granting override: ${err.message}`);
        } finally {
            setIsGranting(false);
        }
    };

    // ---------- ADMIN: Save plan config ----------
    const handleSavePlanConfig = async () => {
        if (!editingPlan) return;
        setSavingPlan(true);
        try {
            const { error } = await supabase
                .from('plans_config')
                .update({
                    name: editingPlan.name,
                    price_monthly: parseFloat(editingPlan.price_monthly),
                    price_yearly: parseFloat(editingPlan.price_yearly),
                    stripe_price_monthly: editingPlan.stripe_price_monthly,
                    stripe_price_yearly: editingPlan.stripe_price_yearly,
                    trial_days: parseInt(editingPlan.trial_duration_value ?? editingPlan.trial_days, 10),
                    trial_duration_value: parseInt(editingPlan.trial_duration_value ?? editingPlan.trial_days, 10),
                    trial_duration_unit: editingPlan.trial_duration_unit || 'days',
                    features: typeof editingPlan.features === 'string'
                        ? editingPlan.features.split('\n').map((f: string) => f.trim()).filter(Boolean)
                        : editingPlan.features,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editingPlan.id);
            if (error) throw new Error(error.message + (error.code === '42501' ? ' (RLS: make sure you are logged in as admin)' : ''));
            showToast(`Plan "${editingPlan.name}" saved!`);
            setEditingPlan(null);
            fetchPlans();
        } catch (err: any) {
            showToast(`Error saving plan: ${err.message}`);
        } finally {
            setSavingPlan(false);
        }
    };

    // ---------- UI Handlers ----------
    const openEditModal = (user: any) => {
        setEditingUser({ ...user });
        setIsEditModalOpen(true);
    };

    const saveEdit = async () => {
        await handleUpdateProfile(editingUser);
        setIsEditModalOpen(false);
    };

    const initiateDelete = (user: any) => {
        setUserToDelete(user);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDeleteStep1 = () => {
        setIsDeleteConfirmOpen(false);
        setIsPasswordModalOpen(true);
    };

    const confirmDeleteFinal = async () => {
        if (adminPassword === 'admin123') {
            await handleDeleteProfile(userToDelete.id);
            setIsPasswordModalOpen(false);
            setAdminPassword('');
            setUserToDelete(null);
        } else {
            showToast('Incorrect password!');
        }
    };

    const filteredUsers = users.filter(u => {
        const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlan = planFilter === 'All Plans' || u.plan === planFilter;
        return matchesSearch && matchesPlan;
    });

    const totalActive = users.filter(u => u.status === 'Active').length;
    const totalPremium = users.filter(u => u.plan === 'Premium').length;

    return (
        <div className="min-h-screen bg-[#000000] text-white font-sans flex relative">

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-green-500 text-black px-6 py-3 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.3)] font-bold flex items-center gap-2 animate-tab-enter">
                    <Check size={18} /> {toastMessage}
                </div>
            )}

            {/* LOGOUT CONFIRM MODAL */}
            {isLogoutConfirmOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#111114] border border-yellow-500/30 rounded-2xl w-full max-w-sm shadow-2xl p-8 text-center">
                        <div className="w-14 h-14 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/20">
                            <LogOut size={24} className="text-yellow-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Leave Admin?</h3>
                        <p className="text-sm text-gray-400 mb-6">Did you save your changes? Are you sure you want to exit?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setIsLogoutConfirmOpen(false)} className="flex-1 py-3 rounded-lg font-bold text-gray-400 bg-white/5 hover:bg-white/10 transition-colors">Cancel</button>
                            <button onClick={() => { setIsLogoutConfirmOpen(false); navigate('/dashboard'); }} className="flex-1 py-3 rounded-lg font-bold bg-yellow-500 text-black hover:bg-yellow-400 transition-colors">Yes, Exit</button>
                        </div>
                    </div>
                </div>
            )}

            {/* OVERRIDE PLAN MODAL */}
            {overrideModal?.show && overrideModal.user && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#111114] border border-yellow-500/30 rounded-2xl w-full max-w-md shadow-2xl flex flex-col p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20">
                                <Gift size={20} className="text-yellow-500" />
                            </div>
                            <h3 className="text-xl font-bold font-display">Override Plan</h3>
                        </div>
                        <p className="text-sm text-gray-400 mb-6">
                            Change the plan for <strong>{overrideModal.user.firstName} {overrideModal.user.lastName}</strong> and set an exact duration. If they are on a paid plan, their Stripe billing will be paused automatically.
                        </p>
                        
                        <div className="space-y-4 mb-8">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400">Target Plan</label>
                                <select 
                                    value={overrideForm.plan} 
                                    onChange={e => setOverrideForm({ ...overrideForm, plan: e.target.value })} 
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500"
                                >
                                    <option value="Free">Free</option>
                                    <option value="Basic">Basic</option>
                                    <option value="Premium">Premium</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 block mb-1">Duration</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="number" 
                                        value={overrideForm.durationValue} 
                                        onChange={e => setOverrideForm({ ...overrideForm, durationValue: e.target.value })} 
                                        className="w-2/3 bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500" 
                                    />
                                    <select 
                                        value={overrideForm.durationUnit} 
                                        onChange={e => setOverrideForm({ ...overrideForm, durationUnit: e.target.value })} 
                                        className="w-1/3 bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 text-white"
                                    >
                                        <option value="minutes">Minutes</option>
                                        <option value="hours">Hours</option>
                                        <option value="days">Days</option>
                                        <option value="months">Months</option>
                                        <option value="years">Years</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex w-full gap-3">
                            <button onClick={() => setOverrideModal(null)} className="flex-1 py-3 rounded-lg font-bold text-gray-400 bg-white/5 hover:bg-white/10 transition-colors">Cancel</button>
                            <button disabled={isGranting} onClick={handleGrantOverride} className="flex-1 py-3 rounded-lg font-bold bg-yellow-500 text-black hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.2)] disabled:opacity-50">
                                {isGranting ? 'Processing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD USER MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#111114] border border-yellow-500/30 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-white/10">
                            <h3 className="text-xl font-bold flex items-center gap-2 font-display">
                                <UserPlus size={20} className="text-yellow-500" /> Add New User
                            </h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleAddUser} className="flex flex-col overflow-hidden">
                            <div className="p-6 overflow-y-auto space-y-4 flex-1">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400">First Name</label>
                                        <input type="text" required value={addForm.firstName} onChange={e => setAddForm({ ...addForm, firstName: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400">Last Name</label>
                                        <input type="text" required value={addForm.lastName} onChange={e => setAddForm({ ...addForm, lastName: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400">Email</label>
                                        <input type="email" required value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400">Password</label>
                                        <div className="relative">
                                            <input type={showAddPassword ? "text" : "password"} required value={addForm.password} onChange={e => setAddForm({ ...addForm, password: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors pr-10" />
                                            <button type="button" onClick={() => setShowAddPassword(!showAddPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                                                {showAddPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400">Confirm Password</label>
                                    <div className="relative">
                                        <input type={showAddConfirm ? "text" : "password"} required value={addForm.confirmPassword} onChange={e => setAddForm({ ...addForm, confirmPassword: e.target.value })} placeholder="Repeat password" className={`w-full bg-black/40 border rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors pr-10 ${addForm.confirmPassword && addForm.password !== addForm.confirmPassword ? 'border-red-500' : 'border-white/10'}`} />
                                        <button type="button" onClick={() => setShowAddConfirm(!showAddConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                                            {showAddConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {addForm.confirmPassword && addForm.password !== addForm.confirmPassword && (
                                        <p className="text-[10px] text-red-400">Passwords do not match</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400">Phone</label>
                                    <div className="flex gap-2">
                                        <select value={addForm.phoneCode} onChange={e => setAddForm({ ...addForm, phoneCode: e.target.value })} className="w-[120px] bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors cursor-pointer appearance-none">
                                            {countryCodes.map(c => <option key={`${c.country}-${c.code}`} value={c.code}>{c.flag} {c.code}</option>)}
                                        </select>
                                        <input type="text" placeholder="Phone without country code" value={addForm.phone} onChange={e => setAddForm({ ...addForm, phone: e.target.value })} className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400">Country</label>
                                    <select value={addForm.country} onChange={e => setAddForm({ ...addForm, country: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors cursor-pointer">
                                        <option value="">Select a country</option>
                                        {countriesList.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 rounded-lg font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                                <button type="submit" disabled={isAdding} className="px-6 py-2.5 rounded-lg font-bold bg-yellow-500 text-black hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.2)] disabled:opacity-50">
                                    {isAdding ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {isEditModalOpen && editingUser && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#111114] border border-yellow-500/30 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-white/10">
                            <h3 className="text-xl font-bold flex items-center gap-2 font-display">
                                <Edit2 size={20} className="text-yellow-500" /> Edit Profile
                            </h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400">First Name</label>
                                    <input type="text" value={editingUser.firstName} onChange={e => setEditingUser({ ...editingUser, firstName: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400">Last Name</label>
                                    <input type="text" value={editingUser.lastName} onChange={e => setEditingUser({ ...editingUser, lastName: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400">Email Address</label>
                                <input type="email" disabled value={editingUser.email} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-gray-400 cursor-not-allowed outline-none focus:border-yellow-500 transition-colors" />
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400">Phone</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={editingUser.phoneCode}
                                            onChange={e => setEditingUser({ ...editingUser, phoneCode: e.target.value })}
                                            className="w-[120px] bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors cursor-pointer appearance-none"
                                        >
                                            {countryCodes.map(c => (
                                                <option key={`${c.country}-${c.code}`} value={c.code}>{c.flag} {c.code}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            value={editingUser.phone}
                                            onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                                            className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400">Country</label>
                                    <select
                                        value={editingUser.country}
                                        onChange={e => setEditingUser({ ...editingUser, country: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors cursor-pointer"
                                    >
                                        <option value="">Select a country</option>
                                        {countriesList.map(country => (
                                            <option key={country} value={country}>{country}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400">Plan</label>
                                    <select value={editingUser.plan} onChange={e => setEditingUser({ ...editingUser, plan: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors cursor-pointer">
                                        <option value="Free">Free</option>
                                        <option value="Basic">Basic</option>
                                        <option value="Premium">Premium</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400">Status</label>
                                    <select disabled value={editingUser.status} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-gray-400 cursor-not-allowed outline-none focus:border-yellow-500 transition-colors">
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Suspended">Suspended</option>
                                    </select>
                                    <p className="text-[10px] text-gray-500">Status gerido automaticamente p/ pagamentos</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                            <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-2.5 rounded-lg font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                            <button onClick={saveEdit} className="px-6 py-2.5 rounded-lg font-bold bg-yellow-500 text-black hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.2)]">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {isDeleteConfirmOpen && userToDelete && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#111114] border border-red-500/30 rounded-2xl w-full max-w-md shadow-2xl flex flex-col items-center text-center p-8">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                            <AlertTriangle size={32} className="text-red-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 font-display">Delete User?</h3>
                        <p className="text-gray-400 mb-8">
                            Are you sure you want to permanently delete <strong>{userToDelete.firstName} {userToDelete.lastName}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex w-full gap-3">
                            <button onClick={() => setIsDeleteConfirmOpen(false)} className="flex-1 py-3 rounded-lg font-bold text-gray-400 bg-white/5 hover:bg-white/10 transition-colors">Cancel</button>
                            <button onClick={confirmDeleteStep1} className="flex-1 py-3 rounded-lg font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]">Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* PASSWORD CONFIRMATION MODAL */}
            {isPasswordModalOpen && userToDelete && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#111114] border border-yellow-500/30 rounded-2xl w-full max-w-md shadow-2xl flex flex-col p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20">
                                <Lock size={20} className="text-yellow-500" />
                            </div>
                            <h3 className="text-xl font-bold font-display">Admin Verification</h3>
                        </div>
                        <p className="text-sm text-gray-400 mb-6">
                            Please enter your administrator password to confirm the deletion of <strong>{userToDelete.firstName} {userToDelete.lastName}</strong>.
                            <br /><span className="text-xs text-yellow-500 mt-1 block">(Hint: use "admin123" for this demo)</span>
                        </p>
                        <div className="space-y-2 mb-8">
                            <input
                                type="password"
                                placeholder="Enter admin password"
                                value={adminPassword}
                                onChange={e => setAdminPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors"
                            />
                        </div>
                        <div className="flex w-full gap-3">
                            <button onClick={() => { setIsPasswordModalOpen(false); setAdminPassword(''); }} className="flex-1 py-3 rounded-lg font-bold text-gray-400 bg-white/5 hover:bg-white/10 transition-colors">Cancel</button>
                            <button onClick={confirmDeleteFinal} className="flex-1 py-3 rounded-lg font-bold bg-yellow-500 text-black hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.2)]">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-[150] w-64 border-r border-yellow-500/20 flex flex-col bg-[#000000] transition-transform duration-300 lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <img src="/logo.png" alt="Quantara Logo" className="w-8 h-8 lg:w-9 lg:h-9 object-contain drop-shadow-md z-10 rounded-xl" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                        <div style={{ display: 'none' }} className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-black font-bold">
                            <Activity size={20} />
                        </div>
                        <h2 className="text-white text-lg font-black tracking-tighter font-display">Quantara</h2>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-gray-400">
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-yellow-500/10 hover:text-yellow-500 transition-colors">
                        <LayoutDashboard size={18} />
                        <span className="text-sm font-medium">Dashboard</span>
                    </button>
                    <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeTab === 'users' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' : 'text-gray-400 hover:bg-yellow-500/10 hover:text-yellow-500'}`}>
                        <Users size={18} />
                        <span className="text-sm font-medium">User Management</span>
                    </button>
                    <button onClick={() => setActiveTab('plans')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeTab === 'plans' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' : 'text-gray-400 hover:bg-yellow-500/10 hover:text-yellow-500'}`}>
                        <Package size={18} />
                        <span className="text-sm font-medium">Plan Settings</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-yellow-500/20">
                    <button onClick={() => setIsLogoutConfirmOpen(true)} className="flex w-full items-center justify-center gap-2 px-4 py-2 rounded-xl border border-yellow-500/50 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all text-sm font-bold">
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Backdrop for Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/60 z-[140] lg:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="fixed top-0 left-0 w-full z-50 flex items-end lg:items-center justify-between px-4 lg:px-8 shadow-sm transition-all border-b border-yellow-500/20 bg-[#000000]/50 backdrop-blur-md"
                  style={{
                    transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)',
                    height: 'calc(var(--header-height-mob, 90px) + env(safe-area-inset-top, 0px))',
                    paddingTop: 'env(safe-area-inset-top, 0px)',
                    paddingBottom: '0.75rem' // to match Dashboard.tsx Mobile padding
                  }}
                >
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-1 active:opacity-70 transition-opacity">
                            <img src="/logo.png" alt="Quantara Logo" className="w-8 h-8 object-contain drop-shadow-md z-10 rounded-xl" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                            <div style={{ display: 'none' }} className="text-yellow-500">
                                <Activity size={24} />
                            </div>
                        </button>
                        <div className="hidden sm:flex items-center gap-2">
                            <span className="text-gray-400 text-sm">Admin</span>
                            <span className="text-gray-400 text-sm">/</span>
                            <span className="text-yellow-500 text-sm font-semibold">User Management</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-sm font-bold transition-opacity hover:opacity-70" style={{ color: '#00B0F0' }}>
                            <Bell size={16} /> <span className="hidden sm:inline">Back to Dashboard</span>
                        </button>
                        <button onClick={fetchProfiles} className="p-2 text-gray-400 hover:text-yellow-500 transition-colors" title="Refresh data">
                            <Activity size={20} className={isLoading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </header>

                <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full mt-[100px] lg:mt-[110px]">
                    
                    {/* Mobile Tabs */}
                    <div className="lg:hidden flex overflow-x-auto gap-2 mb-6 pb-2 hide-scrollbar">
                        <button onClick={() => setActiveTab('users')} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'users' ? 'bg-yellow-500 text-black' : 'text-gray-400 border border-white/10 bg-[#111114]'}`}>
                            Usuários
                        </button>
                        <button onClick={() => setActiveTab('plans')} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'plans' ? 'bg-yellow-500 text-black' : 'text-gray-400 border border-white/10 bg-[#111114]'}`}>
                            Planos
                        </button>
                    </div>
                    {activeTab === 'users' && (
                        <>
                            {/* Title & Add Button */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 text-left">
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight uppercase italic font-display">User Account Administration</h1>
                            <p className="text-xs sm:text-sm text-gray-400 mt-1">Manage and monitor your trading platform users. <span className="text-yellow-500 font-bold">({users.length} profiles loaded)</span></p>
                        </div>
                        <button onClick={() => setIsAddModalOpen(true)} className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-black uppercase text-sm flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                            <UserPlus size={18} />
                            Add New User
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:grid sm:grid-cols-4 gap-3 mb-6">
                        <div className="sm:col-span-3 relative">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                className="w-full bg-transparent border border-yellow-500/30 rounded-xl py-2.5 pl-11 pr-4 focus:outline-none focus:border-yellow-500 text-sm text-white placeholder:text-gray-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                className="w-full bg-[#09090b] border border-yellow-500/30 rounded-xl py-2.5 pl-11 pr-4 focus:outline-none focus:border-yellow-500 text-sm text-white appearance-none cursor-pointer"
                                value={planFilter}
                                onChange={(e) => setPlanFilter(e.target.value)}
                            >
                                <option value="All Plans">All Plans</option>
                                <option value="Free">Free</option>
                                <option value="Basic">Basic</option>
                                <option value="Premium">Premium</option>
                            </select>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-20">
                            <Activity size={32} className="animate-spin text-yellow-500" />
                            <span className="ml-3 text-gray-400 text-lg">Loading profiles from Supabase...</span>
                        </div>
                    )}

                    {/* Table */}
                    {!isLoading && (
                        <div className="bg-[#09090b] border border-yellow-500/20 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse whitespace-nowrap">
                                    <thead>
                                        <tr className="bg-yellow-500/5 border-b border-yellow-500/20">
                                            <th className="px-4 lg:px-6 py-4 text-[10px] font-black uppercase tracking-widest text-yellow-500/70">Name</th>
                                            <th className="hidden md:table-cell px-6 py-4 text-[10px] font-black uppercase tracking-widest text-yellow-500/70">Email</th>
                                            <th className="hidden sm:table-cell px-6 py-4 text-[10px] font-black uppercase tracking-widest text-yellow-500/70">Plan</th>
                                            <th className="px-4 lg:px-6 py-4 text-[10px] font-black uppercase tracking-widest text-yellow-500/70">Status</th>
                                            <th className="px-4 lg:px-6 py-4 text-[10px] font-black uppercase tracking-widest text-yellow-500/70 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-yellow-500/10">
                                        {filteredUsers.map(user => (
                                            <tr key={user.id} className="hover:bg-yellow-500/5 transition-colors">
                                                <td className="px-4 lg:px-6 py-4">
                                                    <div className="flex items-center gap-2 lg:gap-3">
                                                        <div className={`h-8 w-8 lg:h-10 lg:w-10 rounded-full border flex items-center justify-center font-bold text-xs lg:text-sm
                                                        ${user.status === 'Active' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                                                                user.status === 'Suspended' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                                                    'bg-gray-800 border-gray-700 text-gray-400'}`}>
                                                            {user.initials}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-white text-sm whitespace-nowrap">{user.firstName} {user.lastName}</span>
                                                            <span className="md:hidden text-[10px] text-gray-500 truncate max-w-[120px]">{user.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="hidden md:table-cell px-6 py-4 text-gray-400 text-sm">{user.email}</td>
                                                <td className="hidden sm:table-cell px-6 py-4 font-bold text-gray-300 text-sm">
                                                    {user.plan}
                                                </td>
                                                <td className="px-4 lg:px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 lg:px-3 py-0.5 lg:py-1 rounded-full text-[9px] lg:text-xs font-bold border
                                                    ${user.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                            user.status === 'Suspended' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                                'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                                                        <span className={`w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' : user.status === 'Suspended' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => { setOverrideModal({ show: true, user }); setOverrideForm({ plan: 'Premium', durationValue: '7', durationUnit: 'days' }); }}
                                                            title="Grant Free Upgrade"
                                                            className="p-2 text-gray-400 hover:text-yellow-500 transition-colors border border-transparent hover:border-yellow-500/30 rounded-lg"
                                                        >
                                                            <Gift size={18} />
                                                        </button>
                                                        <button onClick={() => openEditModal(user)} className="p-2 text-gray-400 hover:text-yellow-500 transition-colors border border-transparent hover:border-yellow-500/30 rounded-lg">
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button onClick={() => initiateDelete(user)} className="p-2 text-gray-400 hover:text-red-500 transition-colors border border-transparent hover:border-red-500/30 rounded-lg">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredUsers.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 border-t border-yellow-500/20 flex items-center justify-between bg-black/40">
                                <span className="text-xs font-medium text-gray-500 uppercase">Showing {filteredUsers.length} of {users.length} users</span>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1 border border-yellow-500/20 rounded-lg text-gray-400 hover:text-yellow-500 transition-colors text-xs font-bold">Previous</button>
                                    <button className="px-3 py-1 bg-yellow-500 text-black rounded-lg text-xs font-black">1</button>
                                    <button className="px-3 py-1 border border-yellow-500/20 rounded-lg text-gray-400 hover:text-yellow-500 transition-colors text-xs font-bold">Next</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mt-8 lg:mt-12">
                        <div className="p-6 bg-[#09090b] border border-yellow-500/20 rounded-2xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">Total Profiles</p>
                                <h3 className="text-3xl font-black text-white">{users.length}</h3>
                                <div className="mt-4 flex items-center gap-2 text-green-500 text-sm font-bold">
                                    <TrendingUp size={16} />
                                    {totalActive} active
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <Users size={120} className="text-yellow-500" />
                            </div>
                        </div>

                        <div className="p-6 bg-[#09090b] border border-yellow-500/20 rounded-2xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">Premium Users</p>
                                <h3 className="text-3xl font-black text-white">{totalPremium}</h3>
                                <div className="mt-4 flex items-center gap-2 text-yellow-500 text-sm font-bold">
                                    <Clock size={16} />
                                    {users.length > 0 ? Math.round((totalPremium / users.length) * 100) : 0}% of total
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <Activity size={120} className="text-yellow-500" />
                            </div>
                        </div>

                        <div className="p-6 bg-[#09090b] border border-yellow-500/20 rounded-2xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">Data Source</p>
                                <h3 className="text-3xl font-black text-white">Supabase</h3>
                                <div className="mt-4 flex items-center gap-2 text-gray-400 text-sm font-bold">
                                    <BarChart2 size={16} />
                                    Table: profiles
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <DollarSign size={120} className="text-yellow-500" />
                            </div>
                        </div>
                    </div>
                    </>
                )}

                {/* Footer */}
                    <footer className="mt-12 p-8 border-t border-yellow-500/10 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-xs font-medium">
                        <p>© 2024 QUANTARA TRADING LAB. INTERNAL SYSTEM ACCESS ONLY.</p>
                        <div className="flex gap-6 uppercase tracking-widest">
                            <a href="#" className="hover:text-yellow-500 transition-colors">Security Policy</a>
                            <a href="#" className="hover:text-yellow-500 transition-colors">System Logs</a>
                            <a href="#" className="hover:text-yellow-500 transition-colors">API Status</a>
                        </div>
                    </footer>
                </div>

                {/* PLAN SETTINGS TAB */}
                {activeTab === 'plans' && (
                    <div className="p-4 lg:p-8 max-w-4xl mx-auto w-full">
                        <div className="mb-8">
                            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight uppercase italic font-display">Plan Settings</h1>
                            <p className="text-sm text-gray-400 mt-1">Edit plan names, prices, features, and trial durations. Changes reflect immediately on the Pricing page.</p>
                        </div>
                        <div className="grid gap-6">
                            {planConfigs.map(plan => (
                                <div key={plan.id} className="bg-[#09090b] border border-yellow-500/20 rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                                                plan.id === 'premium' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' :
                                                plan.id === 'basic' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                                                'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                                            }`}>{plan.id}</span>
                                            <h3 className="font-black text-white">{plan.name}</h3>
                                        </div>
                                        <button
                                            onClick={() => setEditingPlan({ ...plan, features: Array.isArray(plan.features) ? (plan.features as string[]).join('\n') : plan.features })}
                                            className="p-2 text-gray-400 hover:text-yellow-500 border border-white/10 hover:border-yellow-500/30 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div><p className="text-gray-500 text-xs mb-1">Monthly Price</p><p className="font-bold text-white">${plan.price_monthly}/mo</p></div>
                                        <div><p className="text-gray-500 text-xs mb-1">Yearly Price</p><p className="font-bold text-white">${plan.price_yearly}/yr</p></div>
                                        <div><p className="text-gray-500 text-xs mb-1">Trial</p><p className="font-bold text-white">{plan.trial_duration_value || plan.trial_days} {plan.trial_duration_unit || 'days'}</p></div>
                                        <div><p className="text-gray-500 text-xs mb-1">Storage</p><p className="font-bold text-white">{plan.id === 'premium' ? '☁ Cloud' : '💾 Local'}</p></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Edit Plan Modal */}
                        {editingPlan && (
                            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                                <div className="bg-[#111114] border border-yellow-500/30 rounded-2xl w-full max-w-lg shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-black">Edit Plan: <span className="text-yellow-500">{editingPlan.name}</span></h3>
                                        <button onClick={() => setEditingPlan(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 block mb-1">Display Name</label>
                                            <input value={editingPlan.name} onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 block mb-1">Monthly Price ($)</label>
                                                <input type="number" value={editingPlan.price_monthly} onChange={e => setEditingPlan({ ...editingPlan, price_monthly: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 block mb-1">Yearly Price ($)</label>
                                                <input type="number" value={editingPlan.price_yearly} onChange={e => setEditingPlan({ ...editingPlan, price_yearly: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500" />
                                            </div>
                                        </div>
                                        {editingPlan.id === 'free' && (
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 block mb-1">Trial Duration</label>
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="number" 
                                                        value={editingPlan.trial_duration_value ?? editingPlan.trial_days} 
                                                        onChange={e => setEditingPlan({ ...editingPlan, trial_duration_value: e.target.value })} 
                                                        className="w-2/3 bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500" 
                                                    />
                                                    <select 
                                                        value={editingPlan.trial_duration_unit || 'days'} 
                                                        onChange={e => setEditingPlan({ ...editingPlan, trial_duration_unit: e.target.value })} 
                                                        className="w-1/3 bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 text-white"
                                                    >
                                                        <option value="minutes">Minutes</option>
                                                        <option value="hours">Hours</option>
                                                        <option value="days">Days</option>
                                                        <option value="months">Months</option>
                                                        <option value="years">Years</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                        {editingPlan.id !== 'free' && (
                                            <div className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 block mb-1">Stripe Price ID (Monthly)</label>
                                                    <input value={editingPlan.stripe_price_monthly || ''} onChange={e => setEditingPlan({ ...editingPlan, stripe_price_monthly: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm font-mono outline-none focus:border-yellow-500" />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 block mb-1">Stripe Price ID (Yearly)</label>
                                                    <input value={editingPlan.stripe_price_yearly || ''} onChange={e => setEditingPlan({ ...editingPlan, stripe_price_yearly: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm font-mono outline-none focus:border-yellow-500" />
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 block mb-1">Features (one per line)</label>
                                            <textarea rows={5} value={typeof editingPlan.features === 'string' ? editingPlan.features : (editingPlan.features as string[]).join('\n')} onChange={e => setEditingPlan({ ...editingPlan, features: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 resize-none" />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button onClick={() => setEditingPlan(null)} className="flex-1 py-3 rounded-lg font-bold text-gray-400 bg-white/5 hover:bg-white/10 transition-colors">Cancel</button>
                                        <button onClick={handleSavePlanConfig} disabled={savingPlan} className="flex-1 py-3 rounded-lg font-black bg-yellow-500 text-black hover:bg-yellow-400 transition-colors disabled:opacity-50">{savingPlan ? 'Saving...' : 'Save Changes'}</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
