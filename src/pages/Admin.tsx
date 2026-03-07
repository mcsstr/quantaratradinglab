import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Activity, LayoutDashboard, Users, TrendingUp, BarChart2, Settings, LogOut,
    Bell, Search, Filter, UserPlus, Edit2, Trash2, Clock, DollarSign, X, AlertTriangle, Lock, Check, Eye, EyeOff
} from 'lucide-react';
import { supabase } from '../utils/supabase';

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
    const [addForm, setAddForm] = useState({
        firstName: '', lastName: '', email: '', password: '',
        phoneCode: '+1', phone: '', country: '', postalCode: '', howHeard: ''
    });

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            showToast(`Error deleting profile: ${err.message}`);
        }
    };

    // ---------- SUPABASE: Add New User ----------
    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAdding(true);
        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: addForm.email,
                password: addForm.password
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
                        postal_code: addForm.postalCode,
                        how_heard_about_us: addForm.howHeard,
                        plan: 'Free',
                        status: 'Active',
                        updated_at: new Date().toISOString()
                    });
                if (profileError) throw profileError;
            }

            showToast('User created successfully!');
            setIsAddModalOpen(false);
            setAddForm({ firstName: '', lastName: '', email: '', password: '', phoneCode: '+1', phone: '', country: '', postalCode: '', howHeard: '' });
            await fetchProfiles();
        } catch (err: any) {
            showToast(`Error creating user: ${err.message}`);
        } finally {
            setIsAdding(false);
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

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400">Phone</label>
                                        <div className="flex gap-2">
                                            <select value={addForm.phoneCode} onChange={e => setAddForm({ ...addForm, phoneCode: e.target.value })} className="w-[100px] bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors cursor-pointer appearance-none">
                                                {countryCodes.map(c => <option key={`${c.country}-${c.code}`} value={c.code}>{c.flag} {c.code}</option>)}
                                            </select>
                                            <input type="text" value={addForm.phone} onChange={e => setAddForm({ ...addForm, phone: e.target.value })} className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400">Postal Code</label>
                                        <input type="text" value={addForm.postalCode} onChange={e => setAddForm({ ...addForm, postalCode: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400">Country</label>
                                        <select value={addForm.country} onChange={e => setAddForm({ ...addForm, country: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors cursor-pointer">
                                            <option value="">Select a country</option>
                                            {countriesList.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400">How heard about us?</label>
                                        <select value={addForm.howHeard} onChange={e => setAddForm({ ...addForm, howHeard: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors cursor-pointer">
                                            <option value="">Select an option</option>
                                            <option value="Google">Google</option>
                                            <option value="Social Media">Social Media</option>
                                            <option value="Friend">Friend recommendation</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
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
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-black font-bold">
                            <Activity size={20} />
                        </div>
                        <h2 className="text-white text-lg font-black tracking-tighter uppercase font-display">Quantara</h2>
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
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/30">
                        <Users size={18} />
                        <span className="text-sm font-medium">User Management</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-yellow-500/10 hover:text-yellow-500 transition-colors">
                        <TrendingUp size={18} />
                        <span className="text-sm font-medium">Market Data</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-yellow-500/10 hover:text-yellow-500 transition-colors">
                        <BarChart2 size={18} />
                        <span className="text-sm font-medium">Analytics</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-yellow-500/10 hover:text-yellow-500 transition-colors">
                        <Settings size={18} />
                        <span className="text-sm font-medium">Settings</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-yellow-500/20">
                    <button onClick={() => navigate('/')} className="flex w-full items-center justify-center gap-2 px-4 py-2 rounded-xl border border-yellow-500/50 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all text-sm font-bold">
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
                <header className="py-4 border-b border-yellow-500/20 flex items-center justify-between px-4 lg:px-8 bg-[#000000]/50 backdrop-blur-md sticky top-0 z-40 header-safe">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-yellow-500 p-1">
                            <Activity size={24} />
                        </button>
                        <div className="hidden sm:flex items-center gap-2">
                            <span className="text-gray-400 text-sm">Admin</span>
                            <span className="text-gray-400 text-sm">/</span>
                            <span className="text-yellow-500 text-sm font-semibold">User Management</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={fetchProfiles} className="p-2 text-gray-400 hover:text-yellow-500 transition-colors" title="Refresh data">
                            <Activity size={20} className={isLoading ? 'animate-spin' : ''} />
                        </button>
                        <button className="hidden sm:block p-2 text-gray-400 hover:text-yellow-500 transition-colors">
                            <Bell size={20} />
                        </button>
                        <div className="h-8 w-8 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center overflow-hidden">
                            <UserPlus size={16} className="text-yellow-500" />
                        </div>
                    </div>
                </header>

                <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full">
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
            </main>
        </div>
    );
}
