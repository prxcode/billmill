'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateBusinessProfile(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const companyName = formData.get('companyName') as string
    const companyAddress = formData.get('companyAddress') as string
    const trnNumber = formData.get('trnNumber') as string
    const businessEmail = formData.get('businessEmail') as string
    const businessPhone = formData.get('businessPhone') as string

    // Bank Details
    const bankName = formData.get('bankName') as string
    const accountName = formData.get('accountName') as string
    const accountNumber = formData.get('accountNumber') as string
    const iban = formData.get('iban') as string
    const swiftCode = formData.get('swiftCode') as string

    const { error } = await supabase
        .from('profiles')
        .update({
            company_name: companyName,
            company_address: companyAddress,
            trn_number: trnNumber,
            business_email: businessEmail,
            business_phone: businessPhone,
            bank_name: bankName,
            account_name: accountName,
            account_number: accountNumber,
            iban: iban,
            swift_code: swiftCode,
            branch: formData.get('branch') as string,
            branch_address: formData.get('branchAddress') as string
        })
        .eq('id', user.id)

    if (error) {
        return { error: 'Failed to update profile' }
    }

    revalidatePath('/settings')
    revalidatePath('/')
    return { message: 'Profile updated successfully' }
}

export async function createCompany(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const name = formData.get('name') as string
    const address = formData.get('address') as string
    const trn = formData.get('trn') as string
    const email = formData.get('email') as string
    const mobile = formData.get('mobile') as string
    // Bank Details for this company
    const bankName = formData.get('bankName') as string
    const accountName = formData.get('accountName') as string
    const accountNumber = formData.get('accountNumber') as string
    const iban = formData.get('iban') as string
    const swiftCode = formData.get('swiftCode') as string

    const { error } = await supabase.from('companies').insert({
        user_id: user.id,
        name,
        customer_name: formData.get('customerName') as string,
        address,
        trn_number: trn,
        email,
        mobile,
        bank_name: bankName,
        account_name: accountName,
        account_number: accountNumber,
        iban,
        swift_code: swiftCode,
        branch: formData.get('branch') as string,
        branch_address: formData.get('branchAddress') as string
    })

    if (error) {
        console.error(error)
        return { error: `Failed to create company: ${error.message}` }
    }

    revalidatePath('/settings')
    return { message: 'Company saved successfully' }
}

export async function deleteCompany(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('companies').delete().eq('id', id)
    if (error) console.error(error)
    revalidatePath('/settings')
}

export async function updateCompany(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const address = formData.get('address') as string
    const trn = formData.get('trn') as string
    const email = formData.get('email') as string
    const mobile = formData.get('mobile') as string
    // Bank Details
    const bankName = formData.get('bankName') as string
    const accountName = formData.get('accountName') as string
    const accountNumber = formData.get('accountNumber') as string
    const iban = formData.get('iban') as string
    const swiftCode = formData.get('swiftCode') as string

    const { error } = await supabase
        .from('companies')
        .update({
            name,
            customer_name: formData.get('customerName') as string,
            address,
            trn_number: trn,
            email,
            mobile,
            bank_name: bankName,
            account_name: accountName,
            account_number: accountNumber,
            iban,
            swift_code: swiftCode,
            branch: formData.get('branch') as string,
            branch_address: formData.get('branchAddress') as string
        })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error(error)
        return { error: 'Failed to update company' }
    }

    revalidatePath('/settings')
    return { message: 'Company updated successfully' }
}

