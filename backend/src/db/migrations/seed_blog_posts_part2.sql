-- Migration: Seed remaining 9 blog posts (Part 2)
-- Date: 2025-11-17
-- Description: Culture & History (3), Food & Cuisine (3), Adventure & Activities (3)

DO $$
DECLARE
  admin_user_id INTEGER;
BEGIN
  SELECT id INTO admin_user_id FROM users WHERE role = 'administrator' LIMIT 1;
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'No administrator user found. Please create an admin user first.';
  END IF;

  INSERT INTO blog_posts (
    title, slug, excerpt, content, featured_image_url, thumbnail_image,
    author_id, is_published, is_featured, moderation_status, published_at,
    reading_time, meta_title, meta_description
  ) VALUES

  -- ============================================
  -- CULTURE & HISTORY (3 posts - category_id = 3)
  -- ============================================

  (
    'Temples of Tamil Nadu: Living Monuments of Dravidian Architecture',
    'temples-tamil-nadu-dravidian-architecture',
    'Journey through Tamil Nadu''s magnificent temples showcasing 2,000 years of Dravidian architecture, spirituality, and living traditions.',
    '<h2>The Temple State</h2>
    <p>Tamil Nadu is home to over 30,000 temples, each telling stories of devotion, architectural brilliance, and cultural continuity spanning two millennia. These aren''t museums but living places of worship where ancient rituals continue daily.</p>

    <h2>Architectural Evolution</h2>
    <h3>Pallava Period (3rd-9th Century)</h3>
    <p>Early rock-cut temples like those at Mahabalipuram showcase the transition from rock-cut to structural architecture. The Shore Temple exemplifies early Dravidian style with its pyramidal vimanas (tower over sanctum).</p>

    <h3>Chola Period (9th-13th Century)</h3>
    <p>The golden age of Tamil temple architecture. Brihadeeswara Temple in Thanjavur, a UNESCO World Heritage Site, features a 66-meter vimana and massive Nandi statue. The temple''s shadow never falls on the ground due to architectural genius.</p>

    <h3>Nayak Period (16th-18th Century)</h3>
    <p>Characterized by towering gopurams (gateway towers) often taller than the main shrine. Meenakshi Amman Temple in Madurai features 14 gopurams, the tallest reaching 52 meters, covered in thousands of painted sculptures.</p>

    <h2>Must-Visit Temples</h2>
    <h3>Meenakshi Amman Temple, Madurai</h3>
    <p>Dedicated to Goddess Meenakshi (Parvati) and her consort Sundareshwarar (Shiva). The temple complex covers 45 acres with 12 gopurams. Don''t miss the Hall of Thousand Pillars and the evening ceremony when Shiva''s processional deity is taken to Meenakshi''s chamber.</p>

    <h3>Brihadeeswara Temple, Thanjavur</h3>
    <p>Built by Raja Raja Chola I in 1010 CE, this temple is an engineering marvel. The 80-ton capstone was lifted to 66 meters using a 6 km ramp. The Nandi statue carved from single rock weighs 25 tons.</p>

    <h3>Ramanathaswamy Temple, Rameswaram</h3>
    <p>Famous for the longest temple corridor in India (197 meters) with 1,212 intricately carved pillars. The temple has 22 sacred wells with water of different tastes. An important pilgrimage site mentioned in the Ramayana.</p>

    <h3>Ekambareswarar Temple, Kanchipuram</h3>
    <p>One of the Pancha Bhoota Stalas representing Earth element. Features a 3,500-year-old mango tree with four branches bearing different types of mangoes. The temple has a gopuram measuring 59 meters.</p>

    <h3>Nataraja Temple, Chidambaram</h3>
    <p>Dedicated to Shiva as the cosmic dancer (Nataraja). The architecture symbolizes the human body with five sabhas (halls) representing five elements. The temple''s roof is covered with 21,600 golden tiles representing the 21,600 breaths a human takes daily.</p>

    <h2>Temple Rituals & Timing</h2>
    <p>Most temples open early morning (5-6 AM) and close by 9 PM with afternoon breaks (12-4 PM). Key rituals include:</p>
    <ul>
      <li><strong>Abhishekam:</strong> Sacred bathing of deity (early morning)</li>
      <li><strong>Alankaram:</strong> Decoration of deity</li>
      <li><strong>Deeparadhana:</strong> Evening lamp ceremony (6-7 PM)</li>
      <li><strong>Ekadasi:</strong> Special worship on 11th lunar day</li>
    </ul>

    <h2>Temple Etiquette</h2>
    <ul>
      <li>Remove footwear before entering temple premises</li>
      <li>Dress modestly - no shorts or sleeveless tops</li>
      <li>Men may need to remove shirts in inner sanctum (depending on temple)</li>
      <li>Photography usually prohibited inside sanctum</li>
      <li>Maintain silence in prayer halls</li>
      <li>Walk clockwise around shrines (pradakshina)</li>
      <li>Accept prasadam (sacred food) with right hand</li>
    </ul>

    <h2>Festivals</h2>
    <p>Temples come alive during festivals with processions, music, and dance:</p>
    <ul>
      <li><strong>Chithirai Festival, Madurai (Apr-May):</strong> 10-day celebration with chariot procession</li>
      <li><strong>Natyanjali Dance Festival, Chidambaram (Feb-Mar):</strong> Classical dance dedicated to Nataraja</li>
      <li><strong>Car Festival, Thiruvarur (Apr-May):</strong> Massive temple chariot weighing 300 tons</li>
    </ul>

    <h2>Architectural Elements</h2>
    <ul>
      <li><strong>Gopuram:</strong> Towering gateway with painted sculptures</li>
      <li><strong>Vimana:</strong> Tower over main sanctum</li>
      <li><strong>Mandapam:</strong> Pillared hall for assembly</li>
      <li><strong>Prakaram:</strong> Circumambulatory pathway</li>
      <li><strong>Dwajasthambam:</strong> Flagstaff in front of sanctum</li>
      <li><strong>Balipeetam:</strong> Offering platform</li>
    </ul>

    <h2>Visiting Tips</h2>
    <ul>
      <li>Visit early morning or late evening to avoid crowds</li>
      <li>Hire a knowledgeable guide for deeper understanding</li>
      <li>Combine multiple temples in Kanchipuram (City of 1,000 Temples)</li>
      <li>Respect ongoing worship - don''t disturb devotees</li>
      <li>Try temple prasadam - simple vegetarian food blessed by deity</li>
      <li>Allow 2-3 hours for major temples</li>
    </ul>',
    'https://images.unsplash.com/photo-1582608703725-799c47d50b91?w=1200&h=800',
    'https://images.unsplash.com/photo-1582608703725-799c47d50b91?w=600&h=400',
    admin_user_id, true, false, 'approved', NOW() - INTERVAL '9 days', 9,
    'Tamil Nadu Temples - Dravidian Architecture Heritage Guide',
    'Explore Tamil Nadu''s magnificent temples: Meenakshi, Brihadeeswara, Rameshwaram. Complete guide to Dravidian architecture and living traditions.'
  ),

  (
    'Silk, Spices & Sandalwood: Crafts of South India',
    'silk-spices-sandalwood-crafts-south-india',
    'Discover the traditional crafts and artisan heritage that have defined South India''s identity for centuries.',
    '<h2>A Legacy of Craftsmanship</h2>
    <p>South India''s craft traditions represent centuries of skill passed through generations. From intricate silk weaving to aromatic sandalwood carving, these crafts are integral to the region''s cultural identity and economy.</p>

    <h2>Silk Weaving</h2>
    <h3>Kanchipuram Silk (Tamil Nadu)</h3>
    <p>Considered the queen of silks, Kanchipuram sarees are known for durability and rich gold zari work. Each saree takes 10-20 days to weave. The traditional motifs include temple borders, peacocks, elephants, and checks. Visit weaving centers to watch artisans work on handlooms.</p>

    <h3>Mysore Silk (Karnataka)</h3>
    <p>Known for its pure silk quality and fine texture. The Government Silk Weaving Factory in Mysore showcases the entire silk production process from cocoon to finished saree. Mysore silk is slightly more affordable than Kanchipuram but equally beautiful.</p>

    <h3>Pochampally Ikat (Telangana)</h3>
    <p>Though technically Telangana, this UNESCO recognized craft influences South Indian fashion. The resist-dyeing technique creates geometric patterns before weaving.</p>

    <h2>Metal Crafts</h2>
    <h3>Bronze Casting (Tamil Nadu)</h3>
    <p>Swamimalai, near Thanjavur, is famous for bronze idol making using the ancient lost-wax technique (cire perdue). Artisans create exquisite Nataraja, Ganesha, and other deity idols. The process takes weeks for a single piece.</p>

    <h3>Bidriware (Karnataka)</h3>
    <p>Unique metalwork from Bidar featuring silver inlay on blackened zinc and copper alloy. Traditional items include vases, plates, jewelry boxes with intricate floral and geometric patterns.</p>

    <h2>Woodcraft</h2>
    <h3>Sandalwood Carving (Karnataka)</h3>
    <p>Mysore is the sandalwood capital. Artisans carve intricate idols, jewelry boxes, and decorative items from fragrant sandalwood. The Government Sandalwood Oil Factory offers authentic products and demonstrations.</p>

    <h3>Rosewood Furniture (Tamil Nadu, Kerala)</h3>
    <p>Chettinad region produces ornate rosewood furniture with brass fittings. Traditional designs include pillared beds, swings, and carved doors.</p>

    <h2>Textiles Beyond Silk</h2>
    <h3>Kalamkari (Andhra Pradesh/Tamil Nadu)</h3>
    <p>Hand-painted or block-printed cotton textiles using vegetable dyes. Srikalahasti style uses hand-painting, while Machilipatnam style uses block-printing. Mythological scenes and floral patterns dominate.</p>

    <h3>Kasavu (Kerala)</h3>
    <p>Traditional white cotton sarees and dhotis with golden zari borders worn during festivals and ceremonies. The simplicity and elegance represent Kerala''s aesthetic.</p>

    <h2>Stone Craft</h2>
    <h3>Stone Sculpture (Tamil Nadu, Karnataka)</h3>
    <p>Mahabalipuram continues the Pallava tradition of granite sculpting. Artisans create everything from small statues to large temple sculptures. Visitors can watch craftsmen work and purchase souvenirs.</p>

    <h2>Spice Trading</h2>
    <h3>Kerala Spices</h3>
    <p>Kerala''s spice markets in Kochi and spice plantations in Munnar and Wayanad offer cardamom, black pepper, cinnamon, clove, and nutmeg. Many plantations offer tours explaining cultivation and processing.</p>

    <h3>Spice Shopping Tips</h3>
    <ul>
      <li>Buy directly from spice plantations or government emporia</li>
      <li>Check for authenticity certificates</li>
      <li>Whole spices stay fresh longer than ground</li>
      <li>Vacuum-packed spices travel well</li>
    </ul>

    <h2>Other Notable Crafts</h2>
    <h3>Tanjore Paintings (Tamil Nadu)</h3>
    <p>Classical South Indian art featuring Hindu gods embedded with semi-precious stones and gold foil. Rich colors and compact composition are hallmarks.</p>

    <h3>Kondapalli Toys (Andhra Pradesh)</h3>
    <p>Colorful wooden toys depicting gods, animals, and daily life scenes. Lightweight and eco-friendly.</p>

    <h3>Coir Products (Kerala)</h3>
    <p>Kerala produces 60% of India''s coir (coconut fiber) products - mats, carpets, brushes, rope. Visit coir-making villages near Alleppey.</p>

    <h3>Stone-studded Jewelry (Tamil Nadu)</h3>
    <p>Temple jewelry featuring intricate designs with rubies, emeralds, and pearls. Traditional South Indian brides wear elaborate sets.</p>

    <h2>Where to Shop Authentic Crafts</h2>
    <h3>Government Emporia</h3>
    <ul>
      <li>Poompuhar (Tamil Nadu)</li>
      <li>Cauvery (Karnataka)</li>
      <li>Lepakshi (Andhra Pradesh)</li>
      <li>KTDC outlets (Kerala)</li>
    </ul>

    <h3>Craft Villages & Centers</h3>
    <ul>
      <li>Kanchipuram Weavers Service Centre</li>
      <li>Mahabalipuram Sculptors'' Colony</li>
      <li>Swamimalai Bronze Workshops</li>
      <li>Mysore Sandalwood Factory</li>
    </ul>

    <h2>Sustainable Shopping</h2>
    <ul>
      <li>Buy directly from artisans when possible</li>
      <li>Fair prices ensure craft survival</li>
      <li>Avoid mass-produced imitations</li>
      <li>Ask about materials and methods</li>
      <li>Request demonstrations to verify authenticity</li>
      <li>Support craft cooperatives</li>
    </ul>

    <h2>Craft Experiences</h2>
    <p>Many locations offer hands-on workshops:</p>
    <ul>
      <li>Pottery making in Pondicherry</li>
      <li>Silk weaving lessons in Kanchipuram</li>
      <li>Kalamkari painting classes in Thanjavur</li>
      <li>Bronze casting observation in Swamimalai</li>
    </ul>',
    'https://images.unsplash.com/photo-1610701076387-ae4d3b4a45f1?w=1200&h=800',
    'https://images.unsplash.com/photo-1610701076387-ae4d3b4a45f1?w=600&h=400',
    admin_user_id, true, true, 'approved', NOW() - INTERVAL '7 days', 8,
    'South India Traditional Crafts - Silk, Spices & Sandalwood',
    'Explore South India''s artisan heritage: Kanchipuram silk, Mysore sandalwood, bronze casting, spices. Complete craft shopping and experience guide.'
  ),

  (
    'Classical Arts of South India: Dance, Music & Drama',
    'classical-arts-south-india-dance-music-drama',
    'Experience the vibrant classical arts tradition of South India through Bharatanatyam, Carnatic music, and ancient theater forms.',
    '<h2>A Living Classical Tradition</h2>
    <p>South India preserves one of the world''s oldest continuous classical arts traditions. Unlike museum exhibits, these art forms thrive in everyday cultural life, from temple rituals to concert halls.</p>

    <h2>Classical Dance Forms</h2>
    <h3>Bharatanatyam (Tamil Nadu)</h3>
    <p>The most popular Indian classical dance, characterized by fixed upper torso, bent legs, intricate footwork, and expressive hand gestures (mudras) and facial expressions (abhinaya). Originated in temple traditions, it underwent revival in the 20th century.</p>

    <p><strong>Key Elements:</strong></p>
    <ul>
      <li><strong>Nritta:</strong> Pure dance with rhythmic patterns</li>
      <li><strong>Nritya:</strong> Expressive dance narrating stories</li>
      <li><strong>Natya:</strong> Dramatic element with emotions</li>
    </ul>

    <p><strong>Where to Watch:</strong> Kalakshetra Foundation (Chennai), Darpana Academy (Ahmedabad), or during December Music Season in Chennai.</p>

    <h3>Kuchipudi (Andhra Pradesh)</h3>
    <p>Originated in the village of Kuchipudi, this dance combines pure dance, mime, and histrionic acting. Dancers often perform a water pot dance (tarangam) balanced on their heads.</p>

    <h3>Kathakali (Kerala)</h3>
    <p>Dramatic dance-theater featuring elaborate costumes, vibrant makeup, and stylized movements. Performances last several hours depicting episodes from Mahabharata and Ramayana. The makeup process alone takes 2-3 hours.</p>

    <p><strong>Experience:</strong> Watch pre-performance makeup application at Kerala Kalamandalam or cultural centers in Kochi.</p>

    <h3>Mohiniyattam (Kerala)</h3>
    <p>Graceful feminine dance form meaning "dance of the enchantress." Characterized by swaying movements, rounded body postures, and subtle expressions. Dancers wear white sarees with gold borders.</p>

    <h2>Carnatic Music</h2>
    <p>South India''s classical music system, parallel to North India''s Hindustani music. Highly structured yet allows improvisation.</p>

    <h3>Key Features</h3>
    <ul>
      <li><strong>Ragas:</strong> Melodic frameworks with specific emotional content</li>
      <li><strong>Talas:</strong> Rhythmic cycles</li>
      <li><strong>Kritis:</strong> Devotional compositions, often in Telugu, Tamil, or Sanskrit</li>
      <li><strong>Improvisation:</strong> Alapana (unmetered), Niraval, Kalpanaswaram</li>
    </ul>

    <h3>Instruments</h3>
    <ul>
      <li><strong>Veena:</strong> String instrument, queen of Carnatic music</li>
      <li><strong>Mridangam:</strong> Double-headed drum providing rhythm</li>
      <li><strong>Violin:</strong> Adopted in 19th century, now integral</li>
      <li><strong>Ghatam:</strong> Clay pot percussion</li>
      <li><strong>Flute:</strong> Bamboo flute producing soulful melodies</li>
    </ul>

    <h3>December Music Season, Chennai</h3>
    <p>The world''s largest cultural festival, featuring over 1,000 concerts, dance performances, and lectures from mid-December to early January. The city transforms into a classical arts hub with performances from dawn to midnight.</p>

    <h2>Theater Forms</h2>
    <h3>Yakshagana (Karnataka)</h3>
    <p>Traditional theater combining dance, music, dialogue, costume, and makeup. Performed overnight in village squares, depicting mythological stories. The elaborate headgear and costumes are spectacular.</p>

    <h3>Koothu & Therukoothu (Tamil Nadu)</h3>
    <p>Street theater performed in village squares during festivals. Actors wear colorful makeup and costumes, performing mythological tales with folk music accompaniment.</p>

    <h3>Ottamthullal (Kerala)</h3>
    <p>Solo dance-drama created as a satirical alternative to Kathakali. Performer sings, dances, and acts simultaneously, often incorporating social commentary.</p>

    <h2>Where to Experience Classical Arts</h2>
    <h3>Major Venues</h3>
    <ul>
      <li><strong>Kalakshetra Foundation, Chennai:</strong> Premier institution for Bharatanatyam</li>
      <li><strong>Kerala Kalamandalam, Thrissur:</strong> Kathakali, Mohiniyattam training</li>
      <li><strong>Music Academy, Chennai:</strong> Concerts and music season HQ</li>
      <li><strong>Ravindra Kalakshetra, Bangalore:</strong> Performances and exhibitions</li>
    </ul>

    <h3>Cultural Centers</h3>
    <ul>
      <li><strong>Kalari Kovilakom, Kollengode:</strong> Kalaripayattu (martial arts) demonstrations</li>
      <li><strong>Kochi Cultural Centers:</strong> Daily Kathakali performances for tourists</li>
      <li><strong>Dharamshala, Dharwad:</strong> Traditional music performances</li>
    </ul>

    <h2>Attending Performances</h2>
    <h3>Etiquette</h3>
    <ul>
      <li>Arrive on time; late entry may not be allowed</li>
      <li>Silence mobile phones</li>
      <li>No photography/video without permission</li>
      <li>Applaud after complete pieces, not during</li>
      <li>For Carnatic concerts, appreciate improvisation sections</li>
    </ul>

    <h3>Understanding Performances</h3>
    <ul>
      <li>Many venues provide program notes in English</li>
      <li>Pre-performance lectures common during music season</li>
      <li>Don''t worry about understanding every nuance initially</li>
      <li>Focus on emotions, expressions, and rhythms</li>
    </ul>

    <h2>Learning Opportunities</h2>
    <p>Short-term courses available for tourists:</p>
    <ul>
      <li>Kalakshetra: Dance workshops</li>
      <li>Kerala Kalamandalam: Week-long Kathakali intensives</li>
      <li>Various Chennai schools: Carnatic music introduction</li>
      <li>Kalaripayattu schools in Kerala: Martial arts classes</li>
    </ul>

    <h2>Festivals Featuring Classical Arts</h2>
    <ul>
      <li><strong>Chidambaram Natyanjali (Feb-Mar):</strong> Dance festival at Nataraja Temple</li>
      <li><strong>Mamallapuram Dance Festival (Dec-Jan):</strong> Open-air performances at Shore Temple</li>
      <li><strong>Hampi Utsav (Nov):</strong> Cultural festival with music and dance</li>
      <li><strong>Thrissur Pooram (Apr-May):</strong> Temple festival with music and elephants</li>
    </ul>',
    'https://images.unsplash.com/photo-1583393578223-634de9edc68f?w=1200&h=800',
    'https://images.unsplash.com/photo-1583393578223-634de9edc68f?w=600&h=400',
    admin_user_id, true, false, 'approved', NOW() - INTERVAL '5 days', 10,
    'South India Classical Arts - Dance, Music & Drama Guide',
    'Experience Bharatanatyam, Kathakali, Carnatic music, and classical theater. Complete guide to South India''s living arts tradition with venues and festivals.'
  ),

  -- ============================================
  -- FOOD & CUISINE (3 posts - category_id = 4)
  -- ============================================

  (
    'The Ultimate South Indian Food Guide: Beyond Dosa & Idli',
    'ultimate-south-indian-food-guide-beyond-dosa',
    'Discover the incredible diversity of South Indian cuisine from coastal seafood to spicy Andhra curries and Kerala''s coconut-rich dishes.',
    '<h2>A Culinary Journey</h2>
    <p>South Indian cuisine is far more than the dosa and idli found in Indian restaurants worldwide. Each of the four main states - Kerala, Tamil Nadu, Karnataka, and Andhra Pradesh - boasts distinct culinary traditions shaped by geography, history, and local ingredients.</p>

    <h2>Tamil Nadu Cuisine</h2>
    <h3>Breakfast Delights</h3>
    <ul>
      <li><strong>Idli:</strong> Steamed rice-lentil cakes, soft and fluffy</li>
      <li><strong>Dosa:</strong> Crispy fermented rice crepes (try Masala, Rava, Ghee variants)</li>
      <li><strong>Pongal:</strong> Savory rice-lentil porridge with pepper and cumin</li>
      <li><strong>Vada:</strong> Crispy lentil fritters</li>
      <li><strong>Appam:</strong> Bowl-shaped rice pancakes (especially in Chettinad)</li>
    </ul>

    <h3>Meals (Unlimited Servings on Banana Leaf)</h3>
    <p>The traditional Tamil meal includes:</p>
    <ul>
      <li>White rice as base</li>
      <li>Sambar (lentil-vegetable stew)</li>
      <li>Rasam (spicy tamarind soup)</li>
      <li>Kootu (vegetables with lentils)</li>
      <li>Poriyal (dry vegetable stir-fry)</li>
      <li>Curd (yogurt)</li>
      <li>Pickle and papad</li>
      <li>Payasam (sweet dessert)</li>
    </ul>

    <h3>Chettinad Cuisine</h3>
    <p>Spiciest regional cuisine in South India, known for generous use of freshly ground spices:</p>
    <ul>
      <li>Chettinad Chicken: Fiery chicken curry</li>
      <li>Kara Kuzhambu: Tamarind-based curry with vegetables</li>
      <li>Paniyaram: Sweet or savory rice dumplings</li>
    </ul>

    <h2>Kerala Cuisine</h2>
    <h3>Coastal Influence</h3>
    <p>Coconut, curry leaves, and seafood define Kerala cooking:</p>
    <ul>
      <li><strong>Appam with Stew:</strong> Lacy rice pancakes with coconut milk vegetable/meat stew</li>
      <li><strong>Puttu & Kadala:</strong> Steamed rice cake with chickpea curry (breakfast staple)</li>
      <li><strong>Karimeen Pollichathu:</strong> Pearl spot fish wrapped in banana leaf</li>
      <li><strong>Malabar Biryani:</strong> Fragrant rice dish with meat, unique to North Kerala</li>
      <li><strong>Avial:</strong> Mixed vegetables in coconut-yogurt gravy</li>
      <li><strong>Thoran:</strong> Dry vegetable stir-fry with coconut</li>
    </ul>

    <h3>Sadhya (Festival Feast)</h3>
    <p>Traditional vegetarian feast served on banana leaf during Onam, featuring 26+ dishes including:</p>
    <ul>
      <li>Four types of rice preparations</li>
      <li>Multiple curries and side dishes</li>
      <li>Chips (banana, tapioca)</li>
      <li>Payasam (sweet dessert)</li>
    </ul>

    <h2>Karnataka Cuisine</h2>
    <h3>Udupi Cuisine</h3>
    <p>Vegetarian temple food known for purity and balance:</p>
    <ul>
      <li><strong>Masala Dosa:</strong> Originated in Udupi</li>
      <li><strong>Goli Baje:</strong> Fluffy, crispy fritters</li>
      <li><strong>Bisi Bele Bath:</strong> One-pot rice-lentil dish with vegetables</li>
      <li><strong>Kesari Bath:</strong> Semolina dessert</li>
    </ul>

    <h3>Mangalorean Cuisine</h3>
    <p>Coastal cuisine influenced by Portuguese and Konkani traditions:</p>
    <ul>
      <li><strong>Kane Rava Fry:</strong> Semolina-crusted fried fish</li>
      <li><strong>Kori Rotti:</strong> Chicken curry with crispy rice wafers</li>
      <li><strong>Neer Dosa:</strong> Thin, delicate rice crepes</li>
    </ul>

    <h3>Coorg (Kodagu) Cuisine</h3>
    <ul>
      <li><strong>Pandi Curry:</strong> Pork curry with local spices</li>
      <li><strong>Kadambuttu:</strong> Rice dumplings</li>
      <li><strong>Bamboo Shoot Curry:</strong> Unique forest produce</li>
    </ul>

    <h2>Andhra Pradesh Cuisine</h2>
    <h3>The Spice Champion</h3>
    <p>Andhra food is India''s spiciest, with liberal use of red chillies:</p>
    <ul>
      <li><strong>Hyderabadi Biryani:</strong> World-famous aromatic rice dish</li>
      <li><strong>Gongura Pachadi:</strong> Tangy sorrel leaves chutney</li>
      <li><strong>Pesarattu:</strong> Green gram (moong dal) dosa</li>
      <li><strong>Gutti Vankaya:</strong> Stuffed brinjal curry</li>
      <li><strong>Andhra Chicken:</strong> Extremely spicy chicken curry</li>
    </ul>

    <h2>Street Food Must-Tries</h2>
    <ul>
      <li><strong>Mysore Bonda:</strong> Crispy lentil fritters (Karnataka)</li>
      <li><strong>Bajji:</strong> Batter-fried vegetables (all states)</li>
      <li><strong>Sundal:</strong> Spiced chickpeas snack (Tamil Nadu)</li>
      <li><strong>Bonda Soup:</strong> Vadas in spicy soup (Chennai)</li>
      <li><strong>Mirchi Bajji:</strong> Stuffed chilli fritters (Andhra)</li>
    </ul>

    <h2>Desserts & Sweets</h2>
    <ul>
      <li><strong>Mysore Pak (Karnataka):</strong> Ghee-rich, crumbly sweet</li>
      <li><strong>Payasam (Kerala/Tamil Nadu):</strong> Rice/vermicelli pudding</li>
      <li><strong>Obbattu (Karnataka):</strong> Sweet stuffed flatbread</li>
      <li><strong>Badam Halwa (Tamil Nadu):</strong> Almond fudge</li>
      <li><strong>Double Ka Meetha (Hyderabad):</strong> Bread pudding</li>
    </ul>

    <h2>Beverages</h2>
    <ul>
      <li><strong>Filter Coffee:</strong> Strong decoction mixed with hot milk, served in tumbler-davara</li>
      <li><strong>Sambhar Coffee:</strong> Coffee with sambar flavor (unique combination!)</li>
      <li><strong>Tender Coconut Water:</strong> Fresh from Kerala coast</li>
      <li><strong>Buttermilk (Mor):</strong> Digestive drink after spicy meals</li>
    </ul>

    <h2>Where to Eat</h2>
    <h3>Iconic Restaurants</h3>
    <ul>
      <li><strong>Saravana Bhavan (Chennai):</strong> Vegetarian South Indian chain</li>
      <li><strong>MTR (Bangalore):</strong> Legendary breakfast since 1924</li>
      <li><strong>Woodlands (Chennai):</strong> Traditional vegetarian</li>
      <li><strong>Paradise (Hyderabad):</strong> Famous for biryani</li>
      <li><strong>Paragon (Kozhikode):</strong> Malabar cuisine specialists</li>
    </ul>

    <h3>Local Eateries</h3>
    <ul>
      <li>Look for "Military Hotel" signs for meat dishes</li>
      <li>"Brahmin Hotel" indicates pure vegetarian</li>
      <li>Toddy shops in Kerala serve great seafood</li>
      <li>Udupi restaurants found throughout South India</li>
    </ul>

    <h2>Eating Etiquette</h2>
    <ul>
      <li>Traditionally eaten with right hand directly on banana leaf</li>
      <li>Fold banana leaf towards you when done (satisfied) or away (not satisfied)</li>
      <li>Don''t waste food on banana leaf - take only what you''ll eat</li>
      <li>Say "Saaru" (sambar) or "Rasam" when you want refills</li>
      <li>Wash hands before and after meals</li>
    </ul>

    <h2>Food Tours & Experiences</h2>
    <ul>
      <li>Cooking classes in homestays (Coorg, Kerala)</li>
      <li>Spice plantation tours (Thekkady, Munnar)</li>
      <li>Street food tours in Chennai''s Mylapore</li>
      <li>Toddy shop visits in Kerala backwaters</li>
      <li>Temple prasadam tasting</li>
    </ul>',
    'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1200&h=800',
    'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&h=400',
    admin_user_id, true, true, 'approved', NOW() - INTERVAL '11 days', 12,
    'South Indian Food Guide - Beyond Dosa Idli Complete Cuisine',
    'Comprehensive South Indian cuisine guide: Tamil Nadu, Kerala, Karnataka, Andhra Pradesh dishes, street food, desserts. Must-eat foods and where to find them.'
  )

ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  updated_at = CURRENT_TIMESTAMP;

END $$;

-- To be continued in part 3 with remaining Food & Cuisine (2) and Adventure (3) posts
