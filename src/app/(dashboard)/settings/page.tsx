'use client'

import { updateBusinessProfile, createCompany, deleteCompany, updateCompany } from '@/app/settings/actions'
import { Header } from '@/components/Header'
import { useActionState, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Trash2, Plus, Building2, User, Edit2, Save } from 'lucide-react'

const initialState = {
    error: '',
    message: '',
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'profile' | 'companies'>('profile')
    const [profile, setProfile] = useState<any>(null)
    const [companies, setCompanies] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editingCompany, setEditingCompany] = useState<any>(null)

    // Actions
    // @ts-ignore
    const [profileState, profileAction, isProfilePending] = useActionState(updateBusinessProfile, initialState)
    // @ts-ignore
    const [companyState, companyAction, isCompanyPending] = useActionState(createCompany, initialState)
    // @ts-ignore
    const [updateState, updateAction, isUpdatePending] = useActionState(updateCompany, initialState)

    useEffect(() => {
        fetchData()
    }, [profileState, companyState, updateState]) // Refetch on updates

    const fetchData = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            if (profileData) setProfile(profileData)

            const { data: companiesData } = await supabase.from('companies').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
            if (companiesData) setCompanies(companiesData)
        }
        setLoading(false)
    }

    if (loading) return <div className="p-8">Loading settings...</div>

    return (
        <>
            <Header title="Business Settings" />
            <main className="flex-1 overflow-y-auto p-6 bg-slate-100">
                <div className="max-w-5xl mx-auto">

                    {/* Tabs */}
                    <div className="flex space-x-4 mb-6">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'profile' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                            <User className="w-4 h-4 mr-2" />
                            My Business Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('companies')}
                            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'companies' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Building2 className="w-4 h-4 mr-2" />
                            Saved Clients List
                        </button>
                    </div>

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <form action={profileAction} className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="p-6 space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium leading-6 text-slate-900">My Business Details</h3>
                                    <p className="mt-1 text-sm text-slate-500">Your company information appearing on invoices.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="form-label">Business Name</label>
                                        <input type="text" name="companyName" defaultValue={profile?.company_name || ''} className="form-input" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="form-label">TRN / Tax Number</label>
                                        <input type="text" name="trnNumber" defaultValue={profile?.trn_number || ''} className="form-input" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="form-label">Address</label>
                                        <textarea name="companyAddress" rows={2} defaultValue={profile?.company_address || ''} className="form-input" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="form-label">Email</label>
                                        <input type="email" name="businessEmail" defaultValue={profile?.business_email || ''} className="form-input" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="form-label">Phone</label>
                                        <input type="text" name="businessPhone" defaultValue={profile?.business_phone || ''} className="form-input" />
                                    </div>
                                </div>

                                <hr className="border-slate-200" />

                                <div>
                                    <h3 className="text-md font-medium leading-6 text-slate-900">My Bank Details</h3>
                                    <p className="mt-1 text-sm text-slate-500">Default bank details to show on invoice.</p>
                                </div>
                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="form-label">Bank Name</label>
                                        <input type="text" name="bankName" defaultValue={profile?.bank_name || ''} className="form-input" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="form-label">Account Name</label>
                                        <input type="text" name="accountName" defaultValue={profile?.account_name || ''} className="form-input" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="form-label">Account Number</label>
                                        <input type="text" name="accountNumber" defaultValue={profile?.account_number || ''} className="form-input" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="form-label">IBAN</label>
                                        <input type="text" name="iban" defaultValue={profile?.iban || ''} className="form-input" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="form-label">SWIFT Code</label>
                                        <input type="text" name="swiftCode" defaultValue={profile?.swift_code || ''} className="form-input" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="form-label">Branch</label>
                                        <input type="text" name="branch" defaultValue={profile?.branch || ''} className="form-input" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="form-label">Branch Address</label>
                                        <input type="text" name="branchAddress" defaultValue={profile?.branch_address || ''} className="form-input" />
                                    </div>
                                </div>
                            </div>
                            {profileState?.message && <div className="px-6 pb-2 text-green-600">{profileState.message}</div>}
                            {profileState?.error && <div className="px-6 pb-2 text-red-600">{profileState.error}</div>}
                            <div className="bg-slate-50 px-4 py-3 text-right sm:px-6">
                                <button type="submit" disabled={isProfilePending} className="btn-primary">
                                    {isProfilePending ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'companies' && (
                        <div className="space-y-6">
                            {/* Create / Edit Company Form */}
                            <div className="bg-white shadow rounded-lg overflow-hidden p-6 border-2 border-orange-50">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-slate-900">
                                        {editingCompany ? `Edit: ${editingCompany.name}` : 'Add New Client (Buyer / Consignee)'}
                                    </h3>
                                    {editingCompany && (
                                        <button
                                            onClick={() => setEditingCompany(null)}
                                            className="text-sm text-slate-500 hover:text-slate-700"
                                        >
                                            Cancel Editing
                                        </button>
                                    )}
                                </div>

                                <form action={editingCompany ? updateAction : companyAction}>
                                    {editingCompany && <input type="hidden" name="id" value={editingCompany.id} />}
                                    <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2 mb-4">
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Name</label>
                                            <input type="text" name="name" defaultValue={editingCompany?.name || ''} placeholder="Company Name *" required className="form-input" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Customer Name</label>
                                            <input type="text" name="customerName" defaultValue={editingCompany?.customer_name || ''} placeholder="Person Name" className="form-input" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">TRN</label>
                                            <input type="text" name="trn" defaultValue={editingCompany?.trn_number || ''} placeholder="TRN Number" className="form-input" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Email</label>
                                            <input type="text" name="email" defaultValue={editingCompany?.email || ''} placeholder="Email" className="form-input" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Mobile</label>
                                            <input type="text" name="mobile" defaultValue={editingCompany?.mobile || ''} placeholder="Mobile" className="form-input" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Address</label>
                                            <textarea name="address" defaultValue={editingCompany?.address || ''} placeholder="Address" rows={2} className="form-input" />
                                        </div>

                                        {/* Bank Details for Party */}
                                        <div className="col-span-2 pt-4 border-t mt-2">
                                            <h4 className="text-sm font-medium text-slate-700 mb-3">Bank Details (Optional)</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <input type="text" name="bankName" defaultValue={editingCompany?.bank_name || ''} placeholder="Bank Name" className="form-input" />
                                                <input type="text" name="accountName" defaultValue={editingCompany?.account_name || ''} placeholder="Account Name" className="form-input" />
                                                <input type="text" name="accountNumber" defaultValue={editingCompany?.account_number || ''} placeholder="Account Number" className="form-input" />
                                                <input type="text" name="iban" defaultValue={editingCompany?.iban || ''} placeholder="IBAN" className="form-input" />
                                                <input type="text" name="swiftCode" defaultValue={editingCompany?.swift_code || ''} placeholder="SWIFT" className="form-input" />
                                                <input type="text" name="branch" defaultValue={editingCompany?.branch || ''} placeholder="Branch" className="form-input" />
                                                <input type="text" name="branchAddress" defaultValue={editingCompany?.branch_address || ''} placeholder="Branch Address" className="form-input col-span-2" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button type="submit" disabled={isCompanyPending || isUpdatePending} className="btn-secondary">
                                            {editingCompany ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                            {editingCompany
                                                ? (isUpdatePending ? 'Updating...' : 'Save Changes')
                                                : (isCompanyPending ? 'Adding...' : 'Add Client')
                                            }
                                        </button>

                                        {editingCompany && (
                                            <button
                                                type="button"
                                                onClick={() => setEditingCompany(null)}
                                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>

                                    {(companyState?.message || updateState?.message) && (
                                        <div className="mt-2 text-green-600 text-sm">
                                            {companyState?.message || updateState?.message}
                                        </div>
                                    )}
                                    {(companyState?.error || updateState?.error) && (
                                        <div className="mt-2 text-red-600 text-sm">
                                            {companyState?.error || updateState?.error}
                                        </div>
                                    )}
                                </form>
                            </div>

                            {/* List Header */}
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-800">Saved Clients List</h3>
                                <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded-full border border-slate-200">
                                    {companies.length} Clients
                                </span>
                            </div>

                            {/* List of Companies */}
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {companies.map((company: any) => (
                                    <div key={company.id} className={`bg-white p-4 rounded-lg shadow border transition-all relative group ${editingCompany?.id === company.id ? 'border-orange-500 ring-2 ring-orange-100' : 'border-slate-200'}`}>
                                        <div className="absolute top-2 right-2 flex space-x-1">
                                            <button
                                                onClick={() => setEditingCompany(company)}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-md shadow-sm border border-slate-100"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Delete this party?')) {
                                                        deleteCompany(company.id).then(fetchData)
                                                    }
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-md shadow-sm border border-slate-100"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <h4 className="font-bold text-slate-800 pr-12 truncate">{company.name}</h4>
                                        {company.customer_name && (
                                            <p className="text-xs font-medium text-slate-600 truncate">{company.customer_name}</p>
                                        )}
                                        <p className="text-xs text-slate-500 mt-1 h-8 line-clamp-2">{company.address}</p>
                                        <div className="mt-3 flex flex-wrap gap-1">
                                            {company.trn_number && (
                                                <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">TRN: {company.trn_number}</span>
                                            )}
                                        </div>
                                        {company.bank_name && (
                                            <div className="mt-2 pt-2 border-t border-slate-100">
                                                <p className="text-[10px] text-slate-400 uppercase font-bold truncate">Bank: {company.bank_name}</p>
                                                <p className="text-[10px] text-slate-500 font-mono truncate">{company.iban}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {companies.length === 0 && (
                                    <div className="col-span-full text-center py-8 text-slate-500 italic bg-white rounded-lg border border-dashed border-slate-300">
                                        No saved parties yet. Add one above.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    )
}
