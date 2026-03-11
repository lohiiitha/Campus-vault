'use client'
import { useState, useEffect, useMemo } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// IN-MEMORY IMAGE CACHE
// Persists across component re-mounts within the same browser session.
// Key: chosen URL → value: 'loaded' | 'error'
// Prevents re-fetching images that have already loaded successfully.
// ─────────────────────────────────────────────────────────────────────────────
const imageStatusCache = new Map<string, 'loaded' | 'error'>()

// Preload queue — images added here get an Image() fetch in the background
function preloadImage(url: string) {
  if (typeof window === 'undefined') return
  if (imageStatusCache.has(url)) return
  const img = new window.Image()
  img.onload  = () => imageStatusCache.set(url, 'loaded')
  img.onerror = () => imageStatusCache.set(url, 'error')
  img.src = url
}

// ─────────────────────────────────────────────────────────────────────────────
// PHOTO DATABASE
// All URLs are permanent images.unsplash.com CDN links (never expire).
// ─────────────────────────────────────────────────────────────────────────────

const u = (id: string, w = 600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=82&fit=crop&auto=format`

// ── Category fallback pools ──────────────────────────────────────────────────
const PHOTO_POOLS: Record<string, string[]> = {
  Textbooks: [
    u('1544716278-ca5e3f4abd8c'),
    u('1524995997946-a1c2e315a42f'),
    u('1497633762265-9d179a990aa6'),
    u('1532012197267-da84d127e765'),
    u('1481627834876-b7833e8f5570'),
    u('1456513080510-7bf3a84b82f8'),
    u('1506880018603-83d5b814b5a6'),
    u('1589829085413-56de8ae18c73'),
    u('1491841573634-28140fc7ced7'),
    u('1519682577032-1e9ea5f9c88a'),
  ],
  Electronics: [
    u('1496181133206-80ce9b88a853'),
    u('1517336714731-489689fd1ca8'),
    u('1583394838336-acd977736f90'),
    u('1546435770-a3e426bf472b'),
    u('1593640408182-31c228b2fd28'),
    u('1525547719571-a2d4ac8945e2'),
    u('1498049794561-7780e7231661'),
    u('1588872657578-7efd1f1555ed'),
    u('1527443224154-c4a3942d3acf'),
  ],
  'Hostel Essentials': [
    u('1555041469-a586c61ea9bc'),
    u('1586023492125-27b2c045efd7'),
    u('1505693314120-0d443867891c'),
    u('1540518614846-7eded433c457'),
    u('1493663284031-b7e3aefcae8e'),
    u('1567016432779-094069958ea5'),
    u('1484154218962-a197022b5858'),
    u('1574323347407-f5e1ad6d020b'),
    u('1631049307264-da0ec9d70304'),
    u('1513506003901-1e6a35746c5d'),
  ],
  Clothing: [
    u('1523381210434-271e8be1f52b'),
    u('1489987707025-afc232f7ea0f'),
    u('1542291026-7eec264c27ff'),
    u('1551488831-00ddcb6c6bd3'),
    u('1434389677669-e08b4cac3105'),
    u('1556905055-8f358a7a47b2'),
    u('1503341504253-dff4815485f1'),
    u('1560243563-062bfc001d68'),
    u('1542574621-e088a4464f7e'),
  ],
  Sports: [
    u('1517649763962-0c623066013b'),
    u('1579952363873-27f3bade9f55'),
    u('1593786973178-e4fdfd4e9b21'),
    u('1530549387789-4c1017266635'),
    u('1571019614242-c5c5dee9f50b'),
    u('1434682966165-cb44a87cac2a'),
    u('1587280501635-68a0e82cd5ff'),
    u('1531415074968-036ba1b575da'),
    u('1626224583764-f87db24ac4ea'),
    u('1534438327276-14e5300c3a48'),
  ],
  Stationery: [
    u('1497032628192-86f99bcd76bc'),
    u('1583485088034-697b5bc54ccd'),
    u('1471107340929-a87cd0f5b5f3'),
    u('1456735190827-d1262f71b8a3'),
    u('1434030216411-0b793f4b4173'),
    u('1488190211105-8b0e65b80b4e'),
    u('1509114397022-ed747cca3f65'),
    u('1513542789412-b1af52e5a8d7'),
    u('1550399105-c4db5fb85c18'),
  ],
  Vehicles: [
    u('1558618666-fcd25c85cd64'),
    u('1571068316344-75bc76f77890'),
    u('1609630875171-b1321377ee65'),
    u('1507035895480-2b3156c31fc8'),
    u('1502744688674-c619d1586c9e'),
    u('1532298229144-0ec0c57515c7'),
    u('1485965120184-e220f721d03e'),
  ],
  Services: [
    u('1434030216411-0b793f4b4173'),
    u('1522202176988-66273c2fd55f'),
    u('1516321318423-f06f85e504b3'),
    u('1551836022-d5d88e9218df'),
    u('1580582932707-520aed937b7b'),
    u('1552581234-26160d608093'),
    u('1454165804606-c3d57bc86b40'),
  ],
  Other: [
    u('1441986300917-64674bd600d8'),
    u('1472851294608-062f824d29cc'),
    u('1607082348824-0a96f2a4b9da'),
    u('1523275335684-37898b6baf30'),
    u('1491553895911-0055eca6402d'),
    u('1526170375885-4d8ecf77b99f'),
    u('1585771724684-38269d6639fd'),
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// KEYWORD → EXACT PHOTO MAP
// Ordered from most-specific to least-specific.
// ─────────────────────────────────────────────────────────────────────────────

interface KeywordEntry {
  keywords: string[]
  url: string
  fallback?: string
}

const KEYWORD_MAP: KeywordEntry[] = [
  // ── Calculators ──────────────────────────────────────────────────────────
  {
    keywords: ['casio', 'fx-991', 'fx 991', 'scientific calculator', 'scientific calc'],
    url: u('1564473185935-58de66a5cf15'),
    fallback: u('1585771724684-38269d6639fd'),
  },
  {
    keywords: ['graphing calculator', 'ti-84', 'texas instruments', 'calculator'],
    url: u('1564473185935-58de66a5cf15'),
    fallback: u('1498049794561-7780e7231661'),
  },

  // ── Laptops ───────────────────────────────────────────────────────────────
  {
    keywords: ['macbook', 'mac book'],
    url: u('1517336714731-489689fd1ca8'),
    fallback: u('1496181133206-80ce9b88a853'),
  },
  {
    keywords: ['laptop bag', 'laptop sleeve', 'laptop case', 'laptop pouch'],
    url: u('1553062407-98eeb64c6a62'),
    fallback: u('1496181133206-80ce9b88a853'),
  },
  {
    keywords: ['laptop', 'notebook computer', 'thinkpad', 'dell xps', 'hp elitebook', 'lenovo', 'asus laptop', 'acer laptop', 'dell laptop'],
    url: u('1496181133206-80ce9b88a853'),
    fallback: u('1525547719571-a2d4ac8945e2'),
  },

  // ── Phones ───────────────────────────────────────────────────────────────
  {
    keywords: ['phone cover', 'phone case', 'mobile cover', 'back cover'],
    url: u('1588872657578-7efd1f1555ed'),
    fallback: u('1511707171634-5f897ff02aa9'),
  },
  {
    keywords: ['iphone', 'samsung galaxy', 'oneplus', 'smartphone', 'mobile phone', 'android phone', 'redmi', 'realme'],
    url: u('1511707171634-5f897ff02aa9'),
    fallback: u('1588872657578-7efd1f1555ed'),
  },

  // ── Audio ─────────────────────────────────────────────────────────────────
  {
    keywords: ['airpods', 'earbuds', 'tws', 'wireless earphone', 'in-ear'],
    url: u('1546435770-a3e426bf472b'),
    fallback: u('1505740420928-5e560c06d30e'),
  },
  {
    keywords: ['headphone', 'over-ear', 'sony wh', 'bose headphone', 'jbl headphone', 'noise cancelling'],
    url: u('1505740420928-5e560c06d30e'),
    fallback: u('1583394838336-acd977736f90'),
  },

  // ── Tablets ───────────────────────────────────────────────────────────────
  {
    keywords: ['ipad', 'tablet', 'samsung tab'],
    url: u('1544244015-0df4b3ffc6b0'),
    fallback: u('1496181133206-80ce9b88a853'),
  },

  // ── Input Devices ─────────────────────────────────────────────────────────
  {
    keywords: ['mechanical keyboard', 'keyboard'],
    url: u('1587829741301-dc798b83add3'),
    fallback: u('1593640408182-31c228b2fd28'),
  },
  {
    keywords: ['gaming mouse', 'wireless mouse', 'mouse'],
    url: u('1527443224154-c4a3942d3acf'),
    fallback: u('1498049794561-7780e7231661'),
  },
  {
    keywords: ['monitor', 'display screen', 'external screen'],
    url: u('1527443224154-c4a3942d3acf'),
    fallback: u('1593640408182-31c228b2fd28'),
  },

  // ── Power & Storage ───────────────────────────────────────────────────────
  {
    keywords: ['power bank', 'portable charger', 'battery pack'],
    url: u('1609091839311-d5365f9ff1c5'),
    fallback: u('1498049794561-7780e7231661'),
  },
  {
    keywords: ['charger', 'usb cable', 'type-c', 'lightning cable', 'adapter'],
    url: u('1609091839311-d5365f9ff1c5'),
    fallback: u('1498049794561-7780e7231661'),
  },
  {
    keywords: ['pendrive', 'usb drive', 'flash drive', 'hard disk', 'ssd', 'hard drive', 'external drive'],
    url: u('1518770660439-4636190af475'),
    fallback: u('1498049794561-7780e7231661'),
  },

  // ── Bags ─────────────────────────────────────────────────────────────────
  {
    keywords: ['backpack', 'rucksack', 'sling bag', 'tote bag', 'shoulder bag', 'bag'],
    url: u('1553062407-98eeb64c6a62'),
    fallback: u('1434389677669-e08b4cac3105'),
  },

  // ── Subject Textbooks ────────────────────────────────────────────────────
  {
    keywords: ['vlsi', 'semiconductor', 'microelectronics', 'neil weste', 'cmos'],
    url: u('1518770660439-4636190af475'),
    fallback: u('1544716278-ca5e3f4abd8c'),
  },
  {
    keywords: ['data structure', 'algorithm', 'dsa', 'clrs', 'skiena'],
    url: u('1461749280684-dccba630e2f6'),
    fallback: u('1524995997946-a1c2e315a42f'),
  },
  {
    keywords: ['machine learning', 'deep learning', 'ai book', 'neural network', 'hands-on ml'],
    url: u('1555255707-c19b6f9e5a1f'),
    fallback: u('1461749280684-dccba630e2f6'),
  },
  {
    keywords: ['python', 'programming', 'coding book', 'javascript', 'java book', 'c++ book', 'software engineering'],
    url: u('1461749280684-dccba630e2f6'),
    fallback: u('1532012197267-da84d127e765'),
  },
  {
    keywords: ['calculus', 'mathematics', 'algebra', 'statistics', 'probability', 'math book'],
    url: u('1635070041078-e363dbe005cb'),
    fallback: u('1524995997946-a1c2e315a42f'),
  },
  {
    keywords: ['chemistry', 'organic chemistry', 'inorganic', 'chemical engineering'],
    url: u('1532187863486-abf9dbad1b69'),
    fallback: u('1524995997946-a1c2e315a42f'),
  },
  {
    keywords: ['physics', 'mechanics', 'optics', 'thermodynamics', 'electromagnetism'],
    url: u('1636466497217-26a8cbeaf0aa'),
    fallback: u('1524995997946-a1c2e315a42f'),
  },
  {
    keywords: ['electronics book', 'electrical engineering', 'circuit theory', 'signals', 'analog circuits'],
    url: u('1518770660439-4636190af475'),
    fallback: u('1544716278-ca5e3f4abd8c'),
  },
  {
    keywords: ['biology', 'biochemistry', 'anatomy', 'microbiology', 'genetics'],
    url: u('1532187863486-abf9dbad1b69'),
    fallback: u('1544716278-ca5e3f4abd8c'),
  },
  {
    keywords: ['economics', 'finance', 'accounting', 'management', 'business book', 'mba'],
    url: u('1456513080510-7bf3a84b82f8'),
    fallback: u('1524995997946-a1c2e315a42f'),
  },

  // ── Hostel Furniture ─────────────────────────────────────────────────────
  {
    keywords: ['study desk', 'study table', 'writing desk', 'work desk'],
    url: u('1518455027359-f3f8164ba6bd'),
    fallback: u('1586023492125-27b2c045efd7'),
  },
  {
    keywords: ['office chair', 'study chair', 'chair'],
    url: u('1505843516-c2cf9c4b3cf4'),
    fallback: u('1518455027359-f3f8164ba6bd'),
  },
  {
    keywords: ['mattress', 'foam mattress', 'single mattress'],
    url: u('1631049307264-da0ec9d70304'),
    fallback: u('1505693314120-0d443867891c'),
  },
  {
    keywords: ['pillow', 'cushion'],
    url: u('1540518614846-7eded433c457'),
    fallback: u('1631049307264-da0ec9d70304'),
  },
  {
    keywords: ['blanket', 'quilt', 'bedsheet', 'bed sheet', 'comforter'],
    url: u('1493663284031-b7e3aefcae8e'),
    fallback: u('1540518614846-7eded433c457'),
  },
  {
    keywords: ['table lamp', 'desk lamp', 'led lamp', 'study lamp', 'reading lamp'],
    url: u('1513506003901-1e6a35746c5d'),
    fallback: u('1567016432779-094069958ea5'),
  },
  {
    keywords: ['table fan', 'ceiling fan', 'fan'],
    url: u('1513506003901-1e6a35746c5d'),
    fallback: u('1586023492125-27b2c045efd7'),
  },
  {
    keywords: ['water bottle', 'steel bottle', 'thermos', 'flask'],
    url: u('1527435468990-7cff228e52e0'),
    fallback: u('1484154218962-a197022b5858'),
  },
  {
    keywords: ['bookshelf', 'shelf', 'rack', 'storage shelf'],
    url: u('1497633762265-9d179a990aa6'),
    fallback: u('1586023492125-27b2c045efd7'),
  },

  // ── Clothing ──────────────────────────────────────────────────────────────
  {
    keywords: ['sneaker', 'nike', 'adidas', 'running shoes', 'sports shoes'],
    url: u('1542291026-7eec264c27ff'),
    fallback: u('1560243563-062bfc001d68'),
  },
  {
    keywords: ['sandal', 'slipper', 'flip flop', 'chappal'],
    url: u('1491553895911-0055eca6402d'),
    fallback: u('1560243563-062bfc001d68'),
  },
  {
    keywords: ['formal shoes', 'leather shoes', 'oxford shoes', 'loafer'],
    url: u('1560243563-062bfc001d68'),
    fallback: u('1542291026-7eec264c27ff'),
  },
  {
    keywords: ['hoodie', 'sweatshirt', 'pullover'],
    url: u('1556905055-8f358a7a47b2'),
    fallback: u('1551488831-00ddcb6c6bd3'),
  },
  {
    keywords: ['jacket', 'windbreaker', 'coat', 'winter jacket', 'bomber jacket'],
    url: u('1551488831-00ddcb6c6bd3'),
    fallback: u('1556905055-8f358a7a47b2'),
  },
  {
    keywords: ['t-shirt', 'tshirt', 'polo shirt', 'half sleeve shirt'],
    url: u('1489987707025-afc232f7ea0f'),
    fallback: u('1523381210434-271e8be1f52b'),
  },
  {
    keywords: ['jeans', 'denim', 'trousers', 'chinos', 'pants'],
    url: u('1542574621-e088a4464f7e'),
    fallback: u('1434389677669-e08b4cac3105'),
  },

  // ── Sports ───────────────────────────────────────────────────────────────
  {
    keywords: ['cricket bat', 'cricket ball', 'cricket kit', 'cricket'],
    url: u('1531415074968-036ba1b575da'),
    fallback: u('1517649763962-0c623066013b'),
  },
  {
    keywords: ['football', 'soccer ball', 'soccer'],
    url: u('1579952363873-27f3bade9f55'),
    fallback: u('1517649763962-0c623066013b'),
  },
  {
    keywords: ['badminton', 'shuttlecock', 'badminton racket'],
    url: u('1626224583764-f87db24ac4ea'),
    fallback: u('1530549387789-4c1017266635'),
  },
  {
    keywords: ['racket', 'racquet', 'tennis'],
    url: u('1626224583764-f87db24ac4ea'),
    fallback: u('1530549387789-4c1017266635'),
  },
  {
    keywords: ['basketball'],
    url: u('1579952363873-27f3bade9f55'),
    fallback: u('1517649763962-0c623066013b'),
  },
  {
    keywords: ['dumbbell', 'barbell', 'weight plate', 'gym equipment', 'gym weights'],
    url: u('1534438327276-14e5300c3a48'),
    fallback: u('1593786973178-e4fdfd4e9b21'),
  },
  {
    keywords: ['yoga mat', 'exercise mat', 'gym mat'],
    url: u('1571019614242-c5c5dee9f50b'),
    fallback: u('1534438327276-14e5300c3a48'),
  },
  {
    keywords: ['bicycle', 'cycle', 'mtb', 'mountain bike', 'road bike', 'gear cycle'],
    url: u('1507035895480-2b3156c31fc8'),
    fallback: u('1558618666-fcd25c85cd64'),
  },
  {
    keywords: ['scooter', 'scooty', 'activa', 'moped', 'two wheeler', 'two-wheeler'],
    url: u('1571068316344-75bc76f77890'),
    fallback: u('1609630875171-b1321377ee65'),
  },

  // ── Stationery ───────────────────────────────────────────────────────────
  {
    keywords: ['notebook', 'diary', 'journal', 'notepad', 'spiral notebook'],
    url: u('1471107340929-a87cd0f5b5f3'),
    fallback: u('1497032628192-86f99bcd76bc'),
  },
  {
    keywords: ['pen', 'ballpoint pen', 'gel pen', 'fountain pen'],
    url: u('1583485088034-697b5bc54ccd'),
    fallback: u('1456735190827-d1262f71b8a3'),
  },
  {
    keywords: ['pencil', 'color pencil', 'sketch pen', 'marker', 'highlighter'],
    url: u('1583485088034-697b5bc54ccd'),
    fallback: u('1509114397022-ed747cca3f65'),
  },
  {
    keywords: ['geometry box', 'compass box', 'ruler', 'protractor', 'set square'],
    url: u('1497032628192-86f99bcd76bc'),
    fallback: u('1456735190827-d1262f71b8a3'),
  },
  {
    keywords: ['sticky notes', 'post-it', 'stapler', 'scissor', 'tape'],
    url: u('1550399105-c4db5fb85c18'),
    fallback: u('1497032628192-86f99bcd76bc'),
  },

  // ── Services ─────────────────────────────────────────────────────────────
  {
    keywords: ['python tutoring', 'python coaching', 'data science', 'machine learning tutor'],
    url: u('1461749280684-dccba630e2f6'),
    fallback: u('1516321318423-f06f85e504b3'),
  },
  {
    keywords: ['math tutor', 'maths tutor', 'physics tutor', 'chemistry tutor', 'science tutor'],
    url: u('1635070041078-e363dbe005cb'),
    fallback: u('1522202176988-66273c2fd55f'),
  },
  {
    keywords: ['tutoring', 'tutor', 'coaching', 'private lesson', 'teaching'],
    url: u('1522202176988-66273c2fd55f'),
    fallback: u('1551836022-d5d88e9218df'),
  },
  {
    keywords: ['photography', 'photo shoot', 'photographer'],
    url: u('1516035069371-29a1b244cc32'),
    fallback: u('1551836022-d5d88e9218df'),
  },
  {
    keywords: ['laundry', 'washing', 'dry cleaning'],
    url: u('1545173168-9f1b7c866c0f'),
    fallback: u('1580582932707-520aed937b7b'),
  },
  {
    keywords: ['freelance', 'design work', 'graphic design', 'assignment help', 'project help'],
    url: u('1454165804606-c3d57bc86b40'),
    fallback: u('1552581234-26160d608093'),
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// CORE LOGIC
// ─────────────────────────────────────────────────────────────────────────────

function simpleHash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return h
}

function isValidUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string' || !url.trim()) return false
  if (url.includes('source.unsplash.com')) return false
  if (url.includes('via.placeholder.com')) return false
  if (url.includes('placehold.co')) return false
  try {
    const parsed = new URL(url.trim())
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch { return false }
}

function pickPhoto(
  storedSrc: string | null | undefined,
  title: string,
  category: string,
): { primary: string; fallback: string } {
  // 1. Valid stored URL from the database
  if (isValidUrl(storedSrc)) {
    const pool = PHOTO_POOLS[category] ?? PHOTO_POOLS['Other']
    return { primary: storedSrc!, fallback: pool[0] }
  }

  const titleLower = (title ?? '').toLowerCase()

  // 2. Title keyword match — ordered most-specific first
  for (const entry of KEYWORD_MAP) {
    if (entry.keywords.some(kw => titleLower.includes(kw))) {
      return {
        primary: entry.url,
        fallback: entry.fallback ?? (PHOTO_POOLS[category] ?? PHOTO_POOLS['Other'])[0],
      }
    }
  }

  // 3. Category pool — deterministic pick by hashing title
  const pool = PHOTO_POOLS[category] ?? PHOTO_POOLS['Other']
  const hash = simpleHash(title ?? category)
  const idx   = Math.abs(hash) % pool.length
  const fbIdx = Math.abs(hash + 1) % pool.length
  return { primary: pool[idx], fallback: pool[fbIdx] }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function ListingImage({
  src,
  alt,
  title = '',
  category = 'Other',
  className,
  style,
  size = 'md',
  priority = false,
}: {
  src?:       string | null
  alt?:       string
  title?:     string
  category?:  string
  className?: string
  style?:     React.CSSProperties
  size?:      'sm' | 'md' | 'lg'
  priority?:  boolean
}) {
  const { primary, fallback } = useMemo(
    () => pickPhoto(src, title, category),
    [src, title, category],
  )

  // Skip the loading shimmer entirely if already cached
  const cachedStatus = imageStatusCache.get(primary)
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    cachedStatus === 'loaded' ? 'loaded' : 'loading',
  )
  const [useFallback, setUseFallback] = useState(false)

  // Sync state when URL changes
  useEffect(() => {
    const cached = imageStatusCache.get(primary)
    if (cached === 'loaded') {
      setStatus('loaded')
      setUseFallback(false)
    } else if (cached === 'error') {
      setStatus('loaded')
      setUseFallback(true)
    } else {
      setStatus('loading')
      setUseFallback(false)
    }
  }, [primary])

  // Preload primary and fallback in the background
  useEffect(() => {
    preloadImage(primary)
    preloadImage(fallback)
  }, [primary, fallback])

  const displayUrl = useFallback ? fallback : primary

  const wrapStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    background: '#f0ede8',
    ...style,
  }

  return (
    <div className={className} style={wrapStyle}>
      {/* Shimmer skeleton while loading */}
      {status === 'loading' && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background: 'linear-gradient(90deg,#f0ede8 25%,#e8e3dc 50%,#f0ede8 75%)',
            backgroundSize: '300% 100%',
            animation: 'cv-shimmer 1.4s ease-in-out infinite',
          }}
        />
      )}

      {/* Product image */}
      <img
        src={displayUrl}
        alt={alt ?? title}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => {
          imageStatusCache.set(primary, 'loaded')
          setStatus('loaded')
        }}
        onError={() => {
          if (!useFallback) {
            imageStatusCache.set(primary, 'error')
            setUseFallback(true)
            setStatus('loaded')
          }
        }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: status === 'loaded' ? 1 : 0,
          transition: 'opacity 0.2s ease',
          zIndex: 2,
        }}
        referrerPolicy="no-referrer"
      />

      <style>{`
        @keyframes cv-shimmer {
          0%   { background-position:  200% 0 }
          100% { background-position: -200% 0 }
        }
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PRELOAD HOOK — call in page/list components to warm the cache in the background
// Example: usePreloadListingImages(listings) in marketplace page
// ─────────────────────────────────────────────────────────────────────────────
export function usePreloadListingImages(
  listings: Array<{ images?: string[] | null; title: string; category: string }>,
) {
  useEffect(() => {
    if (!listings?.length) return
    for (const listing of listings) {
      const { primary, fallback } = pickPhoto(listing.images?.[0], listing.title, listing.category)
      preloadImage(primary)
      preloadImage(fallback)
    }
  }, [listings])
}
