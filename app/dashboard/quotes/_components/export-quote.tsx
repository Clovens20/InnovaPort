'use client';

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Quote } from '@/types';
import { hasFeature } from '@/lib/subscription-limits';

interface ExportQuoteProps {
    quote: Quote;
    subscriptionTier: 'free' | 'pro' | 'premium';
}

export function ExportQuote({ quote, subscriptionTier }: ExportQuoteProps) {
    const [exportingPDF, setExportingPDF] = useState(false);
    const [exportingExcel, setExportingExcel] = useState(false);

    const exportToPDF = async () => {
        if (!hasFeature(subscriptionTier, 'exportPDF')) {
            alert('Cette fonctionnalité est disponible uniquement pour les plans Pro et Premium.');
            return;
        }

        if (exportingPDF) return; // Éviter les doubles clics

        setExportingPDF(true);
        try {
            const response = await fetch(`/api/quotes/${quote.id}/export?format=pdf`, {
                method: 'GET',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const fileName = `devis-${quote.name.replace(/\s+/g, '-')}-${quote.id.substring(0, 8)}.html`;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            
            // Nettoyer après un court délai
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }, 100);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'export PDF';
            alert(`Erreur: ${errorMessage}`);
        } finally {
            setExportingPDF(false);
        }
    };

    const exportToExcel = async () => {
        if (!hasFeature(subscriptionTier, 'exportExcel')) {
            alert('Cette fonctionnalité est disponible uniquement pour les plans Pro et Premium.');
            return;
        }

        if (exportingExcel) return; // Éviter les doubles clics

        setExportingExcel(true);
        try {
            const response = await fetch(`/api/quotes/${quote.id}/export?format=excel`, {
                method: 'GET',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const fileName = `devis-${quote.name.replace(/\s+/g, '-')}-${quote.id.substring(0, 8)}.csv`;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            
            // Nettoyer après un court délai
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }, 100);
        } catch (error) {
            console.error('Error exporting Excel:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'export Excel';
            alert(`Erreur: ${errorMessage}`);
        } finally {
            setExportingExcel(false);
        }
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={exportToPDF}
                disabled={exportingPDF || exportingExcel || !hasFeature(subscriptionTier, 'exportPDF')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm min-w-[100px]"
                title={!hasFeature(subscriptionTier, 'exportPDF') ? 'Disponible avec le plan Pro' : 'Exporter en PDF'}
            >
                {exportingPDF ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>PDF</span>
                    </>
                ) : (
                    <>
                        <FileText className="w-4 h-4" />
                        <span>PDF</span>
                    </>
                )}
            </button>
            <button
                onClick={exportToExcel}
                disabled={exportingPDF || exportingExcel || !hasFeature(subscriptionTier, 'exportExcel')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm min-w-[100px]"
                title={!hasFeature(subscriptionTier, 'exportExcel') ? 'Disponible avec le plan Pro' : 'Exporter en Excel'}
            >
                {exportingExcel ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Excel</span>
                    </>
                ) : (
                    <>
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Excel</span>
                    </>
                )}
            </button>
        </div>
    );
}

