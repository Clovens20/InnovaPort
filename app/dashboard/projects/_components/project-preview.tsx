"use client";

import { Monitor, Smartphone } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

export function ProjectPreview({ data }: { data: any }) {
    const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

    return (
        <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl sticky top-6">
            <div className="bg-gray-800 p-3 flex items-center justify-between border-b border-gray-700">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex bg-gray-900 rounded-lg p-1">
                    <button
                        onClick={() => setDevice("desktop")}
                        className={clsx(
                            "p-1.5 rounded-md transition-colors",
                            device === "desktop" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
                        )}
                    >
                        <Monitor className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setDevice("mobile")}
                        className={clsx(
                            "p-1.5 rounded-md transition-colors",
                            device === "mobile" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
                        )}
                    >
                        <Smartphone className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="bg-gray-100 h-[600px] overflow-hidden relative flex items-center justify-center">
                {/* Mock Preview Content */}
                <div
                    className={clsx(
                        "bg-white shadow-lg transition-all duration-300 overflow-hidden",
                        device === "mobile" ? "w-[300px] h-[580px] rounded-3xl border-8 border-gray-900" : "w-full h-full"
                    )}
                >
                    {/* Header Mock */}
                    <div className="h-12 border-b flex items-center px-4 justify-between">
                        <span className="font-bold text-gray-900">Portfolio</span>
                        <div className="flex gap-2 text-xs text-gray-500">
                            <span>About</span>
                            <span>Projects</span>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Thumbnail */}
                        <div className="aspect-video bg-gray-200 rounded-lg mb-6 flex items-center justify-center overflow-hidden">
                            {data.image ? (
                                <img src={data.image} alt="Cover" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-gray-400 text-4xl">🖼️</span>
                            )}
                        </div>

                        {/* Content */}
                        <div className="space-y-4">
                            <div>
                                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                                    {data.category || "Catégorie"}
                                </span>
                                <h1 className="text-2xl font-bold text-gray-900 mt-1">
                                    {data.title || "Titre du projet"}
                                </h1>
                            </div>

                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                                {data.shortDescription || "Description courte du projet..."}
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {(data.technologies || []).map((tech: string) => (
                                    <span key={tech} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                        {tech}
                                    </span>
                                ))}
                                {(!data.technologies || data.technologies.length === 0) && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-400 text-xs rounded">Tech 1</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
