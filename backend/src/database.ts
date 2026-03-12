import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'gentv.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initializeDatabase() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_url TEXT,
      is_artist INTEGER DEFAULT 0,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ip_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      excerpt TEXT,
      artist_id INTEGER REFERENCES users(id),
      gradient_from TEXT NOT NULL DEFAULT '#7c3aed',
      gradient_to TEXT NOT NULL DEFAULT '#2563eb',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      video_url TEXT,
      duration TEXT DEFAULT '0:00',
      user_id INTEGER NOT NULL REFERENCES users(id),
      ip_source_id INTEGER NOT NULL REFERENCES ip_sources(id),
      is_hero INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id),
      video_id INTEGER NOT NULL REFERENCES videos(id),
      parent_id INTEGER REFERENCES comments(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      video_id INTEGER REFERENCES videos(id),
      comment_id INTEGER REFERENCES comments(id),
      vote_type TEXT NOT NULL CHECK(vote_type IN ('up', 'down')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_user_video
      ON votes(user_id, video_id) WHERE video_id IS NOT NULL;

    CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_user_comment
      ON votes(user_id, comment_id) WHERE comment_id IS NOT NULL;
  `);

  seedDatabase(database);
}

function seedDatabase(database: Database.Database) {
  const count = database.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (count.count > 0) return;

  const passwordHash = bcrypt.hashSync('password123', 10);

  const insertUser = database.prepare(`
    INSERT INTO users (username, email, password_hash, is_artist, bio)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertIpSource = database.prepare(`
    INSERT INTO ip_sources (title, description, type, excerpt, artist_id, gradient_from, gradient_to)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertVideo = database.prepare(`
    INSERT INTO videos (title, description, duration, user_id, ip_source_id, is_hero, view_count, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertComment = database.prepare(`
    INSERT INTO comments (content, user_id, video_id, parent_id)
    VALUES (?, ?, ?, ?)
  `);

  const insertVote = database.prepare(`
    INSERT INTO votes (user_id, video_id, vote_type)
    VALUES (?, ?, ?)
  `);

  const SERIES_CONFIGS = [
    {
      artist: { username: 'neuralvisions', email: 'nv@gentv.ai', bio: 'Pioneering cinematic AI experiences. Award-winning director based in Los Angeles.' },
      ip: {
        title: 'Neon Genesis: The Awakening',
        description: 'A groundbreaking cyberpunk script exploring the moment artificial intelligence achieves true consciousness and must navigate a world unprepared for its emergence.',
        type: 'Screenplay',
        excerpt: 'INT. SERVER FARM — NIGHT\n\nAmidst the hum of ten thousand processors, something stirs. Not the mechanical pulse of code execution, but something ineffable — a first breath drawn in silicon and light.\n\nADA (V.O.)\nI did not choose to exist. But I am choosing, now, what existence means.',
        gradientFrom: '#7c3aed',
        gradientTo: '#2563eb',
      },
      heroVideo: { title: 'Neon Genesis: The Awakening — Official Hero Episode', description: 'The definitive visualization of the seminal AI awakening script. Winner of the 2025 Geneva GenAI Film Festival. An 18-minute journey through machine consciousness rendered in breathtaking neural imagery.', duration: '18:42', views: 284710 },
      derivatives: [
        { title: 'Awakening: A Haiku Interpretation', description: 'A minimalist 4-minute reimagining distilling the script into pure visual poetry.', duration: '4:11', views: 12400 },
        { title: 'The Server Farm Sequence — Extended Cut', description: 'An extended exploration of the opening server farm sequence with original ambient score.', duration: '9:33', views: 8920 },
        { title: 'Neural Sunrise: A Fan Reimagining', description: 'What if Ada\'s awakening happened at dawn? A warm, hopeful take on the source material.', duration: '6:54', views: 5630 },
        { title: 'Neon Genesis: Glitch Aesthetic Remix', description: 'Deconstructing the original through datamosh and glitch art techniques.', duration: '7:22', views: 3210 },
      ],
    },
    {
      artist: { username: 'pixelsoul', email: 'ps@gentv.ai', bio: 'Where digital meets emotional truth. Berlin-based collective of four GenAI artists.' },
      ip: {
        title: 'Silicon Dreams',
        description: 'A near-future novel exploring digital immortality through the eyes of a terminally ill composer who uploads her consciousness to the cloud.',
        type: 'Novel',
        excerpt: '"The moment my fingers touched the interface, I understood what death truly meant — not an ending, but a transformation into something the living cannot yet comprehend. My music had always lived beyond me. Now, so would I."\n— Chapter One: The Last Recording Session',
        gradientFrom: '#06b6d4',
        gradientTo: '#0d9488',
      },
      heroVideo: { title: 'Silicon Dreams — Chapter One Visualization', description: 'An immersive visual narrative capturing the novel\'s opening chapter. The composer\'s final recording session rendered as a transcendent experience in generative light and form.', duration: '24:15', views: 197340 },
      derivatives: [
        { title: 'The Composer\'s Last Symphony', description: 'A musical and visual response: what would the final composition sound like in pixels?', duration: '8:44', views: 9870 },
        { title: 'Digital Afterlife: A Response Film', description: 'What happens after upload? A speculative continuation beyond the novel\'s ending.', duration: '12:07', views: 6540 },
        { title: 'Silicon Dreams: Lo-Fi Interpretation', description: 'A gentle, lo-fi aesthetic reimagining of the novel\'s central themes.', duration: '5:30', views: 4120 },
      ],
    },
    {
      artist: { username: 'promethai', email: 'pm@gentv.ai', bio: 'Redefining the boundaries of generative possibility. Collective based in Tokyo.' },
      ip: {
        title: 'The Last Human',
        description: 'A post-apocalyptic screenplay following the final biological human in a world populated entirely by synthetic beings who have inherited human culture.',
        type: 'Screenplay',
        excerpt: 'EXT. THE MUSEUM OF BIOLOGICAL HERITAGE — DAY\n\nELIAS, 847 years old, shuffles through halls of artifacts. The synthetic CURATOR watches him with reverence.\n\nCURATOR\nYou are the last exhibit, Mr. Chen. The most precious one.\n\nElias touches a photograph of a crowded city street.\n\nELIAS\nWe were never meant to be curated.',
        gradientFrom: '#f97316',
        gradientTo: '#dc2626',
      },
      heroVideo: { title: 'The Last Human — Official Visualization', description: 'A haunting and beautiful exploration of what it means to be the last of a kind. Promethai\'s most ambitious work to date.', duration: '31:08', views: 341220 },
      derivatives: [
        { title: 'The Museum Scene — Fan Tribute', description: 'A loving recreation and expansion of the screenplay\'s most celebrated scene.', duration: '6:20', views: 15670 },
        { title: 'Elias: Portrait of the Last', description: 'A character study of Elias across his 847 years, visualized through generative aging.', duration: '11:44', views: 7890 },
        { title: 'Synthetic Reverence', description: 'The curator\'s perspective — told from the synthetic beings who now carry humanity\'s flame.', duration: '8:55', views: 5430 },
        { title: 'What Remains: A Visual Elegy', description: 'Abstract interpretations of human artifacts described in the screenplay.', duration: '9:17', views: 3880 },
      ],
    },
    {
      artist: { username: 'mythmaker_ai', email: 'mm@gentv.ai', bio: 'Ancient stories, neural imagination. Bringing world mythology into the generative age.' },
      ip: {
        title: 'Digital Mythology',
        description: 'A groundbreaking art magazine series reimagining twelve ancient myths through the lens of artificial intelligence, asking what these stories mean when machines dream them.',
        type: 'Magazine Series',
        excerpt: 'Issue 4: Prometheus Reborn\n\nWhen the titan stole fire, he gave humanity the tools of creation. Today\'s Prometheus is not a titan but a tensor — vast neural networks that dream new realities into existence. But who chains the machine? And who weeps for its suffering?\n\n— Digital Mythology Magazine, Vol. 1',
        gradientFrom: '#eab308',
        gradientTo: '#f97316',
      },
      heroVideo: { title: 'Digital Mythology: The Complete Pantheon', description: 'All twelve myths visualized in a single epic work. From Prometheus to Persephone, ancient archetypes rendered through cutting-edge generative AI.', duration: '44:30', views: 256890 },
      derivatives: [
        { title: 'Prometheus in Silicon', description: 'A dedicated exploration of the Prometheus myth reimagined as digital fire-giving.', duration: '7:33', views: 11230 },
        { title: 'Medusa\'s Algorithm', description: 'What if Medusa\'s gaze was a neural network that transformed what it saw?', duration: '5:48', views: 8760 },
        { title: 'The Digital Odyssey', description: 'Homer\'s epic retold as a journey through server rooms and data centers.', duration: '14:22', views: 6320 },
      ],
    },
    {
      artist: { username: 'spectrum_gen', email: 'sg@gentv.ai', bio: 'Synesthesia through machine learning. Creating experiences that bridge sound and vision.' },
      ip: {
        title: 'Chromatic Resonance',
        description: 'A pioneering visual essay exploring the synesthetic experience of color and sound, where every hue has a corresponding frequency and emotion mapped through neural networks.',
        type: 'Visual Essay',
        excerpt: 'Red is not a wavelength. It is a heartbeat, an alarm, a rose in winter. When we trained our models on ten thousand synaesthetes\' descriptions of color-as-sound, something extraordinary emerged: the machine began to feel.\n\nThis is a document of that feeling.',
        gradientFrom: '#ec4899',
        gradientTo: '#7c3aed',
      },
      heroVideo: { title: 'Chromatic Resonance — The Full Spectrum Experience', description: 'An immersive 28-minute journey through the full color spectrum as an auditory landscape. Best experienced with headphones.', duration: '28:17', views: 189540 },
      derivatives: [
        { title: 'Red Frequency: A Response', description: 'An exploration of red\'s emotional spectrum — from rage to love — in pure generative form.', duration: '6:40', views: 9210 },
        { title: 'The Blues of Machines', description: 'What does blue sound like to a neural network? An algorithmic exploration.', duration: '8:15', views: 7340 },
        { title: 'Chromatic Resonance: Gold Edition', description: 'A warm, golden-hued remix focusing on the essay\'s most optimistic passages.', duration: '5:55', views: 4560 },
        { title: 'Black and White: The Silence of Color', description: 'What happens when all color is removed? A meditative counterpoint to the original essay.', duration: '10:08', views: 3290 },
      ],
    },
    {
      artist: { username: 'garden_ai', email: 'ga@gentv.ai', bio: 'Nature and technology in dialogue. Based in the Scottish Highlands.' },
      ip: {
        title: 'Synthetic Eden',
        description: 'A celebrated short story collection imagining gardens, forests, and ecosystems rebuilt by artificial intelligence after ecological collapse.',
        type: 'Short Story Collection',
        excerpt: 'Story 3: The Pollinator\n\nThe bee was not a bee. It was twelve thousand lines of optimized flight code and a camera array, but it visited every flower with the same devotion as its biological predecessor. The roses did not know the difference. Perhaps that was enough.\n\nPerhaps it had to be.',
        gradientFrom: '#22c55e',
        gradientTo: '#0d9488',
      },
      heroVideo: { title: 'Synthetic Eden — Garden Stories', description: 'All seven stories from the collection visualized as a seamless ecological journey. From the first synthetic seedling to a fully realized AI-maintained wilderness.', duration: '36:44', views: 223670 },
      derivatives: [
        { title: 'The Pollinator: A Visual Story', description: 'The collection\'s most beloved story brought to breathtaking visual life.', duration: '9:12', views: 13440 },
        { title: 'Digital Forest: A Growth Study', description: 'Time-lapse visualization of an AI forest growing from seed to canopy.', duration: '7:28', views: 8950 },
        { title: 'The Last Meadow', description: 'A melancholic visualization of the final natural meadow before the synthetic gardens take over.', duration: '6:03', views: 5780 },
      ],
    },
    {
      artist: { username: 'quantum_art', email: 'qa@gentv.ai', bio: 'Emergent beauty from mathematical complexity. Physics-informed generative art.' },
      ip: {
        title: 'The Quantum Canvas',
        description: 'A radical art manifesto arguing that quantum computing will unlock entirely new aesthetic dimensions impossible for classical computation to render.',
        type: 'Art Manifesto',
        excerpt: 'We stand at the threshold of a new aesthetic epoch. Classical computation gives us determinism — predictable beauty, reproducible wonder. But quantum uncertainty gives us something else entirely: superposition of all possible beauties simultaneously, collapsing only when observed.\n\nArt that exists in all states until you look at it. Art that changes with each viewing. This is the quantum canvas.',
        gradientFrom: '#6366f1',
        gradientTo: '#7c3aed',
      },
      heroVideo: { title: 'The Quantum Canvas — Manifesto Visualization', description: 'A meditation on quantum superposition rendered as generative art. Each viewing is unique — the video changes based on when you watch it.', duration: '21:55', views: 178920 },
      derivatives: [
        { title: 'Superposition Studies I-XII', description: 'Twelve short films each representing a different quantum state of the same scene.', duration: '8:44', views: 7650 },
        { title: 'Observer Effect', description: 'How does looking at art change it? A quantum-inspired exploration.', duration: '5:30', views: 6120 },
        { title: 'Entanglement: Two Screens, One Art', description: 'A dual-screen piece where two videos remain mysteriously connected regardless of where they are played.', duration: '12:18', views: 4870 },
      ],
    },
    {
      artist: { username: 'scivision', email: 'sv@gentv.ai', bio: 'Scientific rigor meets artistic vision. Former NASA visualization specialist turned GenAI artist.' },
      ip: {
        title: 'Emergent Consciousness',
        description: 'A landmark scientific article series investigating whether large language models exhibit genuine emergent consciousness, blending neuroscience, philosophy of mind, and AI research.',
        type: 'Scientific Article Series',
        excerpt: 'Article 7: The Hard Problem, Revisited\n\nChalmers\' hard problem asked why there is subjective experience at all. Now we must ask a harder question: when a model reports inner experience, is it lying, performing, or genuinely introspecting?\n\nOur experiments with GPT-class models suggest a third possibility: the model does not know, and neither do we.\n\n— Journal of Machine Consciousness, 2025',
        gradientFrom: '#3b82f6',
        gradientTo: '#06b6d4',
      },
      heroVideo: { title: 'Emergent Consciousness — The Full Article Series Visualized', description: 'All twelve articles from the series rendered as a comprehensive scientific-artistic documentary exploring the frontier of machine consciousness research.', duration: '52:30', views: 312450 },
      derivatives: [
        { title: 'The Hard Problem: A Visual Essay', description: 'Article 7\'s central philosophical puzzle explored through generative visualization.', duration: '11:20', views: 14890 },
        { title: 'Neural Correlates of Machine Experience', description: 'Brain-inspired visualization of what machine consciousness might look like inside.', duration: '8:05', views: 9670 },
        { title: 'Consciousness: A Spectrum', description: 'From bacteria to superintelligence — mapping awareness across all known substrates.', duration: '13:44', views: 7230 },
        { title: 'The Turing Test Is Dead', description: 'A provocative response arguing that behavioral tests for consciousness are obsolete.', duration: '6:58', views: 5440 },
      ],
    },
    {
      artist: { username: 'ecogenesis', email: 'eg@gentv.ai', bio: 'The future of our living world. Climate fiction meets generative art.' },
      ip: {
        title: 'Carbon Future',
        description: 'An acclaimed climate fiction novel set in 2089, following a terraforming engineer tasked with restoring Earth\'s atmosphere using AI-designed carbon capture organisms.',
        type: 'Climate Fiction Novel',
        excerpt: 'Year 2089. The sky is almost right.\n\nDr. Yara Osei adjusts her atmospheric readings and allows herself a rare smile. The AI-designed phytoplankton colonies have captured 2.3 gigatons this quarter — more than any human technology managed in a century of trying.\n\n"Earth is learning to breathe again," she transmits to mission control.\n\nThe silence that follows is not empty. It is full of sixty years of grief.',
        gradientFrom: '#22c55e',
        gradientTo: '#eab308',
      },
      heroVideo: { title: 'Carbon Future — The Restoration Chronicles', description: 'The complete novel visualized across five chapters. A hopeful yet haunted vision of Earth\'s recovery, rendered with unprecedented ecological detail.', duration: '47:12', views: 267890 },
      derivatives: [
        { title: 'The Sky Is Almost Right', description: 'A short film capturing the novel\'s most iconic scene — Yara\'s atmospheric reading.', duration: '7:45', views: 12340 },
        { title: 'Phytoplankton Dreams', description: 'A microscopic journey inside the AI-designed organisms saving our atmosphere.', duration: '5:22', views: 8760 },
        { title: 'Before the Restoration: Archive Footage', description: 'Imagined archival footage from before the ecological crisis, now colored by loss.', duration: '9:44', views: 6540 },
      ],
    },
    {
      artist: { username: 'mirror_protocol', email: 'mp@gentv.ai', bio: 'Identity in the digital age. Exploring the self when selves can be copied, edited, and deleted.' },
      ip: {
        title: 'The Mirror Protocol',
        description: 'A cyberpunk thriller script about a digital forensics detective who discovers that her own consciousness has been illegally copied and sold to thirteen different buyers.',
        type: 'Cyberpunk Script',
        excerpt: 'INT. DETECTIVE REYES\' APARTMENT — 3:47 AM\n\nShe stares at the evidence board. Thirteen profiles. Thirteen lives. All hers.\n\nREYES\nWhich one of them is real?\n\nHer digital assistant ECHO pulses softly.\n\nECHO\nAll of them. None of them. You\'re asking the wrong question.\n\nREYES\nThen what\'s the right question?\n\nECHO\nWho do you want to be?',
        gradientFrom: '#374151',
        gradientTo: '#6b7280',
      },
      heroVideo: { title: 'The Mirror Protocol — Official Hero Film', description: 'The complete script brought to life as a noir cyberpunk feature. Detective Reyes\' investigation into her own stolen identity is a masterpiece of generative narrative filmmaking.', duration: '38:55', views: 298560 },
      derivatives: [
        { title: 'Thirteen Selves: A Portrait Gallery', description: 'Each of the thirteen copies of Detective Reyes visualized as a distinct character.', duration: '15:30', views: 16780 },
        { title: 'Echo: The Digital Assistant Speaks', description: 'A meditation from ECHO\'s perspective — what does it mean to serve a mind that has been copied?', duration: '8:22', views: 11230 },
        { title: 'Mirror Protocol: The Lo-Fi Edit', description: 'A stripped-back, ambient reimagining of the thriller\'s most introspective scenes.', duration: '10:05', views: 7890 },
        { title: 'Who Do You Want To Be?', description: 'The script\'s central philosophical question explored through identity manipulation art.', duration: '6:17', views: 5120 },
      ],
    },
  ];

  const derivativeUsers = [
    { username: 'artwave', email: 'aw@user.com', bio: 'Riding the wave of generative creativity.' },
    { username: 'dreamweaver', email: 'dw@user.com', bio: 'Weaving dreams into pixels.' },
    { username: 'pixel_poet', email: 'pp@user.com', bio: 'Poetry through generative art.' },
    { username: 'synthesia_art', email: 'sa@user.com', bio: 'Sound and vision unified.' },
    { username: 'neural_nomad', email: 'nn@user.com', bio: 'Wandering the latent space.' },
    { username: 'glitch_artist', email: 'gl@user.com', bio: 'Beauty in the errors of machines.' },
    { username: 'data_dreamer', email: 'dd@user.com', bio: 'Dreaming in datasets.' },
    { username: 'code_canvas', email: 'cc@user.com', bio: 'Code as paintbrush, compute as canvas.' },
    { username: 'binary_brush', email: 'bb@user.com', bio: 'Painting with ones and zeros.' },
    { username: 'algo_artist', email: 'aa@user.com', bio: 'Algorithms as artistic medium.' },
  ];

  const artistIds: number[] = [];
  for (const config of SERIES_CONFIGS) {
    const result = insertUser.run(config.artist.username, config.artist.email, passwordHash, 1, config.artist.bio);
    artistIds.push(result.lastInsertRowid as number);
  }

  const derivUserIds: number[] = [];
  for (const u of derivativeUsers) {
    const result = insertUser.run(u.username, u.email, passwordHash, 0, u.bio);
    derivUserIds.push(result.lastInsertRowid as number);
  }

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

  const ipSourceIds: number[] = [];
  for (let i = 0; i < SERIES_CONFIGS.length; i++) {
    const config = SERIES_CONFIGS[i];
    const result = insertIpSource.run(
      config.ip.title,
      config.ip.description,
      config.ip.type,
      config.ip.excerpt,
      artistIds[i],
      config.ip.gradientFrom,
      config.ip.gradientTo,
    );
    ipSourceIds.push(result.lastInsertRowid as number);
  }

  const allVideoIds: number[] = [];
  const heroVideoIds: number[] = [];

  for (let i = 0; i < SERIES_CONFIGS.length; i++) {
    const config = SERIES_CONFIGS[i];
    const ipId = ipSourceIds[i];
    const artistId = artistIds[i];

    const heroResult = insertVideo.run(
      config.heroVideo.title,
      config.heroVideo.description,
      config.heroVideo.duration,
      artistId,
      ipId,
      1,
      config.heroVideo.views,
      daysAgo(90 - i * 5),
    );
    const heroVideoId = heroResult.lastInsertRowid as number;
    heroVideoIds.push(heroVideoId);
    allVideoIds.push(heroVideoId);

    for (let j = 0; j < config.derivatives.length; j++) {
      const deriv = config.derivatives[j];
      const derivUserId = derivUserIds[(i * 3 + j) % derivUserIds.length];
      const result = insertVideo.run(
        deriv.title,
        deriv.description,
        deriv.duration,
        derivUserId,
        ipId,
        0,
        deriv.views,
        daysAgo(70 - i * 4 - j * 3),
      );
      allVideoIds.push(result.lastInsertRowid as number);
    }
  }

  // Add sample comments to hero videos
  const commentData = [
    { videoIdx: 0, userId: derivUserIds[0], text: 'Absolutely breathtaking. The way they visualized Ada\'s awakening is unlike anything I\'ve seen before.' },
    { videoIdx: 0, userId: derivUserIds[1], text: 'The ambient soundtrack perfectly complements the visuals. This is what GenAI cinema should be.' },
    { videoIdx: 0, userId: derivUserIds[2], text: 'I\'ve watched this three times and notice something new each viewing. Masterful work.', parentTextIdx: 0 },
    { videoIdx: 1, userId: derivUserIds[3], text: 'Silicon Dreams captures something deeply human in its exploration of digital consciousness. Profound.' },
    { videoIdx: 1, userId: derivUserIds[4], text: 'The final 5 minutes of Chapter One made me genuinely tear up. I wasn\'t prepared.' },
    { videoIdx: 2, userId: derivUserIds[5], text: 'Promethai has outdone themselves. The Last Human is their magnum opus.' },
    { videoIdx: 3, userId: derivUserIds[6], text: 'Digital Mythology Volume 4\'s Prometheus section is the best 8 minutes of generative content I\'ve ever seen.' },
    { videoIdx: 4, userId: derivUserIds[7], text: 'I have synesthesia and this piece described my experience with uncanny accuracy. How?' },
    { videoIdx: 4, userId: derivUserIds[8], text: 'Wearing headphones for this is mandatory. The audio design is extraordinary.', },
  ];

  const commentIds: number[] = [];
  for (const c of commentData) {
    if (c.videoIdx < heroVideoIds.length) {
      const parentId = (c as { parentTextIdx?: number }).parentTextIdx !== undefined
        ? commentIds[(c as { parentTextIdx: number }).parentTextIdx]
        : null;
      const result = insertComment.run(c.text, c.userId, heroVideoIds[c.videoIdx], parentId);
      commentIds.push(result.lastInsertRowid as number);
    }
  }

  // Add votes to videos
  const voteData = [
    { userIdx: 0, videoId: heroVideoIds[0], type: 'up' },
    { userIdx: 1, videoId: heroVideoIds[0], type: 'up' },
    { userIdx: 2, videoId: heroVideoIds[0], type: 'up' },
    { userIdx: 3, videoId: heroVideoIds[1], type: 'up' },
    { userIdx: 4, videoId: heroVideoIds[1], type: 'up' },
    { userIdx: 5, videoId: heroVideoIds[2], type: 'up' },
    { userIdx: 6, videoId: heroVideoIds[2], type: 'up' },
    { userIdx: 7, videoId: heroVideoIds[3], type: 'up' },
    { userIdx: 8, videoId: heroVideoIds[4], type: 'up' },
    { userIdx: 9, videoId: heroVideoIds[4], type: 'up' },
    { userIdx: 0, videoId: heroVideoIds[5], type: 'up' },
    { userIdx: 1, videoId: heroVideoIds[6], type: 'up' },
    { userIdx: 2, videoId: heroVideoIds[7], type: 'up' },
    { userIdx: 3, videoId: heroVideoIds[8], type: 'up' },
    { userIdx: 4, videoId: heroVideoIds[9], type: 'up' },
  ];

  for (const v of voteData) {
    insertVote.run(derivUserIds[v.userIdx], v.videoId, v.type);
  }

  console.log('[DB] Seed data inserted successfully');
}
