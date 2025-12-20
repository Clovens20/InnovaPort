/**
 * Limites et fonctionnalités par plan d'abonnement
 */

export type SubscriptionTier = 'free' | 'pro' | 'premium';

export interface SubscriptionLimits {
    maxProjects: number | null; // null = illimité
    maxQuotesPerMonth: number | null; // null = illimité
    customDomain: boolean;
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

