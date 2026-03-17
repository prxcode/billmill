'use server'

import { deleteInvoice } from '@/app/invoices/actions'
import { redirect } from 'next/navigation'

export async function deleteInvoiceAction(id: string) {
    const result = await deleteInvoice(id)
    if (result.success) {
        redirect('/invoices')
    }
    return result
}
