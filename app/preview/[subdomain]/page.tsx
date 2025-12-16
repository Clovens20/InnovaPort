"use client";

import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Github, Twitter, Linkedin, Mail } from "lucide-react";
import clsx from "clsx";
import { hexToRgba } from "@/utils/color-utils";
import { getDicebearAvatarUrl } from "@/lib/constants";

export default function PortfolioPreview() {
    const params = useParams();
    const searchParams = useSearchParams();

    const subdomain = params.subdomain as string;
    const template = searchParams.get("template") || "modern";
    const primary = searchParams.get("primary") ? decodeURIComponent(searchParams.get("primary")!) : "#1E3A8A";
    const secondary = searchParams.get("secondary") ? decodeURIComponent(searchParams.get("secondary")!) : "#10B981";

    // Mock Data
    const profile = {
        name: "Jean Dupont",
        title: "Product Designer & Developer",
        bio: "Passionné par la création d'expériences numériques mémorables. Je transforme vos idées en produits réels et impactants.",
        avatar: getDicebearAvatarUrl("Jean"),
    };

    const projects = [
        { title: "E-commerce Dashboard", category: "Web App", image: "https://placehold.co/600x400/1E3A8A/FFF?text=Dashboard", tags: ["React", "Next.js"] },
        { title: "Finance Mobile App", category: "Mobile", image: "https://placehold.co/600x400/10B981/FFF?text=Mobile+App", tags: ["Flutter", "Dart"] },
        { title: "Architect Portfolio", category: "Website", image: "https://placehold.co/600x400/F59E0B/FFF?text=Portfolio", tags: ["Vue.js", "GSAP"] },
    ];

    // Dynamic Styles
    const style = {
        "--primary": primary,
        "--secondary": secondary,
        "--primary-light": hexToRgba(primary, 0.1),
    } as React.CSSProperties;

    // --- TEMPLATES ---

    if (template === "minimal") {
        return (
            <div className="min-h-screen bg-white text-gray-900 font-sans" style={style}>
                <header className="max-w-4xl mx-auto py-12 px-6 flex justify-between items-center">
                    <h1 className="text-xl font-bold">{profile.name}</h1>
                    <nav className="flex gap-6 text-sm font-medium">
                        <a href="#work">Work</a>
                        <a href="#about">About</a>
                        <Link href={`/preview/${subdomain}/contact`} className="text-[var(--primary)]">Contact</Link>
                    </nav>
                </header>

                <main className="max-w-4xl mx-auto px-6">
                    <section className="py-24 text-center">
                        <img src={profile.avatar} className="w-24 h-24 rounded-full mx-auto mb-8 bg-gray-100" />
                        <h2 className="text-4xl font-bold mb-4">{profile.title}</h2>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto">{profile.bio}</p>
                    </section>

                    <section id="work" className="py-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {projects.map((project, i) => (
                                <div key={i} className="group cursor-pointer">
                                    <div className="aspect-[4/3] bg-gray-100 mb-4 overflow-hidden rounded-lg">
                                        <img src={project.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <h3 className="text-lg font-bold group-hover:text-[var(--primary)] transition-colors">{project.title}</h3>
                                    <p className="text-gray-500 text-sm">{project.category}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        );
    }

    // Default Modern Template
    return (
        <div className="min-h-screen bg-gray-50 font-sans" style={style}>
            {/* Hero */}
            <section className="bg-white pt-32 pb-24 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-[var(--primary-light)] blur-3xl opacity-50 rounded-full transform translate-x-1/2" />

                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
                    <div>
                        <span className="inline-block px-3 py-1 bg-[var(--primary-light)] text-[var(--primary)] rounded-full text-sm font-medium mb-6">
                            Available for work
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                            Designing <span className="text-[var(--primary)]">Future</span> Experiences.
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            {profile.bio}
                        </p>
                        <div className="flex gap-4">
                            <a href="#projects" className="px-8 py-4 bg-[var(--primary)] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-blue-900/20">
                                View My Work
                            </a>
                            <Link href={`/preview/${subdomain}/contact`} className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                                Contact Me
                            </Link>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-square bg-[var(--secondary)] rounded-full absolute -top-4 -right-4 opacity-20 blur-2xl w-64 h-64" />
                        <img src={profile.avatar} className="w-full max-w-md mx-auto relative z-10 drop-shadow-2xl" />
                    </div>
                </div>
            </section>

            {/* Projects */}
            <section id="projects" className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-2">Featured Projects</h2>
                            <p className="text-gray-600">Discover my latest creations</p>
                        </div>
                        <a href="#" className="flex items-center gap-2 text-[var(--primary)] font-medium hover:gap-4 transition-all">
                            View all <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project, i) => (
                            <div key={i} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="aspect-video bg-gray-200 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10" />
                                    <img src={project.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="p-6">
                                    <div className="flex gap-2 mb-3">
                                        {project.tags.map(tag => (
                                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[var(--primary)] transition-colors">
                                        {project.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm">
                                        A comprehensive solution for managing digital assets...
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-12 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-2xl font-bold text-gray-900">
                        {profile.name} <span className="text-[var(--primary)]">.</span>
                    </div>
                    <div className="flex gap-6 text-gray-400">
                        <Github className="w-5 h-5 hover:text-gray-900 cursor-pointer" />
                        <Twitter className="w-5 h-5 hover:text-blue-400 cursor-pointer" />
                        <Linkedin className="w-5 h-5 hover:text-blue-700 cursor-pointer" />
                        <Mail className="w-5 h-5 hover:text-[var(--primary)] cursor-pointer" />
                    </div>
                    <p className="text-sm text-gray-500">© 2025 All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
