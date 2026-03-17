import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { PrintButton } from '@/components/PrintButton'
import { DeleteInvoiceButton } from '@/components/DeleteInvoiceButton'
import { DownloadPDFButton } from '@/components/DownloadPDFButton'
import { numberToWords } from '@/utils/numberToWords'

// Helper to format currency
const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount)
}

// Helper to format date
const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: '2-digit'
    }).replace(/ /g, '-')
}

export default async function InvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: invoice, error } = await supabase
        .from('invoices')
        .select(`
      *,
      clients (*),
      invoice_items (*)
    `)
        .eq('id', id)
        .single()

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error || !invoice) {
        notFound()
    }

    const subtotal = invoice.invoice_items.reduce((acc: number, item: any) => acc + (item.quantity * item.unit_price), 0)
    const taxAmount = subtotal * (invoice.tax_rate / 100)
    const total = subtotal + taxAmount

    const hasBarcodes = invoice.invoice_items.some((item: any) => item.barcode && item.barcode.trim() !== '')

    return (
        <div className="min-h-screen bg-slate-100 p-8 print:p-0 print:bg-white font-sans text-slate-900">
            {/* Toolbar */}
            <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden">
                <Link href="/invoices" className="text-slate-600 hover:text-slate-900 font-medium no-underline">
                    &larr; Back to Invoices
                </Link>
                <div className="flex items-center space-x-3">
                    <Link href={`/invoices/${id}/edit`} className="btn-secondary text-xs px-3 py-1.5 flex items-center">
                        Edit
                    </Link>
                    <DeleteInvoiceButton id={id} invoiceNumber={invoice.invoice_number} />
                    <DownloadPDFButton invoiceNumber={invoice.invoice_number} />
                    <PrintButton />
                </div>
            </div>

            {/* A4 Paper Container */}
            <div id="invoice-printable" className="a4-container max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-xl print:shadow-none relative flex flex-col">
                <div className="p-10 print:p-8 flex-1 flex flex-col">

                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-start">
                            <img src="/logo.jpeg" alt="Company Logo" className="h-24 w-auto object-contain" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-extrabold text-slate-700 uppercase tracking-wide">INVOICE</h2>
                        </div>
                    </div>

                    {/* Top Info Grid */}
                    <div className="grid grid-cols-2 gap-8 mb-6">
                        {/* Left: Customer Info */}
                        <div>
                            <h3 className="font-bold text-slate-800 mb-1">Customer</h3>
                            <div className="text-sm font-bold text-slate-800 uppercase leading-snug">
                                {invoice.clients.name}
                            </div>
                            <div className="text-xs text-slate-600 uppercase mt-1 leading-relaxed whitespace-pre-line">
                                {invoice.clients.address}
                            </div>
                        </div>

                        {/* Right: Invoice Data */}
                        <div className="flex flex-col space-y-1 text-sm">
                            <div className="flex">
                                <span className="w-40 font-bold text-slate-700">Invoice No</span>
                                <span className="font-medium">: {invoice.invoice_number}</span>
                            </div>
                            <div className="flex">
                                <span className="w-40 font-bold text-slate-700">Date</span>
                                <span className="font-medium">: {formatDate(invoice.issue_date)}</span>
                            </div>
                            {invoice.reference_number && (
                                <div className="flex">
                                    <span className="w-40 font-bold text-slate-700">Reference No</span>
                                    <span className="font-medium">: {invoice.reference_number}</span>
                                </div>
                            )}
                            {invoice.buyers_order_number && (
                                <div className="flex">
                                    <span className="w-40 font-bold text-slate-700">Buyer&apos;s Order No</span>
                                    <span className="font-medium">: {invoice.buyers_order_number}</span>
                                </div>
                            )}
                            {invoice.destination && (
                                <div className="flex">
                                    <span className="w-40 font-bold text-slate-700">Destination</span>
                                    <span className="font-medium">: {invoice.destination}</span>
                                </div>
                            )}
                            {invoice.sales_person && (
                                <div className="flex">
                                    <span className="w-40 font-bold text-slate-700">Sales Person</span>
                                    <span className="font-medium">: {invoice.sales_person}</span>
                                </div>
                            )}
                            {invoice.delivery_note && (
                                <div className="flex">
                                    <span className="w-40 font-bold text-slate-700">Delivery Note No</span>
                                    <span className="font-medium">: {invoice.delivery_note}</span>
                                </div>
                            )}
                            {invoice.mode_of_payment && (
                                <div className="flex">
                                    <span className="w-40 font-bold text-slate-700">Mode of Payment</span>
                                    <span className="font-medium">: {invoice.mode_of_payment}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-4">
                        <table className="w-full text-left border-collapse border border-slate-400">
                            <thead>
                                <tr className="bg-slate-700 text-white text-xs uppercase">
                                    <th className="py-2 px-3 border border-slate-400 text-center w-[50px] font-bold whitespace-nowrap">Sl.No</th>
                                    <th className="py-2 px-3 border border-slate-400 font-bold">Description of Goods</th>
                                    <th className="py-2 px-3 border border-slate-400 text-center w-[60px] font-bold whitespace-nowrap">Qty</th>
                                    <th className="py-2 px-3 border border-slate-400 text-center w-[80px] font-bold whitespace-nowrap">Unit</th>
                                    <th className="py-2 px-3 border border-slate-400 text-center w-[100px] font-bold whitespace-nowrap">Rate</th>
                                    <th className="py-2 px-3 border border-slate-400 text-center w-[120px] font-bold whitespace-nowrap">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs">
                                {invoice.invoice_items.map((item: any, index: number) => (
                                    <tr key={item.id}>
                                        <td className="py-2 px-3 border-x border-slate-300 text-center align-top">{index + 1}</td>
                                        <td className="py-2 px-3 border-x border-slate-300 align-top uppercase leading-relaxed">
                                            {item.description}
                                        </td>
                                        <td className="py-2 px-3 border-x border-slate-300 text-center align-top">{item.quantity}</td>
                                        <td className="py-2 px-3 border-x border-slate-300 text-center align-top whitespace-nowrap">{item.unit || '-'}</td>
                                        <td className="py-2 px-3 border-x border-slate-300 text-right align-top">{formatCurrency(item.unit_price, invoice.currency)}</td>
                                        <td className="py-2 px-3 border-x border-slate-300 text-right align-top font-semibold">{formatCurrency(item.quantity * item.unit_price, invoice.currency)}</td>
                                    </tr>
                                ))}
                                {/* Minimum Rows Filler to stretch table down */}
                                {Array.from({ length: Math.max(0, 10 - invoice.invoice_items.length) }).map((_, i) => (
                                    <tr key={`filler-${i}`}>
                                        <td className="py-2.5 px-3 border-x border-transparent print:border-slate-300">&nbsp;</td>
                                        <td className="py-2.5 px-3 border-x border-transparent print:border-slate-300">&nbsp;</td>
                                        <td className="py-2.5 px-3 border-x border-transparent print:border-slate-300">&nbsp;</td>
                                        <td className="py-2.5 px-3 border-x border-transparent print:border-slate-300">&nbsp;</td>
                                        <td className="py-2.5 px-3 border-x border-transparent print:border-slate-300">&nbsp;</td>
                                        <td className="py-2.5 px-3 border-x border-transparent print:border-slate-300">&nbsp;</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Section */}
                    <div className="border border-slate-400 border-t-0 bg-white print:-mt-[1px]">
                        <div className="flex">
                            <div className="flex-1 p-3 border-r border-slate-400">
                                <div className="text-[10px] text-slate-700">
                                    <span className="font-bold">Amount Chargeable (In Words) : </span>
                                    <span className="text-slate-500 italic">Amount In Words(Qatari Riyal)</span>
                                </div>
                                <div className="text-sm font-bold text-slate-700 mt-1">
                                    {numberToWords(total)}
                                </div>
                            </div>
                            <div className="w-72 border-l border-slate-400">
                                <div className="flex border-b border-slate-400">
                                    <div className="flex-1 py-1.5 px-3 text-right font-bold text-slate-800 border-r border-slate-400">Total:</div>
                                    <div className="w-28 py-1.5 px-3 text-right font-bold text-slate-800">{formatCurrency(subtotal, invoice.currency)}</div>
                                </div>
                                <div className="flex">
                                    <div className="flex-1 py-1.5 px-3 text-right font-bold text-slate-800 border-r border-slate-400 leading-tight">Net Amount:</div>
                                    <div className="w-28 py-1.5 px-3 text-right font-bold text-slate-800 flex items-center justify-end">{formatCurrency(total, invoice.currency)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-[10px] text-slate-600 italic mt-3 mb-6">
                        <span className="font-bold">Declaration:</span> We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
                    </div>

                    {/* Bank Details & Signature Block */}
                    <div className="flex justify-between items-end mt-2 mb-8">
                        <div className="text-xs text-slate-700">
                            {invoice.show_bank_details !== false && (
                                <>
                                    <div className="font-bold mb-1 underline">Bank Details:</div>
                                    {profile?.bank_name && (
                                        <div>Bank Name: <span className="font-semibold">{profile.bank_name}</span></div>
                                    )}
                                    {profile?.account_name && (
                                        <div>Account Name: <span className="font-semibold">{profile.account_name}</span></div>
                                    )}
                                    {profile?.account_number && (
                                        <div>Account No: <span className="font-semibold">{profile.account_number}</span></div>
                                    )}
                                    {profile?.iban && (
                                        <div>IBAN: <span className="font-semibold">{profile.iban}</span></div>
                                    )}
                                    {profile?.swift_code && (
                                        <div>SWIFT: <span className="font-semibold">{profile.swift_code}</span></div>
                                    )}
                                    {profile?.branch && (
                                        <div>Branch: <span className="font-semibold">{profile.branch}</span></div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="text-right relative">
                            <div className="text-xs font-bold text-slate-700 mb-4 whitespace-nowrap">
                                <div>From {profile?.company_name || 'Your Company Name'}</div>
                            </div>

                            {/* stamp */}
                            <div className="stamp-container absolute top-8 right-4 w-32 h-auto opacity-80 pointer-events-none z-50">
                                <img src="/stamp.jpeg" alt="Stamp" className="w-full h-full object-contain" />
                            </div>

                            {/* signature line */}
                            <div className="w-48 border-b border-slate-400 ml-auto opacity-50 relative z-10"></div>
                        </div>
                    </div>
                </div>

                {/* blue footer bar */}
                <div className="mt-auto bg-[#3e5378] text-white text-[10px] py-1 px-4 flex justify-between items-center text-center" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', backgroundColor: '#3e5378' } as any}>
                    <div className="w-full flex items-center justify-center gap-3">
                        <span className="opacity-40">|</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
