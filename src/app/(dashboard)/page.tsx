import { Header } from '@/components/Header'
import { createClient } from '@/utils/supabase/server'
import { Clock, AlertTriangle, CheckCircle, Users } from 'lucide-react'

// Helper to format currency
const formatCurrency = (amount: number, currency = 'QAR') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        currencyDisplay: 'code', // Shows "QAR 1,200.00" instead of just a generic currency symbol
        minimumFractionDigits: 2,
    }).format(amount)
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default async function DashboardPage() {
    const supabase = await createClient()

    const currentYear = new Date().getFullYear()
    const yearStart = `${currentYear}-01-01`
    const yearEnd = `${currentYear + 1}-01-01`

    // Fetch all invoices for the current year with their items
    const { data: invoices } = await supabase
        .from('invoices')
        .select(`
            id,
            invoice_number,
            issue_date,
            status,
            currency,
            invoice_items ( quantity, unit_price )
        `)
        .gte('issue_date', yearStart)
        .lt('issue_date', yearEnd)
        .order('issue_date', { ascending: true })

    // Fetch unique clients
    const { count: clientsCount } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })

    // Build per-invoice totals
    type InvoiceRow = {
        id: string
        issue_date: string
        status: string
        currency: string
        invoice_items: { quantity: number; unit_price: number }[]
    }

    const invoiceList: InvoiceRow[] = (invoices as InvoiceRow[]) ?? []

    const getTotal = (inv: InvoiceRow) =>
        (inv.invoice_items ?? []).reduce(
            (sum, item) => sum + item.quantity * item.unit_price,
            0
        )

    // Monthly aggregation: invoiced = all invoices, received = paid invoices
    const monthlyInvoiced = Array(12).fill(0)
    const monthlyReceived = Array(12).fill(0)

    let totalOutstanding = 0
    let totalOverdue = 0
    let totalCollected = 0

    const today = new Date()

    for (const inv of invoiceList) {
        const month = new Date(inv.issue_date).getMonth()
        const total = getTotal(inv)
        monthlyInvoiced[month] += total

        if (inv.status === 'paid') {
            monthlyReceived[month] += total
            totalCollected += total
        } else if (inv.status === 'draft' || inv.status === 'sent') {
            totalOutstanding += total
            const issueDate = new Date(inv.issue_date)
            // treat as overdue if more than 30 days past issue with no payment
            if ((today.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24) > 30) {
                totalOverdue += total
            }
        }
    }

    // Invoice summary totals
    const totalInvoiced = monthlyInvoiced.reduce((a, b) => a + b, 0)
    const totalReceived = monthlyReceived.reduce((a, b) => a + b, 0)

    const maxVal = Math.max(...monthlyInvoiced, ...monthlyReceived, 1)

    return (
        <>
            <Header title="Dashboard" />

            <main className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* Recent Activity Section */}
                    <div className="lg:col-span-2">
                        <div className="rounded-lg bg-white shadow">
                            <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                                <h3 className="text-sm font-medium text-slate-900">Recent Activity</h3>
                                <a href="/invoices" className="text-sm text-blue-600 hover:text-blue-500">View All Invoices</a>
                            </div>
                            <div className="p-4">
                                {invoiceList.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <p className="text-slate-500 text-sm">
                                            Nothing to display here &mdash;{' '}
                                            <a href="/invoices/new" className="text-blue-600 hover:underline">
                                                create your first invoice now »
                                            </a>
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                                                    <th className="pb-2 pr-4 font-medium">Date</th>
                                                    <th className="pb-2 pr-4 font-medium">Invoice #</th>
                                                    <th className="pb-2 pr-4 font-medium">Status</th>
                                                    <th className="pb-2 text-right font-medium">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {invoiceList.slice(0, 8).map((inv) => {
                                                    const total = getTotal(inv)
                                                    return (
                                                        <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                                            <td className="py-2.5 pr-4 text-slate-500">
                                                                {new Date(inv.issue_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                            </td>
                                                            <td className="py-2.5 pr-4 text-slate-800 font-medium">
                                                                <a href={`/invoices/${inv.id}`} className="hover:text-blue-600">
                                                                    #{(inv as unknown as { invoice_number?: string }).invoice_number ?? inv.id.slice(0, 8)}
                                                                </a>
                                                            </td>
                                                            <td className="py-2.5 pr-4">
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${inv.status === 'paid'
                                                                    ? 'bg-emerald-100 text-emerald-700'
                                                                    : inv.status === 'sent'
                                                                        ? 'bg-blue-100 text-blue-700'
                                                                        : 'bg-slate-100 text-slate-600'
                                                                    }`}>
                                                                    {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                                                                </span>
                                                            </td>
                                                            <td className="py-2.5 text-right font-medium text-slate-800">
                                                                {formatCurrency(total, inv.currency)}
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Invoiced / Received Bar Chart */}
                        <div className="mt-6 rounded-lg bg-white shadow">
                            <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-slate-50 rounded-t-lg">
                                <h3 className="text-sm font-medium text-slate-700">
                                    Invoiced / Received ({yearStart.slice(0, 10)} – {yearEnd.slice(0, 10)})
                                </h3>
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <span className="flex items-center gap-1.5">
                                        <span className="inline-block w-3 h-3 rounded-sm bg-slate-600"></span>Invoiced
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500"></span>Received
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-end gap-1 h-48">
                                    {MONTHS.map((month, i) => {
                                        const invoicedPct = (monthlyInvoiced[i] / maxVal) * 100
                                        const receivedPct = (monthlyReceived[i] / maxVal) * 100
                                        return (
                                            <div key={month} className="flex-1 flex flex-col items-center gap-1 group">
                                                <div className="w-full flex items-end gap-0.5 h-40 relative">
                                                    {/* Tooltip */}
                                                    {(monthlyInvoiced[i] > 0 || monthlyReceived[i] > 0) && (
                                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 hidden group-hover:flex flex-col items-center whitespace-nowrap">
                                                            <div className="bg-slate-800 text-white text-xs rounded px-2 py-1 shadow-lg">
                                                                <div>Inv: {formatCurrency(monthlyInvoiced[i])}</div>
                                                                <div>Rcv: {formatCurrency(monthlyReceived[i])}</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div
                                                        className="flex-1 bg-slate-300 rounded-t transition-all duration-500"
                                                        style={{ height: `${invoicedPct}%`, minHeight: monthlyInvoiced[i] > 0 ? '2px' : '0' }}
                                                    />
                                                    <div
                                                        className="flex-1 bg-emerald-500 rounded-t transition-all duration-500"
                                                        style={{ height: `${receivedPct}%`, minHeight: monthlyReceived[i] > 0 ? '2px' : '0' }}
                                                    />
                                                </div>
                                                <span className="text-xs text-slate-400">{month}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row Summaries */}
                        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="rounded-lg bg-white shadow overflow-hidden">
                                <div className="px-6 py-3 bg-slate-100 border-b border-slate-200">
                                    <h3 className="text-sm font-medium text-slate-700">Invoice Summary</h3>
                                </div>
                                <div className="p-4 space-y-2">
                                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                                        <span className="text-sm text-slate-600 border-l-4 border-slate-600 pl-2">Invoiced</span>
                                        <span className="text-sm font-medium">{formatCurrency(totalInvoiced)}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                                        <span className="text-sm text-slate-600 border-l-4 border-emerald-500 pl-2">Received</span>
                                        <span className="text-sm font-medium">{formatCurrency(totalReceived)}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                                        <span className="text-sm text-slate-600 border-l-4 border-red-500 pl-2">Outstanding</span>
                                        <span className="text-sm font-medium">{formatCurrency(totalOutstanding)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg bg-white shadow overflow-hidden">
                                <div className="px-6 py-3 bg-slate-100 border-b border-slate-200">
                                    <h3 className="text-sm font-medium text-slate-700">Collection Rate</h3>
                                </div>
                                <div className="p-4 flex flex-col justify-center gap-3 h-[calc(100%-53px)]">
                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                        <span>Received vs Invoiced</span>
                                        <span className="font-semibold text-slate-700">
                                            {totalInvoiced > 0 ? Math.round((totalReceived / totalInvoiced) * 100) : 0}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                            style={{ width: `${totalInvoiced > 0 ? (totalReceived / totalInvoiced) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                                        <span>{formatCurrency(totalReceived)} collected</span>
                                        <span>{formatCurrency(totalInvoiced)} total</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* At a Glance Section (Right Side) */}
                    <div className="lg:col-span-1">
                        <div className="rounded-lg bg-white shadow">
                            <div className="border-b border-slate-200 px-6 py-4 bg-slate-100 rounded-t-lg">
                                <h3 className="text-sm font-medium text-slate-900">At a Glance</h3>
                            </div>
                            <ul className="divide-y divide-slate-200">
                                <li className="flex items-center justify-between px-6 py-4">
                                    <div className="flex items-center">
                                        <Clock className="mr-3 h-5 w-5 text-slate-400" />
                                        <span className="text-sm text-slate-600">Total Outstanding:</span>
                                    </div>
                                    <span className="text-sm font-medium text-slate-900">{formatCurrency(totalOutstanding)}</span>
                                </li>
                                <li className="flex items-center justify-between px-6 py-4">
                                    <div className="flex items-center">
                                        <AlertTriangle className="mr-3 h-5 w-5 text-slate-400" />
                                        <span className="text-sm text-slate-600">Total Overdue:</span>
                                    </div>
                                    <span className="text-sm font-medium text-slate-900">{formatCurrency(totalOverdue)}</span>
                                </li>
                                <li className="flex items-center justify-between px-6 py-4">
                                    <div className="flex items-center">
                                        <CheckCircle className="mr-3 h-5 w-5 text-slate-400" />
                                        <span className="text-sm text-slate-600">Collected this Year:</span>
                                    </div>
                                    <span className="text-sm font-medium text-slate-900">{formatCurrency(totalCollected)}</span>
                                </li>
                                <li className="flex items-center justify-between px-6 py-4">
                                    <div className="flex items-center">
                                        <Users className="mr-3 h-5 w-5 text-slate-400" />
                                        <span className="text-sm text-slate-600">Clients:</span>
                                    </div>
                                    <span className="text-sm font-medium text-slate-900">{clientsCount ?? 0}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </main>
        </>
    )
}
