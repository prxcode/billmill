'use client'

import { Download } from 'lucide-react'
import { useState } from 'react'

interface DownloadPDFButtonProps {
    invoiceNumber: string
}

export function DownloadPDFButton({ invoiceNumber }: DownloadPDFButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleDownload = async () => {
        setLoading(true)
        try {
            const element = document.getElementById('invoice-printable')
            if (!element) {
                alert('Invoice area not found.')
                return
            }

            // Dynamically import heavy libraries only when needed
            const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
                import('jspdf'),
                import('html2canvas'),
            ])

            // Render the invoice element to a canvas
            const canvas = await html2canvas(element, {
                scale: 3,           // 3x on top of a 2400px base is extreme resolution
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 2400,   // Ultra-wide capture ensures tiny elements stay sharp
                onclone: (clonedDoc) => {
                    const a4 = clonedDoc.querySelector('.a4-container') as HTMLElement;
                    if (a4) {
                        a4.style.width = '2400px';
                        a4.style.maxWidth = 'none';
                        a4.style.height = 'auto';
                        a4.style.minHeight = 'auto';
                    }

                    const stamp = clonedDoc.querySelector('.stamp-container') as HTMLElement;
                    if (stamp) {
                        stamp.style.mixBlendMode = 'normal';
                        stamp.style.opacity = '1';
                        stamp.style.display = 'block';
                        stamp.style.visibility = 'visible';
                        // Force stamp to render at its natural resolution for the capture
                        stamp.style.width = '400px';
                        stamp.style.height = 'auto';
                        stamp.style.imageRendering = 'pixelated';

                        const stampImg = stamp.querySelector('img');
                        if (stampImg) {
                            stampImg.style.imageRendering = 'pixelated';
                            stampImg.style.width = '100%';
                            stampImg.style.height = 'auto';
                        }
                    }

                    // Global text sharpening for the high resolution capture
                    const allText = clonedDoc.querySelectorAll('div, span, td, th, p');
                    allText.forEach((el) => {
                        const style = (el as HTMLElement).style;
                        style.setProperty('-webkit-font-smoothing', 'antialiased');
                        style.setProperty('-moz-osx-font-smoothing', 'grayscale');
                        style.textRendering = 'optimizeLegibility';
                    });
                }
            })

            const imgData = canvas.toDataURL('image/png')

            // A4 dimensions in mm
            const pdfWidth = 210
            const pdfHeight = 297

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: false, // Save every single pixel
            })

            // Calculate height to maintain aspect ratio
            const imgHeight = (canvas.height * pdfWidth) / canvas.width

            // Add image
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight, undefined, 'SLOW')

            pdf.save(`Invoice-${invoiceNumber}.pdf`)
        } catch (err) {
            console.error('PDF generation failed', err)
            alert('PDF generation failed. Please try the Print button.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDownload}
            disabled={loading}
            className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
            <Download className="mr-2 h-4 w-4" />
            {loading ? 'Generating...' : 'Download PDF'}
        </button>
    )
}
