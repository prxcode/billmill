'use client'

import { Header } from '@/components/Header'
import Link from 'next/link'
import { Plus, Clock, FileWarning } from 'lucide-react'

export default function EstimatesPage() {
    return (
        <>
            <Header title="Estimates" />
            <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-slate-800">All Estimates</h2>
                    <button
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors opacity-50 cursor-not-allowed"
                        title="Creation coming soon"
                    >
                        <Plus className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                        New Estimate
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200">
                    <div className="text-center py-16">
                        <FileWarning className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">Estimates Module Pipeline</h3>
                        <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
                            The estimates and quote generation features will be available in the next major update. You will be able to easily convert estimates directly into invoices.
                        </p>
                    </div>
                </div>
            </main>
        </>
    )
}
