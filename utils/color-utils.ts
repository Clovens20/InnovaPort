/**
 * Utilitaires pour la manipulation des couleurs
 * 
 * Fonction: Fonctions utilitaires pour convertir et manipuler les couleurs
 * Dépendances: Aucune
 * Raison: Évite la duplication de la fonction hexToRgba dans plusieurs fichiers
 */

/**
 * Convertit une couleur hexadécimale en rgba
 * @param hex - Couleur hexadécimale (ex: "#1E3A8A")
 * @param alpha - Valeur alpha (0-1)
 * @returns Chaîne rgba (ex: "rgba(30, 58, 138, 0.1)")
 */
export function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

