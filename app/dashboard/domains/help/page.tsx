'use client';

import { Globe, CheckCircle2, AlertCircle, ExternalLink, Copy, Check, Clock } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function DomainsHelpPage() {
    const { t } = useTranslation();
    const [copied, setCopied] = useState<string | null>(null);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const innovaportDomain = process.env.NEXT_PUBLIC_DOMAIN || 'innovaport.dev';

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <Link
                    href="/dashboard/domains"
                    className="text-[#1E3A8A] hover:text-[#1E40AF] mb-4 inline-block"
                >
                    ← Retour aux domaines
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Guide de configuration DNS
                </h1>
                <p className="text-gray-600">
                    Instructions détaillées pour configurer vos domaines personnalisés
                </p>
            </div>

            <div className="space-y-8">
                {/* Instructions simplifiées principales */}
                <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 border border-blue-200">
                    <div className="flex items-start mb-4">
                        <Globe className="w-8 h-8 text-blue-600 mr-3 mt-1" />
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                🌐 Configurer votre domaine personnalisé
                            </h2>
                            <p className="text-lg text-green-700 font-semibold mb-4">
                                ✓ Vous n'avez PAS besoin de changer vos nameservers !
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-5 mb-4">
                        <p className="text-base font-semibold text-gray-900 mb-4">Étapes simples :</p>
                        <ol className="space-y-3 text-gray-700">
                            <li className="flex items-start">
                                <span className="font-bold text-blue-600 mr-2">1.</span>
                                <span>Connectez-vous à votre registrar (GoDaddy, Namecheap, OVH, etc.)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="font-bold text-blue-600 mr-2">2.</span>
                                <span>Trouvez la section <strong>"DNS"</strong> ou <strong>"Gestion DNS"</strong></span>
                            </li>
                            <li className="flex items-start">
                                <span className="font-bold text-blue-600 mr-2">3.</span>
                                <div className="flex-1">
                                    <span>Ajoutez un nouvel enregistrement :</span>
                                    <div className="mt-2 ml-4 space-y-2 bg-gray-50 rounded p-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">• <strong>Type :</strong></span>
                                            <code className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">CNAME</code>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-sm">• <strong>Nom :</strong></span>
                                            <div className="text-sm">
                                                <code className="px-2 py-1 bg-white border border-gray-300 rounded font-mono">@</code>
                                                <span className="ml-2">(pour monsite.com) OU</span>
                                                <code className="px-2 py-1 bg-white border border-gray-300 rounded font-mono ml-2">www</code>
                                                <span className="ml-2">(pour www.monsite.com)</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">• <strong>Valeur :</strong></span>
                                            <code className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">
                                                {innovaportDomain}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(innovaportDomain, 'main-cname')}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                {copied === 'main-cname' ? (
                                                    <Check className="w-4 h-4" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">• <strong>TTL :</strong></span>
                                            <code className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">Automatique</code>
                                            <span className="text-xs text-gray-500">(ou 3600)</span>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <span className="font-bold text-blue-600 mr-2">4.</span>
                                <span>Sauvegardez</span>
                            </li>
                            <li className="flex items-start">
                                <span className="font-bold text-blue-600 mr-2">5.</span>
                                <span>Revenez ici et cliquez sur <strong>"Vérifier"</strong></span>
                            </li>
                        </ol>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-3 flex items-start gap-2">
                            <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-gray-900">⏱️ Propagation DNS</p>
                                <p className="text-xs text-gray-600">Généralement 5-10 minutes</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-gray-900">🔒 Certificat SSL</p>
                                <p className="text-xs text-gray-600">Généré automatiquement sous 24h</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Introduction */}
                <section className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Guide détaillé par registrar
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Si vous avez besoin d'instructions plus détaillées pour votre registrar spécifique, 
                        consultez les sections ci-dessous.
                    </p>
                </section>

                {/* Note importante sur l'enregistrement CNAME */}
                <section className="bg-white rounded-lg shadow p-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                            <div>
                                <p className="text-sm text-yellow-900">
                                    <strong>Note importante :</strong> L'enregistrement <strong>CNAME</strong> est le seul 
                                    enregistrement requis pour connecter votre domaine. L'enregistrement TXT est optionnel 
                                    et sert uniquement à la vérification automatique.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        📋 Récapitulatif de l'enregistrement CNAME
                    </h2>
                    
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-700 mb-2">Pour le domaine racine (monsite.com) :</p>
                                <div className="space-y-1 text-sm">
                                    <div><strong>Type :</strong> <code className="px-1.5 py-0.5 bg-white rounded">CNAME</code></div>
                                    <div><strong>Nom :</strong> <code className="px-1.5 py-0.5 bg-white rounded">@</code></div>
                                    <div><strong>Valeur :</strong> <code className="px-1.5 py-0.5 bg-white rounded">{innovaportDomain}</code></div>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700 mb-2">Pour www (www.monsite.com) :</p>
                                <div className="space-y-1 text-sm">
                                    <div><strong>Type :</strong> <code className="px-1.5 py-0.5 bg-white rounded">CNAME</code></div>
                                    <div><strong>Nom :</strong> <code className="px-1.5 py-0.5 bg-white rounded">www</code></div>
                                    <div><strong>Valeur :</strong> <code className="px-1.5 py-0.5 bg-white rounded">{innovaportDomain}</code></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Instructions par provider */}
                <section className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Instructions par registrar DNS
                    </h2>

                    <div className="space-y-6">
                        {/* Cloudflare */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                {t('dashboard.domains.help.providers.cloudflare.title')}
                            </h3>
                            <ol className="list-decimal list-inside space-y-2 text-gray-600">
                                <li>{t('dashboard.domains.help.providers.cloudflare.step1')}</li>
                                <li>{t('dashboard.domains.help.providers.cloudflare.step2')}</li>
                                <li>{t('dashboard.domains.help.providers.cloudflare.step3')}</li>
                                <li>{t('dashboard.domains.help.providers.cloudflare.step4')}</li>
                                <li>{t('dashboard.domains.help.providers.cloudflare.step5')}</li>
                                <li>{t('dashboard.domains.help.providers.cloudflare.step6', { domain: innovaportDomain })}</li>
                                <li>{t('dashboard.domains.help.providers.cloudflare.step7')}</li>
                            </ol>
                            <a
                                href="https://dash.cloudflare.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center mt-3 text-[#1E3A8A] hover:text-[#1E40AF]"
                            >
                                {t('dashboard.domains.help.providers.cloudflare.link')} <ExternalLink className="w-4 h-4 ml-1" />
                            </a>
                        </div>

                        {/* Namecheap */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                {t('dashboard.domains.help.providers.namecheap.title')}
                            </h3>
                            <ol className="list-decimal list-inside space-y-2 text-gray-600">
                                <li>{t('dashboard.domains.help.providers.namecheap.step1')}</li>
                                <li>{t('dashboard.domains.help.providers.namecheap.step2')}</li>
                                <li>{t('dashboard.domains.help.providers.namecheap.step3')}</li>
                                <li>{t('dashboard.domains.help.providers.namecheap.step4')}</li>
                                <li>{t('dashboard.domains.help.providers.namecheap.step5', { domain: innovaportDomain })}</li>
                                <li>{t('dashboard.domains.help.providers.namecheap.step6')}</li>
                            </ol>
                            <a
                                href="https://www.namecheap.com/myaccount/login/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center mt-3 text-[#1E3A8A] hover:text-[#1E40AF]"
                            >
                                {t('dashboard.domains.help.providers.namecheap.link')} <ExternalLink className="w-4 h-4 ml-1" />
                            </a>
                        </div>

                        {/* GoDaddy */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                {t('dashboard.domains.help.providers.godaddy.title')}
                            </h3>
                            <ol className="list-decimal list-inside space-y-2 text-gray-600">
                                <li>{t('dashboard.domains.help.providers.godaddy.step1')}</li>
                                <li>{t('dashboard.domains.help.providers.godaddy.step2')}</li>
                                <li>{t('dashboard.domains.help.providers.godaddy.step3')}</li>
                                <li>{t('dashboard.domains.help.providers.godaddy.step4')}</li>
                                <li>{t('dashboard.domains.help.providers.godaddy.step5')}</li>
                                <li>{t('dashboard.domains.help.providers.godaddy.step6', { domain: innovaportDomain })}</li>
                                <li>{t('dashboard.domains.help.providers.godaddy.step7')}</li>
                            </ol>
                            <a
                                href="https://sso.godaddy.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center mt-3 text-[#1E3A8A] hover:text-[#1E40AF]"
                            >
                                {t('dashboard.domains.help.providers.godaddy.link')} <ExternalLink className="w-4 h-4 ml-1" />
                            </a>
                        </div>

                        {/* Google Domains */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                {t('dashboard.domains.help.providers.google.title')}
                            </h3>
                            <ol className="list-decimal list-inside space-y-2 text-gray-600">
                                <li>{t('dashboard.domains.help.providers.google.step1')}</li>
                                <li>{t('dashboard.domains.help.providers.google.step2')}</li>
                                <li>{t('dashboard.domains.help.providers.google.step3')}</li>
                                <li>{t('dashboard.domains.help.providers.google.step4')}</li>
                                <li>{t('dashboard.domains.help.providers.google.step5')}</li>
                                <li>{t('dashboard.domains.help.providers.google.step6', { domain: innovaportDomain })}</li>
                            </ol>
                        </div>
                    </div>
                </section>

                {/* Sous-domaines */}
                <section className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Configuration pour sous-domaines
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Si vous configurez un sous-domaine (ex: <code>portfolio.mondomaine.com</code>), 
                        utilisez le sous-domaine comme nom d'hôte au lieu de <code>@</code>.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 mb-2">
                            <strong>Exemple pour portfolio.mondomaine.com :</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            <li><strong>TXT :</strong> Nom = <code>portfolio</code>, Valeur = <code>innovaport-verification=VOTRE_TOKEN</code></li>
                            <li><strong>CNAME :</strong> Nom = <code>portfolio</code>, Valeur = <code>{innovaportDomain}</code></li>
                        </ul>
                    </div>
                </section>

                {/* Vérification */}
                <section className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Vérification de la configuration
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Une fois les enregistrements DNS configurés, vous pouvez vérifier la configuration 
                        depuis votre dashboard InnovaPort.
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                            <div>
                                <p className="text-sm text-green-900">
                                    <strong>Conseil :</strong> Utilisez le bouton <strong>Vérifier</strong> 
                                    dans votre liste de domaines pour vérifier automatiquement la configuration DNS. 
                                    La vérification peut prendre quelques minutes après la configuration.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Support */}
                <section className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Besoin d'aide ?
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Si vous rencontrez des difficultés lors de la configuration, n'hésitez pas à 
                        contacter notre support.
                    </p>
                    <Link
                        href="/support"
                        className="inline-flex items-center px-4 py-2 bg-[#1E3A8A] text-white rounded-md hover:bg-[#1E40AF] transition-colors"
                    >
                        Contacter le support
                    </Link>
                </section>
            </div>
        </div>
    );
}

