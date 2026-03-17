import { Header } from '@/components/Header'
import { HardHat } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="flex flex-col h-full">
            <Header title="Not Found" />
            <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
                <div className="text-center">
                    <HardHat className="mx-auto h-24 w-24 text-orange-500 mb-6" />
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Work in progress coming soon</h2>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                        This page is currently under development. Please check back later!
                    </p>
                    <a
                        href="/"
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 sm:text-sm"
                    >
                        Return to Dashboard
                    </a>
                </div>
            </main>
        </div>
    )
}
