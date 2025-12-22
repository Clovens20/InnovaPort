/**
 * Types partagés pour le projet InnovaPort
 * 
 * Fonction: Centralise les types TypeScript utilisés dans l'application
 * Dépendances: Aucune
 * Raison: Évite la duplication de types et améliore la cohérence
 */

// Types pour les projets
export interface Project {
    id: string;
    user_id: string;
    title: string;
    slug: string;
    category: string | null;
    short_description: string | null;
    full_description: string | null;
    problem: string | null;
    technologies: string[];
    client_type: 'personal' | 'professional' | 'open_source';
    client_name: string | null;
    duration_value: number | null;
    duration_unit: 'weeks' | 'months';
    project_url: string | null;
    tags: string | null;
    image_url: string | null;
    featured: boolean;
    published: boolean;
    created_at: string;
    updated_at: string;
}

// Types pour les services
export interface Service {
    id?: string;
    name: string;
    description: string;
    price: string;
    features: string[];
    icon?: string;
    targetCategories?: Array<{ emoji: string; label: string }>;
    exampleProject?: string;
}

// Types pour le processus de travail
export interface WorkProcessStep {
    num: number;
    title: string;
    description: string;
}

// Types pour les profils
export interface Profile {
    id: string;
    username: string;
    subdomain: string | null; // Déprécié : utiliser username à la place
    full_name: string | null;
    bio: string | null;
    title: string | null;
    avatar_url: string | null;
    primary_color: string;
    secondary_color: string;
    template: 'modern' | 'minimal' | 'bold' | 'corporate' | 'creative';
    tiktok_url: string | null;
    facebook_url: string | null;
    twitter_url: string | null;
    linkedin_url: string | null;
    email: string | null;
    // Champs de personnalisation du portfolio
    available_for_work: boolean;
    hero_title: string | null;
    hero_subtitle: string | null;
    hero_description: string | null;
    stats_years_experience: number | null;
    stats_projects_delivered: number | null;
    stats_clients_satisfied: number | null;
    stats_response_time: string | null;
    services: Service[] | null;
    work_process: WorkProcessStep[] | null;
    technologies_list: string[] | null;
    cta_title: string | null;
    cta_subtitle: string | null;
    cta_button_text: string | null;
    cta_footer_text: string | null;
    about_journey: string | null;
    about_approach: string | null;
    about_why_choose: string | null;
    created_at: string;
    updated_at: string;
}

// Types pour les devis
export interface Quote {
    id: string;
    user_id: string;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    location: string | null;
    project_type: string;
    platforms: { ios: boolean; android: boolean } | null;
    budget: string;
    deadline: string;
    features: string[];
    design_pref: string | null;
    description: string;
    has_vague_idea: boolean;
    contact_pref: string;
    consent_contact: boolean;
    consent_privacy: boolean;
    status: 'new' | 'discussing' | 'quoted' | 'accepted' | 'rejected';
    internal_notes: string | null;
    last_reminder_sent_at: string | null;
    reminders_count: number;
    created_at: string;
    updated_at: string;
}

// Types pour les palettes de couleurs
export interface ColorPalette {
    name: string;
    primary: string;
    secondary: string;
}

// Types pour les données de formulaire génériques
export type FormFieldValue = string | number | boolean | string[] | null | undefined;

// Types pour les témoignages
export interface Testimonial {
    id: string;
    user_id: string;
    client_name: string;
    client_email: string;
    client_company: string | null;
    client_position: string | null;
    client_avatar_url: string | null;
    rating: number | null;
    testimonial_text: string;
    project_name: string | null;
    project_url: string | null;
    featured: boolean;
    approved: boolean;
    created_at: string;
    updated_at: string;
}

