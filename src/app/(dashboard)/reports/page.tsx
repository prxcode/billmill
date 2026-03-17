'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import {
    BarChart3,
    TrendingUp,
    PieChart,
    Download
} from 'lucide-react'
import clsx from 'clsx'

const tabs = [
    { name: 'Sales Overview', icon: TrendingUp },
    { name: 'Tax Summary', icon: PieChart },
    { name: 'Collections', icon: BarChart3 },
]

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState('Sales Overview')

    return (
        <>
            <Header title="Reports" />
            <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
                <div className="mb-8 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-slate-800">Business Insights</h2>
                    <button className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors">
                        <Download className="-ml-1 mr-2 h-4 w-4 text-slate-500" aria-hidden="true" />
                        Export
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200 mb-6">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.name
                            return (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={clsx(
                                        isActive
                                            ? 'border-orange-500 text-orange-600'
                                            : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
                                        'group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium transition-colors'
                                    )}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    <tab.icon
                                        className={clsx(
                                            isActive ? 'text-orange-500' : 'text-slate-400 group-hover:text-slate-500',
                                            '-ml-0.5 mr-2 h-5 w-5 transition-colors'
                                        )}
                                        aria-hidden="true"
                                    />
                                    {tab.name}
                                </button>
                            )
                        })}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 min-h-[400px] flex items-center justify-center text-center">
                    <div>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
                            <BarChart3 className="h-6 w-6 text-slate-600" aria-hidden="true" />
                        </div>
                        <h3 className="mt-2 text-lg font-semibold text-slate-900">
                            {activeTab} Data
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                            Detailed reporting features are being actively developed. Check back soon for comprehensive {activeTab.toLowerCase()} analytics.
                        </p>
                    </div>
                </div>
            </main>
        </>
    )
}
