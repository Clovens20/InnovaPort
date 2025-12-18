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
            // Générer un PDF en HTML formaté (s'ouvre comme PDF dans le navigateur)
            const pdfContent = generatePDFContent(quote, id);
            
            return new NextResponse(pdfContent, {
                headers: {
                    'Content-Type': 'text/html',
                    'Content-Disposition': `attachment; filename="devis-${quote.name.replace(/\s+/g, '-')}-${id.substring(0, 8)}.html"`,
                },
            });
        } else if (format === 'excel') {
            // Générer un CSV bien formaté (s'ouvre dans Excel)
            const csvContent = generateCSVContent(quote);
            
            // Ajouter le BOM UTF-8 pour Excel
            const bom = '\uFEFF';
            const csvWithBom = bom + csvContent;
            
            return new NextResponse(csvWithBom, {
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename="devis-${quote.name.replace(/\s+/g, '-')}-${id.substring(0, 8)}.csv"`,
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

function generatePDFContent(quote: any, id: string): string {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const escapeHtml = (text: string | null | undefined) => {
        if (!text) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    const features = Array.isArray(quote.features) ? quote.features : [];
    const platforms = quote.platforms && typeof quote.platforms === 'object' 
        ? Object.entries(quote.platforms)
            .filter(([_, value]) => value === true)
            .map(([key]) => key)
        : [];

    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Devis - ${escapeHtml(quote.name)}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 40px;
            background: #fff;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
        }
        .header {
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2563eb;
            font-size: 28px;
            margin-bottom: 10px;
        }
        .header .date {
            color: #666;
            font-size: 14px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        .info-item {
            margin-bottom: 15px;
        }
        .info-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }
        .info-value {
            font-size: 15px;
            color: #111827;
            font-weight: 500;
        }
        .description {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
            margin-top: 10px;
            white-space: pre-wrap;
            line-height: 1.8;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            margin-right: 8px;
            margin-bottom: 8px;
        }
        .badge-blue {
            background: #dbeafe;
            color: #1e40af;
        }
        .badge-green {
            background: #d1fae5;
            color: #065f46;
        }
        .badge-gray {
            background: #f3f4f6;
            color: #374151;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
        @media print {
            body { padding: 20px; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Demande de Devis</h1>
            <div class="date">Reçue le ${formatDate(quote.created_at)}</div>
        </div>

        <div class="section">
            <div class="section-title">Informations du client</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Nom</div>
                    <div class="info-value">${escapeHtml(quote.name)}</div>
                </div>
                ${quote.company ? `
                <div class="info-item">
                    <div class="info-label">Entreprise</div>
                    <div class="info-value">${escapeHtml(quote.company)}</div>
                </div>
                ` : ''}
                <div class="info-item">
                    <div class="info-label">Email</div>
                    <div class="info-value">${escapeHtml(quote.email)}</div>
                </div>
                ${quote.phone ? `
                <div class="info-item">
                    <div class="info-label">Téléphone</div>
                    <div class="info-value">${escapeHtml(quote.phone)}</div>
                </div>
                ` : ''}
                ${quote.location ? `
                <div class="info-item">
                    <div class="info-label">Localisation</div>
                    <div class="info-value">${escapeHtml(quote.location)}</div>
                </div>
                ` : ''}
                <div class="info-item">
                    <div class="info-label">Préférence de contact</div>
                    <div class="info-value">${escapeHtml(quote.contact_pref || 'Email')}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Détails du projet</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Type de projet</div>
                    <div class="info-value">${escapeHtml(quote.project_type)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Budget estimé</div>
                    <div class="info-value" style="color: #2563eb; font-weight: 600;">${escapeHtml(quote.budget)}</div>
                </div>
                ${quote.deadline ? `
                <div class="info-item">
                    <div class="info-label">Délai souhaité</div>
                    <div class="info-value">${escapeHtml(quote.deadline)}</div>
                </div>
                ` : ''}
                ${quote.design_pref ? `
                <div class="info-item">
                    <div class="info-label">Préférence de design</div>
                    <div class="info-value">${escapeHtml(quote.design_pref)}</div>
                </div>
                ` : ''}
            </div>
            
            ${platforms.length > 0 ? `
            <div class="info-item">
                <div class="info-label">Plateformes ciblées</div>
                <div>
                    ${platforms.map((p: string) => `<span class="badge badge-blue">${escapeHtml(p.toUpperCase())}</span>`).join('')}
                </div>
            </div>
            ` : ''}
            
            ${features.length > 0 ? `
            <div class="info-item">
                <div class="info-label">Fonctionnalités demandées</div>
                <div>
                    ${features.map((f: string) => `<span class="badge badge-gray">${escapeHtml(f)}</span>`).join('')}
                </div>
            </div>
            ` : ''}
            
            <div class="info-item">
                <div class="info-label">Description du projet</div>
                <div class="description">${escapeHtml(quote.description)}</div>
            </div>
            
            ${quote.has_vague_idea ? `
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px; margin-top: 15px;">
                <strong>Note:</strong> Le client a indiqué avoir une idée vague du projet.
            </div>
            ` : ''}
        </div>

        <div class="section">
            <div class="section-title">Consentements</div>
            <div class="info-item">
                <div style="margin-bottom: 8px;">
                    ${quote.consent_privacy ? '✓' : '✗'} Politique de confidentialité acceptée
                </div>
                <div>
                    ${quote.consent_contact ? '✓' : '-'} Consentement pour être contacté
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Document généré le ${new Date().toLocaleDateString('fr-FR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</p>
            <p style="margin-top: 5px;">ID: ${id}</p>
        </div>
    </div>
</body>
</html>`;
}

function generateCSVContent(quote: any): string {
    const escapeCSV = (value: any): string => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        // Échapper les guillemets et remplacer les retours à la ligne
        return `"${str.replace(/"/g, '""').replace(/\n/g, ' ').replace(/\r/g, '')}"`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const features = Array.isArray(quote.features) ? quote.features.join('; ') : '';
    const platforms = quote.platforms && typeof quote.platforms === 'object' 
        ? Object.entries(quote.platforms)
            .filter(([_, value]) => value === true)
            .map(([key]) => key)
            .join('; ')
        : '';

    const rows = [
        // En-têtes
        [
            'Nom',
            'Email',
            'Téléphone',
            'Entreprise',
            'Localisation',
            'Type de projet',
            'Plateformes',
            'Budget',
            'Délai',
            'Préférence de design',
            'Fonctionnalités',
            'Description',
            'Idée vague',
            'Préférence de contact',
            'Consentement confidentialité',
            'Consentement contact',
            'Statut',
            'Date de création',
            'Date de mise à jour',
        ],
        // Données
        [
            quote.name || '',
            quote.email || '',
            quote.phone || '',
            quote.company || '',
            quote.location || '',
            quote.project_type || '',
            platforms,
            quote.budget || '',
            quote.deadline || '',
            quote.design_pref || '',
            features,
            quote.description || '',
            quote.has_vague_idea ? 'Oui' : 'Non',
            quote.contact_pref || 'Email',
            quote.consent_privacy ? 'Oui' : 'Non',
            quote.consent_contact ? 'Oui' : 'Non',
            quote.status || 'new',
            formatDate(quote.created_at),
            formatDate(quote.updated_at),
        ],
    ];

    return rows.map(row => row.map(cell => escapeCSV(cell)).join(',')).join('\n');
}

