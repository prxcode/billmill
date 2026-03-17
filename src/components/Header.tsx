'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'

export function Header({ title = 'Dashboard' }: { title?: string }) {
    return (
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
            <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
            {/* The action button was removed so it only shows on specific pages */}
        </header>
    )
}
