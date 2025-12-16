'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

interface SocialProofItem {
    id: string;
    name: string;
    initials: string;
    color: string;
    display_order: number;
}

export function SocialProofSection() {
    const [items, setItems] = useState<SocialProofItem[]>([]);
    const [text, setText] = useState('Rejoint par 50+ freelances en 2 semaines');
    const [emoji, setEmoji] = useState('🚀');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const supabase = createClient();

            // Charger seulement les 10 premiers items du social proof
            const { data: socialProofData } = await supabase
                .from('homepage_social_proof')
                .select('*')
                .order('display_order', { ascending: true })
                .limit(10);

            if (socialProofData) {
                setItems(socialProofData);
            }

            // Charger les settings
            const { data: settingsData } = await supabase
                .from('homepage_settings')
                .select('*')
                .in('key', ['social_proof_text', 'social_proof_emoji']);

            settingsData?.forEach((setting) => {
                if (setting.key === 'social_proof_text') {
                    setText(setting.value);
                } else if (setting.key === 'social_proof_emoji') {
                    setEmoji(setting.value);
                }
            });
        } catch (error) {
            console.error('Error loading social proof:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        // Afficher les valeurs par défaut pendant le chargement (environ 10 badges)
        const defaultBadges = [
            { initials: 'MC', color: 'bg-blue-500' },
            { initials: 'SL', color: 'bg-green-500' },
            { initials: 'JD', color: 'bg-purple-500' },
            { initials: 'AB', color: 'bg-indigo-500' },
            { initials: 'CD', color: 'bg-pink-500' },
            { initials: 'EF', color: 'bg-teal-500' },
            { initials: 'GH', color: 'bg-orange-500' },
            { initials: 'IJ', color: 'bg-cyan-500' },
            { initials: 'KL', color: 'bg-red-500' },
            { initials: 'MN', color: 'bg-yellow-500' },
        ];
        
        return (
            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 text-sm font-semibold text-gray-700">
                <div className="flex -space-x-2 flex-wrap">
                    {defaultBadges.slice(0, 10).map((badge, index) => (
                        <div
                            key={index}
                            className={`w-10 h-10 rounded-full border-2 border-white ${badge.color} flex items-center justify-center text-white font-bold text-xs`}
                        >
                            {badge.initials}
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-base">🚀</span>
                    <span>Rejoint par 50+ freelances en 2 semaines</span>
                </div>
            </div>
        );
    }

    // Limiter à 10 badges maximum pour un affichage plus propre
    const displayedItems = items.slice(0, 10);
    const remainingCount = Math.max(0, items.length - 10);

    return (
        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 text-sm font-semibold text-gray-700">
            <div className="flex -space-x-2 flex-wrap">
                {displayedItems.map((item, index) => (
                    <div
                        key={item.id || index}
                        className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-xs shadow-sm"
                        style={{ backgroundColor: item.color }}
                        aria-label={`${item.name || item.initials} profile`}
                    >
                        {item.initials}
                    </div>
                ))}
                {remainingCount > 0 && (
                    <div 
                        className="w-10 h-10 rounded-full border-2 border-white bg-gray-500 flex items-center justify-center text-white font-bold text-xs shadow-sm"
                        aria-label={`${remainingCount} autres freelances`}
                    >
                        +{remainingCount}
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2">
                <span className="text-base" aria-hidden="true">{emoji}</span>
                <span>{text}</span>
            </div>
        </div>
    );
}

