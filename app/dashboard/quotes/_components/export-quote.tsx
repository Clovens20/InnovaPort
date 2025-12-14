'use client';

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Quote } from '@/types';
import { hasFeature } from '@/lib/subscription-limits';

interface ExportQuoteProps {
    quote: Quote;
    subscriptionTier: 'free' | 'pro' | 'premium';
}

export function ExportQuote({ quote, subscriptionTier }: ExportQuoteProps) {
    const [exporting, setExporting] = useState(false);

    const exportToPDF = async () => {
        if (!hasFeature(subscriptionTier, 'exportPDF')) {
            alert('Cette fonctionnalité est disponible uniquement pour les plans Pro et Premium.');
            return;
        }

        setExporting(true);
        try {
            const response = await fetch(`/api/quotes/${quote.id}/export?format=pdf`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'export PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `devis-${quote.id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Erreur lors de l\'export PDF');
        } finally {
            setExporting(false);
        }
    };

    const exportToExcel = async () => {
        if (!hasFeature(subscriptionTier, 'exportExcel')) {
            alert('Cette fonctionnalité est disponible uniquement pour les plans Pro et Premium.');
            return;
        }

        setExporting(true);
        try {
            const response = await fetch(`/api/quotes/${quote.id}/export?format=excel`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'export Excel');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `devis-${quote.id}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error exporting Excel:', error);
            alert('Erreur lors de l\'export Excel');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={exportToPDF}
                disabled={exporting || !hasFeature(subscriptionTier, 'exportPDF')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title={!hasFeature(subscriptionTier, 'exportPDF') ? 'Disponible avec le plan Pro' : 'Exporter en PDF'}
            >
                <FileText className="w-4 h-4" />
                PDF
            </button>
            <button
                onClick={exportToExcel}
                disabled={exporting || !hasFeature(subscriptionTier, 'exportExcel')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title={!hasFeature(subscriptionTier, 'exportExcel') ? 'Disponible avec le plan Pro' : 'Exporter en Excel'}
            >
                <FileSpreadsheet className="w-4 h-4" />
                Excel
            </button>
        </div>
    );
}

