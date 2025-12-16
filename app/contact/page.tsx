'use client';

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, MessageSquare, Send } from "lucide-react";
import { Footer } from "@/app/_components/footer";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LanguageSwitcher } from "@/app/_components/language-switcher";
import { useState } from "react";

export default function ContactPage() {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Erreur lors de l\'envoi du message');
            }

            setSending(false);
            setSent(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error: any) {
            console.error('Error sending contact message:', error);
            setSending(false);
            alert(error.message || 'Erreur lors de l\'envoi du message. Veuillez réessayer.');
        }
    };

    return (
        <div className="min-h-screen bg-white">
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
            <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-12 sm:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1E3A8A] rounded-full mb-6">
                            <MessageSquare className="w-8 h-8 text-white" aria-hidden="true" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            {t('contact.title')}
                        </h1>
                        <p className="text-lg text-gray-600">
                            {t('contact.subtitle')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 sm:p-12">
                    {sent ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="w-8 h-8 text-green-600" aria-hidden="true" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {t('contact.success.title')}
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {t('contact.success.message')}
                            </p>
                            <button
                                onClick={() => setSent(false)}
                                className="px-6 py-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E40AF] transition-colors"
                            >
                                {t('contact.success.sendAnother')}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('contact.form.name')}
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                                    placeholder={t('contact.form.namePlaceholder')}
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('contact.form.email')}
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                                    placeholder={t('contact.form.emailPlaceholder')}
                                />
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('contact.form.subject')}
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                                    placeholder={t('contact.form.subjectPlaceholder')}
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('contact.form.message')}
                                </label>
                                <textarea
                                    id="message"
                                    required
                                    rows={6}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent resize-none"
                                    placeholder={t('contact.form.messagePlaceholder')}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full px-6 py-3 bg-[#1E3A8A] text-white rounded-lg font-semibold hover:bg-[#1E40AF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {sending ? (
                                    <>
                                        <span className="animate-spin">⏳</span>
                                        {t('contact.form.sending')}
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" aria-hidden="true" />
                                        {t('contact.form.send')}
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Contact Info */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-[#1E3A8A] mt-1 flex-shrink-0" aria-hidden="true" />
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">{t('contact.info.email')}</h3>
                                    <a
                                        href="mailto:support@innovaport.dev"
                                        className="text-gray-600 hover:text-[#1E3A8A] transition-colors"
                                    >
                                        support@innovaport.dev
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MessageSquare className="w-5 h-5 text-[#1E3A8A] mt-1 flex-shrink-0" aria-hidden="true" />
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">{t('contact.info.responseTime')}</h3>
                                    <p className="text-gray-600">
                                        {t('support.responseTimeValue')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
