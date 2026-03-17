'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type InvoiceItem = {
    description: string
    quantity: number
    unit_price: number
    barcode?: string
    unit?: string
}

export type InvoiceData = {
    clientName: string
    clientEmail: string
    clientPhone?: string
    clientAddress: string
    invoiceNumber: string
    referenceNumber?: string
    issueDate: string
    dueDate: string
    items: InvoiceItem[]
    taxRate: number
    currency: string
    notes?: string
    // New Fields
    sellerId?: string
    isSellerCompany?: boolean
    shippingClientId?: string
    id?: string
    // Excel / delivery note fields
    buyersOrderNumber?: string
    modeOfPayment?: string
    salesPerson?: string
    deliveryNote?: string
    destination?: string
    showBankDetails?: boolean
}

export async function createInvoice(data: InvoiceData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // 1. Get Client (or create if needed for now)
    // If we passed an existing client ID, we might not need to create, but the UI passes name/email/address
    // which might be new or updated.
    // For now, let's assume we maintain the existing logic of creating/updating client 
    // OR if we have a selectedClientId (which isn't in InvoiceData yet but implied), we use it.
    // The UI currently passes the *values* from the selected client to clientName/etc.
    // So we'll continue with the existing "Get or Create" logic based on email/name 
    // OR we should preferably use the ID if we had it. Use the match on Name/User for now to be safe.

    // Actually, let's try to upsert based on name/email for this user?
    // The current logic inserts specific values. 
    // Let's keep the current client creation logic for the "Buyer" to ensure we have a record.
    const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
            user_id: user.id,
            name: data.clientName,
            email: data.clientEmail,
            phone: data.clientPhone || null,
            address: data.clientAddress
        })
        .select()
        .single()

    if (clientError) {
        console.error('Client Error', clientError)
        return { error: `Failed to create client: ${clientError.message}` }
    }

    // 2. Prepare Invoice Insert Data
    const insertData: any = {
        user_id: user.id,
        client_id: client.id,
        invoice_number: data.invoiceNumber,
        reference_number: data.referenceNumber,
        issue_date: data.issueDate || null,
        due_date: data.dueDate || null,
        status: 'draft',
        tax_rate: data.taxRate,
        currency: data.currency,
        notes: data.notes,
        buyers_order_number: data.buyersOrderNumber || null,
        mode_of_payment: data.modeOfPayment || null,
        sales_person: data.salesPerson || null,
        delivery_note: data.deliveryNote || null,
        destination: data.destination || null,
        show_bank_details: data.showBankDetails ?? true,
    }

    // Handle Seller
    if (data.isSellerCompany && data.sellerId) {
        insertData.seller_id = data.sellerId
    }

    // Handle Consignee
    if (data.shippingClientId) {
        insertData.consignee_id = data.shippingClientId
    }

    const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert(insertData)
        .select()
        .single()

    if (invoiceError) {
        console.error('Invoice Error', invoiceError)
        // Fallback: If company_id or shipping_client_id caused error, try without them?
        // Or better, return clean error.
        return { error: `Failed to create invoice: ${invoiceError.message}` }
    }

    // 3. Create Items
    const itemsToInsert = data.items.map(item => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        barcode: item.barcode,
        unit: item.unit
    }))

    const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert)

    if (itemsError) {
        console.error('Items Error', itemsError)
        return { error: `Failed to add invoice items: ${itemsError.message}` }
    }

    revalidatePath('/', 'layout')
    redirect(`/invoices/${invoice.id}`)
}

export async function deleteInvoice(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Delete items first (foreign key)
    await supabase.from('invoice_items').delete().eq('invoice_id', id)

    // Delete the invoice
    const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id) // Safety: only delete own invoices

    if (error) {
        return { error: `Failed to delete invoice: ${error.message}` }
    }

    revalidatePath('/invoices')
    return { success: true }
}

export async function markInvoicePaid(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        return { error: `Failed to mark as paid: ${error.message}` }
    }

    revalidatePath('/invoices')
    revalidatePath('/')
    return { success: true }
}

export async function updateInvoice(data: InvoiceData) {
    if (!data.id) return { error: 'Invoice ID is required for update' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // 1. Update Client (or create if needed for now)
    // For simplicity, we'll stick to the current logic of creating a new client record for the invoice snapshot
    // unless we want to find the existing one. But the current system seems to create a new client entry per invoice.
    const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
            user_id: user.id,
            name: data.clientName,
            email: data.clientEmail,
            phone: data.clientPhone || null,
            address: data.clientAddress
        })
        .select()
        .single()

    if (clientError) {
        console.error('Client Error', clientError)
        return { error: `Failed to create client: ${clientError.message}` }
    }

    // 2. Prepare Invoice Update Data
    const updateData: any = {
        client_id: client.id,
        invoice_number: data.invoiceNumber,
        reference_number: data.referenceNumber,
        issue_date: data.issueDate || null,
        due_date: data.dueDate || null,
        tax_rate: data.taxRate,
        currency: data.currency,
        notes: data.notes,
        buyers_order_number: data.buyersOrderNumber || null,
        mode_of_payment: data.modeOfPayment || null,
        sales_person: data.salesPerson || null,
        delivery_note: data.deliveryNote || null,
        destination: data.destination || null,
        show_bank_details: data.showBankDetails ?? true,
    }

    if (data.isSellerCompany && data.sellerId) {
        updateData.seller_id = data.sellerId
    } else {
        updateData.seller_id = null
    }

    if (data.shippingClientId) {
        updateData.consignee_id = data.shippingClientId
    } else {
        updateData.consignee_id = null
    }

    const { error: invoiceError } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', data.id)
        .eq('user_id', user.id)

    if (invoiceError) {
        console.error('Invoice Error', invoiceError)
        return { error: `Failed to update invoice: ${invoiceError.message}` }
    }

    // 3. Update Items (Delete and re-insert for simplicity)
    await supabase.from('invoice_items').delete().eq('invoice_id', data.id)

    const itemsToInsert = data.items.map(item => ({
        invoice_id: data.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        barcode: item.barcode,
        unit: item.unit
    }))

    const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert)

    if (itemsError) {
        console.error('Items Error', itemsError)
        return { error: `Failed to update invoice items: ${itemsError.message}` }
    }

    revalidatePath('/', 'layout')
    revalidatePath(`/invoices/${data.id}`)
    redirect(`/invoices/${data.id}`)
}
