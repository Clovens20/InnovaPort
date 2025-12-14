'use client';

import { useState, useRef } from 'react';
import { PenTool, X, Check } from 'lucide-react';
import { hasFeature } from '@/lib/subscription-limits';

interface ElectronicSignatureProps {
    quoteId: string;
    subscriptionTier: 'free' | 'pro' | 'premium';
    onSignatureComplete?: (signatureData: string) => void;
}

export function ElectronicSignature({ quoteId, subscriptionTier, onSignatureComplete }: ElectronicSignatureProps) {
    const [isDrawing, setIsDrawing] = useState(false);
    const [showCanvas, setShowCanvas] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [signatureData, setSignatureData] = useState<string | null>(null);

    if (!hasFeature(subscriptionTier, 'electronicSignatures')) {
        return (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">
                    Les signatures électroniques sont disponibles avec le plan Pro.
                </p>
            </div>
        );
    }

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignatureData(null);
    };

    const saveSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataURL = canvas.toDataURL();
        setSignatureData(dataURL);
        setShowCanvas(false);
        if (onSignatureComplete) {
            onSignatureComplete(dataURL);
        }
    };

    if (signatureData) {
        return (
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Signature enregistrée</span>
                    <button
                        onClick={() => {
                            setSignatureData(null);
                            setShowCanvas(true);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700"
                    >
                        Modifier
                    </button>
                </div>
                <img src={signatureData} alt="Signature" className="border border-gray-200 rounded" />
            </div>
        );
    }

    if (!showCanvas) {
        return (
            <button
                onClick={() => setShowCanvas(true)}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
                <PenTool className="w-4 h-4" />
                Ajouter une signature
            </button>
        );
    }

    return (
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Signature électronique</h3>
                <button
                    onClick={() => setShowCanvas(false)}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            <canvas
                ref={canvasRef}
                width={400}
                height={200}
                className="border border-gray-300 rounded-lg cursor-crosshair w-full"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
            <div className="flex gap-2 mt-4">
                <button
                    onClick={clearSignature}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Effacer
                </button>
                <button
                    onClick={saveSignature}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                    <Check className="w-4 h-4" />
                    Enregistrer
                </button>
            </div>
        </div>
    );
}

