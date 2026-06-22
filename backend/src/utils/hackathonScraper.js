const axios = require('axios');
const Hackathon = require('../models/Hackathon');
const logger = require('../config/logger');

// Common Headers to mimic a browser request
const COMMON_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
};

// Fallback high-tech banner images
const FALLBACK_BANNERS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=600&q=80',
];

const getRandomBanner = (index) => FALLBACK_BANNERS[index % FALLBACK_BANNERS.length];

/**
 * Parses Devpost date ranges like "May 19 - Aug 17, 2026" or "Dec 31, 2025 - Jan 15, 2026"
 */
const parseDevpostDates = (datesStr) => {
  const defaultStart = new Date();
  const defaultEnd = new Date(Date.now() + 7 * 86400000);
  if (!datesStr) return { start: defaultStart, end: defaultEnd };

  try {
    const parts = datesStr.split(/\s*-\s*/);
    if (parts.length === 2) {
      let startStr = parts[0].trim();
      let endStr = parts[1].trim();

      const yearMatch = endStr.match(/\d{4}/);
      const year = yearMatch ? yearMatch[0] : new Date().getFullYear();

      if (!startStr.match(/\d{4}/)) {
        startStr = `${startStr}, ${year}`;
      }

      const start = new Date(startStr);
      const end = new Date(endStr);

      return {
        start: isNaN(start.getTime()) ? defaultStart : start,
        end: isNaN(end.getTime()) ? defaultEnd : end
      };
    }
  } catch (err) {
    logger.warn(`Error parsing Devpost dates "${datesStr}": ${err.message}`);
  }
  return { start: defaultStart, end: defaultEnd };
};

/**
 * Extract deadline and dates from Internshala content heuristics
 */
const parseInternshalaDates = (content, publishDate) => {
  const startDate = new Date(publishDate || Date.now());
  let endDate = new Date(startDate.getTime() + 30 * 86400000);
  let regDeadline = null;

  try {
    const text = content.replace(/<[^>]*>/g, ' ');

    const deadlineRegexes = [
      /(?:submission|registration|idea)?\s*deadline\s*:?\s*([A-Za-z]+\s+\d{1,2},?\s*\d{4})/i,
      /(?:submission|registration|idea)?\s*deadline\s*:?\s*(\d{1,2}\s+[A-Za-z]+,?\s*\d{4})/i,
      /(?:submission|registration|idea)?\s*deadline\s*:?\s*([A-Za-z]+\s+\d{1,2})/i,
      /ends\s*on\s*:?\s*([A-Za-z]+\s+\d{1,2},?\s*\d{4})/i,
      /ends\s*on\s*:?\s*(\d{1,2}\s+[A-Za-z]+,?\s*\d{4})/i
    ];

    for (const regex of deadlineRegexes) {
      const match = text.match(regex);
      if (match && match[1]) {
        let matchedDateStr = match[1].trim();
        if (!matchedDateStr.match(/\d{4}/)) {
          matchedDateStr = `${matchedDateStr}, ${startDate.getFullYear()}`;
        }
        const parsedDate = new Date(matchedDateStr);
        if (!isNaN(parsedDate.getTime())) {
          endDate = parsedDate;
          regDeadline = parsedDate;
          break;
        }
      }
    }
  } catch (err) {
    logger.warn(`Error parsing Internshala dates: ${err.message}`);
  }

  return { startDate, endDate, regDeadline };
};

/**
 * Extract prize pool from Internshala title or content heuristics
 */
const parseInternshalaPrize = (title, content) => {
  try {
    const prizeRegex = /Win\s+([₹$]\s*\d+(?:\.\d+)?\s*(?:Lakh|Crore|K|Million|Billion)?)/i;
    const titleMatch = title.match(prizeRegex);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim();
    }

    const text = content.replace(/<[^>]*>/g, ' ');
    const contentMatch = text.match(/Prize\s+Pool\s*(?:of|up\s*to)?\s*:?\s*([₹$]\s*\d+(?:\.\d+)?\s*(?:Lakh|Crore|K|Million|Billion)?)/i);
    if (contentMatch && contentMatch[1]) {
      return contentMatch[1].trim();
    }

    const winMatch = text.match(/Win\s+([₹$]\s*\d+(?:\.\d+)?\s*(?:Lakh|Crore|K|Million|Billion)?)/i);
    if (winMatch && winMatch[1]) {
      return winMatch[1].trim();
    }
  } catch (err) {
    logger.warn(`Error parsing Internshala prize: ${err.message}`);
  }
  return '';
};

/**
 * 1. DEVFOLIO SCRAPER
 */
const scrapeDevfolio = async () => {
  logger.info('Starting Devfolio scraping...');
  const hackathons = [];
  const types = ['application_open', 'upcoming'];

  for (const type of types) {
    try {
      const res = await axios.post(
        'https://api.devfolio.co/api/search/hackathons',
        { type, page: 1, limit: 30 },
        {
          headers: {
            ...COMMON_HEADERS,
            'Content-Type': 'application/json',
            'Origin': 'https://devfolio.co',
            'Referer': 'https://devfolio.co/',
          },
          timeout: 10000,
        }
      );

      const hits = res.data?.hits?.hits || [];
      for (const hit of hits) {
        const source = hit._source;
        if (!source) continue;
        if (source.status !== 'publish') continue;

        const title = source.name;
        const host = source.hosted_by || 'Devfolio Partner';
        const url = source.hackathon_setting?.site || `https://${source.hackathon_setting?.subdomain || source.slug}.devfolio.co`;
        const startDate = new Date(source.starts_at);
        const endDate = new Date(source.ends_at);
        const registrationDeadline = source.hackathon_setting?.reg_ends_at ? new Date(source.hackathon_setting.reg_ends_at) : null;
        const tags = (source.themes || []).map(t => t.name);

        // Images & Details
        const bannerSrc = source.cover_img || getRandomBanner(hits.indexOf(hit));
        const avatarSrc = source.hackathon_setting?.logo || '';
        const platform = 'Devfolio';
        const location = source.is_online ? 'Online' : (source.city || 'India');

        let prizePool = '';
        if (source.prizes && Array.isArray(source.prizes) && source.prizes.length > 0) {
          const mainPrize = source.prizes[0];
          prizePool = mainPrize.desc || mainPrize.title || '';
        } else if (source.tagline && source.tagline.toLowerCase().includes('prize')) {
          const match = source.tagline.match(/([$₹]\s*\d+(?:\.\d+)?\s*(?:Lakh|Crore|K|Million)?)/i);
          if (match) prizePool = match[1];
        }

        hackathons.push({
          title,
          host,
          url,
          startDate,
          endDate,
          registrationDeadline,
          tags,
          prizePool,
          bannerSrc,
          avatarSrc,
          platform,
          location,
        });
      }
    } catch (err) {
      logger.error(`Devfolio scraping failed for type ${type}: ${err.message}`);
    }
  }

  logger.info(`Devfolio scraping completed. Found ${hackathons.length} entries.`);
  return hackathons;
};

/**
 * 2. DEVPOST SCRAPER
 */
const scrapeDevpost = async () => {
  logger.info('Starting Devpost scraping...');
  const hackathons = [];

  try {
    const res = await axios.get('https://devpost.com/api/hackathons', {
      headers: COMMON_HEADERS,
      timeout: 10000,
    });

    const items = res.data?.hackathons || [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const title = item.title;
      const host = item.organization_name || 'Devpost';
      const url = item.url;

      const dates = parseDevpostDates(item.submission_period_dates);
      const tags = (item.themes || []).map(t => t.name);

      const bannerSrc = getRandomBanner(i);
      let avatarSrc = item.thumbnail_url || '';
      if (avatarSrc.startsWith('//')) {
        avatarSrc = 'https:' + avatarSrc;
      }
      const platform = 'Devpost';
      const location = item.displayed_location?.location || 'Online';

      let prizePool = '';
      if (item.prize_amount) {
        prizePool = item.prize_amount.replace(/<[^>]*>/g, '').trim();
      }

      hackathons.push({
        title,
        host,
        url,
        startDate: dates.start,
        endDate: dates.end,
        registrationDeadline: dates.end,
        tags,
        prizePool,
        bannerSrc,
        avatarSrc,
        platform,
        location,
      });
    }
  } catch (err) {
    logger.error(`Devpost scraping failed: ${err.message}`);
  }

  logger.info(`Devpost scraping completed. Found ${hackathons.length} entries.`);
  return hackathons;
};

/**
 * 3. UNSTOP SCRAPER
 */
const scrapeUnstop = async () => {
  logger.info('Starting Unstop scraping...');
  const hackathons = [];

  try {
    const res = await axios.get(
      'https://unstop.com/api/public/opportunity/search-new?opportunity=hackathons&per_page=35',
      {
        headers: COMMON_HEADERS,
        timeout: 10000,
      }
    );

    const items = res.data?.data?.data || [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const title = item.title;
      const host = item.organisation?.name || 'Unstop Partner';
      const url = item.seo_url || `https://unstop.com/hackathons/${item.public_url}`;

      const startDate = item.start_date ? new Date(item.start_date) : new Date();
      const endDate = item.end_date ? new Date(item.end_date) : new Date(Date.now() + 7 * 86400000);
      const registrationDeadline = item.regnRequirements?.end_regn_dt ? new Date(item.regnRequirements.end_regn_dt) : null;
      
      const tags = (item.required_skills || []).map(s => s.skill || s.skill_name).filter(Boolean);
      if (tags.length === 0) tags.push('Coding');

      // Images
      const bannerSrc = item.banner_mobile?.image_url || (item.seo_details && item.seo_details[0]?.sharable_image_url) || getRandomBanner(i);
      const avatarSrc = item.logoUrl2 || item.organisation?.logoUrl || '';
      const platform = 'Unstop';
      const location = item.region || (item.address_with_country_logo?.state ? `${item.address_with_country_logo.state}, India` : 'Online');

      let prizePool = '';
      if (item.prizes && Array.isArray(item.prizes) && item.prizes.length > 0) {
        const mainPrize = item.prizes[0];
        if (mainPrize.rank) {
          prizePool = mainPrize.rank;
        } else if (mainPrize.cash) {
          prizePool = `₹${mainPrize.cash.toLocaleString('en-IN')}`;
        }
      }

      hackathons.push({
        title,
        host,
        url,
        startDate,
        endDate,
        registrationDeadline,
        tags,
        prizePool,
        bannerSrc,
        avatarSrc,
        platform,
        location,
      });
    }
  } catch (err) {
    logger.error(`Unstop scraping failed: ${err.message}`);
  }

  logger.info(`Unstop scraping completed. Found ${hackathons.length} entries.`);
  return hackathons;
};

/**
 * 4. INTERNSHALA SCRAPER
 */
const scrapeInternshala = async () => {
  logger.info('Starting Internshala scraping...');
  const hackathons = [];

  try {
    const res = await axios.get(
      'https://internshala.com/competitions/wp-json/wp/v2/posts?categories=4&per_page=30',
      {
        headers: COMMON_HEADERS,
        timeout: 10000,
      }
    );

    const posts = res.data || [];
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const title = post.title?.rendered || 'Tech Competition';
      const host = 'Internshala Partner';
      const url = post.link;

      const content = post.content?.rendered || '';
      const dates = parseInternshalaDates(content, post.date);
      const prizePool = parseInternshalaPrize(title, content);

      // Images
      const bannerSrc = post.yoast_head_json?.og_image?.[0]?.url || post.yoast_head_json?.schema?.['@graph']?.find(x => x['@type'] === 'ImageObject')?.url || getRandomBanner(i);
      const avatarSrc = 'https://internshala-competitions.s3.ap-south-1.amazonaws.com/competitions/wp-content/uploads/2026/04/13050601/header_logo.png';
      const platform = 'Internshala';
      
      const contentLower = content.toLowerCase();
      const location = contentLower.includes('hybrid') ? 'Hybrid' : (contentLower.includes('offline') || contentLower.includes('venue') ? 'In-Person' : 'Online');

      hackathons.push({
        title,
        host,
        url,
        startDate: dates.startDate,
        endDate: dates.endDate,
        registrationDeadline: dates.regDeadline,
        tags: ['Competition', 'Engineering'],
        prizePool,
        bannerSrc,
        avatarSrc,
        platform,
        location,
      });
    }
  } catch (err) {
    logger.error(`Internshala scraping failed: ${err.message}`);
  }

  logger.info(`Internshala scraping completed. Found ${hackathons.length} entries.`);
  return hackathons;
};

/**
 * Aggregates and runs all scrapers, then upserts items in DB
 */
const runScrape = async () => {
  logger.info('Executing scheduled hackathon scrape job...');
  
  const devfolioList = await scrapeDevfolio();
  const devpostList = await scrapeDevpost();
  const unstopList = await scrapeUnstop();
  const internshalaList = await scrapeInternshala();

  const allHackathons = [
    ...devfolioList,
    ...devpostList,
    ...unstopList,
    ...internshalaList,
  ];

  logger.info(`Aggregated ${allHackathons.length} total hackathons. Upserting to database...`);

  let upsertCount = 0;
  for (const h of allHackathons) {
    try {
      if (h.endDate && h.endDate.getTime() >= Date.now()) {
        await Hackathon.findOneAndUpdate(
          { url: h.url },
          h,
          { upsert: true, new: true }
        );
        upsertCount++;
      }
    } catch (err) {
      logger.error(`Failed to upsert hackathon "${h.title}": ${err.message}`);
    }
  }

  logger.info(`Scraping cycle completed. Successfully upserted ${upsertCount} active hackathons.`);
  return upsertCount;
};

/**
 * Initializes scraper schedule
 */
const startHackathonScraper = () => {
  logger.info('Initializing hackathon background scraper scheduler...');
  runScrape().catch(err => {
    logger.error(`Initial hackathon scrape failed: ${err.message}`);
  });

  const INTERVAL_MS = 6 * 60 * 60 * 1000;
  setInterval(() => {
    runScrape().catch(err => {
      logger.error(`Scheduled hackathon scrape failed: ${err.message}`);
    });
  }, INTERVAL_MS);
};

module.exports = {
  runScrape,
  startHackathonScraper,
};
