'use client';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, Calendar, User, ArrowRight, Tag, Clock, Search, Filter, X } from "lucide-react";
import { Footer } from "@/app/_components/footer";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LanguageSwitcher } from "@/app/_components/language-switcher";
import { NewsletterForm } from "./_components/newsletter-form";

interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    author: string;
    date: string;
    category: string;
    readTime: string;
    image: string;
    slug: string;
}

export default function BlogPage() {
    const { t, language } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Articles de blog avec de belles images haute qualité
    const blogPosts: BlogPost[] = language === 'fr' ? [
        {
            id: 1,
            title: 'Comment créer un portfolio qui attire les clients',
            excerpt: 'Découvrez les meilleures pratiques pour créer un portfolio qui convertit les visiteurs en clients. Apprenez à présenter vos projets de manière professionnelle.',
            author: 'Équipe Innovaport',
            date: '15 Janvier 2025',
            category: 'Conseils',
            readTime: '5 min',
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop&q=80',
            slug: 'creer-portfolio-attire-clients',
        },
        {
            id: 2,
            title: '5 erreurs à éviter dans votre portfolio de développeur',
            excerpt: 'Les erreurs courantes qui peuvent nuire à votre image professionnelle et comment les éviter pour maximiser vos chances de décrocher des projets.',
            author: 'Équipe Innovaport',
            date: '10 Janvier 2025',
            category: 'Développement',
            readTime: '7 min',
            image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=800&fit=crop&q=80',
            slug: 'erreurs-portfolio-developpeur',
        },
        {
            id: 3,
            title: 'Optimiser votre présence en ligne en tant que freelance',
            excerpt: 'Stratégies pour améliorer votre visibilité et attirer plus de clients qualifiés grâce à une présence digitale optimisée.',
            author: 'Équipe Innovaport',
            date: '5 Janvier 2025',
            category: 'Marketing',
            readTime: '6 min',
            image: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=1200&h=800&fit=crop&q=80',
            slug: 'optimiser-presence-online-freelance',
        },
        {
            id: 4,
            title: 'Comment fixer vos tarifs en tant que développeur freelance',
            excerpt: 'Guide complet pour déterminer vos tarifs horaires et forfaitaires en fonction de votre expérience, votre localisation et votre marché.',
            author: 'Équipe Innovaport',
            date: '28 Décembre 2024',
            category: 'Conseils',
            readTime: '8 min',
            image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=800&fit=crop&q=80',
            slug: 'fixer-tarifs-developpeur-freelance',
        },
        {
            id: 5,
            title: 'Les meilleurs outils pour gérer vos projets freelance',
            excerpt: 'Découvrez les outils essentiels pour organiser vos projets, gérer votre temps et automatiser vos tâches administratives.',
            author: 'Équipe Innovaport',
            date: '20 Décembre 2024',
            category: 'Développement',
            readTime: '6 min',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop&q=80',
            slug: 'meilleurs-outils-projets-freelance',
        },
        {
            id: 6,
            title: 'Comment créer un devis professionnel qui convertit',
            excerpt: 'Apprenez à structurer vos devis pour maximiser vos chances d\'acceptation et présenter votre valeur de manière convaincante.',
            author: 'Équipe Innovaport',
            date: '15 Décembre 2024',
            category: 'Marketing',
            readTime: '5 min',
            image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=800&fit=crop&q=80',
            slug: 'creer-devis-professionnel-convertit',
        },
    ] : [
        {
            id: 1,
            title: 'How to Create a Portfolio That Attracts Clients',
            excerpt: 'Discover best practices for creating a portfolio that converts visitors into clients. Learn how to present your projects professionally.',
            author: 'Innovaport Team',
            date: 'January 15, 2025',
            category: 'Tips',
            readTime: '5 min',
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop&q=80',
            slug: 'create-portfolio-attracts-clients',
        },
        {
            id: 2,
            title: '5 Mistakes to Avoid in Your Developer Portfolio',
            excerpt: 'Common mistakes that can harm your professional image and how to avoid them to maximize your chances of landing projects.',
            author: 'Innovaport Team',
            date: 'January 10, 2025',
            category: 'Development',
            readTime: '7 min',
            image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=800&fit=crop&q=80',
            slug: 'mistakes-developer-portfolio',
        },
        {
            id: 3,
            title: 'Optimize Your Online Presence as a Freelancer',
            excerpt: 'Strategies to improve your visibility and attract more qualified clients through an optimized digital presence.',
            author: 'Innovaport Team',
            date: 'January 5, 2025',
            category: 'Marketing',
            readTime: '6 min',
            image: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=1200&h=800&fit=crop&q=80',
            slug: 'optimize-online-presence-freelancer',
        },
        {
            id: 4,
            title: 'How to Set Your Rates as a Freelance Developer',
            excerpt: 'Complete guide to determining your hourly and fixed rates based on your experience, location, and market.',
            author: 'Innovaport Team',
            date: 'December 28, 2024',
            category: 'Tips',
            readTime: '8 min',
            image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=800&fit=crop&q=80',
            slug: 'set-rates-freelance-developer',
        },
        {
            id: 5,
            title: 'Best Tools to Manage Your Freelance Projects',
            excerpt: 'Discover essential tools to organize your projects, manage your time, and automate your administrative tasks.',
            author: 'Innovaport Team',
            date: 'December 20, 2024',
            category: 'Development',
            readTime: '6 min',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop&q=80',
            slug: 'best-tools-freelance-projects',
        },
        {
            id: 6,
            title: 'How to Create a Professional Quote That Converts',
            excerpt: 'Learn how to structure your quotes to maximize your acceptance chances and present your value convincingly.',
            author: 'Innovaport Team',
            date: 'December 15, 2024',
            category: 'Marketing',
            readTime: '5 min',
            image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=800&fit=crop&q=80',
            slug: 'create-professional-quote-converts',
        },
    ];

    const categories = language === 'fr' 
        ? ['all', 'Conseils', 'Développement', 'Marketing']
        : ['all', 'Tips', 'Development', 'Marketing'];

    const filteredArticles = blogPosts.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categoryLabels: Record<string, string> = language === 'fr' 
        ? { all: 'Tous', Conseils: 'Conseils', Développement: 'Développement', Marketing: 'Marketing' }
        : { all: 'All', Tips: 'Tips', Development: 'Development', Marketing: 'Marketing' };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-gray-700 hover:text-[#1E3A8A] transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
                            <span className="text-sm font-medium hidden sm:inline">{t('legal.backToHome')}</span>
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
                        <LanguageSwitcher />
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-20 sm:py-28 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}></div>
                </div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
                            {t('blog.title')}
                        </h1>
                        <p className="text-xl sm:text-2xl text-blue-100 mb-8">
                            {t('blog.subtitle')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Search and Filter Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder={language === 'fr' ? 'Rechercher un article...' : 'Search for an article...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                                        selectedCategory === cat
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {categoryLabels[cat]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            {filteredArticles.length} {language === 'fr' 
                                ? filteredArticles.length > 1 ? 'articles trouvés' : 'article trouvé'
                                : filteredArticles.length > 1 ? 'articles found' : 'article found'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Blog Posts Grid */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                {filteredArticles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredArticles.map((post, index) => (
                            <article
                                key={post.id}
                                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Image Container */}
                                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100">
                                    {post.image ? (
                                        <Image
                                            src={post.image}
                                            alt={post.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            quality={90}
                                            onError={(e) => {
                                                // Fallback si l'image ne charge pas
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-200 to-indigo-200">
                                            <span className="text-gray-400 text-sm">Image</span>
                                        </div>
                                    )}
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    
                                    {/* Category Badge */}
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1.5 bg-blue-600 text-white rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    {/* Meta Info */}
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4" />
                                            <span>{post.date}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            <span>{post.readTime}</span>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                        {post.title}
                                    </h2>

                                    {/* Excerpt */}
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                                        {post.excerpt}
                                    </p>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <User className="w-4 h-4" />
                                            <span className="font-medium">{post.author}</span>
                                        </div>

                                        <Link
                                            href={`/blog/${post.slug}`}
                                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm group/link"
                                        >
                                            {language === 'fr' ? 'Lire la suite' : 'Read More'}
                                            <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                            <Search className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {language === 'fr' ? 'Aucun article trouvé' : 'No articles found'}
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            {language === 'fr' 
                                ? 'Essayez de modifier vos critères de recherche ou votre filtre'
                                : 'Try modifying your search criteria or filter'}
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('all');
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
                        >
                            {language === 'fr' ? 'Réinitialiser les filtres' : 'Reset Filters'}
                        </button>
                    </div>
                )}
            </main>

            {/* Newsletter CTA */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-center text-white overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v22H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z'/%3E%3C/g%3E%3C/svg%3E")`,
                        }}></div>
                    </div>
                    
                    <div className="relative z-10">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            {language === 'fr' ? 'Restez informé' : 'Stay Informed'}
                        </h2>
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                            {language === 'fr' 
                                ? 'Recevez nos derniers articles et conseils directement dans votre boîte mail'
                                : 'Receive our latest articles and tips directly in your inbox'}
                        </p>
                        <NewsletterForm language={language} />
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
