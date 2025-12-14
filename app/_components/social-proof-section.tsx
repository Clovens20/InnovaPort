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

            // Charger les items du social proof
            const { data: socialProofData } = await supabase
                .from('homepage_social_proof')
                .select('*')
                .order('display_order', { ascending: true });

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
        // Afficher les valeurs par défaut pendant le chargement
        return (
            <div className="mt-12 flex items-center gap-4 text-sm font-semibold text-gray-700">
                <div className="flex -space-x-2">
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center text-white font-bold text-xs">MC</div>
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-green-500 flex items-center justify-center text-white font-bold text-xs">SL</div>
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-purple-500 flex items-center justify-center text-white font-bold text-xs">JD</div>
                </div>
                <div>
                    <span className="text-base">🚀</span> Rejoint par 50+ freelances en 2 semaines
                </div>
            </div>
        );
    }

    return (
        <div className="mt-12 flex items-center gap-4 text-sm font-semibold text-gray-700">
            <div className="flex -space-x-2">
                {items.map((item, index) => (
                    <div
                        key={item.id || index}
                        className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: item.color }}
                    >
                        {item.initials}
                    </div>
                ))}
                {items.length > 0 && items.length < 4 && (
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-orange-500 flex items-center justify-center text-white font-bold text-xs">
                        +{Math.max(0, 50 - items.length)}
                    </div>
                )}
            </div>
            <div>
                <span className="text-base">{emoji}</span> {text}
            </div>
        </div>
    );
}

