export const CLI_URL = 'http://localhost:3001';

export const MOCK_CATALOG = {
  retail_clothing: [
    { id: 'c1', name: 'Camiseta Oversize Algodón', price: 59900, emoji: '👕' },
    { id: 'c2', name: 'Jeans Slim Fit Denim', price: 120000, emoji: '👖' },
    { id: 'c3', name: 'Chaqueta Impermeable Acolchada', price: 180000, emoji: '🧥' }
  ],
  technical_services: [
    { id: 't1', name: 'Mecanizado de Eje Rotatorio', price: 350000, emoji: '⚙️' },
    { id: 't2', name: 'Fabricación de Buje de Bronce', price: 85000, emoji: '🔩' },
    { id: 't3', name: 'Rectificación de Volante de Motor', price: 120000, emoji: '🚗' }
  ],
  refrigeration_ac: [
    { id: 'r1', name: 'Mantenimiento Preventivo Split', price: 95000, emoji: '❄️' },
    { id: 'r2', name: 'Instalación de Aire Acondicionado', price: 320000, emoji: '🌬️' },
    { id: 'r3', name: 'Recarga de Gas Refrigerante R410a', price: 140000, emoji: '🧪' }
  ],
  contractors: [
    { id: 'ct1', name: 'Instalación Drywall (m2)', price: 45000, emoji: '📐' },
    { id: 'ct2', name: 'Pintura de Fachada Exterior', price: 280000, emoji: '🎨' },
    { id: 'ct3', name: 'Enchape Cerámico Baño/Cocina', price: 60000, emoji: '🧱' }
  ],
  machinery_rental: [
    { id: 'm1', name: 'Alquiler Mini-Excavadora (Día)', price: 450000, emoji: '🚜' },
    { id: 'm2', name: 'Alquiler Planta Eléctrica 5kW', price: 150000, emoji: '⚡' },
    { id: 'm3', name: 'Alquiler Mezcladora Concreto', price: 80000, emoji: '🌀' }
  ],
  carpentry: [
    { id: 'cp1', name: 'Fabricación de Closet (m2)', price: 250000, emoji: '🪚' },
    { id: 'cp2', name: 'Restauración de Puerta Madera', price: 110000, emoji: '🚪' },
    { id: 'cp3', name: 'Mesa de Centro Madera Maciza', price: 190000, emoji: '🪵' }
  ],
  laundry: [
    { id: 'l1', name: 'Lavado/Secado Edredón Plumas', price: 28000, emoji: '🧺' },
    { id: 'l2', name: 'Lavado/Aplanchado Traje Formal', price: 22000, emoji: '👔' },
    { id: 'l3', name: 'Tintura de Prenda Algodón', price: 18000, emoji: '🎨' }
  ],
  furniture_repair: [
    { id: 'f1', name: 'Tapizado de Sofá 3 Puestos', price: 680000, emoji: '🛋️' },
    { id: 'f2', name: 'Restauración Barniz Silla', price: 75000, emoji: '🪑' },
    { id: 'f3', name: 'Reparación Rieles de Cajonera', price: 45000, emoji: '🔧' }
  ],
  wellness_podology: [
    { id: 'w1', name: 'Perfilaxis Podológica Completa', price: 90000, emoji: '🦶' },
    { id: 'w2', name: 'Tratamiento Onicomicosis (Láser)', price: 120000, emoji: '🔦' },
    { id: 'w3', name: 'Masaje Relajante Espalda/Cuello', price: 75000, emoji: '💆' }
  ],
  grocery_food: [
    { id: 'g1', name: 'Canasta de Verduras Orgánicas', price: 35000, emoji: '🍎' },
    { id: 'g2', name: 'Café Tostado Especial (500g)', price: 24000, emoji: '☕' },
    { id: 'g3', name: 'Aceite de Oliva Extra Virgen', price: 42000, emoji: '🫒' }
  ]
};

export const AVAILABLE_FONTS = [
  // Sans-Serif
  { value: 'Inter', desc: 'Sans-serif funcional y altamente legible a cualquier tamaño.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Poppins', desc: 'Redondeada premium, excelente para interfaces amigables.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Roboto', desc: 'Clásica, limpia, geométrica y balanceada.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Montserrat', desc: 'Geométrica moderna, ideal para títulos impactantes.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Outfit', desc: 'Moderna, estilizada y con personalidad geométrica.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Plus Jakarta Sans', desc: 'Limpia, elegante y de estilo de negocio moderno.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Manrope', desc: 'Grotesque contemporánea de proporciones balanceadas.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'DM Sans', desc: 'Limpia, neutra y de baja distracción visual.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Open Sans', desc: 'Altamente legible, neutral y de gran versatilidad.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Lato', desc: 'Cálida, legible y muy popular en sitios web modernos.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Nunito', desc: 'Suave, con esquinas redondeadas y tono cercano.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Rubik', desc: 'Formas redondeadas sutiles y gran legibilidad en pantallas.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Work Sans', desc: 'Optimizada para pantallas de alta resolución.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Urbanist', desc: 'Estilo sans-serif geométrico elegante y sofisticado.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Lexend', desc: 'Diseñada específicamente para mejorar la velocidad de lectura.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Sora', desc: 'Bordes afilados y aspecto tech, ideal para interfaces modernas.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Cabin', desc: 'Neo-grotesque amigable con curvas suaves humanistas.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Quicksand', desc: 'Geometría puramente redondeada, juguetona y muy legible.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Fira Sans', desc: 'Diseño abierto y orgánico creado por Mozilla.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Kanit', desc: 'Formal, moderna y con gran variedad de pesos tipográficos.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Ubuntu', desc: 'Personalidad única con curvas fluidas e identidad tecnológica.', cat: 'sans-serif', label: 'Sans-Serif' },

  // Serif
  { value: 'Playfair Display', desc: 'Serif elegante con alto contraste de trazos y mucha clase.', cat: 'serif', label: 'Serif' },
  { value: 'Lora', desc: 'Serif contemporánea con pinceladas suaves y tradicionales.', cat: 'serif', label: 'Serif' },
  { value: 'Merriweather', desc: 'Diseñada específicamente para lectura cómoda en pantallas.', cat: 'serif', label: 'Serif' },
  { value: 'PT Serif', desc: 'Estilo clásico con proporciones amplias y excelente legibilidad.', cat: 'serif', label: 'Serif' },
  { value: 'EB Garamond', desc: 'Clásica renacentista, elegante, sofisticada y tradicional.', cat: 'serif', label: 'Serif' },
  { value: 'Cinzel', desc: 'Basada en inscripciones romanas clásicas, ideal para lujo.', cat: 'serif', label: 'Serif' },
  { value: 'Cormorant Garamond', desc: 'Trazo fino de alto impacto editorial y gran distinción.', cat: 'serif', label: 'Serif' },
  { value: 'Arvo', desc: 'Slab-serif geométrica robusta y de gran presencia visual.', cat: 'serif', label: 'Serif' },
  { value: 'Libre Baskerville', desc: 'Clásica optimizada para bloques largos de texto.', cat: 'serif', label: 'Serif' },
  { value: 'Domine', desc: 'Serif amigable diseñada para editoriales web.', cat: 'serif', label: 'Serif' },
  { value: 'DM Serif Display', desc: 'Contraste dramático y sofisticado para grandes titulares.', cat: 'serif', label: 'Serif' },
  { value: 'Cardo', desc: 'Estilo de manuscrito medieval, clásica y distinguida.', cat: 'serif', label: 'Serif' },

  // Display
  { value: 'Space Grotesk', desc: 'Brutalista y futurista, con caracteres de gran impacto.', cat: 'display', label: 'Display' },
  { value: 'Syne', desc: 'Artística, expresiva y diseñada para marcas de moda o creativas.', cat: 'display', label: 'Display' },
  { value: 'Righteous', desc: 'Inspiración Art Deco con formas geométricas singulares.', cat: 'display', label: 'Display' },
  { value: 'Syncopate', desc: 'Ancha, moderna y de proporciones muy extendidas para logos.', cat: 'display', label: 'Display' },
  { value: 'Cabinet Grotesk', desc: 'Formas contrastadas que llaman fuertemente la atención.', cat: 'display', label: 'Display' },
  { value: 'Unbounded', desc: 'Ancha, brutalista y de estilo cyber-tecnológico.', cat: 'display', label: 'Display' },
  { value: 'Archivo Black', desc: 'Ultra-gruesa, idónea para títulos de gran tamaño e impacto.', cat: 'display', label: 'Display' },
  { value: 'Oswald', desc: 'Estilo condensado de gran altura para encabezados firmes.', cat: 'display', label: 'Display' },
  { value: 'Anton', desc: 'Diseño ultra-bold de gran masa visual y estilo póster.', cat: 'display', label: 'Display' },
  { value: 'Abril Fatface', desc: 'Serif Display de alto impacto con curvas gruesas y elegantes.', cat: 'display', label: 'Display' },
  { value: 'Lobster', desc: 'Cursiva gruesa y alegre con estilo retro americano.', cat: 'display', label: 'Display' },
  { value: 'Bungee', desc: 'Estilo urbano monolítico inspirado en carteles callejeros.', cat: 'display', label: 'Display' },
  { value: 'Fredoka', desc: 'Diseño amigable de puntas redondeadas e impacto blando.', cat: 'display', label: 'Display' },

  // Monospace
  { value: 'Space Mono', desc: 'Monospaciada tech con tintes retro y brutalistas.', cat: 'monospace', label: 'Monospace' },
  { value: 'Fira Code', desc: 'Diseñada para desarrollo con ligaduras de programación.', cat: 'monospace', label: 'Monospace' },
  { value: 'JetBrains Mono', desc: 'Optimizada para máxima claridad de código y lectura técnica.', cat: 'monospace', label: 'Monospace' },
  { value: 'Source Code Pro', desc: 'Monospaciada limpia y neutral de Adobe.', cat: 'monospace', label: 'Monospace' },
  { value: 'IBM Plex Mono', desc: 'Basada en la ingeniería clásica de IBM.', cat: 'monospace', label: 'Monospace' },
  { value: 'Inconsolata', desc: 'Sublime tipografía mono muy cercana al clásico Consolas.', cat: 'monospace', label: 'Monospace' },
  { value: 'Courier Prime', desc: 'Remasterización del estilo de máquina de escribir clásica.', cat: 'monospace', label: 'Monospace' },
  { value: 'Ubuntu Mono', desc: 'Variante mono de Ubuntu con formas de curvas suaves.', cat: 'monospace', label: 'Monospace' },
  { value: 'DM Mono', desc: 'Estilo minimalista condensado para terminales limpios.', cat: 'monospace', label: 'Monospace' },
  { value: 'Anonymous Pro', desc: 'Diseñada para programadores, con caracteres muy legibles.', cat: 'monospace', label: 'Monospace' },

  // Handwriting/Script
  { value: 'Great Vibes', desc: 'Caligrafía cursiva clásica con trazos largos y elegantes.', cat: 'handwriting', label: 'Script' },
  { value: 'Caveat', desc: 'Tipografía de escritura a mano fluida y muy natural.', cat: 'handwriting', label: 'Script' },
  { value: 'Pacifico', desc: 'Cursiva retro inspirada en la cultura surf norteamericana.', cat: 'handwriting', label: 'Script' },
  { value: 'Dancing Script', desc: 'Cursiva informal y dinámica con trazos orgánicos.', cat: 'handwriting', label: 'Script' },
  { value: 'Sacramento', desc: 'Línea fina y trazos continuos, elegante y sofisticada.', cat: 'handwriting', label: 'Script' },
  { value: 'Satisfy', desc: 'Brush script contemporánea de curvas fluidas e informales.', cat: 'handwriting', label: 'Script' },
  { value: 'Yellowtail', desc: 'Pincelada plana con toques vintage muy amigables.', cat: 'handwriting', label: 'Script' },
  { value: 'Alex Brush', desc: 'Caligrafía fluida con trazos elegantes de altura corta.', cat: 'handwriting', label: 'Script' },
  { value: 'Allura', desc: 'Estilo manuscrito de trazos finos y sumamente aireados.', cat: 'handwriting', label: 'Script' },
  { value: 'Pinyon Script', desc: 'Cursiva ultra-inclinada aristocrática y de gran lujo.', cat: 'handwriting', label: 'Script' }
];
