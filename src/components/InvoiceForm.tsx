'use client'

import { useState, useEffect } from 'react'
import { createInvoice, updateInvoice, type InvoiceData, type InvoiceItem } from '@/app/invoices/actions'
import { Plus, Trash, Save, User, Calendar, CreditCard, FileText, Truck, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface InvoiceFormProps {
    userProfile: any
    userCompanies: any[]
    savedClients: any[]
    nextInvoiceNumber?: string
    editingInvoice?: any
}

export default function InvoiceForm({ userProfile, userCompanies, savedClients, nextInvoiceNumber, editingInvoice }: InvoiceFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Seller (From) State
    const [selectedSellerId, setSelectedSellerId] = useState<string>(
        editingInvoice ? (editingInvoice.company_id || userProfile?.id || '') : (userProfile?.id || '')
    )
    const [isSellerCompany, setIsSellerCompany] = useState<boolean>(
        editingInvoice ? !!editingInvoice.company_id : false
    )

    // Buyer (To) State
    const [selectedClientId, setSelectedClientId] = useState<string>(
        editingInvoice ? editingInvoice.client_id : ''
    )

    // Shipping (To) State
    const [selectedShippingClientId, setSelectedShippingClientId] = useState<string>(
        editingInvoice?.shipping_client_id || ''
    )
    const [isShippingSameAsBilling, setIsShippingSameAsBilling] = useState<boolean>(
        editingInvoice ? !editingInvoice.shipping_client_id : true
    )

    // Form State
    const [clientName, setClientName] = useState(editingInvoice?.clients?.name || '')
    const [clientEmail, setClientEmail] = useState(editingInvoice?.clients?.email || '')
    const [clientPhone, setClientPhone] = useState(editingInvoice?.clients?.phone || '')
    const [clientAddress, setClientAddress] = useState(editingInvoice?.clients?.address || '')
    const [invoiceNumber, setInvoiceNumber] = useState(editingInvoice?.invoice_number || nextInvoiceNumber || 'DIT-26-121')
    const [referenceNumber, setReferenceNumber] = useState(editingInvoice?.reference_number || '')
    const [issueDate, setIssueDate] = useState(editingInvoice?.issue_date || new Date().toISOString().split('T')[0])
    // Removed Due Date
    const [taxRate, setTaxRate] = useState(editingInvoice?.tax_rate || 0)
    const [currency, setCurrency] = useState(editingInvoice?.currency || 'QAR')
    const [notes, setNotes] = useState(editingInvoice?.notes || '')

    // excel / delivery note fields
    const [buyersOrderNumber, setBuyersOrderNumber] = useState(editingInvoice?.buyers_order_number || '')
    const [modeOfPayment, setModeOfPayment] = useState(editingInvoice?.mode_of_payment || '')
    const [salesPerson, setSalesPerson] = useState(editingInvoice?.sales_person || '')
    const [deliveryNote, setDeliveryNote] = useState(editingInvoice?.delivery_note || '')
    const [destination, setDestination] = useState(editingInvoice?.destination || '')

    // Bank Details Toggle
    const [showBankDetails, setShowBankDetails] = useState<boolean>(
        editingInvoice?.show_bank_details !== undefined ? editingInvoice.show_bank_details : true
    )

    const [items, setItems] = useState<InvoiceItem[]>(
        editingInvoice?.invoice_items || [
            { description: '', quantity: 1, unit_price: 0, barcode: '', unit: 'Pcs' }
        ]
    )

    // Calculations
    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0)
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount

    // Handlers for Seller Selection
    const handleSellerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value
        setSelectedSellerId(id)
        if (id === userProfile?.id) {
            setIsSellerCompany(false)
        } else {
            setIsSellerCompany(true)
        }
    }

    // Handlers for Buyer Selection
    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value
        setSelectedClientId(id)

        if (id === 'new') {
            setClientName('')
            setClientEmail('')
            setClientAddress('')
            return
        }

        const company = userCompanies.find(c => c.id === id)
        if (company) {
            setClientName(company.name)
            setClientEmail(company.email || '')
            setClientPhone(company.mobile || '')
            setClientAddress(company.address || '')
        }
    }

    // Handlers for Shipping Selection
    const handleShippingClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value
        setSelectedShippingClientId(id)
    }

    const handleAddItem = () => {
        setItems([...items, { description: '', quantity: 1, unit_price: 0, barcode: '', unit: 'Pcs' }])
    }

    const handleRemoveItem = (index: number) => {
        const newItems = [...items]
        newItems.splice(index, 1)
        setItems(newItems)
    }

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
        const newItems = [...items]
        // @ts-ignore
        newItems[index][field] = value
        setItems(newItems)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const invoiceData: InvoiceData = {
            id: editingInvoice?.id,
            clientName,
            clientEmail,
            clientPhone,
            clientAddress,
            invoiceNumber,
            referenceNumber,
            issueDate,
            dueDate: '', // Removed from UI
            items,
            taxRate,
            currency,
            notes,
            sellerId: selectedSellerId,
            isSellerCompany: isSellerCompany,
            shippingClientId: isShippingSameAsBilling ? undefined : selectedShippingClientId,
            buyersOrderNumber,
            modeOfPayment,
            salesPerson,
            deliveryNote,
            destination,
            showBankDetails,
        }

        const result = editingInvoice
            ? await updateInvoice(invoiceData)
            : await createInvoice(invoiceData)

        // @ts-ignore
        if (result?.error) {
            alert(result.error) // Simple alert for now to show the user the specific error
        }

        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-8 pb-20">

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                        {editingInvoice ? 'Edit Invoice' : 'New Invoice'}
                    </h2>
                    <p className="text-slate-500 mt-1">
                        {editingInvoice ? 'Modify your invoice details.' : 'Create and manage invoices for your business.'}
                    </p>
                </div>
                <div className="flex items-center space-x-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-sm font-medium text-slate-500 px-2">Invoice # <span className="text-red-500">*</span></span>
                    <input
                        type="text"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        className="block w-32 border-0 border-l border-slate-100 p-0 pl-3 text-right font-mono text-slate-900 focus:ring-0 sm:text-sm font-bold bg-transparent"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Client & Details */}
                <div className="lg:col-span-2 space-y-8">

                    {/* From Section (Seller) */}
                    <div className="card p-6">
                        <div className="flex items-center mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="ml-3 text-lg font-semibold text-slate-900">From (Seller)</h3>
                        </div>
                        <div>
                            <label className="form-label">Business / Company</label>
                            <select
                                value={selectedSellerId}
                                onChange={handleSellerChange}
                                className="form-input"
                            >
                                <option value={userProfile?.id}>{userProfile?.company_name || 'My Profile'} (main)</option>
                                {userCompanies.map(company => (
                                    <option key={company.id} value={company.id}>{company.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* To Section (Buyer) */}
                    <div className="card p-6">
                        <div className="flex items-center mb-4">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <User className="w-5 h-5 text-orange-600" />
                            </div>
                            <h3 className="ml-3 text-lg font-semibold text-slate-900">To (Buyer)</h3>
                        </div>

                        <div className="mb-4">
                            <label className="form-label">Select Client</label>
                            <select
                                value={selectedClientId}
                                onChange={handleClientChange}
                                className="form-input"
                            >
                                {userCompanies.length > 0 && (
                                    <optgroup label="Saved Clients List">
                                        {userCompanies.map(company => (
                                            <option key={company.id} value={company.id}>{company.name}</option>
                                        ))}
                                    </optgroup>
                                )}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2 md:col-span-1">
                                <label className="form-label">Client Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g. Alif Stores"
                                    required
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    // Make readOnly if existing client selected? Or allow edit? 
                                    // Allowing edit might not save back to client unless we implement update.
                                    // For now, let's allow edit for the invoice snapshot.
                                    className="form-input"
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="form-label">Client Email</label>
                                <input
                                    type="email"
                                    placeholder="email@client.com"
                                    value={clientEmail}
                                    onChange={(e) => setClientEmail(e.target.value)}
                                    className="form-input"
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="form-label">Client Phone <span className="text-slate-400 text-xs font-normal">(optional)</span></label>
                                <input
                                    type="tel"
                                    placeholder="e.g. +974 1234 5678"
                                    value={clientPhone}
                                    onChange={(e) => setClientPhone(e.target.value)}
                                    className="form-input"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="form-label">Billing Address</label>
                                <textarea
                                    placeholder="Street, City, P.O. Box..."
                                    rows={3}
                                    value={clientAddress}
                                    onChange={(e) => setClientAddress(e.target.value)}
                                    className="form-input resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Shipping Section */}
                    <div className="card p-6">
                        <div className="flex items-center mb-4 justify-between">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Truck className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="ml-3 text-lg font-semibold text-slate-900">Shipping Details</h3>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="sameAsBilling"
                                    checked={isShippingSameAsBilling}
                                    onChange={(e) => setIsShippingSameAsBilling(e.target.checked)}
                                    className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 mr-2"
                                />
                                <label htmlFor="sameAsBilling" className="text-sm text-slate-700">Same as Billing</label>
                            </div>
                        </div>

                        {!isShippingSameAsBilling && (
                            <div className="mb-4">
                                <label className="form-label">Select Consignee / Shipping Address</label>
                                <select
                                    value={selectedShippingClientId}
                                    onChange={handleShippingClientChange}
                                    className="form-input"
                                >
                                    <option value="">-- Select Consignee --</option>
                                    {userCompanies.map(company => (
                                        <option key={company.id} value={company.id}>{company.name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Select a client for shipping destination.</p>
                            </div>
                        )}

                    </div>

                    {/* Items Card */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="ml-3 text-lg font-semibold text-slate-900">Items</h3>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="btn-secondary text-xs py-1.5"
                            >
                                <Plus className="w-4 h-4 mr-1.5" />
                                Add Item
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                        <th className="pb-3 pl-1 w-[12%]">Barcode</th>
                                        <th className="pb-3 w-[35%]">Description</th>
                                        <th className="pb-3 w-[10%] text-right">Unit</th>
                                        <th className="pb-3 w-[10%] text-right">Qty</th>
                                        <th className="pb-3 w-[15%] text-right">Price</th>
                                        <th className="pb-3 w-[15%] text-right">Total</th>
                                        <th className="pb-3 w-[3%]"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {items.map((item, index) => (
                                        <tr key={index} className="group">
                                            <td className="py-3 px-1 align-top">
                                                <input
                                                    type="text"
                                                    placeholder="Code"
                                                    value={item.barcode || ''}
                                                    onChange={(e) => handleItemChange(index, 'barcode', e.target.value)}
                                                    className="form-input text-xs py-2"
                                                />
                                            </td>
                                            <td className="py-3 px-1 align-top">
                                                <textarea
                                                    rows={1}
                                                    placeholder="Item Name / Desc"
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                    className="form-input text-xs py-2 resize-none"
                                                    style={{ minHeight: '38px' }}
                                                />
                                            </td>
                                            <td className="py-3 px-1 align-top">
                                                <input
                                                    type="text"
                                                    value={item.unit || 'Pcs'}
                                                    onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                                    className="form-input text-xs py-2 text-right"
                                                />
                                            </td>
                                            <td className="py-3 px-1 align-top">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                    className="form-input text-xs py-2 text-right"
                                                />
                                            </td>
                                            <td className="py-3 px-1 align-top">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.unit_price}
                                                    onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                    className="form-input text-xs py-2 text-right"
                                                />
                                            </td>
                                            <td className="py-3 px-1 align-top text-right text-sm font-medium text-slate-700 pt-5">
                                                {(item.quantity * item.unit_price).toFixed(2)}
                                            </td>
                                            <td className="py-3 pl-2 align-top pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings & Totals */}
                <div className="space-y-6">
                    <div className="card p-6 space-y-4">
                        <div className="flex items-center mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Calendar className="w-5 h-5 text-purple-600" />
                            </div>
                            <h3 className="ml-3 text-lg font-semibold text-slate-900">Dates & Reference</h3>
                        </div>

                        <div>
                            <label className="form-label">Reference No / PO No (Optional)</label>
                            <input
                                type="text"
                                value={referenceNumber}
                                onChange={(e) => setReferenceNumber(e.target.value)}
                                placeholder="e.g. PO/2026/00212"
                                className="form-input"
                            />
                        </div>

                        <div>
                            <label className="form-label">Issue Date <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                required
                                value={issueDate}
                                onChange={(e) => setIssueDate(e.target.value)}
                                className="form-input"
                            />
                        </div>

                        <div>
                            <label className="form-label">Buyer&apos;s Order No</label>
                            <input
                                type="text"
                                value={buyersOrderNumber}
                                onChange={(e) => setBuyersOrderNumber(e.target.value)}
                                placeholder="e.g. BO-2026-001"
                                className="form-input"
                            />
                        </div>

                        <div>
                            <label className="form-label">Destination</label>
                            <input
                                type="text"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                placeholder="e.g. Doha, Qatar"
                                className="form-input"
                            />
                        </div>

                        <div>
                            <label className="form-label">Sales Person</label>
                            <input
                                type="text"
                                value={salesPerson}
                                onChange={(e) => setSalesPerson(e.target.value)}
                                placeholder="e.g. John"
                                className="form-input"
                            />
                        </div>

                        <div>
                            <label className="form-label">Delivery Note No</label>
                            <input
                                type="text"
                                value={deliveryNote}
                                onChange={(e) => setDeliveryNote(e.target.value)}
                                placeholder="e.g. DN-001"
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="card p-6 space-y-4">
                        <div className="flex items-center mb-2">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <CreditCard className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h3 className="ml-3 text-lg font-semibold text-slate-900">Payment & Currency</h3>
                        </div>
                        <div>
                            <label className="form-label">Currency</label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="form-input"
                            >
                                <option value="QAR">QAR (QR)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="AED">AED (AED)</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Mode of Payment</label>
                            <input
                                type="text"
                                value={modeOfPayment}
                                onChange={(e) => setModeOfPayment(e.target.value)}
                                placeholder="e.g. Bank Transfer, Cash"
                                className="form-input"
                            />
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <label htmlFor="showBankDetails" className="text-sm font-medium text-slate-700 cursor-pointer">
                                Show Bank Details on Invoice
                            </label>
                            <input
                                type="checkbox"
                                id="showBankDetails"
                                checked={showBankDetails}
                                onChange={(e) => setShowBankDetails(e.target.checked)}
                                className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
                            />
                        </div>
                    </div>

                    <div className="card p-6 bg-slate-50 border-slate-200">
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Subtotal</span>
                                <span className="font-medium">{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-slate-600">
                                <span>Tax Rate</span>
                                <div className="flex items-center">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={taxRate}
                                        onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                                        className="w-12 h-6 text-right text-xs border-slate-300 rounded focus:ring-orange-500 focus:border-orange-500 mr-1"
                                    />
                                    <span>%</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Tax Amount</span>
                                <span>{taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</span>
                            </div>
                            <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                                <span className="text-base font-bold text-slate-900">Total</span>
                                <span className="text-xl font-bold text-slate-900">{total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-3 text-base shadow-lg shadow-orange-500/20 bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
                            >
                                <Save className="w-5 h-5 mr-2" />
                                {loading ? (editingInvoice ? 'Updating...' : 'Generating...') : (editingInvoice ? 'Update Invoice' : 'Save & View Invoice')}
                            </button>
                            <p className="text-center text-xs text-slate-400 mt-3">
                                PDF will be available on the next screen.
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer Notes */}
            <div className="card p-6">
                <label className="form-label">Notes / Terms & Conditions</label>
                <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="form-input resize-none"
                    placeholder="e.g. Please send payment within 15 days. Thank you for your business."
                />
            </div>

        </form>
    )
}
