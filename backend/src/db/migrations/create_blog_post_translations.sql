-- Migration: Create blog_post_translations table for multilingual support
-- This table stores translations of blog posts in different languages

-- Create the translations table
CREATE TABLE IF NOT EXISTS blog_post_translations (
    id SERIAL PRIMARY KEY,
    blog_post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    language VARCHAR(5) NOT NULL DEFAULT 'en',
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blog_post_id, language)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_translations_post_id ON blog_post_translations(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_translations_language ON blog_post_translations(language);
CREATE INDEX IF NOT EXISTS idx_blog_translations_post_lang ON blog_post_translations(blog_post_id, language);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_blog_translation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_blog_translation_updated_at ON blog_post_translations;
CREATE TRIGGER trigger_blog_translation_updated_at
    BEFORE UPDATE ON blog_post_translations
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_translation_updated_at();

-- Migrate existing blog posts to translations table (English as base)
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt, meta_title, meta_description)
SELECT
    id,
    COALESCE(language, 'en'),
    title,
    content,
    excerpt,
    meta_title,
    meta_description
FROM blog_posts
WHERE NOT EXISTS (
    SELECT 1 FROM blog_post_translations WHERE blog_post_id = blog_posts.id AND language = COALESCE(blog_posts.language, 'en')
);

-- Add sample French translations for some popular posts
-- Translation 1: Kerala Backwaters
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT
    id,
    'fr',
    'Découvrir les Backwaters du Kerala : Guide Complet',
    '<h2>Un Paradis Aquatique</h2>
    <p>Les backwaters du Kerala sont un réseau labyrinthique de lagunes saumâtres, de lacs et de canaux qui s''étend le long de la côte du Kerala. Cette merveille naturelle unique offre une expérience de voyage incomparable.</p>

    <h2>Comment Explorer</h2>
    <h3>Croisières en House-boat</h3>
    <p>L''expérience la plus populaire des backwaters est une croisière en house-boat traditionnel appelé "Kettuvallam". Ces bateaux offrent un hébergement confortable avec chambres climatisées, ponts d''observation et cuisine fraîche à bord.</p>

    <h3>Excursions en Canoë</h3>
    <p>Pour une expérience plus intime, optez pour une excursion en canoë traditionnel à travers les canaux étroits. Cela vous permet d''atteindre des zones inaccessibles aux bateaux plus grands.</p>

    <h2>Meilleure Période</h2>
    <p>La meilleure période pour visiter est de novembre à février quand le temps est agréable et sec. Évitez la mousson (juin-septembre) car les niveaux d''eau peuvent être imprévisibles.</p>

    <h2>Destinations Populaires</h2>
    <h3>Alleppey (Alappuzha)</h3>
    <p>Connue comme la "Venise de l''Est", Alleppey est le point de départ le plus populaire pour les croisières en house-boat.</p>

    <h3>Kumarakom</h3>
    <p>Cette destination paisible sur le lac Vembanad offre des stations luxueuses et une réserve ornithologique.</p>',
    'Explorez les sereins backwaters du Kerala avec notre guide complet sur les house-boats, la culture locale et les trésors cachés.'
FROM blog_posts
WHERE slug = 'discovering-kerala-backwaters-complete-guide'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- Translation 2: Mysore Heritage
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT
    id,
    'fr',
    'Circuit Patrimonial de Mysore : Palais, Yoga et Saris de Soie',
    '<h2>La Cité des Palais</h2>
    <p>Mysore (Mysuru), la capitale culturelle du Karnataka, est renommée pour son héritage royal, ses magnifiques palais, son bois de santal, ses saris de soie et comme berceau du yoga Ashtanga. La ville conserve son charme d''antan tout en embrassant la modernité.</p>

    <h2>Attractions Incontournables</h2>
    <h3>Palais de Mysore (Amba Vilas)</h3>
    <p>Le joyau de Mysore, ce palais indo-sarrasin est l''un des monuments les plus visités de l''Inde. Le palais est illuminé par 97 000 ampoules chaque dimanche et pendant les festivals - un spectacle à couper le souffle. Ne manquez pas la Salle du Durbar et le trône royal orné.</p>

    <h3>Collines et Temple de Chamundi</h3>
    <p>Montez les 1 000 marches (ou prenez la route) jusqu''au Temple de Chamundeshwari au sommet des Collines de Chamundi. Le sommet offre des vues panoramiques sur la ville. En chemin, visitez l''imposante statue de Nandi (taureau) de 5 mètres sculptée dans un seul rocher.</p>

    <h3>Jardins de Brindavan</h3>
    <p>Situés à 21 km de Mysore, ces jardins en terrasses sous le barrage de Krishnaraja Sagar présentent des fontaines musicales, des jardins illuminés et des promenades en bateau. Le spectacle des fontaines du soir est spectaculaire.</p>

    <h2>Yoga Ashtanga</h2>
    <p>Mysore est le berceau du Yoga Ashtanga Vinyasa. L''Institut K. Pattabhi Jois Ashtanga Yoga (KPJAYI) attire des pratiquants de yoga du monde entier. De nombreuses écoles de yoga proposent des cours de courte durée et des sessions découverte.</p>

    <h2>Expériences Shopping</h2>
    <h3>Soie de Mysore</h3>
    <p>Visitez l''Usine Gouvernementale de Tissage de Soie pour voir la production de soie et acheter des saris authentiques en soie de Mysore, symbole d''élégance et de tradition.</p>',
    'Découvrez la grandeur royale de Mysore, ville des magnifiques palais, du yoga traditionnel et de la soie mondialement célèbre.'
FROM blog_posts
WHERE slug = 'mysore-heritage-trail-palaces-yoga-silk'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- Translation 3: Munnar Tea Gardens
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT
    id,
    'fr',
    'Munnar : Voyage à Travers les Jardins de Thé et les Collines Brumeuses',
    '<h2>Paradis des Plantations de Thé</h2>
    <p>Munnar, nichée dans les Ghâts occidentaux du Kerala, est l''une des stations de montagne les plus pittoresques de l''Inde. Connue pour ses vastes plantations de thé, sa faune sauvage et ses paysages à couper le souffle, c''est une destination incontournable pour les amoureux de la nature.</p>

    <h2>Plantations de Thé</h2>
    <h3>Musée du Thé KDHP</h3>
    <p>Découvrez l''histoire et le processus de fabrication du thé dans ce musée informatif. Des visites guidées vous emmènent à travers les plantations et les usines de transformation.</p>

    <h3>Domaine Lockhart</h3>
    <p>L''une des plus anciennes plantations de Munnar, offrant des vues spectaculaires sur les collines verdoyantes recouvertes de théiers.</p>

    <h2>Faune et Nature</h2>
    <h3>Parc National d''Eravikulam</h3>
    <p>Habitat du rare Tahr de Nilgiri, ce parc offre des sentiers de randonnée à travers des prairies d''altitude et des forêts de shola. La floraison des Neelakurinji (tous les 12 ans) transforme les collines en un tapis bleu-violet.</p>

    <h3>Top Station</h3>
    <p>Le point le plus élevé de Munnar, offrant des vues panoramiques sur le Tamil Nadu voisin. Par temps clair, vous pouvez voir jusqu''à Madurai.</p>

    <h2>Activités</h2>
    <p>Trekking, observation des oiseaux, visite des cascades (Attukal, Lakkam), et dégustation de thé frais dans les factories locales.</p>

    <h2>Meilleure Période</h2>
    <p>Septembre à mai est idéal. Les mois de mousson (juin-août) offrent une verdure luxuriante mais des pluies fréquentes.</p>',
    'Découvrez la beauté époustouflante de Munnar, la station de montagne la plus pittoresque du Kerala entourée de plantations de thé émeraude.'
FROM blog_posts
WHERE slug = 'munnar-journey-tea-gardens-misty-hills'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- Translation 4: Hampi UNESCO Site
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT
    id,
    'fr',
    'Hampi : À la Découverte d''un Site du Patrimoine Mondial de l''UNESCO',
    '<h2>Ruines de l''Empire Vijayanagara</h2>
    <p>Hampi, autrefois capitale du puissant Empire Vijayanagara, est aujourd''hui un site du patrimoine mondial de l''UNESCO parsemé de temples, palais et pavillons époustouflants. Ce paysage surréaliste de rochers et de ruines est un paradis pour les photographes et les passionnés d''histoire.</p>

    <h2>Sites Sacrés</h2>
    <h3>Temple de Virupaksha</h3>
    <p>L''un des plus anciens temples en activité en Inde, dédié au Seigneur Shiva. Le gopuram (tour) de 50 mètres domine le bazar principal de Hampi.</p>

    <h3>Temple de Vittala</h3>
    <p>Chef-d''œuvre architectural avec le célèbre char en pierre et les piliers musicaux qui émettent des notes musicales lorsqu''on les frappe.</p>

    <h3>Temple de Hazara Rama</h3>
    <p>Temple royal privé avec des bas-reliefs exquis représentant le Ramayana sur ses murs.</p>

    <h2>Centre Royal</h2>
    <h3>Lotus Mahal</h3>
    <p>Pavillon élégant combinant les styles architecturaux hindou et islamique, utilisé par les dames royales.</p>

    <h3>Écuries des Éléphants</h3>
    <p>Structure impressionnante avec 11 dômes qui abritait autrefois les éléphants royaux.</p>

    <h2>Conseils Pratiques</h2>
    <p>Louez un vélo ou un scooter pour explorer. Prévoyez 2-3 jours pour voir les principaux sites. Le lever du soleil depuis Matanga Hill est spectaculaire.</p>

    <h2>Meilleure Période</h2>
    <p>Octobre à février quand le temps est agréable. Évitez l''été (mars-mai) en raison de la chaleur intense.</p>',
    'Découvrez les magnifiques ruines de l''Empire Vijayanagara à Hampi, Karnataka - un paradis pour les photographes et les amoureux de l''histoire.'
FROM blog_posts
WHERE slug = 'hampi-walking-through-unesco-world-heritage'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- Translation 5: Silk, Spices & Sandalwood
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT
    id,
    'fr',
    'Soie, Épices et Bois de Santal : Artisanat du Sud de l''Inde',
    '<h2>Un Héritage Artisanal</h2>
    <p>Les traditions artisanales du Sud de l''Inde représentent des siècles de savoir-faire transmis de génération en génération. Du tissage de soie complexe à la sculpture aromatique du bois de santal, ces artisanats sont partie intégrante de l''identité culturelle et économique de la région.</p>

    <h2>Tissage de Soie</h2>
    <h3>Soie de Kanchipuram (Tamil Nadu)</h3>
    <p>Considérés comme la reine des soies, les saris de Kanchipuram sont réputés pour leur durabilité et leur riche travail de zari doré. Chaque sari nécessite 10 à 20 jours de tissage. Les motifs traditionnels incluent les bordures de temple, paons, éléphants et carreaux.</p>

    <h3>Soie de Mysore (Karnataka)</h3>
    <p>Connue pour sa qualité de soie pure et sa texture fine. L''Usine Gouvernementale de Tissage de Soie à Mysore présente tout le processus de production de la soie, du cocon au sari fini.</p>

    <h2>Artisanat du Métal</h2>
    <h3>Fonte de Bronze (Tamil Nadu)</h3>
    <p>Swamimalai, près de Thanjavur, est célèbre pour la fabrication d''idoles en bronze utilisant l''ancienne technique de la cire perdue. Les artisans créent des statues exquises de divinités hindoues.</p>

    <h2>Bois de Santal</h2>
    <p>Le Karnataka est réputé pour ses produits en bois de santal - huiles, encens, figurines sculptées. L''Usine Gouvernementale d''Huile de Bois de Santal à Mysore propose des produits authentiques.</p>

    <h2>Épices</h2>
    <p>Le Kerala, le "Pays des Épices", produit cardamome, poivre, cannelle et clous de girofle. Visitez les plantations d''épices à Thekkady ou Wayanad pour des visites guidées et des achats directs.</p>',
    'Des traditions artisanales séculaires du Sud de l''Inde - tissage de soie, sculpture de bois de santal et commerce des épices.'
FROM blog_posts
WHERE slug = 'silk-spices-sandalwood-crafts-south-india'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- Verify migration
SELECT
    language,
    COUNT(*) as count
FROM blog_post_translations
GROUP BY language
ORDER BY language;
