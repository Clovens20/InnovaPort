import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { unstable_cache } from 'next/cache';

interface PageProps {
    params: Promise<{ slug: string }>;
}

// Cache pour les pages légales publiées (5 minutes)
async function getCachedLegalPage(slug: string) {
    return unstable_cache(
        async () => {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('legal_pages')
                .select('*')
                .eq('slug', slug)
                .eq('status', 'published')
                .single();

            if (error || !data) return null;
            return data;
        },
        [`legal-page-${slug}`],
        {
            revalidate: 300, // 5 minutes
            tags: [`legal-${slug}`],
        }
    )();
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const page = await getCachedLegalPage(slug);

    if (!page) {
        return {
            title: 'Page non trouvée',
        };
    }

    return {
        title: page.meta_title || page.title,
        description: page.meta_description || `Page légale: ${page.title}`,
    };
}

export default async function LegalPageDynamic({ params }: PageProps) {
    const { slug } = await params;
    const page = await getCachedLegalPage(slug);

    if (!page) {
        notFound();
    }

    // Convertir le markdown en HTML simple (basique)
    const formatContent = (content: string) => {
        return content
            .split('\n')
            .map((line, index) => {
                // Titres
                if (line.startsWith('# ')) {
                    return `<h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">${line.substring(2)}</h1>`;
                }
                if (line.startsWith('## ')) {
                    return `<h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mt-8 mb-4">${line.substring(3)}</h2>`;
                }
                if (line.startsWith('### ')) {
                    return `<h3 class="text-xl sm:text-2xl font-bold text-gray-900 mt-6 mb-3">${line.substring(4)}</h3>`;
                }
                // Gras
                let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                // Liens
                formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#1E3A8A] hover:underline">$1</a>');
                // Paragraphes
                if (formatted.trim()) {
                    return `<p class="text-gray-700 leading-relaxed mb-4">${formatted}</p>`;
                }
                return '<br />';
            })
            .join('');
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation Sticky */}
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm" role="navigation">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-gray-700 hover:text-[#1E3A8A] transition-colors group"
                            aria-label="Retour à l'accueil"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
                            <span className="text-sm font-medium hidden sm:inline">Retour à l'accueil</span>
                        </Link>
                        <Link href="/" aria-label="Innovaport">
                            <Image
                                src="/innovaport-logo.png"
                                alt="InnovaPort Logo"
                                width={200}
                                height={60}
                                className="h-12 w-auto object-contain"
                                priority
                                sizes="200px"
                            />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
                <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: formatContent(page.content) }}
                />
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 mt-16 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
                        <Link href="/mentions-legales" className="hover:text-[#1E3A8A] transition-colors">
                            Mentions Légales
                        </Link>
                        <span>•</span>
                        <Link href="/politique-confidentialite" className="hover:text-[#1E3A8A] transition-colors">
                            Politique de Confidentialité
                        </Link>
                        <span>•</span>
                        <Link href="/conditions-utilisation" className="hover:text-[#1E3A8A] transition-colors">
                            Conditions d'Utilisation
                        </Link>
                        <span>•</span>
                        <Link href="/politique-cookies" className="hover:text-[#1E3A8A] transition-colors">
                            Politique de Cookies
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

