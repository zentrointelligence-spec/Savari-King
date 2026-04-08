-- Migration: Final blog posts (Part 3)
-- Date: 2025-11-17
-- Description: Remaining Food & Cuisine (2) and Adventure & Activities (3)

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
  -- FOOD & CUISINE - Remaining 2 posts
  -- ============================================

  (
    'Filter Coffee Culture: The Soul of South India',
    'filter-coffee-culture-soul-south-india',
    'Explore the beloved filter coffee tradition that defines South Indian mornings - from brewing techniques to legendary coffee houses.',
    '<h2>More Than Just Coffee</h2>
    <p>In South India, filter coffee isn''t just a beverage - it''s a ritual, a social connector, and an art form. This strong, aromatic coffee served in traditional steel tumblers represents the region''s identity as much as temples or silk sarees.</p>

    <h2>The Perfect Brew</h2>
    <h3>Traditional Method</h3>
    <p>South Indian filter coffee uses a special two-chamber metal filter:</p>
    <ol>
      <li><strong>Grounds:</strong> Finely ground coffee (80% coffee, 20% chicory) placed in upper chamber</li>
      <li><strong>Brewing:</strong> Boiling water added, allowed to slowly drip through (20-30 minutes)</li>
      <li><strong>Decoction:</strong> Strong black concentrate collected below</li>
      <li><strong>Mixing:</strong> Hot milk + decoction + sugar mixed in tumbler</li>
      <li><strong>Pouring:</strong> Ceremonially poured between tumbler and davara to create froth</li>
    </ol>

    <h3>The Magic Ratio</h3>
    <p>Perfect filter coffee is about balance:</p>
    <ul>
      <li>1 part decoction to 3-4 parts hot milk</li>
      <li>Sugar adjusted to taste (traditionally quite sweet)</li>
      <li>Temperature just below boiling</li>
    </ul>

    <h2>Coffee Varieties</h2>
    <h3>Arabica vs Robusta</h3>
    <ul>
      <li><strong>Arabica (Mysore, Coorg, Chikmagalur):</strong> Milder, aromatic, slightly acidic</li>
      <li><strong>Robusta (Wayanad):</strong> Stronger, more caffeine, bolder flavor</li>
      <li><strong>Blends:</strong> Most filter coffee uses 70-80% Arabica, 20-30% Robusta</li>
    </ul>

    <h3>Why Chicory?</h3>
    <p>Chicory root adds body, reduces caffeine, and was historically cheaper during shortages. Many South Indians prefer the taste and consider it essential.</p>

    <h2>Legendary Coffee Houses</h2>
    <h3>Chennai</h3>
    <ul>
      <li><strong>Indian Coffee House:</strong> Iconic chain with waiters in white dhotis and turbans</li>
      <li><strong>Rayar''s Cafe:</strong> Historic establishment since 1950s</li>
      <li><strong>Saravana Bhavan:</strong> Consistent quality across locations</li>
      <li><strong>Filter Coffee (Mylapore):</strong> Hole-in-the-wall serving perfect cups</li>
    </ul>

    <h3>Bangalore</h3>
    <ul>
      <li><strong>Brahmin''s Coffee Bar:</strong> Standing-only cafe, super strong coffee</li>
      <li><strong>CTR (Central Tiffin Room):</strong> Famous for benne masala dosa and coffee</li>
      <li><strong>Vidyarthi Bhavan:</strong> Since 1943, beloved by students</li>
      <li><strong>Koshy''s:</strong> Historic cafe with old-world charm</li>
    </ul>

    <h3>Kerala</h3>
    <ul>
      <li><strong>Indian Coffee House, Trivandrum:</strong> Spiral architecture, political hub</li>
      <li><strong>Aryas Vegetarian, Kochi:</strong> Excellent coffee with banana chips</li>
    </ul>

    <h3>Mysore</h3>
    <ul>
      <li><strong>Hotel Dasaprakash:</strong> Traditional breakfast with coffee</li>
      <li><strong>RRR Restaurant:</strong> Simple, authentic</li>
    </ul>

    <h2>Coffee Plantation Tours</h2>
    <h3>Coorg (Karnataka)</h3>
    <p>The coffee capital of India. Visit estates like:</p>
    <ul>
      <li>Tata Coffee plantations</li>
      <li>Honey Valley Estate</li>
      <li>Old Kent Estates</li>
    </ul>
    <p>Tours cover coffee cultivation, processing from cherry to bean, and tasting sessions.</p>

    <h3>Chikmagalur (Karnataka)</h3>
    <p>Where coffee was first grown in India (17th century). Scenic plantations among rolling hills.</p>

    <h3>Wayanad (Kerala)</h3>
    <p>Combines coffee with spice plantations. Experience both on single tour.</p>

    <h2>Coffee Etiquette & Culture</h2>
    <h3>Serving Style</h3>
    <ul>
      <li><strong>Tumbler & Davara:</strong> Stainless steel cup and saucer-like bowl</li>
      <li><strong>Pouring Technique:</strong> Lift high while pouring to create froth</li>
      <li><strong>Drinking Method:</strong> Sip from davara (cools coffee to perfect temperature)</li>
    </ul>

    <h3>Social Ritual</h3>
    <ul>
      <li>Morning coffee is sacred - never skipped</li>
      <li>Offered to guests as welcome gesture</li>
      <li>Afternoon coffee break ("tiffin time") is institution</li>
      <li>Post-meal coffee aids digestion</li>
    </ul>

    <h2>Making It at Home</h2>
    <h3>Equipment Needed</h3>
    <ul>
      <li>South Indian filter (available online)</li>
      <li>Freshly ground coffee-chicory blend</li>
      <li>Whole milk (full-fat preferred)</li>
      <li>Steel tumbler and davara set</li>
    </ul>

    <h3>Pro Tips</h3>
    <ul>
      <li>Use freshly boiled water for brewing</li>
      <li>Don''t rush the dripping process</li>
      <li>Store decoction refrigerated (lasts 2-3 days)</li>
      <li>Heat milk separately, don''t boil together</li>
      <li>Practice the pouring technique - it aerates the coffee</li>
    </ul>

    <h2>Health Benefits</h2>
    <ul>
      <li>Lower caffeine than espresso (due to milk dilution)</li>
      <li>Chicory provides prebiotic fiber</li>
      <li>Antioxidants from coffee beans</li>
      <li>Milk provides calcium</li>
    </ul>

    <h2>Coffee vs Chai</h2>
    <p>While North India prefers chai (tea), South India overwhelmingly chooses coffee. Historical reasons include:</p>
    <ul>
      <li>Coffee cultivation in Western Ghats</li>
      <li>British influence and trading history</li>
      <li>Climate suited to coffee drinking</li>
      <li>Cultural identity marker</li>
    </ul>

    <h2>Modern Coffee Culture</h2>
    <p>While traditional filter coffee remains supreme, cities now boast:</p>
    <ul>
      <li>Third-wave specialty coffee shops</li>
      <li>Single-origin pour-overs</li>
      <li>Cold brews and espresso bars</li>
      <li>But filter coffee still reigns at breakfast!</li>
    </ul>

    <h2>Buying Coffee to Take Home</h2>
    <ul>
      <li><strong>Narasu''s, Kumbakonam:</strong> Famous brand since 1926</li>
      <li><strong>Leo Coffee, Chennai:</strong> Popular household name</li>
      <li><strong>Cothas Coffee, Bangalore:</strong> Premium quality</li>
      <li><strong>Fresh from estates:</strong> Buy directly from Coorg plantations</li>
    </ul>

    <h2>Experimentation</h2>
    <p>Modern variations while respecting tradition:</p>
    <ul>
      <li><strong>Kaapi Nirvana:</strong> Cold coffee with ice cream</li>
      <li><strong>Filter Coffee Milkshake:</strong> Blended cold version</li>
      <li><strong>Jaggery Coffee:</strong> Traditional sweetener instead of sugar</li>
    </ul>',
    'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=1200&h=800',
    'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=600&h=400',
    admin_user_id, true, false, 'approved', NOW() - INTERVAL '13 days', 9,
    'South Indian Filter Coffee Culture - Complete Guide',
    'Everything about South Indian filter coffee: brewing methods, legendary coffee houses, plantation tours. Experience the soul of South India.'
  ),

  (
    'Street Food Paradise: Must-Try Snacks Across South India',
    'street-food-paradise-snacks-south-india',
    'Navigate South India''s vibrant street food scene with our guide to must-try snacks, from crispy bondas to tangy chaats.',
    '<h2>Street Food Capital</h2>
    <p>South India''s streets come alive with sizzling pans, aromatic spices, and vendors perfecting recipes passed through generations. From coastal seafood fries to crispy evening snacks, street food offers authentic flavors at pocket-friendly prices.</p>

    <h2>Tamil Nadu Street Favorites</h2>
    <h3>Chennai Specials</h3>
    <ul>
      <li><strong>Sundal:</strong> Spiced chickpeas/peanuts sold on Marina Beach</li>
      <li><strong>Bajji:</strong> Batter-fried chillies, potatoes, onions - perfect for rainy days</li>
      <li><strong>Murukku:</strong> Crunchy rice spirals, every grandma has a secret recipe</li>
      <li><strong>Kothu Parotta:</strong> Shredded parotta stir-fried with egg/meat and spices</li>
      <li><strong>Atho:</strong> Tamil-Burmese stir-fried noodles</li>
    </ul>

    <h3>Madurai Must-Tries</h3>
    <ul>
      <li><strong>Jigarthanda:</strong> Cold milk drink with ice cream, almond gum, and sarsaparilla</li>
      <li><strong>Paruthi Paal:</strong> Cotton seed milk shake</li>
      <li><strong>Kari Dosa:</strong> Mutton-stuffed dosa</li>
    </ul>

    <h2>Kerala Street Eats</h2>
    <h3>Coastal Delights</h3>
    <ul>
      <li><strong>Banana Chips:</strong> Thin-sliced, perfectly salted - Kerala''s ambassador snack</li>
      <li><strong>Tapioca Chips:</strong> Crispy alternative to potato chips</li>
      <li><strong>Fish Fry:</strong> Fresh catch coated in spiced batter, fried golden</li>
      <li><strong>Kallummakkaya (Mussels):</strong> Steamed or fried, coconut-spiced</li>
    </ul>

    <h3>Tea-Time Snacks</h3>
    <ul>
      <li><strong>Pazham Pori:</strong> Banana fritters, crispy outside, soft inside</li>
      <li><strong>Sukhiyan:</strong> Sweet green gram fritters</li>
      <li><strong>Unniappam:</strong> Sweet rice balls fried in special molds</li>
      <li><strong>Achappam:</strong> Rose-shaped crispy cookies</li>
    </ul>

    <h2>Karnataka Street Food</h2>
    <h3>Bangalore Bites</h3>
    <ul>
      <li><strong>Masala Puri:</strong> Crushed puris topped with spicy curry, onions, sev</li>
      <li><strong>Bonda:</strong> Potato-filled batter balls, best from VV Puram Food Street</li>
      <li><strong>Congress Kadlekai:</strong> Boiled peanuts sold near Gandhi statue</li>
      <li><strong>Nippattu:</strong> Crispy rice crackers with sesame</li>
    </ul>

    <h3>Mysore Treats</h3>
    <ul>
      <li><strong>Mysore Bonda:</strong> Fluffier than Bangalore version, onions inside</li>
      <li><strong>Mysore Pak:</strong> Ghee-rich sweet, melts in mouth</li>
      <li><strong>Ragi Mudde:</strong> Finger millet balls with sambar</li>
    </ul>

    <h3>Mangalore Specials</h3>
    <ul>
      <li><strong>Goli Baje:</strong> Fluffy fritters made from flour and curd</li>
      <li><strong>Chicken Ghee Roast:</strong> Spicy, ghee-laden chicken</li>
      <li><strong>Pork Bafat:</strong> Mangalorean Catholic specialty</li>
    </ul>

    <h2>Andhra Pradesh Fiery Snacks</h2>
    <h3>Hyderabad Street Food</h3>
    <ul>
      <li><strong>Mirchi Bajji:</strong> Large green chillies stuffed, battered, fried</li>
      <li><strong>Punugulu:</strong> Deep-fried idli batter balls with onions</li>
      <li><strong>Lukhmi:</strong> Minced meat samosas</li>
      <li><strong>Irani Chai + Osmania Biscuits:</strong> Tea dunking tradition</li>
    </ul>

    <h3>Coastal Andhra</h3>
    <ul>
      <li><strong>Upma Pesarattu:</strong> Green gram dosa stuffed with upma</li>
      <li><strong>Bobbatlu:</strong> Sweet lentil-stuffed flatbread</li>
      <li><strong>Atukula Dosa:</strong> Rice flakes dosa</li>
    </ul>

    <h2>Chaats & Fusion</h2>
    <h3>South-Style Chaats</h3>
    <ul>
      <li><strong>Dahi Puri:</strong> Crispy puris filled with curd, chutneys, sev</li>
      <li><strong>Samosa Chat:</strong> Crushed samosa with chickpeas, yogurt, chutneys</li>
      <li><strong>Bhel Puri:</strong> Puffed rice with vegetables, tangy sauces</li>
    </ul>

    <h2>Sweets & Desserts</h2>
    <ul>
      <li><strong>Kulfi:</strong> Dense ice cream on stick, cardamom or pistachio</li>
      <li><strong>Badam Milk:</strong> Almond milkshake served chilled</li>
      <li><strong>Falooda:</strong> Rose syrup, vermicelli, sabja seeds, ice cream</li>
      <li><strong>Jalebi:</strong> Crispy sweet spirals in sugar syrup</li>
    </ul>

    <h2>Best Street Food Areas</h2>
    <h3>Chennai</h3>
    <ul>
      <li>Marina Beach (evening snacks)</li>
      <li>Triplicane (Muslim street food)</li>
      <li>Mylapore (traditional snacks)</li>
      <li>Besant Nagar (Bessie) beach</li>
    </ul>

    <h3>Bangalore</h3>
    <ul>
      <li>VV Puram Food Street</li>
      <li>Jayanagar 4th Block</li>
      <li>Malleshwaram 8th Cross</li>
      <li>Shivajinagar</li>
    </ul>

    <h3>Kochi</h3>
    <ul>
      <li>Broadway Market area</li>
      <li>MG Road</li>
      <li>Fort Kochi seafood stalls</li>
    </ul>

    <h3>Hyderabad</h3>
    <ul>
      <li>Charminar area</li>
      <li>Panjagutta</li>
      <li>Banjara Hills</li>
    </ul>

    <h2>Safety & Hygiene Tips</h2>
    <ul>
      <li>Choose busy stalls with high turnover</li>
      <li>Observe cleanliness of cooking area</li>
      <li>Avoid pre-cut fruits and salads</li>
      <li>Freshly fried items are safest</li>
      <li>Carry hand sanitizer</li>
      <li>Start with mild spices, build tolerance</li>
      <li>Drink bottled water, avoid ice in drinks</li>
    </ul>

    <h2>Timing Your Street Food Adventures</h2>
    <ul>
      <li><strong>Morning (6-9 AM):</strong> Idli, dosa, vada at tiffin centers</li>
      <li><strong>Afternoon (12-2 PM):</strong> Meals, biryanis</li>
      <li><strong>Evening (4-7 PM):</strong> Peak snack time - bondas, bajjis, chaats</li>
      <li><strong>Night (8-11 PM):</strong> Kothu parotta, late-night biryanis</li>
    </ul>

    <h2>Price Guide</h2>
    <p>Street food is incredibly affordable:</p>
    <ul>
      <li>Bajji/Bonda: ₹10-20 per piece</li>
      <li>Dosa: ₹30-60</li>
      <li>Chaat items: ₹40-80</li>
      <li>Meals: ₹80-150</li>
      <li>Sweet: ₹30-60</li>
    </ul>

    <h2>Eating Like a Local</h2>
    <ul>
      <li>Don''t shy away from eating with hands</li>
      <li>Follow locals to best vendors</li>
      <li>Ask "Tiffin ready?" at morning stalls</li>
      <li>Learn to say "Less spicy" in local language</li>
      <li>Carry small change (vendors rarely have change for ₹500)</li>
    </ul>

    <h2>Regional Specialties by Season</h2>
    <ul>
      <li><strong>Monsoon:</strong> Bajjis, bondas (fried snacks with hot coffee)</li>
      <li><strong>Summer:</strong> Ice gola (shaved ice), tender coconut, cold buttermilk</li>
      <li><strong>Winter:</strong> Roasted peanuts, sweet potato, corn</li>
      <li><strong>Festivals:</strong> Special sweets, murukku, mixture</li>
    </ul>',
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1200&h=800',
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400',
    admin_user_id, true, false, 'approved', NOW() - INTERVAL '15 days', 10,
    'South India Street Food Guide - Must-Try Snacks & Where',
    'Complete street food guide across South India: Tamil Nadu, Kerala, Karnataka, Andhra Pradesh. Best snacks, locations, timing, and safety tips.'
  ),

  -- ============================================
  -- ADVENTURE & ACTIVITIES (3 posts - category_id = 5)
  -- ============================================

  (
    'Trekking Western Ghats: Best Trails in South India',
    'trekking-western-ghats-best-trails-south-india',
    'Conquer the Western Ghats with our guide to the best trekking trails from misty Munnar to rocky Hampi boulders.',
    '<h2>The Western Ghats Adventure</h2>
    <p>The Western Ghats, a UNESCO World Heritage Site stretching 1,600 km along India''s western coast, offers some of the country''s most spectacular trekking. From gentle nature walks to challenging multi-day expeditions, South India''s mountains await.</p>

    <h2>Karnataka Treks</h2>
    <h3>Kumara Parvatha (Difficulty: Hard)</h3>
    <p><strong>Location:</strong> Coorg | <strong>Duration:</strong> 2 days | <strong>Altitude:</strong> 1,712m</p>
    <p>One of South India''s toughest treks with steep climbs and rocky terrain. Rewards include panoramic views and pristine forests. Best season: October-February.</p>

    <h3>Mullayanagiri & Baba Budangiri (Moderate)</h3>
    <p><strong>Location:</strong> Chikmagalur | <strong>Duration:</strong> 1 day each | <strong>Altitude:</strong> 1,930m (Mullayanagiri - Karnataka''s highest)</p>
    <p>Coffee plantations, rolling hills, and stunning sunrise views. Can be combined into a 2-day trek.</p>

    <h3>Skandagiri (Easy-Moderate)</h3>
    <p><strong>Location:</strong> Near Bangalore | <strong>Duration:</strong> Night trek (3-4 hours) | <strong>Altitude:</strong> 1,450m</p>
    <p>Popular night trek starting at 2 AM to catch sunrise above clouds. Currently restricted - check permission status.</p>

    <h3>Kudremukh (Moderate-Hard)</h3>
    <p><strong>Location:</strong> Chikmagalur District | <strong>Duration:</strong> 1-2 days | <strong>Altitude:</strong> 1,894m</p>
    <p>Named "Horse Face" for its shape, this trek offers grasslands and streams. Requires forest department permission.</p>

    <h3>Tadiandamol (Moderate)</h3>
    <p><strong>Location:</strong> Coorg | <strong>Duration:</strong> 1 day | <strong>Altitude:</strong> 1,748m (Coorg''s highest)</p>
    <p>Well-marked trail through Shola forests. Spectacular 360-degree views from summit.</p>

    <h2>Kerala Treks</h2>
    <h3>Anamudi (Moderate-Hard)</h3>
    <p><strong>Location:</strong> Munnar (Eravikulam National Park) | <strong>Duration:</strong> 2 days | <strong>Altitude:</strong> 2,695m (South India''s highest)</p>
    <p>Requires permission from Forest Department and guide. Spot Nilgiri Tahr along the way. Best: October-March.</p>

    <h3>Meesapulimala (Moderate)</h3>
    <p><strong>Location:</strong> Munnar | <strong>Duration:</strong> 1 day | <strong>Altitude:</strong> 2,640m (South India''s second highest)</p>
    <p>Tea plantation trails leading to rolling grasslands. Clear days offer views of Tamil Nadu plains. Sunrise trek recommended.</p>

    <h3>Chembra Peak (Moderate)</h3>
    <p><strong>Location:</strong> Wayanad | <strong>Duration:</strong> 5-6 hours | <strong>Altitude:</strong> 2,100m</p>
    <p>Famous for heart-shaped lake midway. Lush green landscapes and mist. Permission required from Forest Office, Meppadi.</p>

    <h3>Ponmudi (Easy-Moderate)</h3>
    <p><strong>Location:</strong> Near Trivandrum | <strong>Duration:</strong> Half day | <strong>Altitude:</strong> 1,100m</p>
    <p>Gentle trails through cardamom plantations and forests. Good for beginners.</p>

    <h3>Agasthyarkoodam (Hard)</h3>
    <p><strong>Location:</strong> Near Trivandrum | <strong>Duration:</strong> 2 days | <strong>Altitude:</strong> 1,868m</p>
    <p>Challenging trek through dense forests rich in medicinal plants. Limited to 100 trekkers per day (Jan-Apr only). Advanced booking essential.</p>

    <h2>Tamil Nadu Treks</h2>
    <h3>Kodaikanal Princess of Hills (Easy-Moderate)</h3>
    <p><strong>Various trails:</strong> Dolphin''s Nose, Pillar Rocks, Silent Valley. Half-day to full-day options through forests and viewpoints.</p>

    <h3>Manjolai Hills (Moderate)</h3>
    <p><strong>Location:</strong> Tirunelveli District | <strong>Duration:</strong> 2 days | <strong>Altitude:</strong> 1,600m</p>
    <p>Off-beat trek through tea estates. Spectacular views of Papanasam Dam and Western Ghats.</p>

    <h3>Velliangiri Hills (Moderate-Hard)</h3>
    <p><strong>Location:</strong> Coimbatore | <strong>Duration:</strong> 1 day | <strong>Altitude:</strong> 1,778m</p>
    <p>Spiritual trek with 7 hills. Popular during Mahashivratri. Early morning start recommended.</p>

    <h2>Other Adventure Regions</h2>
    <h3>Hampi Boulder Climbing & Trails (Easy-Moderate)</h3>
    <p>Unique landscape of giant boulders. Multiple trekking routes to Matanga Hill, Anjaneya Hill. Rock climbing paradise.</p>

    <h3>Andaman Islands Treks (Easy)</h3>
    <p>Coastal rainforest treks in Havelock and Neil Islands. Combine with beach time.</p>

    <h2>Best Trekking Seasons</h2>
    <ul>
      <li><strong>October-February:</strong> Best weather, clear views, comfortable temperatures</li>
      <li><strong>March-May:</strong> Hot but doable for high-altitude treks. Morning starts essential</li>
      <li><strong>June-September:</strong> Monsoon - lush green but slippery trails, leeches common. Some treks closed</li>
    </ul>

    <h2>What to Pack</h2>
    <h3>Essentials</h3>
    <ul>
      <li>Sturdy trekking shoes (broken in)</li>
      <li>3-4 liters water (or purification tablets)</li>
      <li>High-energy snacks (nuts, chocolate, energy bars)</li>
      <li>First aid kit with band-aids, pain relief</li>
      <li>Torch/headlamp with extra batteries</li>
      <li>Raincoat/poncho (even in dry season)</li>
    </ul>

    <h3>Clothing</h3>
    <ul>
      <li>Moisture-wicking t-shirts (avoid cotton)</li>
      <li>Light jacket or fleece</li>
      <li>Comfortable trekking pants</li>
      <li>Sun hat and sunglasses</li>
      <li>Extra pair of socks</li>
    </ul>

    <h3>For Longer Treks</h3>
    <ul>
      <li>Sleeping bag (if camping)</li>
      <li>Tent (if not provided)</li>
      <li>Cooking gear or arrange with guides</li>
      <li>Power bank</li>
      <li>Personal toiletries</li>
    </ul>

    <h2>Safety Tips</h2>
    <ul>
      <li>Never trek alone in unfamiliar terrain</li>
      <li>Hire local guides for difficult treks</li>
      <li>Check weather forecasts</li>
      <li>Inform someone about your trekking plans</li>
      <li>Start early to avoid afternoon heat/storms</li>
      <li>Respect wildlife - maintain distance</li>
      <li>Don''t litter - carry trash back</li>
      <li>Be leech-aware during monsoons (salt, tobacco deters them)</li>
      <li>Know altitude sickness symptoms</li>
      <li>Carry permission documents where required</li>
    </ul>

    <h2>Permits & Permissions</h2>
    <p>Many Western Ghats treks require Forest Department permission:</p>
    <ul>
      <li>Anamudi: Eravikulam National Park office, Munnar</li>
      <li>Chembra: Forest Office, Meppadi</li>
      <li>Kudremukh: Karnataka Forest Department</li>
      <li>Agasthyarkoodam: Online booking (opens December for Jan-Apr slots)</li>
    </ul>

    <h2>Guided vs Independent Trekking</h2>
    <h3>When to Hire Guides</h3>
    <ul>
      <li>Challenging or multi-day treks</li>
      <li>Unfamiliar terrain</li>
      <li>Mandated by Forest Department</li>
      <li>For wildlife spotting expertise</li>
    </ul>

    <h3>Cost</h3>
    <p>Guides typically charge ₹500-1,500 per day depending on trek difficulty and duration.</p>

    <h2>Responsible Trekking</h2>
    <ul>
      <li>Stick to marked trails</li>
      <li>No campfires in restricted areas</li>
      <li>Don''t pick flowers or disturb wildlife</li>
      <li>Use biodegradable soap if washing in streams</li>
      <li>Bury human waste properly or carry out</li>
      <li>Support local guides and businesses</li>
    </ul>

    <h2>Combining Treks with Other Activities</h2>
    <ul>
      <li>Tea/coffee plantation tours in Munnar, Chikmagalur, Coorg</li>
      <li>Wildlife safaris in nearby national parks</li>
      <li>Waterfalls (many accessible post-trek)</li>
      <li>Local homestays for authentic experiences</li>
    </ul>',
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&h=800',
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=400',
    admin_user_id, true, true, 'approved', NOW() - INTERVAL '17 days', 11,
    'Western Ghats Trekking Guide - Best South India Trails',
    'Complete Western Ghats trekking guide: Karnataka, Kerala, Tamil Nadu trails. Difficulty levels, permits, what to pack, and safety tips.'
  ),

  (
    'Water Sports & Beach Adventures in South India',
    'water-sports-beach-adventures-south-india',
    'Dive into South India''s coastal adventures: surfing in Kovalam, scuba diving in Andamans, and white-water rafting in Dandeli.',
    '<h2>Coastal Playground</h2>
    <p>With 7,500 km of coastline along Arabian Sea and Bay of Bengal, plus the Andaman Islands, South India offers world-class water sports from surfing to scuba diving. Whether you''re an adrenaline junkie or first-timer, there''s an adventure waiting.</p>

    <h2>Surfing & Standup Paddleboarding</h2>
    <h3>Kovalam, Kerala</h3>
    <p><strong>Best Season:</strong> September-March</p>
    <p>India''s surfing capital with consistent waves. Multiple surf schools offer:</p>
    <ul>
      <li>Beginner lessons (₹1,500-2,500 for 2 hours)</li>
      <li>Board rentals (₹300-500/hour)</li>
      <li>Multi-day courses</li>
    </ul>
    <p><strong>Schools:</strong> Soul & Surf, Surfing Swami''s, Kovalam Surf Club</p>

    <h3>Varkala, Kerala</h3>
    <p><strong>Best Season:</strong> October-April</p>
    <p>Cliff-backed beach with good waves. Less crowded than Kovalam. Great for SUP (Stand Up Paddleboarding) too.</p>

    <h3>Mahabalipuram, Tamil Nadu</h3>
    <p><strong>Best Season:</strong> November-February</p>
    <p>Growing surf scene near Chennai. Mumu Surf School offers lessons for beginners to advanced.</p>

    <h3>Mulki, Karnataka</h3>
    <p><strong>Best Season:</strong> June-September (monsoon surfing!)</p>
    <p>River mouth creates perfect waves. Mantra Surf Club operates surf camps.</p>

    <h2>Scuba Diving & Snorkeling</h2>
    <h3>Andaman & Nicobar Islands</h3>
    <p>India''s premier diving destination with crystal-clear waters, coral reefs, and diverse marine life.</p>

    <p><strong>Havelock Island (Swaraj Dweep):</strong></p>
    <ul>
      <li><strong>Elephant Beach:</strong> Best snorkeling, shallow coral reefs</li>
      <li><strong>Dive Sites:</strong> Lighthouse, Aquarium, Dixon''s Pinnacle</li>
      <li><strong>Marine Life:</strong> Manta rays, turtles, reef sharks, colorful fish</li>
      <li><strong>Costs:</strong> Discover dive ₹4,500, certified dives ₹3,500, PADI certification ₹25,000-30,000</li>
    </ul>

    <p><strong>Neil Island (Shaheed Dweep):</strong></p>
    <ul>
      <li>Calmer, less crowded alternative</li>
      <li>Excellent coral visibility</li>
    </ul>

    <p><strong>Best Season:</strong> October-May (visibility up to 40m)</p>

    <h3>Netrani Island, Karnataka</h3>
    <p>Rocky island off Murudeshwar coast. Day trips from Murudeshwar or Gokarna. See whale sharks (season dependent), barracudas, triggerfish.</p>
    <p><strong>Cost:</strong> ₹3,500-5,500 including boat transfer</p>

    <h3>Lakshadweep</h3>
    <p>Pristine coral atolls with exceptional diving. Permit required, book through authorized tour operators.</p>

    <h2>White Water Rafting</h2>
    <h3>Dandeli, Karnataka</h3>
    <p><strong>River:</strong> Kali | <strong>Best Season:</strong> June-September</p>
    <p>South India''s white water rafting hub with Grade 2-3 rapids:</p>
    <ul>
      <li>9 km stretch with 7-8 rapids</li>
      <li>Suitable for first-timers and families</li>
      <li>Cost: ₹700-1,200 per person</li>
      <li>Safety gear provided</li>
    </ul>

    <h3>Coorg (Barapole River), Karnataka</h3>
    <p><strong>Best Season:</strong> July-September</p>
    <p>More challenging than Dandeli with Grade 3-4 rapids. Experience required or join guided trips.</p>

    <h2>Kayaking & Canoeing</h2>
    <h3>Kerala Backwaters</h3>
    <ul>
      <li><strong>Alleppey:</strong> Guided kayaking through villages, canals</li>
      <li><strong>Kumarakom:</strong> Early morning bird-watching kayak tours</li>
      <li><strong>Kollam:</strong> Longer kayaking routes</li>
      <li><strong>Cost:</strong> ₹1,000-2,500 for half-day guided tours</li>
    </ul>

    <h3>Coracle Rides, Karnataka</h3>
    <p>Traditional round basket boats in Hampi (Tungabhadra River) and Hogenakkal Falls. Short cultural experience, ₹100-200.</p>

    <h2>Parasailing & Jet Skiing</h2>
    <h3>Goa Beaches</h3>
    <ul>
      <li><strong>Parasailing:</strong> ₹1,000-1,500 for 5-7 minutes</li>
      <li><strong>Jet Skiing:</strong> ₹800-1,500 for 10-15 minutes</li>
      <li><strong>Banana Boat:</strong> ₹300-500 per person</li>
      <li><strong>Bumper Rides:</strong> ₹300-500</li>
    </ul>
    <p><strong>Popular Beaches:</strong> Baga, Calangute, Candolim, Anjuna</p>

    <h3>Kovalam Beach, Kerala</h3>
    <p>Similar water sports available but less developed than Goa. Slightly lower prices.</p>

    <h2>Windsurfing & Kitesurfing</h2>
    <h3>Covelong (Kovalam), Tamil Nadu</h3>
    <p>Annual Point Break festival (August) showcases surfing, windsurfing, kitesurfing.</p>

    <h3>Varkala, Kerala</h3>
    <p>Growing kitesurfing scene. Season: December-March when winds are strong.</p>

    <h2>Fishing Experiences</h2>
    <h3>Deep Sea Fishing</h3>
    <ul>
      <li><strong>Kerala Coast:</strong> Half/full day charters from Kochi</li>
      <li><strong>Andaman:</strong> Game fishing for marlin, sailfish</li>
      <li><strong>Cost:</strong> ₹3,000-10,000 depending on duration and boat</li>
    </ul>

    <h3>Traditional Fishing Villages</h3>
    <p>Join local fishermen for authentic experiences in Kovalam, Gokarna, Andaman villages. Negotiate directly, ₹500-1,500.</p>

    <h2>Boat & Yacht Experiences</h2>
    <h3>Houseboat Cruises</h3>
    <ul>
      <li><strong>Kerala Backwaters:</strong> Luxury to budget options, ₹6,000-30,000 per night</li>
      <li><strong>Goa:</strong> Mandovi River cruises with dinner/entertainment</li>
    </ul>

    <h3>Yacht Sailing</h3>
    <p>Available in Andaman and Goa. Day trips or multi-day charters. Expensive but unique experience.</p>

    <h2>Beach Camping</h2>
    <h3>Gokarna, Karnataka</h3>
    <p>Camp on Om Beach, Half Moon Beach. Organized camps with bonfires, BBQ. ₹1,500-3,000 per night including meals.</p>

    <h3>Tarkarli, Maharashtra (close to Goa)</h3>
    <p>Pristine beach with camping options. Combine with dolphin watching and water sports.</p>

    <h2>Safety Guidelines</h2>
    <ul>
      <li>Always wear provided life jackets</li>
      <li>Follow instructor''s directions, especially in rafting/diving</li>
      <li>Check equipment before starting activity</li>
      <li>Don''t attempt water sports during rough seas/red flag warnings</li>
      <li>Avoid alcohol before water activities</li>
      <li>Know your swimming ability - don''t overestimate</li>
      <li>Use licensed operators with insurance</li>
      <li>Sun protection: waterproof sunscreen, rash guards</li>
    </ul>

    <h2>Best Times for Water Sports</h2>
    <ul>
      <li><strong>Kerala/Tamil Nadu Beaches:</strong> October-March</li>
      <li><strong>Karnataka Coast:</strong> October-February (Monsoon surfing: June-September)</li>
      <li><strong>Andaman:</strong> October-May</li>
      <li><strong>Goa:</strong> October-April</li>
      <li><strong>Rafting:</strong> Monsoon and post-monsoon (June-October)</li>
    </ul>

    <h2>Costs Overview</h2>
    <ul>
      <li>Surfing lesson: ₹1,500-2,500</li>
      <li>Scuba discover dive: ₹4,000-5,000</li>
      <li>Rafting: ₹700-1,500</li>
      <li>Kayaking tour: ₹1,000-2,500</li>
      <li>Parasailing: ₹1,000-1,500</li>
      <li>Jet ski: ₹800-1,500</li>
      <li>PADI certification: ₹25,000-30,000</li>
    </ul>

    <h2>Booking Tips</h2>
    <ul>
      <li>Book water sports through reputable operators</li>
      <li>Check reviews online</li>
      <li>Ensure insurance coverage</li>
      <li>Bargain for packages combining multiple activities</li>
      <li>Pre-book during peak season (December-January)</li>
      <li>Morning sessions often less crowded</li>
    </ul>',
    'https://images.unsplash.com/photo-1502933691298-84fc14542831?w=1200&h=800',
    'https://images.unsplash.com/photo-1502933691298-84fc14542831?w=600&h=400',
    admin_user_id, true, false, 'approved', NOW() - INTERVAL '19 days', 12,
    'Water Sports South India - Surfing Diving Rafting Guide',
    'Complete water sports guide: surfing Kerala, scuba diving Andaman, rafting Dandeli, kayaking backwaters. Costs, seasons, safety tips.'
  ),

  (
    'Wildlife Safaris: Spotting Tigers & Elephants in South India',
    'wildlife-safaris-tigers-elephants-south-india',
    'Experience South India''s incredible biodiversity through safaris in Bandipur, Nagarhole, Periyar - home to tigers, elephants, and rare species.',
    '<h2>Wild South India</h2>
    <p>South India''s national parks and wildlife sanctuaries protect some of Asia''s most diverse ecosystems. From Bengal tigers to Nilgiri Tahr, these protected areas offer world-class wildlife viewing in pristine natural settings.</p>

    <h2>Top National Parks</h2>
    <h3>Nagarhole National Park, Karnataka</h3>
    <p><strong>Also known as:</strong> Rajiv Gandhi National Park</p>
    <p><strong>Best Time:</strong> April-May (summer - animals near water sources), October-March (pleasant weather)</p>
    <p><strong>Area:</strong> 643 sq km</p>

    <p><strong>Wildlife:</strong></p>
    <ul>
      <li>Tigers, leopards, wild dogs (dholes)</li>
      <li>Large elephant population (500+)</li>
      <li>Gaur (Indian bison), sambar deer, spotted deer</li>
      <li>Over 270 bird species</li>
    </ul>

    <p><strong>Safari Options:</strong></p>
    <ul>
      <li>Morning safari: 6-9 AM</li>
      <li>Evening safari: 4-6 PM</li>
      <li>Jeep safari: ₹2,500-4,000 (6 people max)</li>
      <li>Boat safari on Kabini River: ₹1,000-1,500</li>
    </ul>

    <p><strong>Accommodation:</strong> Forest lodges, luxury resorts near Kabini River, budget options in nearby towns.</p>

    <h3>Bandipur National Park, Karnataka</h3>
    <p><strong>Best Time:</strong> March-June, September-November</p>
    <p><strong>Area:</strong> 874 sq km (part of Nilgiri Biosphere Reserve)</p>

    <p><strong>Wildlife:</strong></p>
    <ul>
      <li>Tigers (70-100 individuals)</li>
      <li>Elephants (2,000+ population)</li>
      <li>Gaur, sloth bears, leopards</li>
      <li>Four-horned antelope (rare)</li>
    </ul>

    <p><strong>Safari:</strong></p>
    <ul>
      <li>Government bus safari: ₹300-500 per person</li>
      <li>Private jeep safari: ₹2,000-3,500</li>
      <li>Two time slots: morning and evening</li>
    </ul>

    <p><strong>Tip:</strong> Combine with Mudumalai (Tamil Nadu) and Wayanad (Kerala) for complete Nilgiri Biosphere experience.</p>

    <h3>Periyar Wildlife Sanctuary, Kerala</h3>
    <p><strong>Best Time:</strong> September-March</p>
    <p><strong>Area:</strong> 925 sq km around Periyar Lake</p>

    <p><strong>Wildlife:</strong></p>
    <ul>
      <li>Elephants frequently spotted near lake</li>
      <li>Tigers (rarely seen, around 40)</li>
      <li>Nilgiri Tahr, sambar, wild boar</li>
      <li>Malabar giant squirrel</li>
      <li>Great hornbill, kingfishers</li>
    </ul>

    <p><strong>Unique Experiences:</strong></p>
    <ul>
      <li><strong>Boat Safari:</strong> ₹300-1,800 (2 hours on Periyar Lake)</li>
      <li><strong>Nature Walk:</strong> ₹300 (3-4 hours with trained guides)</li>
      <li><strong>Tiger Trail:</strong> ₹5,000-7,500 (2 day/1 night camping with ex-poachers as guides)</li>
      <li><strong>Bamboo Rafting:</strong> ₹2,000-3,000 (full day experience)</li>
    </ul>

    <p><strong>Base:</strong> Thekkady town with resorts, homestays, spice plantations.</p>

    <h3>Mudumalai National Park, Tamil Nadu</h3>
    <p><strong>Best Time:</strong> April-June, September-October</p>
    <p><strong>Area:</strong> 321 sq km</p>

    <p><strong>Wildlife:</strong></p>
    <ul>
      <li>Part of Nilgiri Biosphere with tigers, elephants</li>
      <li>Better chance of spotting compared to some parks</li>
      <li>Gaur, sambar, bonnet macaque</li>
    </ul>

    <p><strong>Safari:</strong> Van safari ₹700-1,200, private jeep ₹2,500-3,500</p>

    <h2>Marine & Island Wildlife</h2>
    <h3>Gulf of Mannar Marine National Park, Tamil Nadu</h3>
    <p>India''s first marine biosphere reserve. Glass-bottom boat rides to see coral reefs, sea turtles, dugongs (rare). Base: Rameswaram.</p>

    <h3>Andaman Islands</h3>
    <ul>
      <li><strong>Mahatma Gandhi Marine National Park:</strong> Snorkeling, sea turtles, coral</li>
      <li><strong>Mount Harriet National Park:</strong> Andaman wild pig, robber crabs</li>
      <li><strong>Chidiya Tapu:</strong> Birding paradise</li>
    </ul>

    <h2>Endemic & Rare Species Parks</h2>
    <h3>Eravikulam National Park, Kerala</h3>
    <p><strong>Highlight:</strong> Nilgiri Tahr (endangered mountain goat)</p>
    <p><strong>Best Time:</strong> September-November, January-May</p>
    <p>Walking trails with casi guaranteed Tahr sightings. Closed during monsoon for breeding season (June-August). Entry: ₹125 Indians, ₹440 foreigners.</p>

    <h3>Silent Valley National Park, Kerala</h3>
    <p><strong>Highlight:</strong> Last  remaining rainforest in South India</p>
    <p>Lion-tailed macaque, Nilgiri langur, Malabar giant squirrel. Trekking with guides. Permit required. Limited visitors per day.</p>

    <h2>Bird Watching Hotspots</h2>
    <h3>Ranganathittu Bird Sanctuary, Karnataka</h3>
    <p>Near Mysore. Painted storks, spoonbills, ibis. Boat rides ₹50-100. Best: June-November (breeding season).</p>

    <h3>Vedanthangal Bird Sanctuary, Tamil Nadu</h3>
    <p>Oldest water bird sanctuary in India. Migratory birds October-March. Spot-billed pelican, grey herons.</p>

    <h3>Kumarakom Bird Sanctuary, Kerala</h3>
    <p>On Vembanad Lake. Local and migratory waterfowl. Early morning boat rides best.</p>

    <h2>Safari Booking Tips</h2>
    <ul>
      <li><strong>Advance Booking:</strong> Online booking opens weeks in advance - book early for peak season</li>
      <li><strong>Timing:</strong> Early morning safaris have better animal sighting chances</li>
      <li><strong>Patience:</strong> Wildlife sightings never guaranteed - multiple safaris increase odds</li>
      <li><strong>Dress Code:</strong> Earth tones (avoid bright colors), comfortable clothes</li>
      <li><strong>Silence:</strong> Maintain silence during safaris to not scare animals</li>
    </ul>

    <h2>What to Bring</h2>
    <ul>
      <li>Binoculars (essential for bird watching)</li>
      <li>Camera with telephoto lens</li>
      <li>Sunglasses, sun hat, sunscreen</li>
      <li>Insect repellent</li>
      <li>Water bottle</li>
      <li>Comfortable shoes</li>
      <li>Light jacket for early mornings</li>
    </ul>

    <h2>Photography Guidelines</h2>
    <ul>
      <li>No flash photography (disturbs wildlife)</li>
      <li>Telephoto lens (300mm+) recommended</li>
      <li>Fast shutter speed for moving animals</li>
      <li>Shoot during golden hours (early morning/late evening)</li>
      <li>Respect distance - never ask driver to go off-track</li>
    </ul>

    <h2>Accommodation Options</h2>
    <h3>Forest Department Lodges</h3>
    <p>Basic, budget-friendly (₹500-2,000), book through forest department websites.</p>

    <h3>Jungle Resorts</h3>
    <p>Luxury options near parks (₹5,000-20,000+). Include safaris, naturalist talks, nature walks.</p>
    <ul>
      <li>Kabini River Lodge</li>
      <li>The Serai, Bandipur</li>
      <li>Evolve Back, Kabini</li>
      <li>Spice Village, Periyar</li>
    </ul>

    <h3>Homestays</h3>
    <p>Near Periyar, Nagarhole. Authentic experience, home-cooked meals (₹1,500-3,000).</p>

    <h2>Combining Wildlife with Culture</h2>
    <ul>
      <li><strong>Mysore + Bandipur/Nagarhole:</strong> Palaces + safaris</li>
      <li><strong>Thekkady + Munnar:</strong> Wildlife + tea plantations</li>
      <li><strong>Wayanad + Coorg:</strong> Wildlife + coffee estates</li>
    </ul>

    <h2>Responsible Wildlife Tourism</h2>
    <ul>
      <li>Maintain safe distance from animals</li>
      <li>No feeding wildlife</li>
      <li>No littering - carry trash back</li>
      <li>Respect park rules and timing</li>
      <li>Don''t disturb nesting sites</li>
      <li>Support local communities through homestays</li>
      <li>Use licensed guides and operators</li>
    </ul>

    <h2>Safety in Parks</h2>
    <ul>
      <li>Never exit vehicle during safari</li>
      <li>Don''t stand on vehicle or lean out</li>
      <li>Follow guide/driver instructions</li>
      <li>If elephant encountered on road, switch off engine, stay calm</li>
      <li>No sudden movements or loud noises</li>
      <li>Be cautious during treks - follow guides</li>
    </ul>',
    'https://images.unsplash.com/photo-1551316679-9c6ae9dec224?w=1200&h=800',
    'https://images.unsplash.com/photo-1551316679-9c6ae9dec224?w=600&h=400',
    admin_user_id, true, false, 'approved', NOW() - INTERVAL '21 days', 12,
    'South India Wildlife Safaris - Tigers Elephants National Parks',
    'Complete wildlife safari guide: Bandipur, Nagarhole, Periyar. Tiger spotting, elephant encounters, bird watching. Best times, costs, booking tips.'
  )

ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  updated_at = CURRENT_TIMESTAMP;

END $$;

-- Success! All 20 blog posts created
SELECT COUNT(*) as total_blogs FROM blog_posts;
