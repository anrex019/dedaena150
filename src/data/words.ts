/**
 * Vocabulary is data, not hardcoded cards.
 * Definitions are plain classroom meanings. Etymologies are intentionally omitted.
 * Add a word by appending an object with a unique id.
 */
export const categories = [
  { id: 'nature', label: 'ბუნება' },
  { id: 'animals', label: 'ცხოველები' },
  { id: 'sky', label: 'ცა' },
  { id: 'family', label: 'ოჯახი' },
  { id: 'home', label: 'სახლი' },
  { id: 'study', label: 'სწავლა' },
  { id: 'body', label: 'სხეული' },
  { id: 'society', label: 'საზოგადოება' },
  { id: 'literature', label: 'მწერლობა' },
] as const;

export type CategoryId = (typeof categories)[number]['id'];

export const artIds = [
  'violet',
  'finger',
  'mountain',
  'sun',
  'book',
  'scroll',
  'mother',
  'father',
  'house',
  'water',
  'sky',
  'star',
  'moon',
  'flower',
  'tree',
  'leaf',
  'bird',
  'river',
  'school',
  'teacher',
  'pupil',
  'letter',
  'word',
  'quill',
  'reading',
  'heart',
  'hand',
  'eye',
  'bread',
  'friends',
  'homeland',
  'flag',
  'stone',
  'door',
  'light',
  'night',
  'morning',
  'cloud',
] as const;

export type ArtId = (typeof artIds)[number];

export interface WordEntry {
  id: string;
  word: string;
  category: CategoryId;
  definition: string;
  example: string;
  art: ArtId;
  /** Painted file in public/art/words/marks. Absent words use the existing glyph. */
  illustration?: string;
  /** The existing glyph would depict a different object, so the page shows the first letter. */
  plain?: boolean;
}

export const words: WordEntry[] = [
  { id: 'ia', word: 'ია', category: 'nature', art: 'violet', illustration: 'violet.jpg', definition: 'პატარა, სურნელოვანი ყვავილი. ხშირად იასფერია.', example: 'გაზაფხულზე ბაღში ია აყვავდა.' },
  { id: 'tit', word: 'თითი', category: 'body', art: 'finger', definition: 'ხელის ან ფეხის ერთ-ერთი მოძრავი ნაწილი.', example: 'ბავშვმა თითით ასო აჩვენა.' },
  { id: 'mta', word: 'მთა', category: 'nature', art: 'mountain', illustration: 'mountain.jpg', definition: 'ირგვლივ მიწაზე მაღლა აწეული დიდი ბუნებრივი ფორმა.', example: 'შორს თოვლიანი მთა ჩანს.' },
  { id: 'mze', word: 'მზე', category: 'sky', art: 'sun', illustration: 'sun.jpg', definition: 'ვარსკვლავი, რომელიც დედამიწას სინათლესა და სითბოს აძლევს.', example: 'დილით მზე ამოვიდა.' },
  { id: 'wigni', word: 'წიგნი', category: 'study', art: 'book', illustration: 'book.jpg', definition: 'შეკრული ფურცლები, რომლებსაც ვკითხულობთ.', example: 'მოსწავლე დედაენას კითხულობს.' },
  { id: 'ena', word: 'ენა', category: 'literature', art: 'scroll', definition: 'ხალხის საუბრისა და წერის საშუალება.', example: 'ქართული ენა ჩვენი საგანძურია.' },
  { id: 'deda', word: 'დედა', category: 'family', art: 'mother', illustration: 'mother.jpg', definition: 'შვილის დედა — მშობელი ქალი.', example: 'დედამ ზღაპარი მიამბო.' },
  { id: 'mama', word: 'მამა', category: 'family', art: 'father', illustration: 'father.jpg', definition: 'შვილის მამა — მშობელი კაცი.', example: 'მამა ბაღში მუშაობს.' },
  { id: 'bebia', word: 'ბებია', category: 'family', art: 'mother', definition: 'დედის ან მამის დედა.', example: 'ბებიამ ბაღში ია მომკრიფა.' },
  { id: 'babua', word: 'ბაბუა', category: 'family', art: 'father', definition: 'დედის ან მამის მამა.', example: 'ბაბუა საღამოს ზღაპარს გვიყვება.' },
  { id: 'da', word: 'და', category: 'family', art: 'friends', definition: 'იგივე მშობლების გოგო სხვა შვილის მიმართ.', example: 'ჩემი და სკოლაში დადის.' },
  { id: 'dzma', word: 'ძმა', category: 'family', art: 'friends', definition: 'იგივე მშობლების ვაჟი სხვა შვილის მიმართ.', example: 'ძმამ წიგნი მომცა.' },
  { id: 'ojaxi', word: 'ოჯახი', category: 'family', art: 'friends', definition: 'ახლობელი ადამიანები, რომლებიც ერთად ცხოვრობენ — დედა, მამა და შვილები.', example: 'ჩვენს ოჯახში ერთად ვკითხულობთ.' },
  { id: 'saxli', word: 'სახლი', category: 'home', art: 'house', illustration: 'house.jpg', definition: 'შენობა, სადაც ადამიანი ცხოვრობს.', example: 'ჩვენი სახლი ბაღით არის გარშემორტყმული.' },
  { id: 'wyali', word: 'წყალი', category: 'nature', art: 'water', illustration: 'water.jpg', definition: 'გამჭვირვალე სითხე, რომელსაც ვსვამთ.', example: 'ჭიქაში სუფთა წყალია.' },
  { id: 'ca', word: 'ცა', category: 'sky', art: 'sky', definition: 'დედამიწის ზემოთ გადაშლილი სივრცე.', example: 'ცა დღეს ცისფერია.' },
  { id: 'varskvlavi', word: 'ვარსკვლავი', category: 'sky', art: 'star', definition: 'ცაზე მოჩანული მანათობელი ციური სხეული.', example: 'ღამით ვარსკვლავი ანათებს.' },
  { id: 'mtvare', word: 'მთვარე', category: 'sky', art: 'moon', illustration: 'moon.jpg', definition: 'დედამიწის თანამგზავრი, რომელიც ღამით ცაზე ჩანს.', example: 'სავსე მთვარე ბილიკს უნათებს.' },
  { id: 'qvavili', word: 'ყვავილი', category: 'nature', art: 'flower', illustration: 'flower.jpg', definition: 'მცენარის ფერადი, ხშირად სურნელოვანი ნაწილი.', example: 'მინდორში ყვავილი ამოვიდა.' },
  { id: 'xe', word: 'ხე', category: 'nature', art: 'tree', illustration: 'tree.jpg', definition: 'მერქნიანი მცენარე ტანითა და ტოტებით.', example: 'ეზოში დიდი ხე დგას.' },
  { id: 'fotoli', word: 'ფოთოლი', category: 'nature', art: 'leaf', definition: 'მცენარის მწვანე, თხელი ნაწილი ტოტზე.', example: 'შემოდგომაზე ფოთოლი ცვივა.' },
  { id: 'chiti', word: 'ჩიტი', category: 'animals', art: 'bird', illustration: 'bird.jpg', definition: 'ბუმბულებიანი ცხოველი, რომელსაც ფრენა შეუძლია.', example: 'ჩიტი ტოტზე მღერის.' },
  { id: 'dzaghli', word: 'ძაღლი', category: 'animals', art: 'bird', illustration: 'dog.jpg', definition: 'შინაური ცხოველი, რომელიც ყეფს და ხშირად სახლს იცავს.', example: 'ეზოს ძაღლმა სტუმარი გაიცნო.' },
  { id: 'kata', word: 'კატა', category: 'animals', art: 'bird', illustration: 'cat.jpg', definition: 'შინაური ცხოველი რბილი ბეწვითა და ულვაშებით.', example: 'კატა თბილ ფანჯარასთან წვება.' },
  { id: 'cxeni', word: 'ცხენი', category: 'animals', art: 'bird', illustration: 'horse.jpg', definition: 'დიდი ჩლიქოსანი ცხოველი.', example: 'მინდორში ცხენი ბალახს ძოვს.' },
  { id: 'tevzi', word: 'თევზი', category: 'animals', art: 'water', illustration: 'fish.jpg', definition: 'წყალში მცხოვრები ცხოველი, რომელსაც ფარფლები აქვს.', example: 'მდინარის თევზი წყალში ცურავს.' },
  { id: 'futkari', word: 'ფუტკარი', category: 'animals', art: 'bird', illustration: 'bee.jpg', definition: 'მფრინავი მწერი, რომელიც ყვავილებიდან თაფლს აგროვებს.', example: 'ფუტკარი იას ყვავილზე დაჯდა.' },
  { id: 'datvi', word: 'დათვი', category: 'animals', art: 'bird', illustration: 'bear.jpg', definition: 'დიდი ტყის ცხოველი სქელი ბეწვით.', example: 'ზღაპრის დათვი ტყის ბილიკზე გამოვიდა.' },
  { id: 'mdinare', word: 'მდინარე', category: 'nature', art: 'river', definition: 'ბუნებრივ კალაპოტში მიმავალი წყლის ნაკადი.', example: 'სოფელთან მდინარე ჩამოუდის.' },
  { id: 'skola', word: 'სკოლა', category: 'study', art: 'school', definition: 'ადგილი, სადაც მოსწავლეები სწავლობენ.', example: 'დილით სკოლაში მივდივარ.' },
  { id: 'maswavlebeli', word: 'მასწავლებელი', category: 'study', art: 'teacher', definition: 'ადამიანი, რომელიც სხვას ასწავლის.', example: 'მასწავლებელმა ახალი სიტყვა აგვიხსნა.' },
  { id: 'moswavle', word: 'მოსწავლე', category: 'study', art: 'pupil', definition: 'ადამიანი, რომელიც სკოლაში სწავლობს.', example: 'მოსწავლემ წიგნი გახსნა.' },
  { id: 'rveuli', word: 'რვეული', category: 'study', art: 'scroll', definition: 'შეკერილი ფურცლები, რომლებშიც ვწერთ.', example: 'რვეულში ახალი სიტყვა ჩავწერე.' },
  { id: 'aso', word: 'ასო', category: 'literature', art: 'letter', definition: 'ანბანის ერთი ნიშანი.', example: 'სიტყვა „ია“ ორი ასოსგან შედგება.' },
  { id: 'sitqva', word: 'სიტყვა', category: 'literature', art: 'word', definition: 'ასოებისგან შედგენილი ერთეული, რომელსაც მნიშვნელობა აქვს.', example: 'ყოველ სიტყვას თავისი ადგილი აქვს.' },
  { id: 'wera', word: 'წერა', category: 'literature', art: 'quill', definition: 'ასოებით აზრის ქაღალდზე ან ეკრანზე დატანა.', example: 'წერას ქართულ ენაზე ვარჯიშობ.' },
  { id: 'kitxva', word: 'კითხვა', category: 'literature', art: 'reading', definition: 'დაწერილი ტექსტის გაგება და წარმოთქმა.', example: 'კითხვა დედაენით იწყება.' },
  { id: 'dedaena', word: 'დედაენა', category: 'literature', art: 'book', definition: 'მშობლიური ენა. იაკობ გოგებაშვილის პირველ საკითხავ წიგნს „დედა ენა“ ჰქვია და ის 1876 წელს დაიბეჭდა.', example: 'დედაენა ის ენაა, რომელსაც სახლში ვსწავლობთ.' },
  { id: 'anbani', word: 'ანბანი', category: 'literature', art: 'letter', definition: 'ასოების დალაგებული რიგი, რომლითაც წერა და კითხვა იწყება.', example: 'ქართული ანბანი ასო „ა“-თი იწყება.' },
  { id: 'zgapari', word: 'ზღაპარი', category: 'literature', art: 'scroll', definition: 'მოთხრობა, რომელშიც ხშირად სასწაული და გამოგონილი ამბავია.', example: 'ბებიამ ძილის წინ ზღაპარი მიამბო.' },
  { id: 'leqsi', word: 'ლექსი', category: 'literature', art: 'quill', definition: 'პოეტური ტექსტი, ხშირად რიტმითა და რითმით.', example: 'მოსწავლემ მოკლე ლექსი ზეპირად თქვა.' },
  { id: 'guli', word: 'გული', category: 'body', art: 'heart', illustration: 'heart.jpg', definition: 'მკერდის ორგანო, რომელიც სისხლს მოძრაობაში აყენებს.', example: 'სირბილისას გული სწრაფად უცემს.' },
  { id: 'xeli', word: 'ხელი', category: 'body', art: 'hand', definition: 'ადამიანის ზედა კიდური, რომელსაც თითები აქვს.', example: 'ხელით წიგნს ვიჭერ.' },
  { id: 'tvali', word: 'თვალი', category: 'body', art: 'eye', definition: 'მხედველობის ორგანო.', example: 'თვალით ასოებს ვარჩევ.' },
  { id: 'quri', word: 'ყური', category: 'body', art: 'eye', plain: true, definition: 'სმენის ორგანო თავის ორივე მხარეს.', example: 'ყურით მასწავლებელს ვუსმენ.' },
  { id: 'puri', word: 'პური', category: 'home', art: 'bread', definition: 'ცომისგან გამომცხვარი საკვები.', example: 'სუფრაზე თბილი პური დევს.' },
  { id: 'megobari', word: 'მეგობარი', category: 'society', art: 'friends', illustration: 'friends.jpg', definition: 'ადამიანი, რომელსაც ენდობი და რომელიც ახლოს გყავს.', example: 'მეგობართან ერთად ვკითხულობთ.' },
  { id: 'samshoblo', word: 'სამშობლო', category: 'society', art: 'homeland', definition: 'ქვეყანა, რომელსაც ადამიანი თავისად თვლის.', example: 'საქართველო ჩვენი სამშობლოა.' },
  { id: 'drosha', word: 'დროშა', category: 'society', art: 'flag', illustration: 'flag.jpg', definition: 'ქვეყნის ნიშანი, გამოსახული ქსოვილზე.', example: 'სკოლის ეზოში დროშა ფრიალებს.' },
  { id: 'sofli', word: 'სოფელი', category: 'society', art: 'house', definition: 'პატარა დასახლება სახლებით, ბაღებითა და მინდვრებით.', example: 'სოფლის სკოლამდე ფეხით მივდივარ.' },
  { id: 'kalaki', word: 'ქალაქი', category: 'society', art: 'school', definition: 'დიდი დასახლება ქუჩებით, სახლებითა და სკოლებით.', example: 'თბილისი საქართველოს დედაქალაქია.' },
  { id: 'xalxi', word: 'ხალხი', category: 'society', art: 'friends', definition: 'ადამიანები, რომლებსაც საერთო ენა და ცხოვრება აკავშირებს.', example: 'ქუჩაში ბევრი ხალხი დადიოდა.' },
  { id: 'kva', word: 'ქვა', category: 'nature', art: 'stone', definition: 'მყარი ბუნებრივი მინერალური ნატეხი.', example: 'ბილიკზე მრგვალი ქვა დევს.' },
  { id: 'kari', word: 'კარი', category: 'home', art: 'door', definition: 'შესასვლელი, რომელიც იღება და იხურება.', example: 'მუზეუმის კარი სტუმარს ელოდება.' },
  { id: 'sinatle', word: 'სინათლე', category: 'sky', art: 'light', definition: 'ის, რაც საგნებს ხილულს ხდის.', example: 'ფანჯრიდან სინათლე შემოდის.' },
  { id: 'game', word: 'ღამე', category: 'sky', art: 'night', definition: 'დღის ბნელი ნაწილი, მზის ჩასვლიდან ამოსვლამდე.', example: 'ღამით ვარსკვლავები ჩანან.' },
  { id: 'dila', word: 'დილა', category: 'sky', art: 'morning', definition: 'დღის დასაწყისი, მზის ამოსვლის შემდეგ.', example: 'დილით ფრინველები მღერიან.' },
  { id: 'grubl', word: 'ღრუბელი', category: 'sky', art: 'cloud', definition: 'ცაში შეკრული წყლის წვეთების თეთრი ან რუხი მასა.', example: 'მთაზე ღრუბელი დგას.' },
];

export function wordById(id: string): WordEntry | undefined {
  return words.find((word) => word.id === id);
}

/** Written letters in order. This is spelling, not syllables and not an etymology. */
export function lettersOf(word: string): string[] {
  return Array.from(word).filter((char) => char.trim().length > 0);
}

export function spellingLine(word: string): string | null {
  const parts = lettersOf(word);
  if (parts.length < 2) return null;
  return `${parts.join(' + ')} = ${word}`;
}

export function categoryLabel(id: CategoryId): string {
  return categories.find((category) => category.id === id)?.label ?? id;
}
