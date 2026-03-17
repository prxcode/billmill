'use client'

import { useEffect, useState, useTransition } from 'react'
import { Header } from '@/components/Header'
import Link from 'next/link'
import { Plus, Trash2, CheckCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { deleteInvoice, markInvoicePaid } from '@/app/invoices/actions'

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isPending, startTransition] = useTransition()

    const fetchInvoices = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase
            .from('invoices')
            .select('*, clients(name)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        setInvoices(data || [])
        setLoading(false)
    }

    useEffect(() => {
        fetchInvoices()
    }, [])

    const handleDelete = (id: string, invoiceNumber: string) => {
        if (!confirm(`Delete invoice ${invoiceNumber}? This cannot be undone.`)) return
        startTransition(async () => {
            const result = await deleteInvoice(id)
            if (result?.error) {
                alert(result.error)
            } else {
                setInvoices(prev => prev.filter(inv => inv.id !== id))
            }
        })
    }

    const handleMarkPaid = (id: string, invoiceNumber: string) => {
        if (!confirm(`Mark invoice ${invoiceNumber} as fully received?`)) return
        startTransition(async () => {
            const result = await markInvoicePaid(id)
            if (result?.error) {
                alert(result.error)
            } else {
                // Optimistically update UI
                setInvoices(prev => prev.map(inv =>
                    inv.id === id ? { ...inv, status: 'paid' } : inv
                ))
            }
        })
    }

    return (
        <>
            <Header title="Invoices" />
            <main className="flex-1 overflow-y-auto p-6 bg-slate-100">

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-slate-800">All Invoices</h2>
                    <Link
                        href="/invoices/new"
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-600 transition-colors"
                    >
                        <Plus className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                        New Invoice
                    </Link>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    {loading ? (
                        <div className="text-center py-12 text-slate-500 text-sm">Loading invoices...</div>
                    ) : invoices && invoices.length > 0 ? (
                        <ul className="divide-y divide-slate-200">
                            {invoices.map((invoice: any) => (
                                <li key={invoice.id} className="relative group">
                                    <Link href={`/invoices/${invoice.id}`} className="block hover:bg-slate-50 transition-colors">
                                        <div className="py-4 pl-4 pr-24 sm:py-5 sm:pl-6 sm:pr-28">
                                            <div className="flex items-center justify-between">
                                                <p className="truncate text-sm font-medium text-blue-600 font-mono">{invoice.invoice_number}</p>
                                                <div className="ml-2 flex flex-shrink-0 items-center gap-3">
                                                    <p className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                        invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-slate-100 text-slate-800'
                                                        }`}>
                                                        {invoice.status}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-2 sm:flex sm:justify-between">
                                                <div className="sm:flex">
                                                    <p className="flex items-center text-sm text-slate-500">
                                                        {invoice.clients?.name || 'Unknown Client'}
                                                    </p>
                                                </div>
                                                <div className="mt-2 flex items-center text-sm text-slate-500 sm:mt-0">
                                                    <p>
                                                        {invoice.issue_date && <>Date: <time dateTime={invoice.issue_date}>{invoice.issue_date}</time></>}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                    {/* Actions — sit outside the Link */}
                                    <div className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                                        {invoice.status !== 'paid' && (
                                            <button
                                                onClick={() => handleMarkPaid(invoice.id, invoice.invoice_number)}
                                                disabled={isPending}
                                                className="text-slate-500 hover:text-emerald-600 p-2 rounded-md hover:bg-emerald-50 transition-colors"
                                                title="Mark as Received"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(invoice.id, invoice.invoice_number)}
                                            disabled={isPending}
                                            className="text-slate-500 hover:text-red-600 p-2 rounded-md hover:bg-red-50 transition-colors"
                                            title="Delete invoice"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-slate-500 text-sm">No invoices found.</p>
                            <div className="mt-6">
                                <Link
                                    href="/invoices/new"
                                    className="text-orange-600 hover:text-orange-500 font-medium"
                                >
                                    Create your first invoice
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    )
}
