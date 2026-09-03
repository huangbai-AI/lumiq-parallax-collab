export const navItems = [
  { label: "Home", href: "/" },
  { label: "Brand Story", href: "/story" },
  { label: "Products", href: "/products" },
  { label: "Plans", href: "/plans" },
  { label: "Media & Review", href: "/media" },
  { label: "FAQ", href: "/faq" },
];

export const brandPrinciples = [
  {
    number: "01",
    title: "Warmth",
    body: "Interactions should feel attentive, natural and reassuring — present when needed, quiet when they are not.",
  },
  {
    number: "02",
    title: "Intelligence",
    body: "Technology should gradually understand individual needs and offer the right help at the right moment.",
  },
  {
    number: "03",
    title: "All Ages",
    body: "Children, adults and older family members deserve experiences shaped around their own stage of life.",
  },
  {
    number: "04",
    title: "Future",
    body: "The future is not more devices. It is technology that connects learning, companionship and everyday care naturally.",
  },
];

export const products = [
  {
    id: "tablet",
    order: "01",
    name: "Lumiq Tablet",
    eyebrow: "A tablet built for wonder",
    short: "A distraction-free AI learning and reading tablet created for stories, interaction and imagination.",
    price: "USD 399",
    image: "/assets/direction-1-base.png",
    imagePosition: "62% center",
    features: [
      "Original story library created for children",
      "ImagiMe places the child inside the story",
      "Story Quest campaigns and interactive adventures",
      "No ads, feeds or distracting notifications",
      "Reading, play and discovery in one calm experience",
    ],
  },
  {
    id: "ola",
    order: "02",
    name: "Lumiq Ola + Ola Go",
    eyebrow: "One person. One Ola. Wherever life goes.",
    short: "A personal holographic companion for conversation, encouragement, reminders and everyday care — with a pocket extension for life outside.",
    price: "USD 599",
    image: "/assets/direction-2-k3.png",
    imagePosition: "58% center",
    features: [
      "A personal Ola for every individual user",
      "Expressive 3D holographic companion",
      "Natural conversation and positive encouragement",
      "Schedule, routine and daily-care reminders",
      "Every Ola includes an Ola Go pocket companion",
    ],
  },
  {
    id: "print",
    order: "03",
    name: "Lumiq Print",
    eyebrow: "Your child, the hero",
    short: "A personalized hardcover storybook that turns a child’s digital adventure into a lasting family keepsake.",
    price: "USD 69",
    image: "/assets/direction-2-k1.png",
    imagePosition: "50% center",
    features: [
      "Personalized character powered by ImagiMe",
      "Turns Lumiq Tablet stories into physical books",
      "Premium hardcover printing",
      "Delivered directly to the family’s door",
      "A keepsake to revisit across generations",
    ],
  },
];

export const storyPassPlans = [
  {
    name: "Free",
    monthly: "$0",
    yearly: "$0",
    note: "Included with Lumiq Tablet",
    features: ["Starter story library", "1 child profile", "Cloud-synced creations"],
  },
  {
    name: "Lite",
    monthly: "$7.99",
    yearly: "$6.99",
    note: "For regular readers",
    features: ["Growing story library", "Up to 2 child profiles", "Monthly Story Quests"],
  },
  {
    name: "Pro",
    monthly: "$12.99",
    yearly: "$10.99",
    note: "Most popular",
    featured: true,
    features: ["Full story library", "Up to 4 child profiles", "Unlimited ImagiMe creations"],
  },
];

export const companionPlans = [
  {
    name: "Lite",
    monthly: "$9.99",
    yearly: "$8.99",
    note: "Everyday companionship",
    features: ["Conversation and reminders", "Routine support", "Ola Go sync"],
  },
  {
    name: "Pro",
    monthly: "$16.99",
    yearly: "$14.99",
    note: "For a continuous day",
    featured: true,
    features: ["Personalized encouragement", "Voice diary continuity", "Family connection tools"],
  },
  {
    name: "Ultra",
    monthly: "$24.99",
    yearly: "$21.99",
    note: "Connected safety support",
    features: ["All Pro features", "4G Ola Go support", "On-demand location and SOS alerts"],
  },
];

export const pressItems = [
  {
    publication: "The Atelier Review",
    date: "March 2026",
    quote: "A studio that actually cares about the small, quiet moments at home.",
    action: "Read feature",
  },
  {
    publication: "Slow Design Quarterly",
    date: "Jan 2026",
    quote: "Tech that wants to slow you down instead of speeding you up — a rare thing.",
    action: "Read review",
  },
  {
    publication: "Kinfolk",
    date: "Nov 2025",
    quote: "Considered objects for considered families.",
    action: "Read profile",
  },
];

export const readerLetters = [
  {
    quote: "Every product feels written, not assembled. My daughter asks for one more chapter instead of one more video.",
    author: "Maya, parent",
  },
  {
    quote: "Ola gives my father a gentle rhythm to the day without making him feel watched.",
    author: "Daniel, son and caregiver",
  },
  {
    quote: "The best part is that the story continues after the screen is put away.",
    author: "Rina, early reader",
  },
];

export const faqItems = [
  {
    question: "What is Lumiq Studio?",
    answer: "We design AI experiences at the meeting point of intelligent technology, storytelling and everyday care.",
  },
  {
    question: "Who is Lumiq for?",
    answer: "Lumiq is designed for children, adults and older family members, with different experiences for each stage of life.",
  },
  {
    question: "Where do you ship?",
    answer: "The current plan covers most countries in North America, Europe and East Asia, with additional regions to follow.",
  },
  {
    question: "How does the AI work?",
    answer: "AI helps narrate, personalize, remember and respond. It supports human connection; it is not intended to replace family, friendship or professional care.",
  },
  {
    question: "Is my data private?",
    answer: "Privacy and safety are part of the product design. Lumiq aims to store only what is needed, never sell personal data and provide offline modes wherever possible.",
  },
  {
    question: "Can I cancel a plan?",
    answer: "Yes. Plans can be changed or cancelled without a long-term contract or penalty.",
  },
];
