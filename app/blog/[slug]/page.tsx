'use client';

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, User, Clock, Tag, Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import { Footer } from "@/app/_components/footer";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LanguageSwitcher } from "@/app/_components/language-switcher";
import { useParams } from "next/navigation";

interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    author: string;
    date: string;
    category: string;
    readTime: string;
    image: string;
    slug: string;
    content: string;
}

export default function BlogPostPage() {
    const { t, language } = useTranslation();
    const params = useParams();
    const slug = params?.slug as string;

    // Articles de blog complets avec contenu
    const blogPosts: BlogPost[] = language === 'fr' ? [
        {
            id: 1,
            title: 'Comment créer un portfolio qui attire les clients',
            excerpt: 'Découvrez les meilleures pratiques pour créer un portfolio qui convertit les visiteurs en clients.',
            author: 'Équipe Innovaport',
            date: '15 Janvier 2025',
            category: 'Conseils',
            readTime: '5 min',
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop&q=80',
            slug: 'creer-portfolio-attire-clients',
            content: `
                <h2>Introduction</h2>
                <p>Un portfolio efficace est votre meilleur outil de vente en tant que freelance. Il ne s'agit pas seulement de montrer vos réalisations, mais de convaincre vos clients potentiels que vous êtes la personne idéale pour leur projet.</p>
                
                <h2>1. Montrez vos meilleurs travaux uniquement</h2>
                <p>La qualité prime sur la quantité. Sélectionnez 8 à 12 de vos meilleurs projets qui démontrent votre expertise et votre polyvalence. Chaque projet doit raconter une histoire et montrer l'impact de votre travail.</p>
                
                <h2>2. Incluez des études de cas détaillées</h2>
                <p>Pour chaque projet majeur, créez une étude de cas qui explique :</p>
                <ul>
                    <li>Le problème du client</li>
                    <li>Votre approche et méthodologie</li>
                    <li>Les défis rencontrés et comment vous les avez surmontés</li>
                    <li>Les résultats mesurables obtenus</li>
                </ul>
                
                <h2>3. Optimisez pour votre audience cible</h2>
                <p>Adaptez votre portfolio aux clients que vous souhaitez attirer. Si vous visez les startups tech, mettez en avant des projets innovants et agiles. Pour les grandes entreprises, montrez votre capacité à gérer des projets complexes.</p>
                
                <h2>4. Ajoutez des témoignages clients</h2>
                <p>Les témoignages authentiques renforcent votre crédibilité. Demandez à vos clients satisfaits de partager leur expérience de travail avec vous, en mettant l'accent sur les résultats obtenus.</p>
                
                <h2>5. Facilitez le contact</h2>
                <p>Votre call-to-action doit être clair et visible sur chaque page. Incluez plusieurs moyens de vous contacter et répondez rapidement aux demandes.</p>
                
                <h2>Conclusion</h2>
                <p>Un portfolio réussi est un outil vivant qui évolue avec votre carrière. Mettez-le à jour régulièrement et analysez ce qui fonctionne pour continuellement l'améliorer.</p>
            `,
        },
        {
            id: 2,
            title: '5 erreurs à éviter dans votre portfolio de développeur',
            excerpt: 'Les erreurs courantes qui peuvent nuire à votre image professionnelle et comment les éviter.',
            author: 'Équipe Innovaport',
            date: '10 Janvier 2025',
            category: 'Développement',
            readTime: '7 min',
            image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=800&fit=crop&q=80',
            slug: 'erreurs-portfolio-developpeur',
            content: `
                <h2>Introduction</h2>
                <p>Votre portfolio est souvent la première impression que vous donnez aux clients potentiels. Éviter ces erreurs courantes peut faire la différence entre décrocher un contrat et être ignoré.</p>
                
                <h2>Erreur #1 : Un site trop lent</h2>
                <p>Un portfolio qui met plus de 3 secondes à charger perd 50% de ses visiteurs. Optimisez vos images, utilisez un hébergement performant et minimisez votre code.</p>
                <p><strong>Solution :</strong> Utilisez des outils comme Lighthouse pour identifier les problèmes de performance et les corriger.</p>
                
                <h2>Erreur #2 : Manque de projets concrets</h2>
                <p>Dire "Je maîtrise React" sans montrer de projets React concrets ne convainc personne. Chaque compétence listée doit être illustrée par au moins un projet.</p>
                <p><strong>Solution :</strong> Créez des projets personnels si vous manquez de projets clients. Un bon side project peut être aussi impressionnant qu'un projet commercial.</p>
                
                <h2>Erreur #3 : Design amateur ou daté</h2>
                <p>Un design qui semble venir de 2010 suggère que vos compétences techniques sont aussi datées. Même si vous êtes développeur backend, votre portfolio doit être moderne et professionnel.</p>
                <p><strong>Solution :</strong> Utilisez des templates modernes ou engagez un designer si le design n'est pas votre fort.</p>
                
                <h2>Erreur #4 : Absence de code source</h2>
                <p>Les développeurs veulent voir votre code. Un lien GitHub vers vos projets montre votre transparence et permet aux recruteurs d'évaluer votre style de code.</p>
                <p><strong>Solution :</strong> Ajoutez des liens vers vos repositories GitHub pour chaque projet, avec un README détaillé.</p>
                
                <h2>Erreur #5 : Pas de call-to-action clair</h2>
                <p>Si un client potentiel aime votre travail mais ne sait pas comment vous contacter facilement, vous perdez une opportunité.</p>
                <p><strong>Solution :</strong> Placez des boutons de contact clairs sur chaque page, avec plusieurs options (email, formulaire, calendrier de rendez-vous).</p>
                
                <h2>Conclusion</h2>
                <p>Éviter ces erreurs communes peut transformer votre portfolio d'un simple CV en ligne en un véritable outil de génération de leads. Prenez le temps de perfectionner chaque aspect.</p>
            `,
        },
        {
            id: 3,
            title: 'Optimiser votre présence en ligne en tant que freelance',
            excerpt: 'Stratégies pour améliorer votre visibilité et attirer plus de clients qualifiés.',
            author: 'Équipe Innovaport',
            date: '5 Janvier 2025',
            category: 'Marketing',
            readTime: '6 min',
            image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=800&fit=crop&q=80',
            slug: 'optimiser-presence-online-freelance',
            content: `
                <h2>Introduction</h2>
                <p>En tant que freelance, votre présence en ligne est votre vitrine principale. Une stratégie digitale bien pensée peut multiplier vos opportunités de business.</p>
                
                <h2>1. Créez du contenu de valeur régulièrement</h2>
                <p>Le content marketing est l'un des moyens les plus efficaces d'attirer des clients qualifiés. Partagez votre expertise à travers :</p>
                <ul>
                    <li>Des articles de blog techniques</li>
                    <li>Des tutoriels vidéo</li>
                    <li>Des études de cas détaillées</li>
                    <li>Des posts sur LinkedIn</li>
                </ul>
                
                <h2>2. Optimisez votre SEO local</h2>
                <p>Si vous travaillez avec des clients locaux, le référencement local est crucial. Créez un profil Google Business, optimisez pour les mots-clés géographiques, et collectez des avis clients.</p>
                
                <h2>3. Utilisez les réseaux sociaux stratégiquement</h2>
                <p>Vous n'avez pas besoin d'être partout. Choisissez 1-2 plateformes où se trouvent vos clients idéaux :</p>
                <ul>
                    <li><strong>LinkedIn :</strong> Parfait pour le B2B et les services professionnels</li>
                    <li><strong>Twitter/X :</strong> Idéal pour les développeurs et tech</li>
                    <li><strong>Instagram :</strong> Excellent pour les créatifs (designers, photographes)</li>
                </ul>
                
                <h2>4. Construisez votre réseau activement</h2>
                <p>Le networking reste l'une des meilleures sources de clients. Participez à des événements, rejoignez des communautés en ligne, et ne sous-estimez jamais le pouvoir du bouche-à-oreille.</p>
                
                <h2>5. Utilisez l\'email marketing</h2>
                <p>Créez une newsletter pour rester en contact avec vos prospects et clients. Partagez des insights, des conseils, et vos derniers projets. L'email a un ROI bien supérieur aux réseaux sociaux.</p>
                
                <h2>6. Témoignages et preuves sociales</h2>
                <p>Affichez vos témoignages clients partout : sur votre site, vos profils sociaux, et dans vos propositions commerciales. Les études montrent que 92% des consommateurs font plus confiance aux recommandations qu'à la publicité.</p>
                
                <h2>Conclusion</h2>
                <p>Une présence en ligne optimisée prend du temps à construire, mais les résultats en valent la peine. Commencez par les bases et ajoutez progressivement des canaux à mesure que vous gagnez en traction.</p>
            `,
        },
        {
            id: 4,
            title: 'Comment fixer vos tarifs en tant que développeur freelance',
            excerpt: 'Guide complet pour déterminer vos tarifs horaires et forfaitaires en fonction de votre expérience, votre localisation et votre marché.',
            author: 'Équipe Innovaport',
            date: '28 Décembre 2024',
            category: 'Conseils',
            readTime: '8 min',
            image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=800&fit=crop&q=80',
            slug: 'fixer-tarifs-developpeur-freelance',
            content: `
                <h2>Introduction</h2>
                <p>Fixer ses tarifs est l'un des défis les plus difficiles pour un développeur freelance. Trop bas, vous vous sous-estimez. Trop haut, vous risquez de perdre des clients. Ce guide vous aidera à trouver le juste équilibre.</p>
                
                <h2>1. Évaluez votre niveau d\'expérience</h2>
                <p>Votre expérience est le facteur le plus important dans la détermination de vos tarifs. Un développeur junior peut facturer entre 30-50€/h, tandis qu'un senior peut aller jusqu'à 100-150€/h ou plus.</p>
                
                <h2>2. Recherchez les tarifs du marché</h2>
                <p>Faites une recherche approfondie des tarifs pratiqués dans votre région et votre secteur. Consultez des plateformes comme Malt, Upwork, ou des communautés de freelances pour avoir une idée précise.</p>
                
                <h2>3. Calculez vos coûts</h2>
                <p>N'oubliez pas d'inclure tous vos coûts : matériel, logiciels, assurance, retraite, vacances, maladie. Un bon calcul est de multiplier votre tarif souhaité par 1.5 à 2 pour couvrir tous ces coûts.</p>
                
                <h2>4. Différenciez vos tarifs selon le type de projet</h2>
                <p>Un projet récurrent peut être facturé moins cher qu'un projet ponctuel. Un projet passionnant peut justifier un tarif plus bas si cela vous permet d'acquérir de nouvelles compétences.</p>
                
                <h2>5. Négociez avec confiance</h2>
                <p>Ne sous-estimez jamais votre valeur. Si un client trouve vos tarifs trop élevés, expliquez votre valeur ajoutée plutôt que de baisser immédiatement vos prix.</p>
                
                <h2>Conclusion</h2>
                <p>Fixer ses tarifs est un processus continu. Réévaluez-les régulièrement en fonction de votre expérience, de la demande et de votre situation financière.</p>
            `,
        },
        {
            id: 5,
            title: 'Les meilleurs outils pour gérer vos projets freelance',
            excerpt: 'Découvrez les outils essentiels pour organiser vos projets, gérer votre temps et automatiser vos tâches administratives.',
            author: 'Équipe Innovaport',
            date: '20 Décembre 2024',
            category: 'Développement',
            readTime: '6 min',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop&q=80',
            slug: 'meilleurs-outils-projets-freelance',
            content: `
                <h2>Introduction</h2>
                <p>En tant que freelance, vous devez être à la fois développeur, chef de projet, comptable et commercial. Les bons outils peuvent vous faire gagner un temps précieux et améliorer votre productivité.</p>
                
                <h2>1. Gestion de projet</h2>
                <p>Des outils comme Trello, Asana ou Notion vous permettent d'organiser vos tâches, suivre vos projets et collaborer avec vos clients de manière efficace.</p>
                
                <h2>2. Suivi du temps</h2>
                <p>Des applications comme Toggl ou Clockify vous aident à suivre précisément le temps passé sur chaque projet, essentiel pour la facturation et l'amélioration de votre productivité.</p>
                
                <h2>3. Gestion financière</h2>
                <p>Des outils comme QuickBooks, FreshBooks ou même un simple tableur Excel peuvent vous aider à gérer vos factures, vos dépenses et vos impôts.</p>
                
                <h2>4. Communication</h2>
                <p>Slack, Discord ou même WhatsApp peuvent être utilisés pour communiquer efficacement avec vos clients et vos collaborateurs.</p>
                
                <h2>5. Automatisation</h2>
                <p>Zapier ou Make peuvent automatiser de nombreuses tâches répétitives, comme l'envoi de factures ou la mise à jour de votre CRM.</p>
                
                <h2>Conclusion</h2>
                <p>Investir dans les bons outils est essentiel pour réussir en tant que freelance. Choisissez ceux qui correspondent le mieux à votre workflow et à vos besoins spécifiques.</p>
            `,
        },
        {
            id: 6,
            title: 'Comment créer un devis professionnel qui convertit',
            excerpt: 'Apprenez à structurer vos devis pour maximiser vos chances d\'acceptation et présenter votre valeur de manière convaincante.',
            author: 'Équipe Innovaport',
            date: '15 Décembre 2024',
            category: 'Marketing',
            readTime: '5 min',
            image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=800&fit=crop&q=80',
            slug: 'creer-devis-professionnel-convertit',
            content: `
                <h2>Introduction</h2>
                <p>Un devis professionnel et bien structuré peut faire la différence entre décrocher un projet et le perdre. Voici comment créer des devis qui convertissent.</p>
                
                <h2>1. Structurez clairement votre devis</h2>
                <p>Un bon devis doit contenir : une description détaillée du projet, une décomposition des tâches, un calendrier, et bien sûr, le prix. Plus c'est clair, plus vous inspirez confiance.</p>
                
                <h2>2. Expliquez votre valeur ajoutée</h2>
                <p>Ne vous contentez pas de lister les tâches. Expliquez comment votre expertise va résoudre les problèmes du client et apporter de la valeur à son projet.</p>
                
                <h2>3. Proposez plusieurs options</h2>
                <p>Offrir plusieurs niveaux de service (basique, standard, premium) permet au client de choisir selon son budget tout en vous permettant de proposer une option plus élevée.</p>
                
                <h2>4. Incluez des garanties</h2>
                <p>Des garanties comme "satisfait ou remboursé" ou "support inclus pendant X mois" peuvent rassurer le client et augmenter vos chances d\'acceptation.</p>
                
                <h2>5. Facilitez la réponse</h2>
                <p>Incluez un bouton "Accepter le devis" ou un lien de paiement pour faciliter l\'acceptation. Plus c\'est facile, plus vous avez de chances de conclure.</p>
                
                <h2>Conclusion</h2>
                <p>Un devis professionnel est votre meilleur outil de vente. Prenez le temps de le soigner et vous verrez votre taux d\'acceptation augmenter significativement.</p>
            `,
        },
    ] : [
        {
            id: 1,
            title: 'How to Create a Portfolio That Attracts Clients',
            excerpt: 'Discover best practices for creating a portfolio that converts visitors into clients.',
            author: 'Innovaport Team',
            date: 'January 15, 2025',
            category: 'Tips',
            readTime: '5 min',
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop&q=80',
            slug: 'create-portfolio-attracts-clients',
            content: `
                <h2>Introduction</h2>
                <p>An effective portfolio is your best sales tool as a freelancer. It's not just about showing your work, but convincing potential clients that you're the right person for their project.</p>
                
                <h2>1. Show Only Your Best Work</h2>
                <p>Quality over quantity. Select 8 to 12 of your best projects that demonstrate your expertise and versatility. Each project should tell a story and show the impact of your work.</p>
                
                <h2>2. Include Detailed Case Studies</h2>
                <p>For each major project, create a case study that explains:</p>
                <ul>
                    <li>The client's problem</li>
                    <li>Your approach and methodology</li>
                    <li>Challenges encountered and how you overcame them</li>
                    <li>Measurable results achieved</li>
                </ul>
                
                <h2>3. Optimize for Your Target Audience</h2>
                <p>Adapt your portfolio to the clients you want to attract. If you're targeting tech startups, highlight innovative and agile projects. For large companies, show your ability to manage complex projects.</p>
                
                <h2>4. Add Client Testimonials</h2>
                <p>Authentic testimonials strengthen your credibility. Ask satisfied clients to share their experience working with you, focusing on results achieved.</p>
                
                <h2>5. Make Contact Easy</h2>
                <p>Your call-to-action should be clear and visible on every page. Include multiple ways to contact you and respond quickly to requests.</p>
                
                <h2>Conclusion</h2>
                <p>A successful portfolio is a living tool that evolves with your career. Update it regularly and analyze what works to continuously improve it.</p>
            `,
        },
        {
            id: 2,
            title: '5 Mistakes to Avoid in Your Developer Portfolio',
            excerpt: 'Common mistakes that can harm your professional image and how to avoid them.',
            author: 'Innovaport Team',
            date: 'January 10, 2025',
            category: 'Development',
            readTime: '7 min',
            image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=800&fit=crop&q=80',
            slug: 'mistakes-developer-portfolio',
            content: `
                <h2>Introduction</h2>
                <p>Your portfolio is often the first impression you give to potential clients. Avoiding these common mistakes can make the difference between landing a contract and being ignored.</p>
                
                <h2>Mistake #1: A Too Slow Site</h2>
                <p>A portfolio that takes more than 3 seconds to load loses 50% of its visitors. Optimize your images, use high-performance hosting, and minimize your code.</p>
                <p><strong>Solution:</strong> Use tools like Lighthouse to identify performance issues and fix them.</p>
                
                <h2>Mistake #2: Lack of Concrete Projects</h2>
                <p>Saying "I master React" without showing concrete React projects convinces no one. Each listed skill must be illustrated by at least one project.</p>
                <p><strong>Solution:</strong> Create personal projects if you lack client projects. A good side project can be as impressive as a commercial project.</p>
                
                <h2>Mistake #3: Amateur or Dated Design</h2>
                <p>A design that looks like it's from 2010 suggests your technical skills are also dated. Even if you're a backend developer, your portfolio must be modern and professional.</p>
                <p><strong>Solution:</strong> Use modern templates or hire a designer if design isn't your strength.</p>
                
                <h2>Mistake #4: No Source Code</h2>
                <p>Developers want to see your code. A GitHub link to your projects shows your transparency and allows recruiters to evaluate your coding style.</p>
                <p><strong>Solution:</strong> Add links to your GitHub repositories for each project, with a detailed README.</p>
                
                <h2>Mistake #5: No Clear Call-to-Action</h2>
                <p>If a potential client likes your work but doesn't know how to contact you easily, you lose an opportunity.</p>
                <p><strong>Solution:</strong> Place clear contact buttons on every page, with multiple options (email, form, appointment calendar).</p>
                
                <h2>Conclusion</h2>
                <p>Avoiding these common mistakes can transform your portfolio from a simple online CV into a real lead generation tool. Take the time to perfect every aspect.</p>
            `,
        },
        {
            id: 3,
            title: 'Optimize Your Online Presence as a Freelancer',
            excerpt: 'Strategies to improve your visibility and attract more qualified clients.',
            author: 'Innovaport Team',
            date: 'January 5, 2025',
            category: 'Marketing',
            readTime: '6 min',
            image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=800&fit=crop&q=80',
            slug: 'optimize-online-presence-freelancer',
            content: `
                <h2>Introduction</h2>
                <p>As a freelancer, your online presence is your main showcase. A well-thought-out digital strategy can multiply your business opportunities.</p>
                
                <h2>1. Create Valuable Content Regularly</h2>
                <p>Content marketing is one of the most effective ways to attract qualified clients. Share your expertise through:</p>
                <ul>
                    <li>Technical blog articles</li>
                    <li>Video tutorials</li>
                    <li>Detailed case studies</li>
                    <li>LinkedIn posts</li>
                </ul>
                
                <h2>2. Optimize Your Local SEO</h2>
                <p>If you work with local clients, local SEO is crucial. Create a Google Business profile, optimize for geographic keywords, and collect client reviews.</p>
                
                <h2>3. Use Social Media Strategically</h2>
                <p>You don't need to be everywhere. Choose 1-2 platforms where your ideal clients are:</p>
                <ul>
                    <li><strong>LinkedIn:</strong> Perfect for B2B and professional services</li>
                    <li><strong>Twitter/X:</strong> Ideal for developers and tech</li>
                    <li><strong>Instagram:</strong> Excellent for creatives (designers, photographers)</li>
                </ul>
                
                <h2>4. Build Your Network Actively</h2>
                <p>Networking remains one of the best sources of clients. Attend events, join online communities, and never underestimate the power of word-of-mouth.</p>
                
                <h2>5. Use Email Marketing</h2>
                <p>Create a newsletter to stay in touch with your prospects and clients. Share insights, tips, and your latest projects. Email has a much higher ROI than social media.</p>
                
                <h2>6. Testimonials and Social Proof</h2>
                <p>Display your client testimonials everywhere: on your site, social profiles, and in your proposals. Studies show that 92% of consumers trust recommendations more than advertising.</p>
                
                <h2>Conclusion</h2>
                <p>An optimized online presence takes time to build, but the results are worth it. Start with the basics and gradually add channels as you gain traction.</p>
            `,
        },
        {
            id: 4,
            title: 'How to Set Your Rates as a Freelance Developer',
            excerpt: 'Complete guide to determining your hourly and fixed rates based on your experience, location, and market.',
            author: 'Innovaport Team',
            date: 'December 28, 2024',
            category: 'Tips',
            readTime: '8 min',
            image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=800&fit=crop&q=80',
            slug: 'set-rates-freelance-developer',
            content: `
                <h2>Introduction</h2>
                <p>Setting your rates is one of the most challenging aspects of being a freelance developer. Too low, and you're undervaluing yourself. Too high, and you risk losing clients. This guide will help you find the right balance.</p>
                
                <h2>1. Assess Your Experience Level</h2>
                <p>Your experience is the most important factor in determining your rates. A junior developer can charge between $30-50/hour, while a senior can go up to $100-150/hour or more.</p>
                
                <h2>2. Research Market Rates</h2>
                <p>Do thorough research on rates in your region and sector. Check platforms like Upwork, Toptal, or freelance communities to get an accurate idea.</p>
                
                <h2>3. Calculate Your Costs</h2>
                <p>Don't forget to include all your costs: equipment, software, insurance, retirement, vacation, sick leave. A good calculation is to multiply your desired rate by 1.5 to 2 to cover all these costs.</p>
                
                <h2>4. Differentiate Rates by Project Type</h2>
                <p>A recurring project can be charged less than a one-time project. An exciting project can justify a lower rate if it allows you to acquire new skills.</p>
                
                <h2>5. Negotiate with Confidence</h2>
                <p>Never underestimate your value. If a client finds your rates too high, explain your added value rather than immediately lowering your prices.</p>
                
                <h2>Conclusion</h2>
                <p>Setting your rates is an ongoing process. Regularly reassess them based on your experience, demand, and financial situation.</p>
            `,
        },
        {
            id: 5,
            title: 'Best Tools to Manage Your Freelance Projects',
            excerpt: 'Discover essential tools to organize your projects, manage your time, and automate your administrative tasks.',
            author: 'Innovaport Team',
            date: 'December 20, 2024',
            category: 'Development',
            readTime: '6 min',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop&q=80',
            slug: 'best-tools-freelance-projects',
            content: `
                <h2>Introduction</h2>
                <p>As a freelancer, you need to be both a developer, project manager, accountant, and salesperson. The right tools can save you precious time and improve your productivity.</p>
                
                <h2>1. Project Management</h2>
                <p>Tools like Trello, Asana, or Notion allow you to organize your tasks, track your projects, and collaborate with your clients effectively.</p>
                
                <h2>2. Time Tracking</h2>
                <p>Applications like Toggl or Clockify help you accurately track time spent on each project, essential for billing and improving your productivity.</p>
                
                <h2>3. Financial Management</h2>
                <p>Tools like QuickBooks, FreshBooks, or even a simple Excel spreadsheet can help you manage your invoices, expenses, and taxes.</p>
                
                <h2>4. Communication</h2>
                <p>Slack, Discord, or even WhatsApp can be used to communicate effectively with your clients and collaborators.</p>
                
                <h2>5. Automation</h2>
                <p>Zapier or Make can automate many repetitive tasks, such as sending invoices or updating your CRM.</p>
                
                <h2>Conclusion</h2>
                <p>Investing in the right tools is essential to succeed as a freelancer. Choose those that best match your workflow and specific needs.</p>
            `,
        },
        {
            id: 6,
            title: 'How to Create a Professional Quote That Converts',
            excerpt: 'Learn how to structure your quotes to maximize your acceptance chances and present your value convincingly.',
            author: 'Innovaport Team',
            date: 'December 15, 2024',
            category: 'Marketing',
            readTime: '5 min',
            image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=800&fit=crop&q=80',
            slug: 'create-professional-quote-converts',
            content: `
                <h2>Introduction</h2>
                <p>A professional and well-structured quote can make the difference between landing a project and losing it. Here's how to create quotes that convert.</p>
                
                <h2>1. Structure Your Quote Clearly</h2>
                <p>A good quote should contain: a detailed project description, a breakdown of tasks, a timeline, and of course, the price. The clearer it is, the more you inspire confidence.</p>
                
                <h2>2. Explain Your Added Value</h2>
                <p>Don't just list tasks. Explain how your expertise will solve the client's problems and bring value to their project.</p>
                
                <h2>3. Offer Multiple Options</h2>
                <p>Offering several service levels (basic, standard, premium) allows the client to choose according to their budget while allowing you to propose a higher option.</p>
                
                <h2>4. Include Guarantees</h2>
                <p>Guarantees like "satisfied or refunded" or "support included for X months" can reassure the client and increase your acceptance chances.</p>
                
                <h2>5. Make Response Easy</h2>
                <p>Include an "Accept Quote" button or payment link to facilitate acceptance. The easier it is, the more likely you are to close the deal.</p>
                
                <h2>Conclusion</h2>
                <p>A professional quote is your best sales tool. Take the time to polish it and you'll see your acceptance rate increase significantly.</p>
            `,
        },
    ];

    const post = blogPosts.find(p => p.slug === slug);

    if (!post) {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                    <h1 className="text-3xl font-bold mb-4">
                        {language === 'fr' ? 'Article non trouvé' : 'Article not found'}
                    </h1>
                    <Link href="/blog" className="text-blue-600 hover:text-blue-700">
                        {language === 'fr' ? 'Retour au blog' : 'Back to blog'}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link
                            href="/blog"
                            className="flex items-center gap-2 text-gray-700 hover:text-[#1E3A8A] transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
                            <span className="text-sm font-medium hidden sm:inline">
                                {language === 'fr' ? 'Retour au blog' : 'Back to blog'}
                            </span>
                        </Link>
                        <Link href="/" aria-label="Innovaport">
                            <Image
                                src="/innovaport-logo.png"
                                alt="InnovaPort Logo"
                                width={200}
                                height={60}
                                className="h-12 w-auto object-contain"
                                priority
                                sizes="200px"
                            />
                        </Link>
                        <LanguageSwitcher />
                    </div>
                </div>
            </nav>

            {/* Article Content */}
            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Article Header */}
                <header className="mb-8">
                    <div className="flex items-center gap-4 mb-4 flex-wrap">
                        <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            {post.category}
                        </span>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Calendar className="w-4 h-4" />
                            {post.date}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Clock className="w-4 h-4" />
                            {post.readTime}
                        </div>
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center gap-3 text-gray-600">
                        <User className="w-5 h-5" />
                        <span className="font-medium">{post.author}</span>
                    </div>
                </header>

                {/* Featured Image */}
                <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="relative h-96 sm:h-[500px] bg-gradient-to-br from-blue-100 to-indigo-100">
                        {post.image ? (
                            <>
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    priority
                                    quality={90}
                                    sizes="(max-width: 768px) 100vw, 896px"
                                    unoptimized={post.image.includes('unsplash.com')}
                                />
                                {/* Overlay pour améliorer la lisibilité du texte si nécessaire */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-200 to-indigo-200">
                                <div className="text-center">
                                    <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                    <p className="text-gray-500 font-medium">{post.title}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Article Body */}
                <div
                    className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-li:marker:text-blue-600 prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-3xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-2xl"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Share Section */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600 font-medium">
                            {language === 'fr' ? 'Partager :' : 'Share:'}
                        </span>
                        <div className="flex gap-3">
                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                aria-label="Share on Facebook"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(post.title)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                                aria-label="Share on Twitter"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a
                                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                                aria-label="Share on LinkedIn"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {language === 'fr' ? 'Besoin d\'aide pour votre projet ?' : 'Need help with your project?'}
                    </h3>
                    <p className="text-gray-700 mb-6">
                        {language === 'fr' 
                            ? 'Notre équipe d\'experts est là pour vous accompagner dans la création de votre portfolio professionnel.'
                            : 'Our team of experts is here to help you create your professional portfolio.'}
                    </p>
                    <Link
                        href="/contact"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
                    >
                        {language === 'fr' ? 'Contactez-nous' : 'Contact Us'}
                    </Link>
                </div>

                {/* Related Articles */}
                <div className="mt-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                        {language === 'fr' ? 'Articles recommandés' : 'Recommended Articles'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {blogPosts.filter(p => p.id !== post.id).slice(0, 2).map(relatedPost => (
                            <Link
                                key={relatedPost.id}
                                href={`/blog/${relatedPost.slug}`}
                                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group"
                            >
                                <div className="relative h-48">
                                    <Image
                                        src={relatedPost.image}
                                        alt={relatedPost.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                                <div className="p-6">
                                    <span className="text-sm text-blue-600 font-medium">{relatedPost.category}</span>
                                    <h4 className="text-xl font-bold text-gray-900 mt-2 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                        {relatedPost.title}
                                    </h4>
                                    <p className="text-gray-600 text-sm line-clamp-2">{relatedPost.excerpt}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </article>

            <Footer />
        </div>
    );
}

