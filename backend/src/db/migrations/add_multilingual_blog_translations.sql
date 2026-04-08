-- Migration: Add multilingual translations for blog posts
-- Languages: Spanish (es), Italian (it), Hindi (hi), Malay (ms), Chinese (zh)

-- ==========================================
-- SPANISH (es) TRANSLATIONS
-- ==========================================

-- Kerala Backwaters - Spanish
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT id, 'es',
'Descubriendo los Backwaters de Kerala: Guía Completa',
'<h2>Un Paraíso Acuático</h2>
<p>Los backwaters de Kerala son una red laberíntica de lagunas salobres, lagos y canales que se extienden a lo largo de la costa de Kerala. Esta maravilla natural única ofrece una experiencia de viaje incomparable.</p>

<h2>Cómo Explorar</h2>
<h3>Cruceros en House-boat</h3>
<p>La experiencia más popular de los backwaters es un crucero en house-boat tradicional llamado "Kettuvallam". Estos barcos ofrecen alojamiento confortable con habitaciones climatizadas, cubiertas de observación y cocina fresca a bordo.</p>

<h3>Excursiones en Canoa</h3>
<p>Para una experiencia más íntima, opte por una excursión en canoa tradicional a través de los canales estrechos. Esto le permite llegar a zonas inaccesibles para barcos más grandes.</p>

<h2>Mejor Época</h2>
<p>La mejor época para visitar es de noviembre a febrero cuando el clima es agradable y seco. Evite el monzón (junio-septiembre) ya que los niveles de agua pueden ser impredecibles.</p>

<h2>Destinos Populares</h2>
<h3>Alleppey (Alappuzha)</h3>
<p>Conocida como la "Venecia del Este", Alleppey es el punto de partida más popular para cruceros en house-boat.</p>

<h3>Kumarakom</h3>
<p>Este destino tranquilo en el lago Vembanad ofrece resorts de lujo y un santuario de aves.</p>',
'Explore los serenos backwaters de Kerala con nuestra guía completa sobre house-boats, cultura local y tesoros escondidos.'
FROM blog_posts WHERE slug = 'discovering-kerala-backwaters-complete-guide'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- Mysore Heritage - Spanish
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT id, 'es',
'Ruta del Patrimonio de Mysore: Palacios, Yoga y Saris de Seda',
'<h2>La Ciudad de los Palacios</h2>
<p>Mysore (Mysuru), la capital cultural de Karnataka, es famosa por su herencia real, magníficos palacios, sándalo, saris de seda y como cuna del yoga Ashtanga. La ciudad mantiene su encanto antiguo mientras abraza la modernidad.</p>

<h2>Atracciones Imprescindibles</h2>
<h3>Palacio de Mysore (Amba Vilas)</h3>
<p>La joya de Mysore, este palacio indo-sarraceno es uno de los monumentos más visitados de India. El palacio se ilumina con 97,000 bombillas cada domingo y durante festivales - un espectáculo impresionante.</p>

<h3>Colinas y Templo de Chamundi</h3>
<p>Suba los 1,000 escalones (o conduzca) hasta el Templo Chamundeshwari en la cima de las Colinas Chamundi. La cumbre ofrece vistas panorámicas de la ciudad.</p>

<h3>Jardines de Brindavan</h3>
<p>Ubicados a 21 km de Mysore, estos jardines en terrazas bajo la presa Krishnaraja Sagar presentan fuentes musicales, jardines iluminados y paseos en bote.</p>

<h2>Yoga Ashtanga</h2>
<p>Mysore es la cuna del Yoga Ashtanga Vinyasa. El Instituto K. Pattabhi Jois atrae practicantes de yoga de todo el mundo.</p>',
'Descubra la grandeza real de Mysore, hogar de magníficos palacios, yoga tradicional y seda mundialmente famosa.'
FROM blog_posts WHERE slug = 'mysore-heritage-trail-palaces-yoga-silk'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- Munnar - Spanish
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT id, 'es',
'Munnar: Viaje a Través de Jardines de Té y Colinas Brumosas',
'<h2>Paraíso de Plantaciones de Té</h2>
<p>Munnar, ubicada en los Ghats Occidentales de Kerala, es una de las estaciones de montaña más pintorescas de India. Conocida por sus vastas plantaciones de té, vida silvestre y paisajes impresionantes.</p>

<h2>Plantaciones de Té</h2>
<h3>Museo del Té KDHP</h3>
<p>Descubra la historia y el proceso de fabricación del té en este museo informativo. Las visitas guiadas lo llevan a través de plantaciones y fábricas de procesamiento.</p>

<h2>Fauna y Naturaleza</h2>
<h3>Parque Nacional Eravikulam</h3>
<p>Hábitat del raro Tahr de Nilgiri, este parque ofrece senderos de trekking a través de praderas de alta altitud y bosques de shola.</p>

<h3>Top Station</h3>
<p>El punto más alto de Munnar, ofreciendo vistas panorámicas del vecino Tamil Nadu.</p>

<h2>Mejor Época</h2>
<p>Septiembre a mayo es ideal. Los meses de monzón (junio-agosto) ofrecen exuberante verdor pero lluvias frecuentes.</p>',
'Experimente la belleza impresionante de Munnar, la estación de montaña más pintoresca de Kerala rodeada de plantaciones de té esmeralda.'
FROM blog_posts WHERE slug = 'munnar-journey-tea-gardens-misty-hills'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- Hampi - Spanish
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT id, 'es',
'Hampi: Caminando por un Sitio del Patrimonio Mundial de la UNESCO',
'<h2>Ruinas del Imperio Vijayanagara</h2>
<p>Hampi, antigua capital del poderoso Imperio Vijayanagara, es hoy un sitio del Patrimonio Mundial de la UNESCO salpicado de templos, palacios y pabellones impresionantes.</p>

<h2>Sitios Sagrados</h2>
<h3>Templo de Virupaksha</h3>
<p>Uno de los templos más antiguos en funcionamiento en India, dedicado al Señor Shiva. El gopuram de 50 metros domina el bazar principal de Hampi.</p>

<h3>Templo de Vittala</h3>
<p>Obra maestra arquitectónica con el famoso carro de piedra y pilares musicales que emiten notas musicales cuando se golpean.</p>

<h2>Centro Real</h2>
<h3>Lotus Mahal</h3>
<p>Pabellón elegante que combina estilos arquitectónicos hindú e islámico, usado por las damas reales.</p>

<h3>Establos de Elefantes</h3>
<p>Estructura impresionante con 11 cúpulas que albergaba los elefantes reales.</p>

<h2>Consejos Prácticos</h2>
<p>Alquile una bicicleta o scooter para explorar. Planifique 2-3 días para ver los principales sitios.</p>',
'Descubra las magníficas ruinas del Imperio Vijayanagara en Hampi, Karnataka - un paraíso para fotógrafos y amantes de la historia.'
FROM blog_posts WHERE slug = 'hampi-walking-through-unesco-world-heritage'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- Silk Spices - Spanish
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT id, 'es',
'Seda, Especias y Sándalo: Artesanías del Sur de India',
'<h2>Un Legado Artesanal</h2>
<p>Las tradiciones artesanales del Sur de India representan siglos de habilidad transmitida de generación en generación. Desde el tejido de seda intrincado hasta la talla aromática de sándalo.</p>

<h2>Tejido de Seda</h2>
<h3>Seda de Kanchipuram (Tamil Nadu)</h3>
<p>Considerados la reina de las sedas, los saris de Kanchipuram son conocidos por su durabilidad y rico trabajo de zari dorado. Cada sari requiere 10-20 días de tejido.</p>

<h3>Seda de Mysore (Karnataka)</h3>
<p>Conocida por su calidad de seda pura y textura fina. La Fábrica Gubernamental de Tejido de Seda en Mysore muestra todo el proceso de producción.</p>

<h2>Artesanías de Metal</h2>
<h3>Fundición de Bronce (Tamil Nadu)</h3>
<p>Swamimalai, cerca de Thanjavur, es famosa por la fabricación de ídolos de bronce usando la antigua técnica de cera perdida.</p>

<h2>Especias</h2>
<p>Kerala, el "País de las Especias", produce cardamomo, pimienta, canela y clavo. Visite las plantaciones de especias en Thekkady o Wayanad.</p>',
'Tradiciones artesanales centenarias del Sur de India - tejido de seda, talla de sándalo y comercio de especias.'
FROM blog_posts WHERE slug = 'silk-spices-sandalwood-crafts-south-india'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- ==========================================
-- ITALIAN (it) TRANSLATIONS
-- ==========================================

-- Kerala Backwaters - Italian
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT id, 'it',
'Scoprire i Backwaters del Kerala: Guida Completa',
'<h2>Un Paradiso Acquatico</h2>
<p>I backwaters del Kerala sono una rete labirintica di lagune salmastre, laghi e canali che si estendono lungo la costa del Kerala. Questa meraviglia naturale unica offre un''esperienza di viaggio incomparabile.</p>

<h2>Come Esplorare</h2>
<h3>Crociere in House-boat</h3>
<p>L''esperienza più popolare dei backwaters è una crociera in house-boat tradizionale chiamata "Kettuvallam". Queste barche offrono alloggio confortevole con camere climatizzate, ponti di osservazione e cucina fresca a bordo.</p>

<h3>Escursioni in Canoa</h3>
<p>Per un''esperienza più intima, optate per un''escursione in canoa tradizionale attraverso i canali stretti.</p>

<h2>Periodo Migliore</h2>
<p>Il periodo migliore per visitare è da novembre a febbraio quando il tempo è piacevole e secco.</p>

<h2>Destinazioni Popolari</h2>
<h3>Alleppey (Alappuzha)</h3>
<p>Conosciuta come la "Venezia dell''Est", Alleppey è il punto di partenza più popolare per le crociere in house-boat.</p>

<h3>Kumarakom</h3>
<p>Questa destinazione tranquilla sul lago Vembanad offre resort di lusso e un santuario degli uccelli.</p>',
'Esplorate i sereni backwaters del Kerala con la nostra guida completa su house-boat, cultura locale e tesori nascosti.'
FROM blog_posts WHERE slug = 'discovering-kerala-backwaters-complete-guide'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- Mysore - Italian
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT id, 'it',
'Itinerario del Patrimonio di Mysore: Palazzi, Yoga e Sari di Seta',
'<h2>La Città dei Palazzi</h2>
<p>Mysore (Mysuru), la capitale culturale del Karnataka, è rinomata per il suo patrimonio reale, magnifici palazzi, sandalo, sari di seta e come luogo di nascita dello yoga Ashtanga.</p>

<h2>Attrazioni Imperdibili</h2>
<h3>Palazzo di Mysore (Amba Vilas)</h3>
<p>Il gioiello di Mysore, questo palazzo indo-saraceno è uno dei monumenti più visitati dell''India. Il palazzo è illuminato da 97.000 lampadine ogni domenica e durante i festival.</p>

<h3>Colline e Tempio di Chamundi</h3>
<p>Salite i 1.000 gradini fino al Tempio di Chamundeshwari in cima alle Colline di Chamundi. La vetta offre viste panoramiche sulla città.</p>

<h3>Giardini di Brindavan</h3>
<p>Situati a 21 km da Mysore, questi giardini terrazzati sotto la diga Krishnaraja Sagar presentano fontane musicali e giardini illuminati.</p>

<h2>Yoga Ashtanga</h2>
<p>Mysore è il luogo di nascita dello Yoga Ashtanga Vinyasa. L''Istituto K. Pattabhi Jois attira praticanti di yoga da tutto il mondo.</p>',
'Scoprite la grandezza reale di Mysore, casa di magnifici palazzi, yoga tradizionale e seta famosa in tutto il mondo.'
FROM blog_posts WHERE slug = 'mysore-heritage-trail-palaces-yoga-silk'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- Munnar - Italian
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT id, 'it',
'Munnar: Viaggio Attraverso Giardini di Tè e Colline Nebbiose',
'<h2>Paradiso delle Piantagioni di Tè</h2>
<p>Munnar, situata nei Ghati Occidentali del Kerala, è una delle stazioni di montagna più pittoresche dell''India. Conosciuta per le sue vaste piantagioni di tè, fauna selvatica e paesaggi mozzafiato.</p>

<h2>Piantagioni di Tè</h2>
<h3>Museo del Tè KDHP</h3>
<p>Scoprite la storia e il processo di produzione del tè in questo museo informativo.</p>

<h2>Fauna e Natura</h2>
<h3>Parco Nazionale di Eravikulam</h3>
<p>Habitat del raro Tahr del Nilgiri, questo parco offre sentieri escursionistici attraverso praterie d''alta quota e foreste di shola.</p>

<h3>Top Station</h3>
<p>Il punto più alto di Munnar, che offre viste panoramiche sul vicino Tamil Nadu.</p>

<h2>Periodo Migliore</h2>
<p>Da settembre a maggio è ideale. I mesi del monsone (giugno-agosto) offrono verde lussureggiante ma piogge frequenti.</p>',
'Vivete la bellezza mozzafiato di Munnar, la stazione di montagna più pittoresca del Kerala circondata da piantagioni di tè smeraldo.'
FROM blog_posts WHERE slug = 'munnar-journey-tea-gardens-misty-hills'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- Hampi - Italian
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT id, 'it',
'Hampi: Passeggiando in un Sito Patrimonio dell''Umanità UNESCO',
'<h2>Rovine dell''Impero Vijayanagara</h2>
<p>Hampi, un tempo capitale del potente Impero Vijayanagara, è oggi un sito Patrimonio dell''Umanità UNESCO costellato di templi, palazzi e padiglioni mozzafiato.</p>

<h2>Siti Sacri</h2>
<h3>Tempio di Virupaksha</h3>
<p>Uno dei templi più antichi ancora in funzione in India, dedicato al Signore Shiva. Il gopuram di 50 metri domina il bazar principale di Hampi.</p>

<h3>Tempio di Vittala</h3>
<p>Capolavoro architettonico con il famoso carro di pietra e pilastri musicali che emettono note musicali quando percossi.</p>

<h2>Centro Reale</h2>
<h3>Lotus Mahal</h3>
<p>Elegante padiglione che combina stili architettonici indù e islamici.</p>

<h2>Consigli Pratici</h2>
<p>Noleggiate una bicicletta o uno scooter per esplorare. Pianificate 2-3 giorni per vedere i siti principali.</p>',
'Scoprite le magnifiche rovine dell''Impero Vijayanagara a Hampi, Karnataka - un paradiso per fotografi e appassionati di storia.'
FROM blog_posts WHERE slug = 'hampi-walking-through-unesco-world-heritage'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- Silk Spices - Italian
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT id, 'it',
'Seta, Spezie e Sandalo: Artigianato del Sud India',
'<h2>Un''Eredità Artigianale</h2>
<p>Le tradizioni artigianali del Sud India rappresentano secoli di abilità trasmessa di generazione in generazione. Dalla tessitura della seta intricata all''intaglio aromatico del sandalo.</p>

<h2>Tessitura della Seta</h2>
<h3>Seta di Kanchipuram (Tamil Nadu)</h3>
<p>Considerati la regina delle sete, i sari di Kanchipuram sono noti per la loro durabilità e il ricco lavoro di zari dorato.</p>

<h3>Seta di Mysore (Karnataka)</h3>
<p>Nota per la qualità della seta pura e la texture fine.</p>

<h2>Artigianato del Metallo</h2>
<h3>Fusione del Bronzo (Tamil Nadu)</h3>
<p>Swamimalai è famosa per la produzione di idoli in bronzo usando l''antica tecnica della cera persa.</p>

<h2>Spezie</h2>
<p>Il Kerala, il "Paese delle Spezie", produce cardamomo, pepe, cannella e chiodi di garofano.</p>',
'Tradizioni artigianali centenarie del Sud India - tessitura della seta, intaglio del sandalo e commercio delle spezie.'
FROM blog_posts WHERE slug = 'silk-spices-sandalwood-crafts-south-india'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- ==========================================
-- HINDI (hi) TRANSLATIONS
-- ==========================================

-- Kerala Backwaters - Hindi
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT id, 'hi',
'केरल बैकवाटर्स की खोज: संपूर्ण गाइड',
'<h2>एक जलीय स्वर्ग</h2>
<p>केरल के बैकवाटर्स खारे पानी की लैगून, झीलों और नहरों का एक भूलभुलैया नेटवर्क है जो केरल के तट के साथ फैला हुआ है। यह अनूठा प्राकृतिक आश्चर्य एक अतुलनीय यात्रा अनुभव प्रदान करता है।</p>

<h2>कैसे घूमें</h2>
<h3>हाउसबोट क्रूज</h3>
<p>बैकवाटर्स का सबसे लोकप्रिय अनुभव "केट्टुवल्लम" नामक पारंपरिक हाउसबोट में क्रूज है। ये नावें वातानुकूलित कमरों, अवलोकन डेक और बोर्ड पर ताजा भोजन के साथ आरामदायक आवास प्रदान करती हैं।</p>

<h3>कैनो भ्रमण</h3>
<p>अधिक अंतरंग अनुभव के लिए, संकीर्ण नहरों के माध्यम से पारंपरिक कैनो यात्रा का विकल्प चुनें।</p>

<h2>सबसे अच्छा समय</h2>
<p>यात्रा का सबसे अच्छा समय नवंबर से फरवरी है जब मौसम सुहावना और शुष्क होता है।</p>

<h2>लोकप्रिय स्थान</h2>
<h3>अलेप्पी (अलप्पुझा)</h3>
<p>"पूर्व का वेनिस" के रूप में जाना जाने वाला, अलेप्पी हाउसबोट क्रूज के लिए सबसे लोकप्रिय प्रारंभिक बिंदु है।</p>',
'हमारी व्यापक गाइड के साथ केरल के शांत बैकवाटर्स का अन्वेषण करें - हाउसबोट, स्थानीय संस्कृति और छिपे हुए खजाने।'
FROM blog_posts WHERE slug = 'discovering-kerala-backwaters-complete-guide'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- Mysore - Hindi
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT id, 'hi',
'मैसूर विरासत यात्रा: महल, योग और रेशम साड़ियां',
'<h2>महलों का शहर</h2>
<p>मैसूर (मैसूरु), कर्नाटक की सांस्कृतिक राजधानी, अपनी शाही विरासत, भव्य महलों, चंदन, रेशमी साड़ियों और अष्टांग योग के जन्मस्थान के रूप में प्रसिद्ध है।</p>

<h2>अवश्य देखें आकर्षण</h2>
<h3>मैसूर पैलेस (अंबा विलास)</h3>
<p>मैसूर का गहना, यह भारत-सरैसेनिक महल भारत के सबसे अधिक देखे जाने वाले स्मारकों में से एक है। महल हर रविवार और त्योहारों के दौरान 97,000 बल्बों से जगमगाता है।</p>

<h3>चामुंडी हिल्स और मंदिर</h3>
<p>चामुंडी हिल्स के शीर्ष पर चामुंडेश्वरी मंदिर तक 1,000 सीढ़ियां चढ़ें। शिखर शहर के मनोरम दृश्य प्रस्तुत करता है।</p>

<h2>अष्टांग योग</h2>
<p>मैसूर अष्टांग विन्यास योग का जन्मस्थान है। के. पट्टाभि जोइस संस्थान दुनिया भर से योग साधकों को आकर्षित करता है।</p>',
'मैसूर की शाही भव्यता की खोज करें - भव्य महल, पारंपरिक योग और विश्व प्रसिद्ध रेशम का घर।'
FROM blog_posts WHERE slug = 'mysore-heritage-trail-palaces-yoga-silk'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- Munnar - Hindi
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT id, 'hi',
'मुन्नार: चाय बागानों और धुंधली पहाड़ियों की यात्रा',
'<h2>चाय बागानों का स्वर्ग</h2>
<p>मुन्नार, केरल के पश्चिमी घाटों में स्थित, भारत के सबसे सुंदर हिल स्टेशनों में से एक है। अपने विशाल चाय बागानों, वन्यजीवों और लुभावने दृश्यों के लिए प्रसिद्ध।</p>

<h2>चाय बागान</h2>
<h3>KDHP चाय संग्रहालय</h3>
<p>इस जानकारीपूर्ण संग्रहालय में चाय का इतिहास और निर्माण प्रक्रिया जानें।</p>

<h2>वन्यजीव और प्रकृति</h2>
<h3>एराविकुलम राष्ट्रीय उद्यान</h3>
<p>दुर्लभ नीलगिरि ताहर का निवास, यह पार्क उच्च ऊंचाई वाले घास के मैदानों और शोला जंगलों के माध्यम से ट्रैकिंग पथ प्रदान करता है।</p>

<h2>सबसे अच्छा समय</h2>
<p>सितंबर से मई आदर्श है। मानसून के महीने हरियाली प्रदान करते हैं लेकिन बार-बार बारिश होती है।</p>',
'मुन्नार की लुभावनी सुंदरता का अनुभव करें - पन्ना चाय बागानों से घिरा केरल का सबसे सुंदर हिल स्टेशन।'
FROM blog_posts WHERE slug = 'munnar-journey-tea-gardens-misty-hills'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- Hampi - Hindi
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT id, 'hi',
'हम्पी: यूनेस्को विश्व धरोहर स्थल की सैर',
'<h2>विजयनगर साम्राज्य के खंडहर</h2>
<p>हम्पी, कभी शक्तिशाली विजयनगर साम्राज्य की राजधानी, आज मंदिरों, महलों और मंडपों से भरा यूनेस्को विश्व धरोहर स्थल है।</p>

<h2>पवित्र स्थल</h2>
<h3>विरुपाक्ष मंदिर</h3>
<p>भारत के सबसे पुराने कार्यरत मंदिरों में से एक, भगवान शिव को समर्पित। 50 मीटर का गोपुरम हम्पी के मुख्य बाजार पर हावी है।</p>

<h3>विट्ठल मंदिर</h3>
<p>प्रसिद्ध पत्थर के रथ और संगीतमय स्तंभों के साथ वास्तुकला की उत्कृष्ट कृति।</p>

<h2>शाही केंद्र</h2>
<h3>लोटस महल</h3>
<p>हिंदू और इस्लामी वास्तुकला शैलियों का संयोजन करने वाला सुरुचिपूर्ण मंडप।</p>

<h2>व्यावहारिक सुझाव</h2>
<p>घूमने के लिए साइकिल या स्कूटर किराए पर लें। मुख्य स्थलों को देखने के लिए 2-3 दिन की योजना बनाएं।</p>',
'हम्पी, कर्नाटक में विजयनगर साम्राज्य के भव्य खंडहरों की खोज करें - फोटोग्राफरों और इतिहास प्रेमियों के लिए स्वर्ग।'
FROM blog_posts WHERE slug = 'hampi-walking-through-unesco-world-heritage'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- Silk Spices - Hindi
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT id, 'hi',
'रेशम, मसाले और चंदन: दक्षिण भारत की शिल्पकला',
'<h2>शिल्प की विरासत</h2>
<p>दक्षिण भारत की शिल्प परंपराएं पीढ़ियों से चली आ रही सदियों पुरानी कुशलता का प्रतिनिधित्व करती हैं। जटिल रेशम बुनाई से लेकर सुगंधित चंदन की नक्काशी तक।</p>

<h2>रेशम बुनाई</h2>
<h3>कांचीपुरम रेशम (तमिलनाडु)</h3>
<p>रेशम की रानी मानी जाने वाली, कांचीपुरम साड़ियां अपनी टिकाऊपन और समृद्ध सुनहरे जरी काम के लिए जानी जाती हैं।</p>

<h3>मैसूर रेशम (कर्नाटक)</h3>
<p>शुद्ध रेशम की गुणवत्ता और महीन बनावट के लिए प्रसिद्ध।</p>

<h2>धातु शिल्प</h2>
<h3>कांस्य ढलाई (तमिलनाडु)</h3>
<p>स्वामीमलाई प्राचीन लॉस्ट-वैक्स तकनीक का उपयोग करके कांस्य मूर्तियां बनाने के लिए प्रसिद्ध है।</p>

<h2>मसाले</h2>
<p>केरल, "मसालों का देश", इलायची, काली मिर्च, दालचीनी और लौंग का उत्पादन करता है।</p>',
'दक्षिण भारत की सदियों पुरानी शिल्प परंपराएं - रेशम बुनाई, चंदन नक्काशी और मसाला व्यापार।'
FROM blog_posts WHERE slug = 'silk-spices-sandalwood-crafts-south-india'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- ==========================================
-- MALAY (ms) TRANSLATIONS
-- ==========================================

-- Kerala Backwaters - Malay
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT id, 'ms',
'Meneroka Backwaters Kerala: Panduan Lengkap',
'<h2>Syurga Air</h2>
<p>Backwaters Kerala adalah rangkaian lagun air payau, tasik dan terusan yang membentang sepanjang pantai Kerala. Keajaiban alam yang unik ini menawarkan pengalaman perjalanan yang tiada tandingan.</p>

<h2>Cara Meneroka</h2>
<h3>Pelayaran Houseboat</h3>
<p>Pengalaman backwaters yang paling popular adalah pelayaran dalam houseboat tradisional yang dipanggil "Kettuvallam". Bot-bot ini menawarkan penginapan selesa dengan bilik berhawa dingin, dek pemerhatian dan masakan segar di atas kapal.</p>

<h3>Lawatan Kanu</h3>
<p>Untuk pengalaman yang lebih intim, pilih lawatan kanu tradisional melalui terusan sempit.</p>

<h2>Masa Terbaik</h2>
<p>Masa terbaik untuk melawat adalah dari November hingga Februari apabila cuaca menyenangkan dan kering.</p>

<h2>Destinasi Popular</h2>
<h3>Alleppey (Alappuzha)</h3>
<p>Dikenali sebagai "Venice Timur", Alleppey adalah titik permulaan paling popular untuk pelayaran houseboat.</p>',
'Terokai backwaters Kerala yang tenang dengan panduan lengkap kami tentang houseboat, budaya tempatan dan khazanah tersembunyi.'
FROM blog_posts WHERE slug = 'discovering-kerala-backwaters-complete-guide'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- Mysore - Malay
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT id, 'ms',
'Laluan Warisan Mysore: Istana, Yoga & Sari Sutera',
'<h2>Bandar Istana</h2>
<p>Mysore (Mysuru), ibu kota budaya Karnataka, terkenal dengan warisan dirajanya, istana-istana megah, kayu cendana, sari sutera dan sebagai tempat kelahiran yoga Ashtanga.</p>

<h2>Tarikan Wajib Dilawati</h2>
<h3>Istana Mysore (Amba Vilas)</h3>
<p>Permata Mysore, istana Indo-Saracenic ini adalah salah satu monumen paling banyak dilawati di India. Istana ini diterangi dengan 97,000 mentol setiap Ahad dan semasa perayaan.</p>

<h3>Bukit dan Kuil Chamundi</h3>
<p>Daki 1,000 anak tangga ke Kuil Chamundeshwari di puncak Bukit Chamundi. Puncaknya menawarkan pemandangan panoramik bandar.</p>

<h2>Yoga Ashtanga</h2>
<p>Mysore adalah tempat kelahiran Yoga Ashtanga Vinyasa. Institut K. Pattabhi Jois menarik pengamal yoga dari seluruh dunia.</p>',
'Temui kemegahan diraja Mysore, rumah kepada istana-istana megah, yoga tradisional dan sutera terkenal dunia.'
FROM blog_posts WHERE slug = 'mysore-heritage-trail-palaces-yoga-silk'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- Munnar - Malay
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT id, 'ms',
'Munnar: Perjalanan Melalui Ladang Teh dan Bukit Berkabus',
'<h2>Syurga Ladang Teh</h2>
<p>Munnar, terletak di Western Ghats Kerala, adalah salah satu stesen bukit paling indah di India. Terkenal dengan ladang teh yang luas, hidupan liar dan pemandangan yang menakjubkan.</p>

<h2>Ladang Teh</h2>
<h3>Muzium Teh KDHP</h3>
<p>Temui sejarah dan proses pembuatan teh di muzium informatif ini.</p>

<h2>Hidupan Liar dan Alam</h2>
<h3>Taman Negara Eravikulam</h3>
<p>Habitat Tahr Nilgiri yang jarang ditemui, taman ini menawarkan laluan trekking melalui padang rumput tinggi dan hutan shola.</p>

<h2>Masa Terbaik</h2>
<p>September hingga Mei adalah ideal. Bulan-bulan monsun menawarkan kehijauan tetapi hujan kerap.</p>',
'Alami keindahan menakjubkan Munnar, stesen bukit paling indah Kerala yang dikelilingi ladang teh zamrud.'
FROM blog_posts WHERE slug = 'munnar-journey-tea-gardens-misty-hills'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- Hampi - Malay
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT id, 'ms',
'Hampi: Berjalan Melalui Tapak Warisan Dunia UNESCO',
'<h2>Runtuhan Empayar Vijayanagara</h2>
<p>Hampi, dahulunya ibu kota Empayar Vijayanagara yang berkuasa, kini adalah Tapak Warisan Dunia UNESCO yang dipenuhi kuil, istana dan pavilion yang menakjubkan.</p>

<h2>Tapak Suci</h2>
<h3>Kuil Virupaksha</h3>
<p>Salah satu kuil tertua yang masih beroperasi di India, didedikasikan kepada Lord Shiva. Gopuram setinggi 50 meter mendominasi bazar utama Hampi.</p>

<h3>Kuil Vittala</h3>
<p>Karya agung seni bina dengan kereta batu terkenal dan tiang muzikal yang menghasilkan nota muzikal apabila dipukul.</p>

<h2>Pusat Diraja</h2>
<h3>Lotus Mahal</h3>
<p>Pavilion elegan yang menggabungkan gaya seni bina Hindu dan Islam.</p>',
'Temui runtuhan megah Empayar Vijayanagara di Hampi, Karnataka - syurga untuk jurugambar dan pencinta sejarah.'
FROM blog_posts WHERE slug = 'hampi-walking-through-unesco-world-heritage'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- Silk Spices - Malay
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT id, 'ms',
'Sutera, Rempah & Kayu Cendana: Kraf India Selatan',
'<h2>Warisan Kraf</h2>
<p>Tradisi kraf India Selatan mewakili kemahiran berabad-abad yang diwarisi dari generasi ke generasi. Dari tenunan sutera yang rumit hingga ukiran kayu cendana yang harum.</p>

<h2>Tenunan Sutera</h2>
<h3>Sutera Kanchipuram (Tamil Nadu)</h3>
<p>Dianggap sebagai ratu sutera, sari Kanchipuram terkenal dengan ketahanan dan kerja zari emas yang kaya.</p>

<h3>Sutera Mysore (Karnataka)</h3>
<p>Terkenal dengan kualiti sutera tulen dan tekstur halus.</p>

<h2>Kraf Logam</h2>
<h3>Tuangan Gangsa (Tamil Nadu)</h3>
<p>Swamimalai terkenal dengan pembuatan patung gangsa menggunakan teknik lilin hilang kuno.</p>

<h2>Rempah</h2>
<p>Kerala, "Negeri Rempah", menghasilkan kapulaga, lada hitam, kayu manis dan cengkih.</p>',
'Tradisi kraf berabad-abad India Selatan - tenunan sutera, ukiran kayu cendana dan perdagangan rempah.'
FROM blog_posts WHERE slug = 'silk-spices-sandalwood-crafts-south-india'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- ==========================================
-- CHINESE (zh) TRANSLATIONS
-- ==========================================

-- Kerala Backwaters - Chinese
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT id, 'zh',
'探索喀拉拉邦回水区：完整指南',
'<h2>水上天堂</h2>
<p>喀拉拉邦的回水区是沿着喀拉拉邦海岸延伸的咸水泻湖、湖泊和运河组成的迷宫般的网络。这个独特的自然奇观提供了无与伦比的旅行体验。</p>

<h2>如何探索</h2>
<h3>船屋巡游</h3>
<p>回水区最受欢迎的体验是乘坐传统船屋"Kettuvallam"巡游。这些船提供舒适的住宿，配有空调房间、观景台和船上新鲜烹饪的美食。</p>

<h3>独木舟之旅</h3>
<p>如需更亲密的体验，可选择乘坐传统独木舟穿越狭窄的运河。</p>

<h2>最佳时间</h2>
<p>最佳游览时间是11月至2月，此时天气宜人干燥。</p>

<h2>热门目的地</h2>
<h3>阿勒皮（Alappuzha）</h3>
<p>被称为"东方威尼斯"，阿勒皮是船屋巡游最受欢迎的出发点。</p>

<h3>库玛拉孔</h3>
<p>这个位于维姆巴纳德湖畔的宁静目的地提供豪华度假村和鸟类保护区。</p>',
'通过我们关于船屋、当地文化和隐藏宝藏的完整指南，探索喀拉拉邦宁静的回水区。'
FROM blog_posts WHERE slug = 'discovering-kerala-backwaters-complete-guide'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- Mysore - Chinese
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT id, 'zh',
'迈索尔遗产之旅：宫殿、瑜伽和丝绸纱丽',
'<h2>宫殿之城</h2>
<p>迈索尔（Mysuru）是卡纳塔克邦的文化之都，以其皇家遗产、宏伟的宫殿、檀香木、丝绸纱丽以及作为阿斯汤加瑜伽的发源地而闻名。</p>

<h2>必游景点</h2>
<h3>迈索尔宫殿（Amba Vilas）</h3>
<p>迈索尔的明珠，这座印度-撒拉逊式宫殿是印度访问量最大的纪念碑之一。宫殿每周日和节日期间用97,000个灯泡照明——令人叹为观止的景象。</p>

<h3>查蒙迪山和寺庙</h3>
<p>攀登1000级台阶到达查蒙迪山顶的查蒙德什瓦里寺庙。山顶提供城市全景。</p>

<h2>阿斯汤加瑜伽</h2>
<p>迈索尔是阿斯汤加维尼亚萨瑜伽的发源地。K. Pattabhi Jois研究所吸引了来自世界各地的瑜伽练习者。</p>',
'发现迈索尔的皇家辉煌——宏伟宫殿、传统瑜伽和世界著名丝绸的家园。'
FROM blog_posts WHERE slug = 'mysore-heritage-trail-palaces-yoga-silk'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- Munnar - Chinese
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT id, 'zh',
'蒙纳尔：穿越茶园和云雾山丘的旅程',
'<h2>茶园天堂</h2>
<p>蒙纳尔位于喀拉拉邦的西高止山脉，是印度最风景如画的山站之一。以其广阔的茶园、野生动物和令人惊叹的风景而闻名。</p>

<h2>茶园</h2>
<h3>KDHP茶博物馆</h3>
<p>在这个信息丰富的博物馆了解茶的历史和制作过程。</p>

<h2>野生动物和自然</h2>
<h3>埃拉维库拉姆国家公园</h3>
<p>稀有尼尔吉里塔尔羊的栖息地，这个公园提供穿越高海拔草地和shola森林的徒步小径。</p>

<h3>顶站</h3>
<p>蒙纳尔的最高点，提供邻近泰米尔纳德邦的全景。</p>

<h2>最佳时间</h2>
<p>9月至5月是理想时间。季风月份提供茂盛的绿色植被但经常下雨。</p>',
'体验蒙纳尔令人惊叹的美景——喀拉拉邦最风景如画的山站，被翠绿茶园环绕。'
FROM blog_posts WHERE slug = 'munnar-journey-tea-gardens-misty-hills'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- Hampi - Chinese
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT id, 'zh',
'亨比：漫步联合国教科文组织世界遗产',
'<h2>维查耶纳加尔帝国遗址</h2>
<p>亨比曾是强大的维查耶纳加尔帝国的首都，现在是联合国教科文组织世界遗产，散布着令人惊叹的寺庙、宫殿和亭阁。</p>

<h2>神圣遗址</h2>
<h3>维鲁帕克沙寺</h3>
<p>印度最古老的仍在运营的寺庙之一，供奉湿婆神。50米高的gopuram主导着亨比的主要集市。</p>

<h3>维塔拉寺</h3>
<p>建筑杰作，拥有著名的石车和敲击时会发出音乐音符的音乐柱。</p>

<h2>皇家中心</h2>
<h3>莲花宫</h3>
<p>融合印度教和伊斯兰建筑风格的优雅亭阁。</p>

<h2>实用建议</h2>
<p>租一辆自行车或摩托车探索。计划2-3天参观主要景点。</p>',
'发现卡纳塔克邦亨比维查耶纳加尔帝国的宏伟遗址——摄影师和历史爱好者的天堂。'
FROM blog_posts WHERE slug = 'hampi-walking-through-unesco-world-heritage'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- Silk Spices - Chinese
INSERT INTO blog_post_translations (blog_post_id, language, title, content, excerpt)
SELECT id, 'zh',
'丝绸、香料和檀香：南印度的工艺',
'<h2>工艺传承</h2>
<p>南印度的工艺传统代表了几个世纪以来代代相传的技艺。从精致的丝绸编织到芳香的檀香雕刻。</p>

<h2>丝绸编织</h2>
<h3>坎奇普拉姆丝绸（泰米尔纳德邦）</h3>
<p>被认为是丝绸之后，坎奇普拉姆纱丽以其耐用性和丰富的金色zari工艺而闻名。每条纱丽需要10-20天编织。</p>

<h3>迈索尔丝绸（卡纳塔克邦）</h3>
<p>以纯丝质量和精细质地著称。</p>

<h2>金属工艺</h2>
<h3>青铜铸造（泰米尔纳德邦）</h3>
<p>斯瓦米马莱以使用古老的失蜡技术制作青铜神像而闻名。</p>

<h2>香料</h2>
<p>喀拉拉邦，"香料之国"，生产小豆蔻、胡椒、肉桂和丁香。</p>',
'南印度数百年的工艺传统——丝绸编织、檀香雕刻和香料贸易。'
FROM blog_posts WHERE slug = 'silk-spices-sandalwood-crafts-south-india'
ON CONFLICT (blog_post_id, language) DO NOTHING;

-- Verify all translations
SELECT
    language,
    COUNT(*) as count
FROM blog_post_translations
GROUP BY language
ORDER BY language;
