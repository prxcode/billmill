'use client'

import { Trash2 } from 'lucide-react'
import { useTransition } from 'react'
import { deleteInvoice } from '@/app/invoices/actions'
import { useRouter } from 'next/navigation'

export function DeleteInvoiceButton({ id, invoiceNumber }: { id: string, invoiceNumber: string }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleDelete = () => {
        if (!confirm(`Delete invoice ${invoiceNumber}? This cannot be undone.`)) return
        startTransition(async () => {
            const result = await deleteInvoice(id)
            if (result?.error) {
                alert(result.error)
            } else {
                router.push('/invoices')
                router.refresh()
            }
        })
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-100 transition-colors border border-red-200"
            title="Delete invoice"
        >
            <Trash2 className="mr-2 h-4 w-4" />
            {isPending ? 'Deleting...' : 'Delete'}
        </button>
    )
}
