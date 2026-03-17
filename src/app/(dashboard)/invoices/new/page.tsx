import { Header } from '@/components/Header'
import InvoiceForm from '@/components/InvoiceForm'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// Generate next invoice number in DAL/TS/YYYY/NNN format
async function getNextInvoiceNumber(supabase: any, userId: string): Promise<string> {
    const year = new Date().getFullYear().toString() // "2026"
    const prefix = `DAL/TS/${year}/`

    // Find the highest existing number for this prefix
    const { data: invoices } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('user_id', userId)
        .like('invoice_number', `${prefix}%`)
        .order('invoice_number', { ascending: false })
        .limit(1)

    if (invoices && invoices.length > 0) {
        // Extract the ending number (e.g. 001)
        const parts = invoices[0].invoice_number.split('/')
        const lastNum = parseInt(parts[parts.length - 1], 10)
        const nextNum = isNaN(lastNum) ? 1 : lastNum + 1
        return `${prefix}${nextNum.toString().padStart(3, '0')}`
    }

    // First invoice format starts with 001
    return `${prefix}001`
}

export default async function NewInvoicePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch User Profile (Main Business)
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Fetch User Companies (Other Businesses)
    const { data: companies } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)

    // Auto-generate next invoice number
    const nextInvoiceNumber = await getNextInvoiceNumber(supabase, user.id)

    return (
        <>
            <Header title="New Invoice" />
            <main className="flex-1 overflow-y-auto p-6 bg-slate-100">
                <InvoiceForm
                    userProfile={profile}
                    userCompanies={companies || []}
                    savedClients={[]}
                    nextInvoiceNumber={nextInvoiceNumber}
                />
            </main>
        </>
    )
}
