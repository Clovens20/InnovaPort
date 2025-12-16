'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Mail, MessageSquare, Calendar, User, Search, Filter, CheckCircle, XCircle, Archive, Reply, Eye } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string | null;
    message: string;
    status: 'new' | 'read' | 'replied' | 'archived';
    read_at: string | null;
    replied_at: string | null;
    created_at: string;
}

interface NewsletterSubscription {
    id: string;
    email: string;
    source: 'blog' | 'homepage' | 'footer' | 'other';
    status: 'active' | 'unsubscribed' | 'bounced';
    subscribed_at: string;
    unsubscribed_at: string | null;
    created_at: string;
}

export function MessagesClient() {
    const { t, language } = useTranslation();
    const [activeTab, setActiveTab] = useState<'contact' | 'newsletter'>('contact');
    const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
    const [newsletterSubscriptions, setNewsletterSubscriptions] = useState<NewsletterSubscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'read' | 'replied' | 'archived'>('all');
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        const supabase = createClient();

        try {
            if (activeTab === 'contact') {
                const { data, error } = await supabase
                    .from('contact_messages')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setContactMessages((data || []) as ContactMessage[]);
            } else {
                const { data, error } = await supabase
                    .from('newsletter_subscriptions')
                    .select('*')
                    .order('subscribed_at', { ascending: false });

                if (error) throw error;
                setNewsletterSubscriptions((data || []) as NewsletterSubscription[]);
            }
        } catch (error: any) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateMessageStatus = async (messageId: string, newStatus: string) => {
        const supabase = createClient();
        const updateData: any = { status: newStatus };

        if (newStatus === 'read' && !selectedMessage?.read_at) {
            updateData.read_at = new Date().toISOString();
        }
        if (newStatus === 'replied' && !selectedMessage?.replied_at) {
            updateData.replied_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('contact_messages')
            .update(updateData)
            .eq('id', messageId);

        if (error) {
            console.error('Error updating message status:', error);
            return;
        }

        await loadData();
        if (selectedMessage?.id === messageId) {
            setSelectedMessage({ ...selectedMessage, ...updateData });
        }
    };

    const filteredContactMessages = contactMessages.filter(msg => {
        const matchesSearch = msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             (msg.subject && msg.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
                             msg.message.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const filteredNewsletterSubscriptions = newsletterSubscriptions.filter(sub => {
        return sub.email.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const getStatusBadge = (status: string) => {
        const badges = {
            new: 'bg-blue-100 text-blue-700',
            read: 'bg-gray-100 text-gray-700',
            replied: 'bg-green-100 text-green-700',
            archived: 'bg-gray-200 text-gray-600',
            active: 'bg-green-100 text-green-700',
            unsubscribed: 'bg-red-100 text-red-700',
            bounced: 'bg-orange-100 text-orange-700',
        };
        return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-700';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    {language === 'fr' ? 'Messages et Inscriptions' : 'Messages & Subscriptions'}
                </h1>
                <p className="text-gray-600 mt-2">
                    {language === 'fr' 
                        ? 'Gérez les messages de contact et les inscriptions à la newsletter'
                        : 'Manage contact messages and newsletter subscriptions'}
                </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-4">
                    <button
                        onClick={() => {
                            setActiveTab('contact');
                            setSearchQuery('');
                            setStatusFilter('all');
                            setSelectedMessage(null);
                        }}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                            activeTab === 'contact'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            {language === 'fr' ? 'Messages de Contact' : 'Contact Messages'}
                            {contactMessages.length > 0 && (
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                                    {contactMessages.length}
                                </span>
                            )}
                        </div>
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('newsletter');
                            setSearchQuery('');
                            setSelectedMessage(null);
                        }}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                            activeTab === 'newsletter'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Mail className="w-5 h-5" />
                            {language === 'fr' ? 'Newsletter' : 'Newsletter'}
                            {newsletterSubscriptions.length > 0 && (
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                                    {newsletterSubscriptions.length}
                                </span>
                            )}
                        </div>
                    </button>
                </nav>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                {activeTab === 'contact' && (
                    <div className="flex gap-2">
                        {(['all', 'new', 'read', 'replied', 'archived'] as const).map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    statusFilter === status
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {language === 'fr' 
                                    ? { all: 'Tous', new: 'Nouveaux', read: 'Lus', replied: 'Répondus', archived: 'Archivés' }[status]
                                    : { all: 'All', new: 'New', read: 'Read', replied: 'Replied', archived: 'Archived' }[status]}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">{language === 'fr' ? 'Chargement...' : 'Loading...'}</p>
                </div>
            ) : activeTab === 'contact' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Messages List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="p-4 border-b border-gray-200">
                                <h2 className="font-semibold text-gray-900">
                                    {language === 'fr' ? 'Messages' : 'Messages'} ({filteredContactMessages.length})
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                                {filteredContactMessages.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        {language === 'fr' ? 'Aucun message trouvé' : 'No messages found'}
                                    </div>
                                ) : (
                                    filteredContactMessages.map((message) => (
                                        <div
                                            key={message.id}
                                            onClick={() => setSelectedMessage(message)}
                                            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                                                selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                                            }`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 mb-1">
                                                        {message.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-1">{message.email}</p>
                                                    {message.subject && (
                                                        <p className="text-sm font-medium text-gray-900 mb-2">
                                                            {message.subject}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(message.status)}`}>
                                                    {language === 'fr' 
                                                        ? { new: 'Nouveau', read: 'Lu', replied: 'Répondu', archived: 'Archivé' }[message.status]
                                                        : { new: 'New', read: 'Read', replied: 'Replied', archived: 'Archived' }[message.status]}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                {message.message}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatDate(message.created_at)}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Message Detail */}
                    <div className="lg:col-span-1">
                        {selectedMessage ? (
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sticky top-4">
                                <div className="flex items-start justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {language === 'fr' ? 'Détails du message' : 'Message Details'}
                                    </h2>
                                    <button
                                        onClick={() => setSelectedMessage(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            {language === 'fr' ? 'Nom' : 'Name'}
                                        </label>
                                        <p className="text-gray-900 font-semibold">{selectedMessage.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            {language === 'fr' ? 'Email' : 'Email'}
                                        </label>
                                        <p className="text-gray-900">
                                            <a href={`mailto:${selectedMessage.email}`} className="text-blue-600 hover:underline">
                                                {selectedMessage.email}
                                            </a>
                                        </p>
                                    </div>
                                    {selectedMessage.subject && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">
                                                {language === 'fr' ? 'Sujet' : 'Subject'}
                                            </label>
                                            <p className="text-gray-900">{selectedMessage.subject}</p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            {language === 'fr' ? 'Message' : 'Message'}
                                        </label>
                                        <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            {language === 'fr' ? 'Date' : 'Date'}
                                        </label>
                                        <p className="text-gray-900">{formatDate(selectedMessage.created_at)}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                                    {selectedMessage.status === 'new' && (
                                        <button
                                            onClick={() => updateMessageStatus(selectedMessage.id, 'read')}
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            {language === 'fr' ? 'Marquer lu' : 'Mark Read'}
                                        </button>
                                    )}
                                    {selectedMessage.status !== 'replied' && (
                                        <button
                                            onClick={() => updateMessageStatus(selectedMessage.id, 'replied')}
                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                        >
                                            <Reply className="w-4 h-4" />
                                            {language === 'fr' ? 'Marquer répondu' : 'Mark Replied'}
                                        </button>
                                    )}
                                    {selectedMessage.status !== 'archived' && (
                                        <button
                                            onClick={() => updateMessageStatus(selectedMessage.id, 'archived')}
                                            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                        >
                                            <Archive className="w-4 h-4" />
                                            {language === 'fr' ? 'Archiver' : 'Archive'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center text-gray-500">
                                {language === 'fr' 
                                    ? 'Sélectionnez un message pour voir les détails'
                                    : 'Select a message to view details'}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Newsletter Subscriptions */
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="font-semibold text-gray-900">
                            {language === 'fr' ? 'Inscriptions Newsletter' : 'Newsletter Subscriptions'} ({filteredNewsletterSubscriptions.length})
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {language === 'fr' ? 'Email' : 'Email'}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {language === 'fr' ? 'Source' : 'Source'}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {language === 'fr' ? 'Statut' : 'Status'}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {language === 'fr' ? 'Date d\'inscription' : 'Subscribed At'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredNewsletterSubscriptions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            {language === 'fr' ? 'Aucune inscription trouvée' : 'No subscriptions found'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredNewsletterSubscriptions.map((subscription) => (
                                        <tr key={subscription.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{subscription.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600">
                                                    {language === 'fr' 
                                                        ? { blog: 'Blog', homepage: 'Page d\'accueil', footer: 'Footer', other: 'Autre' }[subscription.source]
                                                        : { blog: 'Blog', homepage: 'Homepage', footer: 'Footer', other: 'Other' }[subscription.source]}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(subscription.status)}`}>
                                                    {language === 'fr' 
                                                        ? { active: 'Actif', unsubscribed: 'Désinscrit', bounced: 'Rebondi' }[subscription.status]
                                                        : { active: 'Active', unsubscribed: 'Unsubscribed', bounced: 'Bounced' }[subscription.status]}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {formatDate(subscription.subscribed_at)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

