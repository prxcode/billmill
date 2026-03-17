'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    FileText,
    PieChart,
    Users,
    Settings,
    LogOut,
    Files,
} from 'lucide-react'
import { signout } from '@/app/auth/actions'
import clsx from 'clsx'

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Reports', href: '/reports', icon: PieChart },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Estimates', href: '/estimates', icon: Files },
    { name: 'Business Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-full w-64 flex-col bg-slate-900 text-white shadow-xl print:hidden">
            <div className="flex h-20 items-center px-4 border-b border-slate-800 bg-slate-950">
                {/* BillMill logo PNG — text already included in the image */}
                <img
                    src="/billmill-logo.png"
                    alt="BillMill"
                    className="h-18 w-50 object-contain"
                />
            </div>

            <div className="flex-1 overflow-y-auto py-6">
                <nav className="space-y-1.5 px-3">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={clsx(
                                    isActive
                                        ? 'bg-orange-600 text-white shadow-md'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200'
                                )}
                            >
                                <item.icon
                                    className={clsx(
                                        isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300',
                                        'mr-3 h-5 w-5 flex-shrink-0 transition-colors'
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="border-t border-slate-800 p-4 bg-slate-950">
                <button
                    onClick={() => signout()}
                    className="group w-full text-left px-3 py-2.5 text-sm font-medium text-slate-400 rounded-lg hover:bg-slate-800 hover:text-white transition-all duration-200"
                >
                    Sign Out
                </button>
            </div>
        </div>
    )
}
