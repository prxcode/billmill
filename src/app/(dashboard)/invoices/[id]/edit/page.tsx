import { Header } from '@/components/Header'
import InvoiceForm from '@/components/InvoiceForm'
import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch Invoice with Items and Client
    const { data: invoice, error } = await supabase
        .from('invoices')
        .select(`
            *,
            clients (*),
            invoice_items (*)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error || !invoice) {
        notFound()
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

    return (
        <>
            <Header title={`Edit Invoice: ${invoice.invoice_number}`} />
            <main className="flex-1 overflow-y-auto p-6 bg-slate-100">
                <InvoiceForm
                    userProfile={profile}
                    userCompanies={companies || []}
                    savedClients={[]}
                    editingInvoice={invoice}
                />
            </main>
        </>
    )
}
