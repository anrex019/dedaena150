/**
 * Wikimedia Commons photo search terms for the 58 treasure words.
 * Results are fetched on demand, cached per session and shown with a source link.
 * This is a review prototype, not a hand-curated or guaranteed set of photographs.
 */
export const photoQueries: Record<string, string> = {
  ia:'Viola odorata flower photograph', tit:'human index finger pointing up isolated hand photo -spider -insect -animal', mta:'Caucasus mountain landscape photograph',
  mze:'Sun sky photograph', wigni:'open printed book photograph', ena:'Georgian alphabet text book photograph',
  deda:'mother child photograph', mama:'father child photograph', bebia:'grandmother portrait photograph',
  babua:'grandfather portrait photograph', da:'sisters children photograph', dzma:'brothers children photograph',
  ojaxi:'family parents children photograph', saxli:'house exterior photograph', wyali:'glass of water photograph',
  ca:'blue sky photograph', varskvlavi:'night sky stars astrophotography', mtvare:'full moon astrophotography',
  qvavili:'flower closeup photograph', xe:'tree photograph', fotoli:'green leaf closeup photograph',
  chiti:'bird perched branch photograph', dzaghli:'domestic dog photograph', kata:'domestic cat photograph',
  cxeni:'horse meadow photograph', tevzi:'fish underwater photograph', futkari:'honey bee flower photograph',
  datvi:'brown bear wildlife photograph', mdinare:'river landscape photograph', skola:'school building photograph',
  maswavlebeli:'teacher classroom photograph', moswavle:'student studying classroom photograph',
  rveuli:'school notebook photograph', aso:'Georgian letter alphabet photograph',
  sitqva:'Georgian text printed page photograph', wera:'handwriting pen paper photograph',
  kitxva:'child reading book photograph', dedaena:'Gogebashvili Deda Ena book photograph',
  anbani:'Georgian alphabet letters photograph', zgapari:'fairy tale story book photograph',
  leqsi:'poetry book page photograph', guli:'human anatomical heart model photograph',
  xeli:'human hand photograph', tvali:'human eye closeup photograph', quri:'human ear closeup photograph',
  puri:'Georgian bread shotis puri photograph', megobari:'friends children together photograph',
  samshoblo:'Georgia country landscape photograph', drosha:'flag of Georgia waving photograph',
  sofli:'Georgian village houses photograph', kalaki:'Tbilisi city photograph',
  xalxi:'crowd of people street photograph', kva:'rock stone photograph', kari:'wooden door photograph',
  sinatle:'sunlight through window photograph', game:'night landscape photograph',
  dila:'morning sunrise landscape photograph', grubl:'cloud sky photograph',
};

// Teacher review: deliberately more specific searches for the 23 rejected images.
// The Commons API can still return an imperfect match; these are review candidates.
const corrections: Record<string, string> = {
  tit: 'human index finger pointing upward isolated hand photograph -spider -arachnid',
  mze: 'sun solar disk NASA photograph',
  wigni: 'Deda Ena 1876 cover',
  ena: 'Albert Einstein sticks his tongue 1951',
  deda: 'mother reading to child illustration',
  mama: 'father with young son portrait photograph',
  babua: 'elderly grandfather portrait photograph',
  ca: 'clear blue sky white clouds landscape photograph',
  xe: 'single oak tree meadow photograph',
  dzaghli: 'golden retriever dog standing grass photograph',
  cxeni: 'brown horse full body meadow photograph',
  mdinare: 'river flowing green valley landscape photograph',
  skola: 'primary school classroom desks photograph',
  rveuli: 'open lined school exercise notebook photograph',
  sitqva: 'Georgian alphabet printed text closeup photograph',
  wera: 'hand writing pencil notebook closeup photograph',
  dedaena: 'Deda Ena 1876 cover',
  leqsi: 'open poetry book printed verse photograph',
  xeli: 'open palm human hand photograph',
  quri: 'human external ear close up photograph',
  sinatle: 'sun rays shining through forest photograph',
  game: 'moonlit night stars landscape photograph',
};
const exactFiles: Record<string, string> = {
  wigni: 'File:Deda Ena 1876 cover.jpg',
  dedaena: 'File:Deda Ena 1876 cover.jpg',
  ena: 'File:Albert Einstein sticks his tongue 1951.jpg',
};
type CommonsPhoto = { url: string; page: string };
const cache = new Map<string, Promise<CommonsPhoto | null>>();

export function findCommonsPhoto(id: string): Promise<CommonsPhoto | null> {
  const query = corrections[id] ?? photoQueries[id];
  if (!query) return Promise.resolve(null);
  const existing = cache.get(id);
  if (existing) return existing;
  const request = (async () => {
    try {
      const exact = exactFiles[id];
      const params = new URLSearchParams({
        action: 'query',
        ...(exact ? { titles: exact } : { generator: 'search', gsrsearch: query, gsrnamespace: '6', gsrlimit: '12' }),
        prop: 'imageinfo', iiprop: 'url|mime|extmetadata',
        iiurlwidth: '640', format: 'json', origin: '*',
      });
      const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`);
      if (!response.ok) return null;
      const data = await response.json() as {
        query?: { pages?: Record<string, { title?: string; imageinfo?: Array<{
          thumburl?: string; descriptionurl?: string; mime?: string;
          extmetadata?: { LicenseShortName?: { value?: string } };
        }> }> };
      };
      const pages = Object.values(data.query?.pages ?? {});
      const photos = pages.map((page) => ({ title: page.title ?? '', info: page.imageinfo?.[0] }))
        .filter(({ title }) => id !== 'tit' || !/spider|arachnid|insect|tarantula|jumping spider|spinne|araignée/i.test(title))
        .filter(({ info }) =>
          info?.thumburl && info.descriptionurl &&
          (info.mime === 'image/jpeg' || info.mime === 'image/png' || info.mime === 'image/webp') &&
          /^(CC|Public domain|PD)/i.test(info.extmetadata?.LicenseShortName?.value ?? '')
        );
      // Prefer titles containing the distinctive subject instead of arbitrary API order.
      const tokens = query.toLowerCase().split(/\s+/).filter((token) => token.length >= 5 && !['photo', 'photograph', 'closeup', 'portrait'].includes(token));
      photos.sort((a, b) => {
        const score = (title: string) => tokens.filter((token) => title.toLowerCase().includes(token)).length;
        return score(b.title) - score(a.title);
      });
      const photo = photos[0]?.info;
      return photo?.thumburl && photo.descriptionurl
        ? { url: photo.thumburl, page: photo.descriptionurl }
        : null;
    } catch { return null; }
  })();
  cache.set(id, request);
  return request;
}
