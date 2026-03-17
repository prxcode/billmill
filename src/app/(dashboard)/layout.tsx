import { Sidebar } from '@/components/Sidebar'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="flex h-screen bg-slate-100 font-sans">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                {children}
            </div>
        </div>
    )
}
