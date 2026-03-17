'use client'

import { Printer } from 'lucide-react'

export function PrintButton() {
    return (
        <button
            onClick={() => {
                if (typeof window !== 'undefined') window.print();
            }}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
        </button>
    )
}
