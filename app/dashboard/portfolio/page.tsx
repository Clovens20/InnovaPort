/**
 * Page: Dashboard Portfolio Editor
 * 
 * Fonction: Permet au développeur d'éditer tous les éléments de son portfolio public
 * Dépendances: @supabase/supabase-js, react, next/navigation
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Save, Plus, Trash2, Check, X } from 'lucide-react';
import { Service, WorkProcessStep } from '@/types';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function PortfolioEditorPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Hero Section
    const [availableForWork, setAvailableForWork] = useState(true);
    const [heroTitle, setHeroTitle] = useState('');
    const [heroTitleEn, setHeroTitleEn] = useState('');
    const [heroSubtitle, setHeroSubtitle] = useState('');
    const [heroSubtitleEn, setHeroSubtitleEn] = useState('');
    const [heroDescription, setHeroDescription] = useState('');
    const [heroDescriptionEn, setHeroDescriptionEn] = useState('');

    // Stats
    const [statsYears, setStatsYears] = useState(5);
    const [statsProjects, setStatsProjects] = useState(15);
    const [statsClients, setStatsClients] = useState(10);
    const [statsResponseTime, setStatsResponseTime] = useState('48h');

    // Services
    const [services, setServices] = useState<Service[]>([]);

    // Work Process
    const [workProcess, setWorkProcess] = useState<WorkProcessStep[]>([]);

    // Technologies
    const [technologies, setTechnologies] = useState<string[]>([]);
    const [newTech, setNewTech] = useState('');

    // CTA
    const [ctaTitle, setCtaTitle] = useState('');
    const [ctaTitleEn, setCtaTitleEn] = useState('');
    const [ctaSubtitle, setCtaSubtitle] = useState('');
    const [ctaSubtitleEn, setCtaSubtitleEn] = useState('');
    const [ctaButtonText, setCtaButtonText] = useState('Demander un devis gratuit');
    const [ctaButtonTextEn, setCtaButtonTextEn] = useState('');
    const [ctaFooterText, setCtaFooterText] = useState('');
    const [ctaFooterTextEn, setCtaFooterTextEn] = useState('');

    // À propos
    const [aboutJourney, setAboutJourney] = useState('');
    const [aboutJourneyEn, setAboutJourneyEn] = useState('');
    const [aboutApproach, setAboutApproach] = useState('');
    const [aboutApproachEn, setAboutApproachEn] = useState('');
    const [aboutWhyChoose, setAboutWhyChoose] = useState('');
    const [aboutWhyChooseEn, setAboutWhyChooseEn] = useState('');

    // Charger les données existantes
    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            if (data) {
                setAvailableForWork(data.available_for_work ?? true);
                setHeroTitle(data.hero_title || '');
                setHeroTitleEn(data.hero_title_en || '');
                setHeroSubtitle(data.hero_subtitle || '');
                setHeroSubtitleEn(data.hero_subtitle_en || '');
                setHeroDescription(data.hero_description || '');
                setHeroDescriptionEn(data.hero_description_en || '');
                setStatsYears(data.stats_years_experience ?? 5);
                setStatsProjects(data.stats_projects_delivered ?? 15);
                setStatsClients(data.stats_clients_satisfied ?? 10);
                setStatsResponseTime(data.stats_response_time || '48h');
                setServices(data.services || []);
                setWorkProcess(data.work_process || []);
                setTechnologies(data.technologies_list || []);
                setCtaTitle(data.cta_title || '');
                setCtaTitleEn(data.cta_title_en || '');
                setCtaSubtitle(data.cta_subtitle || '');
                setCtaSubtitleEn(data.cta_subtitle_en || '');
                setCtaButtonText(data.cta_button_text || 'Demander un devis gratuit');
                setCtaButtonTextEn(data.cta_button_text_en || '');
                setCtaFooterText(data.cta_footer_text || '');
                setCtaFooterTextEn(data.cta_footer_text_en || '');
                setAboutJourney(data.about_journey || '');
                setAboutJourneyEn(data.about_journey_en || '');
                setAboutApproach(data.about_approach || '');
                setAboutApproachEn(data.about_approach_en || '');
                setAboutWhyChoose(data.about_why_choose || '');
                setAboutWhyChooseEn(data.about_why_choose_en || '');
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            setMessage({ type: 'error', text: t('dashboard.portfolio.errorLoading') });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Non authentifié');

            const { error } = await supabase
                .from('profiles')
                .update({
                    available_for_work: availableForWork,
                    hero_title: heroTitle || null,
                    hero_title_en: heroTitleEn || null,
                    hero_subtitle: heroSubtitle || null,
                    hero_subtitle_en: heroSubtitleEn || null,
                    hero_description: heroDescription || null,
                    hero_description_en: heroDescriptionEn || null,
                    stats_years_experience: statsYears,
                    stats_projects_delivered: statsProjects,
                    stats_clients_satisfied: statsClients,
                    stats_response_time: statsResponseTime,
                    services: services.length > 0 ? services : null,
                    work_process: workProcess.length > 0 ? workProcess : null,
                    technologies_list: technologies.length > 0 ? technologies : null,
                    cta_title: ctaTitle || null,
                    cta_title_en: ctaTitleEn || null,
                    cta_subtitle: ctaSubtitle || null,
                    cta_subtitle_en: ctaSubtitleEn || null,
                    cta_button_text: ctaButtonText || null,
                    cta_button_text_en: ctaButtonTextEn || null,
                    cta_footer_text: ctaFooterText || null,
                    cta_footer_text_en: ctaFooterTextEn || null,
                    about_journey: aboutJourney || null,
                    about_journey_en: aboutJourneyEn || null,
                    about_approach: aboutApproach || null,
                    about_approach_en: aboutApproachEn || null,
                    about_why_choose: aboutWhyChoose || null,
                    about_why_choose_en: aboutWhyChooseEn || null,
                })
                .eq('id', user.id);

            if (error) throw error;

            setMessage({ type: 'success', text: t('dashboard.portfolio.success') });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Error saving profile:', error);
            setMessage({ type: 'error', text: t('dashboard.portfolio.error') });
        } finally {
            setSaving(false);
        }
    };

    // Gestion des services
    const addService = () => {
        setServices([...services, { 
            name: '', 
            description: '', 
            price: '', 
            features: [],
            icon: 'globe',
            targetCategories: [],
            exampleProject: ''
        }]);
    };

    const updateService = (index: number, field: keyof Service, value: any) => {
        const updated = [...services];
        updated[index] = { ...updated[index], [field]: value };
        setServices(updated);
    };

    const removeService = (index: number) => {
        setServices(services.filter((_, i) => i !== index));
    };

    const addServiceFeature = (serviceIndex: number) => {
        const updated = [...services];
        updated[serviceIndex].features = [...(updated[serviceIndex].features || []), ''];
        setServices(updated);
    };

    const updateServiceFeature = (serviceIndex: number, featureIndex: number, value: string) => {
        const updated = [...services];
        if (!updated[serviceIndex].features) updated[serviceIndex].features = [];
        updated[serviceIndex].features[featureIndex] = value;
        setServices(updated);
    };

    const removeServiceFeature = (serviceIndex: number, featureIndex: number) => {
        const updated = [...services];
        if (updated[serviceIndex].features) {
            updated[serviceIndex].features = updated[serviceIndex].features.filter((_, i) => i !== featureIndex);
        }
        setServices(updated);
    };

    // Gestion des catégories cibles
    const addServiceCategory = (serviceIndex: number) => {
        const updated = [...services];
        if (!updated[serviceIndex].targetCategories) {
            updated[serviceIndex].targetCategories = [];
        }
        updated[serviceIndex].targetCategories = [
            ...(updated[serviceIndex].targetCategories || []),
            { emoji: '✨', label: '' }
        ];
        setServices(updated);
    };

    const updateServiceCategory = (serviceIndex: number, categoryIndex: number, field: 'emoji' | 'label', value: string) => {
        const updated = [...services];
        if (!updated[serviceIndex].targetCategories) {
            updated[serviceIndex].targetCategories = [];
        }
        updated[serviceIndex].targetCategories[categoryIndex] = {
            ...updated[serviceIndex].targetCategories[categoryIndex],
            [field]: value
        };
        setServices(updated);
    };

    const removeServiceCategory = (serviceIndex: number, categoryIndex: number) => {
        const updated = [...services];
        if (updated[serviceIndex].targetCategories) {
            updated[serviceIndex].targetCategories = updated[serviceIndex].targetCategories.filter((_, i) => i !== categoryIndex);
        }
        setServices(updated);
    };

    // Gestion du process de travail
    const addWorkProcessStep = () => {
        setWorkProcess([...workProcess, { num: workProcess.length + 1, title: '', description: '' }]);
    };

    const updateWorkProcessStep = (index: number, field: keyof WorkProcessStep, value: any) => {
        const updated = [...workProcess];
        updated[index] = { ...updated[index], [field]: value };
        // Réorganiser les numéros
        updated.forEach((step, i) => {
            step.num = i + 1;
        });
        setWorkProcess(updated);
    };

    const removeWorkProcessStep = (index: number) => {
        const updated = workProcess.filter((_, i) => i !== index);
        updated.forEach((step, i) => {
            step.num = i + 1;
        });
        setWorkProcess(updated);
    };

    // Gestion des technologies
    const addTechnology = () => {
        if (newTech.trim() && !technologies.includes(newTech.trim())) {
            setTechnologies([...technologies, newTech.trim()]);
            setNewTech('');
        }
    };

    const removeTechnology = (tech: string) => {
        setTechnologies(technologies.filter((t) => t !== tech));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.portfolio.title')}</h1>
                    <p className="text-gray-600 mt-2">{t('dashboard.portfolio.subtitle')}</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <Save className="w-5 h-5" />
                    {saving ? t('dashboard.portfolio.saving') : t('dashboard.portfolio.save')}
                </button>
            </div>

            {message && (
                <div
                    className={`p-4 rounded-lg ${
                        message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}
                >
                    {message.text}
                </div>
            )}

            {/* Hero Section */}
            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold mb-6">{t('dashboard.portfolio.hero.title')}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="flex items-center gap-2 mb-2">
                            <input
                                type="checkbox"
                                checked={availableForWork}
                                onChange={(e) => setAvailableForWork(e.target.checked)}
                                className="rounded"
                            />
                            <span className="font-medium">{t('dashboard.portfolio.hero.availableForWork')}</span>
                        </label>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.portfolio.hero.mainTitle')} (FR)</label>
                        <input
                            type="text"
                            value={heroTitle}
                            onChange={(e) => setHeroTitle(e.target.value)}
                            placeholder={t('dashboard.portfolio.hero.mainTitlePlaceholder')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none mb-2"
                        />
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.portfolio.hero.mainTitle')} (EN) <span className="text-gray-400 font-normal">- {t('common.optional')}</span></label>
                        <input
                            type="text"
                            value={heroTitleEn}
                            onChange={(e) => setHeroTitleEn(e.target.value)}
                            placeholder="I transform your ideas into high-performance web applications"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.portfolio.hero.subtitle')} (FR)</label>
                        <input
                            type="text"
                            value={heroSubtitle}
                            onChange={(e) => setHeroSubtitle(e.target.value)}
                            placeholder={t('dashboard.portfolio.hero.subtitlePlaceholder')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none mb-2"
                        />
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.portfolio.hero.subtitle')} (EN) <span className="text-gray-400 font-normal">- {t('common.optional')}</span></label>
                        <input
                            type="text"
                            value={heroSubtitleEn}
                            onChange={(e) => setHeroSubtitleEn(e.target.value)}
                            placeholder="Solutions tailored to your needs and budget"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.portfolio.hero.description')} (FR)</label>
                        <textarea
                            value={heroDescription}
                            onChange={(e) => setHeroDescription(e.target.value)}
                            placeholder={t('dashboard.portfolio.hero.descriptionPlaceholder')}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none mb-2"
                        />
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.portfolio.hero.description')} (EN) <span className="text-gray-400 font-normal">- {t('common.optional')}</span></label>
                        <textarea
                            value={heroDescriptionEn}
                            onChange={(e) => setHeroDescriptionEn(e.target.value)}
                            placeholder="Full-Stack Developer specialized in React, Next.js and Node.js..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold mb-6">{t('dashboard.portfolio.stats.title')}</h2>
                <div className="grid md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.portfolio.stats.yearsExperience')}</label>
                        <input
                            type="number"
                            value={statsYears}
                            onChange={(e) => setStatsYears(parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.portfolio.stats.projectsDelivered')}</label>
                        <input
                            type="number"
                            value={statsProjects}
                            onChange={(e) => setStatsProjects(parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.portfolio.stats.clientsSatisfied')}</label>
                        <input
                            type="number"
                            value={statsClients}
                            onChange={(e) => setStatsClients(parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.portfolio.stats.responseTime')}</label>
                        <input
                            type="text"
                            value={statsResponseTime}
                            onChange={(e) => setStatsResponseTime(e.target.value)}
                            placeholder={t('dashboard.portfolio.stats.responseTimePlaceholder')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{t('dashboard.portfolio.services.title')}</h2>
                    <button
                        onClick={addService}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        {t('dashboard.portfolio.services.addService')}
                    </button>
                </div>
                <div className="space-y-6">
                    {services.map((service, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-semibold">{t('dashboard.portfolio.services.serviceNumber', { number: index + 1 })}</h3>
                                <button
                                    onClick={() => removeService(index)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.portfolio.services.name')}</label>
                                    <input
                                        type="text"
                                        value={service.name}
                                        onChange={(e) => updateService(index, 'name', e.target.value)}
                                        placeholder={t('dashboard.portfolio.services.namePlaceholder')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.portfolio.services.icon')}</label>
                                    <select
                                        value={service.icon || 'globe'}
                                        onChange={(e) => updateService(index, 'icon', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                                    >
                                        <option value="globe">🌐 Site Web</option>
                                        <option value="code">💻 Application</option>
                                        <option value="shopping">🛒 E-commerce</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.portfolio.services.price')}</label>
                                    <input
                                        type="text"
                                        value={service.price}
                                        onChange={(e) => updateService(index, 'price', e.target.value)}
                                        placeholder={t('dashboard.portfolio.services.pricePlaceholder')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.portfolio.services.description')}</label>
                                <textarea
                                    value={service.description}
                                    onChange={(e) => updateService(index, 'description', e.target.value)}
                                    placeholder={t('dashboard.portfolio.services.descriptionPlaceholder')}
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                                />
                            </div>
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">{t('dashboard.portfolio.services.features')}</label>
                                    <button
                                        onClick={() => addServiceFeature(index)}
                                        className="text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        <Plus className="w-4 h-4 inline" /> {t('dashboard.portfolio.services.addFeature')}
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {service.features?.map((feature, fIndex) => (
                                        <div key={fIndex} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={feature}
                                                onChange={(e) => updateServiceFeature(index, fIndex, e.target.value)}
                                                placeholder={t('dashboard.portfolio.services.featurePlaceholder')}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                                            />
                                            <button
                                                onClick={() => removeServiceFeature(index, fIndex)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Catégories cibles */}
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">{t('dashboard.portfolio.services.targetCategories')}</label>
                                    <button
                                        onClick={() => addServiceCategory(index)}
                                        className="text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        <Plus className="w-4 h-4 inline" /> {t('dashboard.portfolio.services.addFeature')}
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {service.targetCategories?.map((category, cIndex) => (
                                        <div key={cIndex} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={category.emoji}
                                                onChange={(e) => updateServiceCategory(index, cIndex, 'emoji', e.target.value)}
                                                placeholder={t('dashboard.portfolio.services.categoryEmojiPlaceholder')}
                                                className="w-16 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-center"
                                                maxLength={2}
                                            />
                                            <input
                                                type="text"
                                                value={category.label}
                                                onChange={(e) => updateServiceCategory(index, cIndex, 'label', e.target.value)}
                                                placeholder={t('dashboard.portfolio.services.categoryLabelPlaceholder')}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                                            />
                                            <button
                                                onClick={() => removeServiceCategory(index, cIndex)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Exemple de projet */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.portfolio.services.exampleProject')}</label>
                                <textarea
                                    value={service.exampleProject || ''}
                                    onChange={(e) => updateService(index, 'exampleProject', e.target.value)}
                                    placeholder={t('dashboard.portfolio.services.exampleProjectPlaceholder')}
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Work Process Section */}
            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{t('dashboard.portfolio.workProcess.title')}</h2>
                    <button
                        onClick={addWorkProcessStep}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        {t('dashboard.portfolio.workProcess.addStep')}
                    </button>
                </div>
                <div className="space-y-4">
                    {workProcess.map((step, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                        {step.num}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={step.title}
                                            onChange={(e) => updateWorkProcessStep(index, 'title', e.target.value)}
                                            placeholder={t('dashboard.portfolio.workProcess.stepTitle')}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none mb-2"
                                        />
                                        <textarea
                                            value={step.description}
                                            onChange={(e) => updateWorkProcessStep(index, 'description', e.target.value)}
                                            placeholder={t('dashboard.portfolio.workProcess.stepDescription')}
                                            rows={2}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeWorkProcessStep(index)}
                                    className="text-red-600 hover:text-red-700 ml-4"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Technologies Section */}
            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold mb-6">{t('dashboard.portfolio.technologies.title')}</h2>
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newTech}
                        onChange={(e) => setNewTech(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTechnology()}
                        placeholder={t('dashboard.portfolio.technologies.addTechnology')}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                    <button
                        onClick={addTechnology}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {technologies.map((tech) => (
                        <span
                            key={tech}
                            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-medium flex items-center gap-2"
                        >
                            {tech}
                            <button
                                onClick={() => removeTechnology(tech)}
                                className="text-blue-700 hover:text-blue-900"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </span>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold mb-6">{t('dashboard.portfolio.cta.title')}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.portfolio.cta.ctaTitle')} (FR)</label>
                        <input
                            type="text"
                            value={ctaTitle}
                            onChange={(e) => setCtaTitle(e.target.value)}
                            placeholder={t('dashboard.portfolio.cta.ctaTitlePlaceholder')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none mb-2"
                        />
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.portfolio.cta.ctaTitle')} (EN) <span className="text-gray-400 font-normal">- {t('common.optional')}</span></label>
                        <input
                            type="text"
                            value={ctaTitleEn}
                            onChange={(e) => setCtaTitleEn(e.target.value)}
                            placeholder="Ready to start your project?"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.portfolio.cta.ctaSubtitle')} (FR)</label>
                        <input
                            type="text"
                            value={ctaSubtitle}
                            onChange={(e) => setCtaSubtitle(e.target.value)}
                            placeholder={t('dashboard.portfolio.cta.ctaSubtitlePlaceholder')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none mb-2"
                        />
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.portfolio.cta.ctaSubtitle')} (EN) <span className="text-gray-400 font-normal">- {t('common.optional')}</span></label>
                        <input
                            type="text"
                            value={ctaSubtitleEn}
                            onChange={(e) => setCtaSubtitleEn(e.target.value)}
                            placeholder="Get a free quote in less than 48h"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.portfolio.cta.buttonText')} (FR)</label>
                        <input
                            type="text"
                            value={ctaButtonText}
                            onChange={(e) => setCtaButtonText(e.target.value)}
                            placeholder={t('dashboard.portfolio.cta.buttonTextPlaceholder')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none mb-2"
                        />
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.portfolio.cta.buttonText')} (EN) <span className="text-gray-400 font-normal">- {t('common.optional')}</span></label>
                        <input
                            type="text"
                            value={ctaButtonTextEn}
                            onChange={(e) => setCtaButtonTextEn(e.target.value)}
                            placeholder="Request a free quote"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.portfolio.cta.footerText')} (FR)</label>
                        <input
                            type="text"
                            value={ctaFooterText}
                            onChange={(e) => setCtaFooterText(e.target.value)}
                            placeholder={t('dashboard.portfolio.cta.footerTextPlaceholder')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none mb-2"
                        />
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.portfolio.cta.footerText')} (EN) <span className="text-gray-400 font-normal">- {t('common.optional')}</span></label>
                        <input
                            type="text"
                            value={ctaFooterTextEn}
                            onChange={(e) => setCtaFooterTextEn(e.target.value)}
                            placeholder="No commitment • Quick response • Advice included"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                    </div>
                </div>
            </section>

            {/* À propos Section */}
            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold mb-6">{t('dashboard.portfolio.about.title')}</h2>
                <p className="text-gray-600 mb-6 text-sm">
                    {t('dashboard.portfolio.about.description')}
                </p>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('dashboard.portfolio.about.journey')} (FR) <span className="text-gray-500">{t('dashboard.portfolio.about.optional')}</span>
                        </label>
                        <textarea
                            value={aboutJourney}
                            onChange={(e) => setAboutJourney(e.target.value)}
                            placeholder={t('dashboard.portfolio.about.journeyPlaceholder')}
                            rows={6}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none resize-none mb-2"
                        />
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('dashboard.portfolio.about.journey')} (EN) <span className="text-gray-400 font-normal">- {t('common.optional')}</span>
                        </label>
                        <textarea
                            value={aboutJourneyEn}
                            onChange={(e) => setAboutJourneyEn(e.target.value)}
                            placeholder="Describe your professional journey, experiences, training..."
                            rows={6}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {t('dashboard.portfolio.about.journeyHint')}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('dashboard.portfolio.about.approach')} (FR) <span className="text-gray-500">{t('dashboard.portfolio.about.optional')}</span>
                        </label>
                        <textarea
                            value={aboutApproach}
                            onChange={(e) => setAboutApproach(e.target.value)}
                            placeholder={t('dashboard.portfolio.about.approachPlaceholder')}
                            rows={6}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none resize-none mb-2"
                        />
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('dashboard.portfolio.about.approach')} (EN) <span className="text-gray-400 font-normal">- {t('common.optional')}</span>
                        </label>
                        <textarea
                            value={aboutApproachEn}
                            onChange={(e) => setAboutApproachEn(e.target.value)}
                            placeholder="Explain your working method, process, how you approach projects..."
                            rows={6}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {t('dashboard.portfolio.about.approachHint')}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('dashboard.portfolio.about.whyChoose')} (FR) <span className="text-gray-500">{t('dashboard.portfolio.about.optional')}</span>
                        </label>
                        <textarea
                            value={aboutWhyChoose}
                            onChange={(e) => setAboutWhyChoose(e.target.value)}
                            placeholder={t('dashboard.portfolio.about.whyChoosePlaceholder')}
                            rows={6}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none resize-none mb-2"
                        />
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('dashboard.portfolio.about.whyChoose')} (EN) <span className="text-gray-400 font-normal">- {t('common.optional')}</span>
                        </label>
                        <textarea
                            value={aboutWhyChooseEn}
                            onChange={(e) => setAboutWhyChooseEn(e.target.value)}
                            placeholder="Highlight your strengths, differences, what makes you unique..."
                            rows={6}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {t('dashboard.portfolio.about.whyChooseHint')}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

