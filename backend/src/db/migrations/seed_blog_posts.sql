-- Migration: Seed 20 blog posts about South India
-- Date: 2025-11-17
-- Description: Insert 20 high-quality blog posts (7 Travel Guides, 4 Tips & Advice, 3 Culture & History, 3 Food & Cuisine, 3 Adventure)

-- Get admin user ID for author
DO $$
DECLARE
  admin_user_id INTEGER;
BEGIN
  -- Get the first administrator user
  SELECT id INTO admin_user_id
  FROM users
  WHERE role = 'administrator'
  LIMIT 1;

  -- If no administrator found, raise error
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'No administrator user found. Please create an admin user first.';
  END IF;

  -- Insert blog posts
  INSERT INTO blog_posts (
    title, slug, excerpt, content, featured_image_url, thumbnail_image,
    author_id, is_published, is_featured, moderation_status, published_at,
    reading_time, meta_title, meta_description
  ) VALUES

  -- ============================================
  -- TRAVEL GUIDES (7 posts - category_id = 1)
  -- ============================================

  (
    'Discovering Kerala Backwaters: A Complete Guide',
    'discovering-kerala-backwaters-complete-guide',
    'Explore the serene backwaters of Kerala with our comprehensive guide to houseboats, local culture, and hidden gems.',
    '<h2>Introduction to Kerala Backwaters</h2>
    <p>Kerala''s backwaters are a network of interconnected canals, rivers, lakes, and inlets along the Arabian Sea coast. This unique ecosystem offers visitors a glimpse into traditional village life while cruising through palm-fringed waterways.</p>

    <h2>Best Time to Visit</h2>
    <p>The ideal time to visit Kerala backwaters is between November and March when the weather is pleasant and dry. Avoid the monsoon season (June-September) unless you enjoy rain and want to see the landscape at its most lush.</p>

    <h2>Top Backwater Destinations</h2>
    <h3>Alleppey (Alappuzha)</h3>
    <p>Known as the "Venice of the East," Alleppey is the most popular backwater destination. The annual Nehru Trophy Boat Race in August attracts thousands of visitors.</p>

    <h3>Kumarakom</h3>
    <p>A quieter alternative to Alleppey, Kumarakom offers bird watching at the Kumarakom Bird Sanctuary and luxury resorts along Vembanad Lake.</p>

    <h3>Kollam (Quilon)</h3>
    <p>The longest backwater cruise (8 hours) runs between Kollam and Alleppey, passing through villages, coir-making units, and toddy shops.</p>

    <h2>Houseboat Experience</h2>
    <p>Traditional kettuvallams (houseboats) have been converted into floating hotels with bedrooms, bathrooms, and dining areas. Most packages include:</p>
    <ul>
      <li>All meals prepared by an onboard chef</li>
      <li>Air-conditioned or fan-cooled bedrooms</li>
      <li>Sunset views from the deck</li>
      <li>Village visits and canoe rides</li>
    </ul>

    <h2>Local Experiences</h2>
    <p>Don''t miss visiting toddy shops (local bars), watching coir rope making, visiting spice gardens, and trying Kerala''s famous fish curry and appam for breakfast.</p>

    <h2>Practical Tips</h2>
    <ul>
      <li>Book houseboats in advance during peak season</li>
      <li>Negotiate prices directly with boat owners for better deals</li>
      <li>Choose eco-friendly houseboats to minimize environmental impact</li>
      <li>Carry mosquito repellent and light cotton clothing</li>
      <li>Respect local customs when visiting villages</li>
    </ul>',
    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&h=800',
    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&h=400',
    admin_user_id, true, true, 'approved', NOW() - INTERVAL '25 days', 8,
    'Kerala Backwaters Guide 2025 - Houseboats & Hidden Gems',
    'Complete guide to Kerala backwaters including Alleppey, Kumarakom, houseboat tips, and local experiences. Plan your perfect backwater vacation.'
  ),

  (
    'Hampi: Walking Through a UNESCO World Heritage Site',
    'hampi-walking-through-unesco-world-heritage',
    'Discover the magnificent ruins of the Vijayanagara Empire in Hampi, Karnataka - a photographer''s paradise and history lover''s dream.',
    '<h2>The Ancient City of Hampi</h2>
    <p>Hampi, a UNESCO World Heritage Site in Karnataka, was once the capital of the mighty Vijayanagara Empire (1336-1565 CE). Today, its 1,600 monuments scattered across 41.5 square kilometers attract history enthusiasts, photographers, and spiritual seekers from around the world.</p>

    <h2>Must-Visit Monuments</h2>
    <h3>Virupaksha Temple</h3>
    <p>This active temple dedicated to Lord Shiva has been functioning continuously for over 700 years. Its 52-meter gopuram (tower) dominates the Hampi skyline.</p>

    <h3>Vittala Temple Complex</h3>
    <p>Home to the iconic Stone Chariot and the famous musical pillars that produce different musical notes when tapped. This temple showcases the pinnacle of Vijayanagara architecture.</p>

    <h3>Royal Enclosure</h3>
    <p>Explore the stepped tanks, elephant stables, Lotus Mahal, and the queen''s bath - remnants of royal grandeur.</p>

    <h3>Matanga Hill</h3>
    <p>Climb this hill for spectacular sunrise or sunset views over the boulder-strewn landscape and ancient ruins.</p>

    <h2>Best Time to Visit</h2>
    <p>Visit between October and March to avoid the scorching summer heat. November hosts the Hampi Utsav, a cultural festival featuring music, dance, and processions.</p>

    <h2>Getting Around</h2>
    <p>Rent a bicycle or scooter to explore the vast site at your own pace. The monuments are spread across both sides of the Tungabhadra River. Take a coracle (circular boat) ride to cross the river and explore Anegundi village.</p>

    <h2>Photography Tips</h2>
    <ul>
      <li>Golden hour (sunrise/sunset) offers the best lighting</li>
      <li>The boulder-strewn landscape creates dramatic compositions</li>
      <li>Matanga Hill viewpoint is perfect for panoramic shots</li>
      <li>Respect temple rules regarding photography</li>
    </ul>

    <h2>Where to Stay</h2>
    <p>Stay in Hampi Bazaar for proximity to monuments or across the river in Virupapur Gaddi (Hippie Island) for a more relaxed, backpacker-friendly atmosphere with cafes and guesthouses.</p>',
    'https://images.unsplash.com/photo-1609920658906-8223bd289001?w=1200&h=800',
    'https://images.unsplash.com/photo-1609920658906-8223bd289001?w=600&h=400',
    admin_user_id, true, true, 'approved', NOW() - INTERVAL '22 days', 7,
    'Hampi Travel Guide 2025 - UNESCO World Heritage Site',
    'Explore Hampi''s ancient ruins, temples, and monuments. Complete guide to Karnataka''s UNESCO World Heritage Site including what to see and photography tips.'
  ),

  (
    'Chennai Uncovered: Tamil Nadu''s Cultural Capital',
    'chennai-uncovered-tamil-nadu-cultural-capital',
    'From ancient temples to modern tech hubs, discover why Chennai is South India''s most fascinating metropolitan city.',
    '<h2>Welcome to Chennai</h2>
    <p>Chennai, formerly known as Madras, is the capital of Tamil Nadu and India''s fourth-largest city. This coastal metropolis seamlessly blends tradition with modernity, offering ancient temples, colonial architecture, pristine beaches, and a thriving cultural scene.</p>

    <h2>Top Attractions</h2>
    <h3>Kapaleeshwarar Temple</h3>
    <p>This 7th-century Dravidian temple in Mylapore is dedicated to Lord Shiva. Its towering gopuram, vibrant sculptures, and evening ceremonies offer an authentic spiritual experience.</p>

    <h3>Marina Beach</h3>
    <p>The world''s second-longest urban beach stretches for 13 km along the Bay of Bengal. Visit in the evening to see locals playing cricket, enjoying street food, and watching the sunset.</p>

    <h3>Fort St. George</h3>
    <p>Built in 1644 by the British East India Company, this fort houses a museum showcasing colonial-era artifacts, weapons, and documents.</p>

    <h3>San Thome Basilica</h3>
    <p>A neo-Gothic Roman Catholic basilica built over the tomb of St. Thomas, one of the twelve apostles of Jesus.</p>

    <h2>Cultural Experiences</h2>
    <h3>Bharatanatyam Dance</h3>
    <p>Watch classical Bharatanatyam performances at Kalakshetra Foundation or during the December Music Season when the city hosts over 1,000 classical concerts.</p>

    <h3>Filter Coffee Culture</h3>
    <p>Experience authentic South Indian filter coffee at traditional eateries like Saravana Bhavan or India Coffee House. The coffee is served in steel tumblers and davara (small bowls).</p>

    <h2>Day Trips from Chennai</h2>
    <ul>
      <li><strong>Mahabalipuram (60 km):</strong> UNESCO World Heritage Site with ancient rock-cut temples</li>
      <li><strong>Kanchipuram (75 km):</strong> City of 1,000 temples and famous silk sarees</li>
      <li><strong>Pondicherry (160 km):</strong> Former French colony with colonial architecture</li>
    </ul>

    <h2>Food Scene</h2>
    <p>Chennai is a paradise for South Indian cuisine lovers. Must-try dishes include:</p>
    <ul>
      <li>Idli and dosa at Murugan Idli Shop</li>
      <li>Chettinad chicken at Anjappar</li>
      <li>Filter coffee at Rayar''s Cafe</li>
      <li>Street food at Besant Nagar Beach (Bessie)</li>
    </ul>

    <h2>Practical Information</h2>
    <p>Best time to visit: November to February. Chennai International Airport connects to major global cities. The local transport includes metro, buses, auto-rickshaws, and app-based cabs. Dress modestly when visiting temples.</p>',
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=800',
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400',
    admin_user_id, true, false, 'approved', NOW() - INTERVAL '20 days', 6,
    'Chennai Travel Guide - Explore Tamil Nadu''s Cultural Capital',
    'Discover Chennai''s temples, beaches, colonial heritage, and vibrant culture. Complete guide to South India''s metropolitan hub with tips and attractions.'
  ),

  (
    'Munnar: A Journey Through Tea Gardens and Misty Hills',
    'munnar-journey-tea-gardens-misty-hills',
    'Experience the breathtaking beauty of Munnar, Kerala''s most scenic hill station surrounded by emerald tea plantations.',
    '<h2>Introduction to Munnar</h2>
    <p>Nestled in the Western Ghats at an altitude of 1,600 meters, Munnar is Kerala''s premier hill station. Famous for endless tea plantations, misty mountains, rare flora and fauna, and pleasant climate year-round, Munnar offers a perfect escape from tropical heat.</p>

    <h2>Top Attractions</h2>
    <h3>Tea Plantations & Museums</h3>
    <p>Visit working tea estates like Kolukkumalai (the world''s highest tea plantation) and the Tea Museum in Munnar town to learn about tea processing from leaf to cup. Many plantations offer guided tours where you can pluck tea leaves alongside workers.</p>

    <h3>Eravikulam National Park</h3>
    <p>Home to the endangered Nilgiri Tahr, this park is particularly beautiful when the Neelakurinji flowers bloom (once every 12 years - next in 2030). The park offers stunning views and easy trekking trails.</p>

    <h3>Mattupetty Dam</h3>
    <p>A popular picnic spot offering boating facilities and views of tea estates. The nearby Mattupetty Indo-Swiss Livestock Project is worth a visit.</p>

    <h3>Anamudi Peak</h3>
    <p>At 2,695 meters, Anamudi is South India''s highest peak. Trekking requires permission from Forest Department, but the views from base areas are spectacular.</p>

    <h2>Activities</h2>
    <ul>
      <li><strong>Trekking:</strong> Multiple trails through tea estates and forests</li>
      <li><strong>Rock Climbing:</strong> At Echo Point and surrounding areas</li>
      <li><strong>Mountain Biking:</strong> Through winding plantation roads</li>
      <li><strong>Photography:</strong> Endless opportunities for landscape photography</li>
      <li><strong>Wildlife Spotting:</strong> Nilgiri Tahr, elephants, various bird species</li>
    </ul>

    <h2>Best Time to Visit</h2>
    <p>September to May is ideal. December to February can be chilly (10-15°C), perfect for those seeking cold weather. Avoid monsoons (June-August) when heavy rains can cause landslides.</p>

    <h2>Where to Stay</h2>
    <p>Options range from budget homestays offering home-cooked Kerala meals to luxury resorts with tea estate views. Popular areas include Munnar town, Chinnakanal, and Marayoor.</p>

    <h2>Local Tips</h2>
    <ul>
      <li>Carry warm clothing, especially for early mornings and evenings</li>
      <li>Book accommodation in advance during peak season (December-January)</li>
      <li>Hire a local guide for trekking and wildlife spotting</li>
      <li>Try the locally grown tea and fresh strawberries</li>
      <li>Respect plantation boundaries and don''t litter</li>
    </ul>',
    'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1200&h=800',
    'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=600&h=400',
    admin_user_id, true, true, 'approved', NOW() - INTERVAL '18 days', 7,
    'Munnar Travel Guide - Kerala Tea Gardens & Hill Station',
    'Complete guide to Munnar including tea plantations, national parks, trekking, and where to stay. Explore Kerala''s most beautiful hill station.'
  ),

  (
    'Mahabalipuram: Ancient Rock-Cut Marvels by the Sea',
    'mahabalipuram-ancient-rock-cut-marvels-sea',
    'Explore the 7th-century shore temples and rock-cut sculptures of Mahabalipuram, a UNESCO World Heritage Site on Tamil Nadu''s coast.',
    '<h2>Mahabalipuram: Where Art Meets Ocean</h2>
    <p>Mahabalipuram (also called Mamallapuram) is a historic coastal town in Tamil Nadu, 60 km south of Chennai. This UNESCO World Heritage Site showcases the architectural genius of the Pallava dynasty through its shore temples, rock-cut caves, and massive stone sculptures carved between the 7th and 8th centuries.</p>

    <h2>Major Monuments</h2>
    <h3>Shore Temple</h3>
    <p>This iconic 8th-century structural temple stands facing the Bay of Bengal. Dedicated to both Shiva and Vishnu, it''s one of the oldest structural stone temples in South India and particularly beautiful at sunrise.</p>

    <h3>Pancha Rathas (Five Chariots)</h3>
    <p>Five monolithic rock-cut temples, each carved from a single granite boulder in the shape of temple chariots. Each ratha is dedicated to a different deity and showcases different architectural styles.</p>

    <h3>Arjuna''s Penance (Descent of the Ganges)</h3>
    <p>One of the world''s largest open-air rock reliefs, measuring 27m long and 9m high. This magnificent sculpture depicts over 100 figures including gods, humans, animals, and mythical creatures.</p>

    <h3>Krishna''s Butter Ball</h3>
    <p>A massive natural rock boulder perched precariously on a slope, defying gravity for over 1,200 years. A popular photo spot!</p>

    <h3>Varaha Cave Temple</h3>
    <p>A 7th-century rock-cut cave temple featuring beautiful panel sculptures depicting various incarnations of Vishnu.</p>

    <h2>Beach & Water Activities</h2>
    <p>Mahabalipuram Beach offers swimming, surfing, and beach games. Several surf schools operate from the beach, offering lessons for beginners. The beach is also perfect for evening strolls and watching fishermen bring in their catch.</p>

    <h2>Shopping</h2>
    <p>The town is famous for stone sculpture craft. Watch artisans chiseling granite into intricate idols and decorative pieces. You can purchase souvenirs ranging from small figurines to large sculptures (shipping available).</p>

    <h2>Best Time to Visit</h2>
    <p>November to February offers pleasant weather. Avoid April and May when temperatures soar. Visit monuments early morning or late afternoon to avoid crowds and heat.</p>

    <h2>Practical Tips</h2>
    <ul>
      <li>Entry fee required for main monument complex</li>
      <li>Hire a guide for historical context and stories</li>
      <li>Wear comfortable shoes for walking on uneven rocks</li>
      <li>Carry water and sun protection</li>
      <li>Try fresh seafood at beachside restaurants</li>
      <li>Combine with a visit to nearby Pondicherry (100 km south)</li>
    </ul>',
    'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&h=800',
    'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=600&h=400',
    admin_user_id, true, false, 'approved', NOW() - INTERVAL '16 days', 6,
    'Mahabalipuram Guide - UNESCO Rock-Cut Temples Tamil Nadu',
    'Explore Mahabalipuram''s shore temples, rock sculptures, and beach. Complete guide to Tamil Nadu''s UNESCO World Heritage Site near Chennai.'
  ),

  (
    'Coorg: Scotland of India - Coffee, Waterfalls & Wildlife',
    'coorg-scotland-india-coffee-waterfalls-wildlife',
    'Discover the misty hills, coffee plantations, and lush landscapes of Coorg, Karnataka''s most romantic hill station.',
    '<h2>Welcome to Coorg (Kodagu)</h2>
    <p>Coorg, officially known as Kodagu, is a picturesque hill station in Karnataka known for its coffee plantations, lush greenery, cascading waterfalls, and rich Kodava culture. Often called the "Scotland of India," Coorg offers a perfect blend of natural beauty and cultural experiences.</p>

    <h2>Top Attractions</h2>
    <h3>Abbey Falls</h3>
    <p>A stunning waterfall surrounded by coffee plantations and spice estates. The 70-foot falls are especially impressive during monsoons (June-September).</p>

    <h3>Raja''s Seat</h3>
    <p>A popular viewpoint offering panoramic views of mist-covered valleys and mountains. Beautiful gardens, fountains, and musical fountain shows in the evening make it a perfect sunset spot.</p>

    <h3>Dubare Elephant Camp</h3>
    <p>Interact with elephants through bathing, feeding, and learning about elephant care from mahouts. Located on the banks of the Kaveri River, it also offers river rafting and fishing.</p>

    <h3>Talacauvery</h3>
    <p>The source of River Kaveri (Cauvery), one of South India''s sacred rivers. The temple and surrounding views from Brahmagiri hills are spectacular.</p>

    <h3>Nagarhole National Park</h3>
    <p>Part of the Nilgiri Biosphere Reserve, this park is home to tigers, elephants, leopards, and over 270 bird species. Safari tours available.</p>

    <h2>Coffee Plantation Tours</h2>
    <p>Coorg produces some of India''s finest Arabica coffee. Many plantations offer guided tours explaining coffee cultivation, processing, and tasting. Popular estates include:</p>
    <ul>
      <li>Old Kent Estates</li>
      <li>Tata Coffee Plantations</li>
      <li>Honey Valley Estate</li>
    </ul>

    <h2>Adventure Activities</h2>
    <ul>
      <li><strong>White Water Rafting:</strong> On Barapole River (July-September)</li>
      <li><strong>Trekking:</strong> Tadiandamol Peak (1,748m), Brahmagiri, Pushpagiri</li>
      <li><strong>Zip-lining:</strong> Various adventure parks</li>
      <li><strong>Mountain Biking:</strong> Through coffee estates</li>
    </ul>

    <h2>Kodava Culture & Cuisine</h2>
    <p>The Kodava people have a unique culture with distinct traditions, dress, and cuisine. Must-try dishes include:</p>
    <ul>
      <li>Pandi Curry (pork curry)</li>
      <li>Kadambuttu (rice dumplings)</li>
      <li>Bamboo Shoot Curry</li>
      <li>Noolputtu (rice noodles)</li>
    </ul>

    <h2>Best Time to Visit</h2>
    <p>October to March for pleasant weather. Monsoons (June-September) bring spectacular waterfalls but can restrict outdoor activities. Coffee blossom season (March-April) fills the air with fragrant white flowers.</p>

    <h2>Where to Stay</h2>
    <p>Choose from luxury resorts, coffee plantation homestays, or budget hotels in Madikeri town. Homestays offer authentic Kodava hospitality and home-cooked meals.</p>',
    'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&h=800',
    'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&h=400',
    admin_user_id, true, true, 'approved', NOW() - INTERVAL '14 days', 7,
    'Coorg Travel Guide - Coffee Plantations & Waterfalls Karnataka',
    'Complete Coorg guide including coffee estates, waterfalls, wildlife, trekking, and Kodava culture. Plan your Karnataka hill station vacation.'
  ),

  (
    'Mysore Heritage Trail: Palaces, Yoga & Silk Sarees',
    'mysore-heritage-trail-palaces-yoga-silk',
    'Experience royal grandeur in Mysore, home to magnificent palaces, traditional yoga, and world-famous silk.',
    '<h2>The City of Palaces</h2>
    <p>Mysore (Mysuru), the cultural capital of Karnataka, is renowned for its royal heritage, magnificent palaces, sandalwood, silk sarees, and as the birthplace of Ashtanga yoga. The city maintains its old-world charm while embracing modernity.</p>

    <h2>Must-Visit Attractions</h2>
    <h3>Mysore Palace (Amba Vilas)</h3>
    <p>The jewel of Mysore, this Indo-Saracenic palace is one of India''s most visited monuments. The palace is illuminated with 97,000 light bulbs every Sunday and during festivals - a breathtaking sight. Don''t miss the Durbar Hall and the ornate royal throne.</p>

    <h3>Chamundi Hills & Temple</h3>
    <p>Climb 1,000 steps (or drive) to Chamundeshwari Temple atop Chamundi Hills. The hilltop offers panoramic city views. On the way, visit the massive 5-meter tall Nandi (bull) statue carved from a single rock.</p>

    <h3>Brindavan Gardens</h3>
    <p>Located 21 km from Mysore, these terraced gardens below Krishnaraja Sagar Dam feature musical fountains, illuminated gardens, and boat rides. The evening fountain show is spectacular.</p>

    <h3>Jaganmohan Palace Art Gallery</h3>
    <p>Houses an impressive collection of paintings including works by Raja Ravi Varma. The palace itself is a beautiful example of Hindu architecture.</p>

    <h2>Ashtanga Yoga</h2>
    <p>Mysore is the birthplace of Ashtanga Vinyasa Yoga. The K. Pattabhi Jois Ashtanga Yoga Institute (KPJAYI) attracts yoga practitioners worldwide. Many yoga schools offer short-term courses and drop-in classes.</p>

    <h2>Shopping Experiences</h2>
    <h3>Mysore Silk</h3>
    <p>Visit the Government Silk Weaving Factory to see silk production and purchase authentic Mysore silk sarees, a symbol of elegance and tradition.</p>

    <h3>Sandalwood Products</h3>
    <p>The Government Sandalwood Oil Factory offers pure sandalwood oil, soaps, incense, and carvings. Sandalwood from Mysore is prized for its quality and fragrance.</p>

    <h3>Devaraja Market</h3>
    <p>A vibrant local market selling flowers (especially jasmine), spices, fruits, vegetables, and traditional items. A sensory feast and photographer''s delight.</p>

    <h2>Mysore Dasara Festival</h2>
    <p>Celebrated for 10 days in September/October, Mysore Dasara is a grand spectacle featuring processions with decorated elephants, cultural performances, and illuminated palace. Book accommodation well in advance if visiting during Dasara.</p>

    <h2>Day Trips</h2>
    <ul>
      <li><strong>Srirangapatna (15 km):</strong> Historic island town with Tipu Sultan''s summer palace</li>
      <li><strong>Somnathpur (35 km):</strong> Exquisite Hoysala temple architecture</li>
      <li><strong>Nagarhole (90 km):</strong> Wildlife sanctuary for tiger and elephant safaris</li>
    </ul>

    <h2>Culinary Delights</h2>
    <p>Try Mysore Masala Dosa, Mysore Pak (sweet), and filter coffee at traditional restaurants like RRR, Mylari, or Vinayaka Mylari.</p>',
    'https://images.unsplash.com/photo-1609920707168-c58d7cfb0b9e?w=1200&h=800',
    'https://images.unsplash.com/photo-1609920707168-c58d7cfb0b9e?w=600&h=400',
    admin_user_id, true, false, 'approved', NOW() - INTERVAL '12 days', 6,
    'Mysore Travel Guide - Palaces, Yoga & Cultural Heritage',
    'Explore Mysore''s royal palaces, Ashtanga yoga, silk sarees, and Dasara festival. Complete guide to Karnataka''s cultural capital.'
  ),

  -- ============================================
  -- TIPS & ADVICE (4 posts - category_id = 2)
  -- ============================================

  (
    'First Timer''s Guide: 10 Essential Tips for South India',
    'first-timer-guide-essential-tips-south-india',
    'Planning your first trip to South India? Our comprehensive guide covers everything from customs to currency, ensuring a smooth journey.',
    '<h2>Welcome to South India</h2>
    <p>South India offers a distinct experience from North India, with its own languages, cuisine, culture, and climate. This guide will help first-time visitors navigate the region confidently.</p>

    <h2>1. Best Time to Visit</h2>
    <p>November to March is ideal for most of South India. The weather is pleasant (20-30°C) and dry. Avoid April-May (extremely hot) unless visiting hill stations. Monsoon (June-September) brings heavy rain, especially to Kerala and coastal Karnataka, but offers lush green landscapes and lower prices.</p>

    <h2>2. Language & Communication</h2>
    <p>Each state has its own language: Tamil in Tamil Nadu, Telugu in Andhra Pradesh, Kannada in Karnataka, and Malayalam in Kerala. English is widely understood in cities and tourist areas. Learn basic phrases like "Thank you" (Nandri in Tamil, Dhanyavad in Telugu/Kannada, Nanni in Malayalam) to connect with locals.</p>

    <h2>3. Dress Code & Modesty</h2>
    <p>South India is generally conservative. When visiting temples:</p>
    <ul>
      <li>Cover shoulders and knees</li>
      <li>Remove shoes before entering</li>
      <li>Some temples restrict entry for non-Hindus (mainly in Kerala)</li>
      <li>Women should avoid crop tops and shorts in religious places</li>
    </ul>
    <p>Beachwear is acceptable at beaches but change before entering towns.</p>

    <h2>4. Food & Water Safety</h2>
    <p>South Indian cuisine is predominantly vegetarian, rice-based, and can be spicy. Tips:</p>
    <ul>
      <li>Start with mild dishes if not accustomed to spice</li>
      <li>Always drink bottled or filtered water</li>
      <li>Eat at busy restaurants (high turnover = fresh food)</li>
      <li>Street food is generally safe in popular spots</li>
      <li>Try traditional banana leaf meals (unlimited servings!)</li>
    </ul>

    <h2>5. Transportation</h2>
    <p>Options include:</p>
    <ul>
      <li><strong>Trains:</strong> Comfortable and scenic, book in advance</li>
      <li><strong>Buses:</strong> Extensive network, state transport is reliable</li>
      <li><strong>Auto-rickshaws:</strong> Use metered rides or agree on fare beforehand</li>
      <li><strong>App-based cabs:</strong> Uber, Ola widely available in cities</li>
      <li><strong>Rental bikes/scooters:</strong> Great for exploring Goa, Coorg, Kerala</li>
    </ul>

    <h2>6. Currency & Payments</h2>
    <p>Currency is Indian Rupee (₹). ATMs are widely available in cities and towns. Many places now accept UPI payments and cards, but carry cash for small vendors, temples, and rural areas. Inform your bank about international travel to avoid card blocks.</p>

    <h2>7. Temple Etiquette</h2>
    <ul>
      <li>Remove leather items (belts, bags) before entering some temples</li>
      <li>Wash feet at temple entrances</li>
      <li>Photography may be restricted - always ask</li>
      <li>Dress modestly</li>
      <li>Observe silence in inner sanctums</li>
      <li>Leave small offerings (₹10-50) if you wish</li>
    </ul>

    <h2>8. Health Precautions</h2>
    <ul>
      <li>Get travel insurance covering medical emergencies</li>
      <li>Carry basic medicines (anti-diarrheal, pain relief, band-aids)</li>
      <li>Use mosquito repellent, especially in coastal and backwater areas</li>
      <li>Apply sunscreen (SPF 30+) - tropical sun is strong</li>
      <li>Stay hydrated in hot weather</li>
    </ul>

    <h2>9. Bargaining & Shopping</h2>
    <p>Bargaining is expected in markets and with auto-rickshaw drivers (not using meters). Government emporiums and branded stores have fixed prices. Start at 50-60% of quoted price and negotiate. Be polite and smile!</p>

    <h2>10. Safety Tips</h2>
    <ul>
      <li>South India is generally safe for travelers</li>
      <li>Women should avoid isolated areas after dark</li>
      <li>Keep valuables in hotel safes</li>
      <li>Beware of overfriendly strangers offering free tours</li>
      <li>Use registered taxis/rickshaws</li>
      <li>Trust your instincts</li>
    </ul>

    <h2>Bonus Tips</h2>
    <ul>
      <li>Download offline maps (Google Maps works well)</li>
      <li>Learn to eat with your right hand - it''s fun!</li>
      <li>Respect local customs and you''ll receive warm hospitality</li>
      <li>Be patient - "Indian Standard Time" is flexible</li>
      <li>Embrace the experience with an open mind</li>
    </ul>',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&h=800',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&h=400',
    admin_user_id, true, true, 'approved', NOW() - INTERVAL '10 days', 9,
    'First Timer Guide South India - 10 Essential Travel Tips',
    'Essential tips for first-time visitors to South India covering weather, culture, temples, food, transportation, and safety. Plan your trip confidently.'
  ),

  (
    'Monsoon Magic: Traveling South India During Rainy Season',
    'monsoon-magic-traveling-south-india-rainy-season',
    'Discover why monsoon is the best-kept secret for experiencing South India''s lush landscapes, waterfalls, and authentic local life.',
    '<h2>Embrace the Monsoon</h2>
    <p>While most travelers avoid the monsoon season (June-September), this period offers unique experiences: dramatic waterfalls, verdant landscapes, fewer crowds, lower prices, and authentic local culture. Here''s how to make the most of monsoon travel in South India.</p>

    <h2>Best Monsoon Destinations</h2>
    <h3>Western Ghats</h3>
    <p>The Western Ghats receive heavy rainfall, transforming into a green paradise. Recommended destinations:</p>
    <ul>
      <li><strong>Agumbe, Karnataka:</strong> "Cherrapunji of South India" with spectacular sunsets and rainforests</li>
      <li><strong>Munnar, Kerala:</strong> Tea gardens shimmer in the rain, clouds descend into valleys</li>
      <li><strong>Coorg, Karnataka:</strong> Coffee plantations at their greenest, roaring waterfalls</li>
      <li><strong>Wayanad, Kerala:</strong> Lush forests, trekking when rain permits</li>
    </ul>

    <h3>Coastal Regions</h3>
    <p>Kerala''s backwaters are beautiful during monsoon. The rain creates ripples on waterways, and you''ll have houseboats almost to yourself. Gokarna''s beaches are wild and dramatic with crashing waves (swimming not recommended).</p>

    <h2>Advantages of Monsoon Travel</h2>
    <ul>
      <li><strong>Lower Prices:</strong> 30-50% discounts on hotels and tour packages</li>
      <li><strong>Fewer Crowds:</strong> Popular tourist sites are peaceful</li>
      <li><strong>Lush Landscapes:</strong> Nature at its most vibrant</li>
      <li><strong>Waterfalls:</strong> At their most spectacular</li>
      <li><strong>Authentic Experience:</strong> Witness local life during agricultural season</li>
      <li><strong>Ayurveda Treatments:</strong> Monsoon is considered best for Panchakarma</li>
    </ul>

    <h2>What to Pack</h2>
    <ul>
      <li>Waterproof jacket or poncho</li>
      <li>Quick-dry clothes (avoid jeans)</li>
      <li>Waterproof bag for electronics</li>
      <li>Good quality umbrella</li>
      <li>Waterproof footwear with good grip</li>
      <li>Plastic bags for wet clothes</li>
      <li>Mosquito repellent</li>
      <li>Extra batteries for electronics</li>
    </ul>

    <h2>Activities Perfect for Monsoon</h2>
    <h3>Waterfall Visits</h3>
    <p>Jog Falls, Abbey Falls, Athirapally Falls, and dozens of seasonal waterfalls come alive. Maintain safe distance and follow local warnings.</p>

    <h3>Ayurvedic Treatments</h3>
    <p>Kerala''s Ayurveda centers offer special monsoon packages. The humid climate is believed to enhance treatment effectiveness.</p>

    <h3>Cultural Immersion</h3>
    <p>Attend local festivals like Onam (Kerala, Aug-Sep), visit museums, watch Kathakali performances, learn cooking or yoga.</p>

    <h3>Photography</h3>
    <p>Monsoon clouds, mist-covered hills, rain-soaked streets, and dramatic landscapes offer incredible photography opportunities.</p>

    <h2>Challenges & How to Overcome</h2>
    <h3>Transportation Delays</h3>
    <p>Flights and trains may be delayed. Build buffer days into your itinerary. Check weather forecasts and plan flexibility.</p>

    <h3>Road Conditions</h3>
    <p>Some hill roads may be closed due to landslides. Always check local conditions before traveling. Hire experienced drivers familiar with monsoon driving.</p>

    <h3>Limited Outdoor Activities</h3>
    <p>Beach swimming, trekking, and water sports may be restricted. Focus on cultural activities, indoor attractions, and enjoying nature from covered viewpoints.</p>

    <h3>Health Concerns</h3>
    <p>Mosquito-borne diseases peak during monsoon. Use repellent, wear full-sleeved clothes in evenings, and stay in accommodations with mosquito nets or screens.</p>

    <h2>Safety Tips</h2>
    <ul>
      <li>Avoid trekking in heavy rain or when weather warnings are issued</li>
      <li>Don''t cross flooded roads or streams</li>
      <li>Stay away from beaches during high tide</li>
      <li>Keep emergency contacts handy</li>
      <li>Inform hotel staff about your day plans</li>
      <li>Carry basic medicines</li>
    </ul>

    <h2>Monsoon Photography Tips</h2>
    <ul>
      <li>Protect your camera with rain covers or plastic bags</li>
      <li>Use lens hood to prevent water drops on lens</li>
      <li>Carry microfiber cloths for cleaning</li>
      <li>Embrace moody, atmospheric shots</li>
      <li>Capture reflections in puddles</li>
      <li>Early morning mist creates magical scenes</li>
    </ul>',
    'https://images.unsplash.com/photo-1433863448220-78aaa064ff47?w=1200&h=800',
    'https://images.unsplash.com/photo-1433863448220-78aaa064ff47?w=600&h=400',
    admin_user_id, true, false, 'approved', NOW() - INTERVAL '8 days', 8,
    'Monsoon Travel South India - Complete Rainy Season Guide',
    'Experience South India during monsoon season: waterfalls, green landscapes, lower prices. Complete guide with tips, destinations, and what to pack.'
  ),

  (
    'Budget Travel South India: $30 Per Day Guide',
    'budget-travel-south-india-30-per-day',
    'Explore South India on a shoestring budget with our practical tips for accommodation, food, transport, and experiences.',
    '<h2>South India on a Budget</h2>
    <p>South India is one of the most budget-friendly destinations in the world. With careful planning, you can experience temples, beaches, hills, and local culture for around $30 (₹2,500) per day. Here''s how.</p>

    <h2>Budget Breakdown (per day)</h2>
    <ul>
      <li><strong>Accommodation:</strong> $8-12 (₹660-1,000)</li>
      <li><strong>Food:</strong> $6-8 (₹500-660)</li>
      <li><strong>Local Transport:</strong> $3-5 (₹250-415)</li>
      <li><strong>Attractions:</strong> $2-5 (₹165-415)</li>
      <li><strong>Miscellaneous:</strong> $3-5 (₹250-415)</li>
      <li><strong>Total:</strong> $22-35 (₹1,815-2,900) per day</li>
    </ul>

    <h2>Accommodation Options</h2>
    <h3>Budget Hotels & Guesthouses</h3>
    <p>Clean basic rooms with fan or AC available for ₹400-800 per night. Look for "lodges" or "budget hotels" near bus stands.</p>

    <h3>Hostels</h3>
    <p>Dorm beds cost ₹300-600 in major cities (Chennai, Bangalore, Kochi). Benefits include meeting fellow travelers and free Wi-Fi.</p>

    <h3>Homestays</h3>
    <p>In Kerala and Coorg, homestays offer great value (₹800-1,200) with home-cooked meals included.</p>

    <h3>Temple Accommodation</h3>
    <p>Many large temples offer basic accommodation for pilgrims at nominal rates (₹100-300). Rules apply: no alcohol, simple vegetarian food, early wake-up times.</p>

    <h2>Eating on a Budget</h2>
    <h3>Breakfast (₹50-100)</h3>
    <ul>
      <li>Idli-vada-sambar at local tiffin centers: ₹40-60</li>
      <li>Dosa varieties: ₹50-100</li>
      <li>Pongal: ₹40-70</li>
      <li>Filter coffee: ₹20-30</li>
    </ul>

    <h3>Lunch (₹100-150)</h3>
    <ul>
      <li>Unlimited "meals" on banana leaf: ₹100-150</li>
      <li>Vegetarian thali: ₹100-130</li>
      <li>Local restaurants (not tourist areas): ₹80-120</li>
    </ul>

    <h3>Dinner (₹100-200)</h3>
    <ul>
      <li>Similar to lunch options</li>
      <li>Street food (dosa, bhajji, vada pav): ₹30-80</li>
      <li>Biryani at local eateries: ₹120-180</li>
    </ul>

    <h3>Budget Food Tips</h3>
    <ul>
      <li>Eat where locals eat - follow crowds</li>
      <li>Avoid restaurants near tourist sites (2-3x more expensive)</li>
      <li>"Meals" (unlimited rice, curries, sambar) are best value</li>
      <li>Udupi restaurants offer quality vegetarian food cheaply</li>
      <li>Drink filter coffee instead of bottled water when possible</li>
    </ul>

    <h2>Transportation Savings</h2>
    <h3>Between Cities</h3>
    <ul>
      <li><strong>Government Buses:</strong> Cheapest option (₹1-2 per km)</li>
      <li><strong>Train (Sleeper Class):</strong> Comfortable and affordable</li>
      <li><strong>Night Buses/Trains:</strong> Save accommodation costs</li>
      <li><strong>Book in advance:</strong> For better seats and prices</li>
    </ul>

    <h3>Within Cities</h3>
    <ul>
      <li><strong>Local Buses:</strong> ₹10-30 per ride</li>
      <li><strong>Auto-rickshaws:</strong> Negotiate or use meter (₹50-150)</li>
      <li><strong>Shared Autos:</strong> Half the price of private</li>
      <li><strong>Walking:</strong> Free and great way to explore</li>
      <li><strong>Bicycle Rental:</strong> ₹50-100 per day in small towns</li>
    </ul>

    <h2>Free & Cheap Attractions</h2>
    <h3>Free Activities</h3>
    <ul>
      <li>Most temples are free entry</li>
      <li>Beaches (Marina, Kovalam, Varkala)</li>
      <li>Local markets and bazaars</li>
      <li>Sunset viewpoints</li>
      <li>Nature walks and village exploration</li>
    </ul>

    <h3>Low-Cost Activities</h3>
    <ul>
      <li>Museums: ₹50-100</li>
      <li>Palaces: ₹200-400</li>
      <li>National parks: ₹300-600</li>
      <li>Yoga classes: ₹200-500</li>
      <li>Cooking classes: ₹500-1,000</li>
    </ul>

    <h2>Money-Saving Tips</h2>
    <ol>
      <li><strong>Travel in shoulder season:</strong> Apr-May and Sep-Oct offer lower prices</li>
      <li><strong>Book directly:</strong> Avoid booking platform fees</li>
      <li><strong>Use government transport:</strong> Cheaper and reliable</li>
      <li><strong>Eat local foods:</strong> Banana leaf meals beat restaurant menus</li>
      <li><strong>Drink tap water:</strong> If filtered/boiled (carry reusable bottle)</li>
      <li><strong>Bargain:</strong> Especially for auto-rickshaws and shopping</li>
      <li><strong>Use free Wi-Fi:</strong> At cafes, restaurants, accommodation</li>
      <li><strong>Travel slow:</strong> Rushing increases costs</li>
      <li><strong>Avoid tourist traps:</strong> Walk 5-10 minutes from main sites for better prices</li>
      <li><strong>Join group tours:</strong> For expensive activities (safaris, boat trips)</li>
    </ol>

    <h2>Sample 7-Day Budget Itinerary</h2>
    <ul>
      <li><strong>Day 1-2:</strong> Chennai (temples, Marina Beach, local food) - ₹2,000</li>
      <li><strong>Day 3:</strong> Mahabalipuram (day trip) - ₹1,500</li>
      <li><strong>Day 4-5:</strong> Pondicherry (beaches, French Quarter) - ₹3,000</li>
      <li><strong>Day 6-7:</strong> Madurai (Meenakshi Temple, local markets) - ₹2,500</li>
      <li><strong>Total:</strong> ₹9,000 ($108) for 7 days</li>
    </ul>',
    'https://images.unsplash.com/photo-1553603227-2358aabe821e?w=1200&h=800',
    'https://images.unsplash.com/photo-1553603227-2358aabe821e?w=600&h=400',
    admin_user_id, true, true, 'approved', NOW() - INTERVAL '6 days', 10,
    'Budget Travel South India $30/Day - Complete Guide 2025',
    'Travel South India on $30 per day: budget accommodation, cheap food, free attractions. Complete backpacker guide with sample itinerary.'
  ),

  (
    'South India for Solo Female Travelers: Safety Guide',
    'south-india-solo-female-travelers-safety',
    'Practical safety tips and empowering advice for women traveling alone in South India, from an experienced female traveler.',
    '<h2>Solo Female Travel in South India</h2>
    <p>South India is generally safer for solo female travelers compared to many other regions in India. With common sense precautions and cultural awareness, women can explore this beautiful region confidently and safely.</p>

    <h2>General Safety Tips</h2>
    <h3>Clothing & Appearance</h3>
    <ul>
      <li>Dress modestly, especially in smaller towns and rural areas</li>
      <li>Cover shoulders and knees when visiting temples</li>
      <li>Lightweight, loose-fitting clothes work best (comfort + cultural respect)</li>
      <li>Carry a dupatta/scarf for conservative areas</li>
      <li>Western wear acceptable in metros and beach towns</li>
      <li>Remove shoes when entering homes and temples</li>
    </ul>

    <h3>Accommodation</h3>
    <ul>
      <li>Book verified accommodations with good reviews from solo female travelers</li>
      <li>Choose accommodations in well-lit, central areas</li>
      <li>Female-only hostels available in major cities</li>
      <li>Request ground floor rooms or near reception</li>
      <li>Use door locks and chains - verify they work</li>
      <li>Consider homestays with families for cultural immersion and safety</li>
    </ul>

    <h3>Transportation</h3>
    <ul>
      <li><strong>Trains:</strong> Book ladies'' compartments when available</li>
      <li><strong>Buses:</strong> Sit near other women or the driver</li>
      <li><strong>Auto-rickshaws:</strong> Use app-based services (Ola, Uber) when possible</li>
      <li><strong>Taxis:</strong> Share live location with friends/family</li>
      <li><strong>Night Travel:</strong> Avoid traveling alone after 10 PM if possible</li>
      <li><strong>Scooter Rental:</strong> Great for independence in places like Gokarna, Pondicherry</li>
    </ul>

    <h2>Safest Destinations for Solo Female Travelers</h2>
    <h3>Pondicherry</h3>
    <p>This former French colony has a laid-back vibe, beach cafes, and attracts many solo travelers. Very safe and walkable.</p>

    <h3>Kochi (Cochin)</h3>
    <p>Cosmopolitan city with progressive mindset, good tourism infrastructure, and friendly locals.</p>

    <h3>Mysore</h3>
    <p>Clean, organized city with royal heritage. Very tourist-friendly and safe.</p>

    <h3>Munnar</h3>
    <p>Peaceful hill station with homestays and tea plantations. Perfect for solo reflection.</p>

    <h3>Hampi</h3>
    <p>Large backpacker community, including many solo female travelers. Laid-back atmosphere.</p>

    <h2>Dealing with Attention</h2>
    <h3>Staring</h3>
    <p>Staring is common in India, especially in smaller towns where foreign women are rare. It''s usually curiosity, not threat. Ignore it, wear sunglasses, or politely ask to not be photographed without permission.</p>

    <h3>Unwanted Approaches</h3>
    <ul>
      <li>Be firm but polite when declining offers of help or company</li>
      <li>Avoid sharing personal details (hotel name, solo status) with strangers</li>
      <li>Use "my husband" or "my friends" to deflect unwanted attention</li>
      <li>Walk confidently even if lost</li>
      <li>Trust your instincts - if uncomfortable, leave</li>
    </ul>

    <h3>Selfie Requests</h3>
    <p>Common, especially in non-tourist areas. It''s okay to politely decline. If you agree, do so in public spaces with families present.</p>

    <h2>What to Pack</h2>
    <ul>
      <li><strong>Safety:</strong> Door wedge, whistle, photocopy of passport</li>
      <li><strong>Clothing:</strong> Modest clothes, long scarf/dupatta, comfortable walking shoes</li>
      <li><strong>Health:</strong> Feminine hygiene products, basic medicines, hand sanitizer</li>
      <li><strong>Tech:</strong> Power bank, phone with local SIM, offline maps</li>
      <li><strong>Documents:</strong> Copies of important documents stored separately</li>
    </ul>

    <h2>Health & Hygiene</h2>
    <h3>Feminine Hygiene</h3>
    <ul>
      <li>Carry your preferred sanitary products - not all brands available everywhere</li>
      <li>Menstrual cups are practical for areas with limited facilities</li>
      <li>Some temples don''t allow entry during menstruation (traditional belief)</li>
    </ul>

    <h3>Bathrooms</h3>
    <ul>
      <li>Public toilets vary in cleanliness - carry tissues and hand sanitizer</li>
      <li>Many places have squat toilets - learn the technique before you go</li>
      <li>Always carry toilet paper as it''s not always provided</li>
    </ul>

    <h2>Making Connections</h2>
    <ul>
      <li>Stay in hostels to meet fellow travelers</li>
      <li>Join group tours or activities (cooking classes, yoga)</li>
      <li>Use travel apps and forums to connect with others</li>
      <li>Female travel groups specific to India exist on social media</li>
      <li>Local women are often helpful - don''t hesitate to ask for directions</li>
    </ul>

    <h2>Cultural Considerations</h2>
    <ul>
      <li>Physical contact between men and women is uncommon in public</li>
      <li>Handshakes may be declined by traditional men - a namaste is universal</li>
      <li>Alcohol consumption by women is less socially accepted than for men</li>
      <li>Avoid visiting beach shacks or bars alone late at night</li>
      <li>In temples, follow the lead of local women</li>
    </ul>

    <h2>Emergency Contacts</h2>
    <ul>
      <li><strong>Emergency Number:</strong> 112 (works across India)</li>
      <li><strong>Women Helpline:</strong> 1091</li>
      <li><strong>Tourist Police:</strong> Available in major tourist destinations</li>
      <li><strong>Your Embassy:</strong> Save contact details</li>
    </ul>

    <h2>Empowerment Tips</h2>
    <ul>
      <li>Don''t let fear dominate - South India is welcoming to women travelers</li>
      <li>Many women travel solo here safely every day</li>
      <li>Trust your instincts and be assertive when needed</li>
      <li>Connect with local women for authentic cultural experiences</li>
      <li>Learn basic local phrases - locals appreciate the effort</li>
      <li>Embrace the adventure while staying street-smart</li>
    </ul>',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=800',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400',
    admin_user_id, true, false, 'approved', NOW() - INTERVAL '4 days', 11,
    'Solo Female Travel South India - Safety Guide & Tips',
    'Complete safety guide for women traveling alone in South India. Practical tips, safest destinations, cultural advice, and empowering experiences.'
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  excerpt = EXCLUDED.excerpt,
  updated_at = CURRENT_TIMESTAMP;

END $$;

-- Verify insertion
SELECT id, title, slug, is_published, is_featured
FROM blog_posts
ORDER BY created_at DESC
LIMIT 11;
