import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const format = searchParams.get('format') || 'pdf';

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        // Récupérer le devis
        const { data: quote, error: quoteError } = await supabase
            .from('quotes')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (quoteError || !quote) {
            return NextResponse.json(
                { error: 'Devis non trouvé' },
                { status: 404 }
            );
        }

        if (format === 'pdf') {
            // Générer le PDF (utiliser une bibliothèque comme jsPDF ou puppeteer)
            // Pour l'instant, on retourne un JSON formaté
            const pdfContent = generatePDFContent(quote);
            
            return new NextResponse(pdfContent, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="devis-${id}.pdf"`,
                },
            });
        } else if (format === 'excel') {
            // Générer l'Excel (utiliser une bibliothèque comme exceljs)
            // Pour l'instant, on retourne un CSV
            const csvContent = generateCSVContent(quote);
            
            return new NextResponse(csvContent, {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': `attachment; filename="devis-${id}.xlsx"`,
                },
            });
        }

        return NextResponse.json(
            { error: 'Format non supporté' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error exporting quote:', error);
        return NextResponse.json(
            { error: 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}

function generatePDFContent(quote: any): string {
    // TODO: Implémenter la génération PDF avec jsPDF ou puppeteer
    // Pour l'instant, retourner un texte simple
    return `DEVIS - ${quote.name}\n\nEmail: ${quote.email}\nType: ${quote.project_type}\nBudget: ${quote.budget}`;
}

function generateCSVContent(quote: any): string {
    // Générer un CSV simple
    const rows = [
        ['Nom', 'Email', 'Téléphone', 'Type de projet', 'Budget', 'Description'],
        [
            quote.name || '',
            quote.email || '',
            quote.phone || '',
            quote.project_type || '',
            quote.budget || '',
            quote.description || '',
        ],
    ];

    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

