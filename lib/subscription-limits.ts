/**
 * Limites et fonctionnalités par plan d'abonnement
 */

export type SubscriptionTier = 'free' | 'pro' | 'premium';

export interface SubscriptionLimits {
    maxProjects: number | null; // null = illimité
    maxQuotesPerMonth: number | null; // null = illimité
    customDomain: boolean;
    customSlug: boolean; // Slug personnalisé pour le portfolio
    maxCustomDomains: number | null; // Nombre max de domaines personnalisés (null = illimité)
    maxSubdomains: number | null; // Nombre max de sous-domaines par domaine (null = illimité)
    multiDomainDashboard: boolean; // Dashboard de gestion multi-domaines
    removeBranding: boolean; // Sans logo/filigrane InnovaPort
    exportPDF: boolean;
    exportExcel: boolean;
    electronicSignatures: boolean;
    analyticsReports: boolean;
    prioritySupport: boolean;
    multiUsers: boolean; // Équipe
    customClientPortal: boolean;
    accountingIntegration: boolean;
    advancedAutomations: boolean;
    customReports: boolean;
}

export const subscriptionLimits: Record<SubscriptionTier, SubscriptionLimits> = {
    free: {
        maxProjects: 3,
        maxQuotesPerMonth: 3,
        customDomain: false,
        customSlug: false,
        maxCustomDomains: 0,
        maxSubdomains: 0,
        multiDomainDashboard: false,
        removeBranding: false, // Avec logo InnovaPort
        exportPDF: false,
        exportExcel: false,
        electronicSignatures: false,
        analyticsReports: false,
        prioritySupport: false,
        multiUsers: false,
        customClientPortal: false,
        accountingIntegration: false,
        advancedAutomations: false,
        customReports: false,
    },
    pro: {
        maxProjects: null, // Illimité
        maxQuotesPerMonth: null, // Illimité
        customDomain: true,
        customSlug: true, // ✅ Slug personnalisé
        maxCustomDomains: 1, // ✅ 1 domaine personnalisé
        maxSubdomains: 0, // Pas de sous-domaines pour Pro
        multiDomainDashboard: false,
        removeBranding: true, // Sans logo/filigrane
        exportPDF: true,
        exportExcel: true,
        electronicSignatures: true,
        analyticsReports: true,
        prioritySupport: true,
        multiUsers: false,
        customClientPortal: false,
        accountingIntegration: false,
        advancedAutomations: false,
        customReports: false,
    },
    premium: {
        maxProjects: null, // Illimité
        maxQuotesPerMonth: null, // Illimité
        customDomain: true,
        customSlug: true, // ✅ Slug personnalisé
        maxCustomDomains: null, // ✅ Domaines illimités
        maxSubdomains: null, // ✅ Sous-domaines illimités
        multiDomainDashboard: true, // ✅ Dashboard de gestion multi-domaines
        removeBranding: true,
        exportPDF: true,
        exportExcel: true,
        electronicSignatures: true,
        analyticsReports: true,
        prioritySupport: true,
        multiUsers: true, // Équipe
        customClientPortal: true,
        accountingIntegration: true,
        advancedAutomations: true,
        customReports: true,
    },
};

/**
 * Vérifie si l'utilisateur peut créer un nouveau projet
 */
export function canCreateProject(tier: SubscriptionTier, currentProjectCount: number): boolean {
    const limits = subscriptionLimits[tier];
    if (limits.maxProjects === null) {
        return true; // Illimité
    }
    return currentProjectCount < limits.maxProjects;
}

/**
 * Vérifie si une fonctionnalité est disponible pour un plan
 */
export function hasFeature(tier: SubscriptionTier, feature: keyof SubscriptionLimits): boolean {
    return subscriptionLimits[tier][feature] === true;
}

/**
 * Vérifie si l'utilisateur peut recevoir un nouveau devis ce mois-ci
 */
export function canReceiveQuote(tier: SubscriptionTier, currentMonthQuoteCount: number): boolean {
    const limits = subscriptionLimits[tier];
    if (limits.maxQuotesPerMonth === null) {
        return true; // Illimité
    }
    return currentMonthQuoteCount < limits.maxQuotesPerMonth;
}

/**
 * Vérifie si l'utilisateur peut ajouter un nouveau domaine personnalisé
 */
export function canAddCustomDomain(tier: SubscriptionTier, currentDomainCount: number): boolean {
    const limits = subscriptionLimits[tier];
    if (limits.maxCustomDomains === null) {
        return true; // Illimité
    }
    return currentDomainCount < limits.maxCustomDomains;
}

/**
 * Vérifie si l'utilisateur peut ajouter un nouveau sous-domaine
 */
export function canAddSubdomain(tier: SubscriptionTier, currentSubdomainCount: number, domainId: string): boolean {
    const limits = subscriptionLimits[tier];
    if (limits.maxSubdomains === null) {
        return true; // Illimité
    }
    return currentSubdomainCount < limits.maxSubdomains;
}

