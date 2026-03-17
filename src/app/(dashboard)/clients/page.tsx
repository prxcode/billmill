import { createClient } from '@/utils/supabase/server'
import { Header } from '@/components/Header'
import { Building2, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function ClientsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let companies: any[] = []
    if (user) {
        const { data } = await supabase
            .from('companies')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        companies = data || []
    }

    return (
        <>
            <Header title="Clients & Business Partners" />
            <main className="flex-1 overflow-y-auto p-6 bg-slate-100">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Saved Business Partners</h2>
                            <p className="text-sm text-slate-500 mt-1">
                                {companies.length} partner(s) saved. Manage your buyers, sellers, and consignees in Business Settings.
                            </p>
                        </div>
                        <Link href="/settings" className="btn-primary flex items-center">
                            <Plus className="w-4 h-4 mr-2" />
                            Manage Partners
                        </Link>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {companies.map((company) => (
                            <div key={company.id} className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col h-full">
                                <div className="flex items-start mb-2">
                                    <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                                        <Building2 className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="ml-3 overflow-hidden">
                                        <h4 className="font-bold text-slate-800 truncate" title={company.name}>
                                            {company.name}
                                        </h4>
                                        {company.customer_name && (
                                            <p className="text-xs font-medium text-slate-600 truncate">{company.customer_name}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 mt-2">
                                    <p className="text-sm text-slate-500 line-clamp-2" title={company.address}>
                                        {company.address || 'No address provided'}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {company.trn_number && (
                                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono">
                                                TRN: {company.trn_number}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {(company.email || company.mobile) && (
                                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                                        {company.email && <div className="truncate mb-1">{company.email}</div>}
                                        {company.mobile && <div>{company.mobile}</div>}
                                    </div>
                                )}
                            </div>
                        ))}

                        {companies.length === 0 && (
                            <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-500 bg-white rounded-lg border border-dashed border-slate-300">
                                <Building2 className="w-12 h-12 text-slate-300 mb-4" />
                                <p className="text-lg font-medium text-slate-700">No Business Partners Found</p>
                                <p className="text-sm mt-1 mb-6">You haven't added any clients or partners yet.</p>
                                <Link href="/settings" className="btn-primary">
                                    Add Your First Partner
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    )
}
