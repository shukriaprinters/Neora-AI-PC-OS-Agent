export interface RoadmapItem {
  id: string;
  category: 'vector' | 'typography' | 'canvas' | 'color' | 'export' | 'ai';
  featureName: string;
  featureNameBn: string;
  scaleMetric: string;
  scaleMetricBn: string;
  status: 'active' | 'in_development' | 'planned' | 'proposed';
  description: string;
  descriptionBn: string;
}

export const ROADMAP_CATEGORIES = [
  { id: 'all', label: 'All Scales / সকল ফিচার', labelBn: 'সব ফিচার' },
  { id: 'vector', label: 'Vector & Shapes', labelBn: 'ভেক্টর ও শেপস' },
  { id: 'typography', label: 'Pro Typography', labelBn: 'প্রো টাইপোগ্রাফি' },
  { id: 'canvas', label: 'Canvas & Layouts', labelBn: 'ক্যানভাস ও লেআউট' },
  { id: 'color', label: 'Color & Effects', labelBn: 'কালার ও ইফেক্টস' },
  { id: 'export', label: 'High-Res & Print', labelBn: 'প্রিন্ট ও এক্সপোর্ট' },
  { id: 'ai', label: 'AI Copilot Scales', labelBn: 'এআই কোপাইলট' }
];

export const ROADMAP_ITEMS: RoadmapItem[] = [
  // 1. Vector & Shapes
  {
    id: 'v_1',
    category: 'vector',
    featureName: 'SVG Bezier Vector Pen Tool',
    featureNameBn: 'এসভিজি বেজিয়ার ভেক্টর পেন টুল',
    scaleMetric: '0.01px subpixel precision bezier nodes',
    scaleMetricBn: '০.০১px সাবপিক্সেল নিখুঁত বেজিয়ার নোড',
    status: 'planned',
    description: 'Enables custom freehand vector drawing with anchor points directly on the canvas.',
    descriptionBn: 'ক্যানভাসে সরাসরি নোড পয়েন্ট দিয়ে নিখুঁত কাস্টম ভেক্টর ড্রয়িং করার সুবিধা।'
  },
  {
    id: 'v_2',
    category: 'vector',
    featureName: 'Multi-node Polygon Scale Generator',
    featureNameBn: 'মাল্টি-নোড বহুভুজ স্কেল জেনারেটর',
    scaleMetric: '3 to 64 vertex shape sliders',
    scaleMetricBn: '৩ থেকে ৬৪টি কোণ বিশিষ্ট শেপ স্লাইডার',
    status: 'active',
    description: 'Allows dynamically dragging sides to create stars, triangles, hexagons instantly.',
    descriptionBn: 'স্টার, ত্রিভুজ বা ষড়ভুজ তৈরির জন্য স্লাইডার দিয়ে কোণের সংখ্যা পরিবর্তন করুন।'
  },
  {
    id: 'v_3',
    category: 'vector',
    featureName: 'Pathfinder Boolean Union/Subtract',
    featureNameBn: 'পাথফাইন্ডার বুলিয়ান ইউনিয়ন/সাবট্র্যাক্ট',
    scaleMetric: '4 real-time shape operations',
    scaleMetricBn: '৪টি রিয়েল-টাইম শেপ অপারেশন',
    status: 'proposed',
    description: 'Combine or exclude overlapping shapes to build complex logos/icons easily.',
    descriptionBn: 'একাধিক ওভারল্যাপিং শেপ যুক্ত বা বিয়োগ করে কাস্টম লোগো তৈরি করুন।'
  },
  {
    id: 'v_4',
    category: 'vector',
    featureName: 'Dynamic Rounded Corner Scale',
    featureNameBn: 'ডাইনামিক রাউন্ডেড কর্নার স্কেল',
    scaleMetric: '0px to 250px independent radius',
    scaleMetricBn: '০px থেকে ২৫০px পর্যন্ত কর্নার ব্যাসার্ধ',
    status: 'active',
    description: 'Independently adjust corner borders of rectangular shapes or images with a precision scale slider.',
    descriptionBn: 'শেপ বা ছবির চার কোণার রাউন্ডনেস স্লাইডার দিয়ে নিখুঁতভাবে নিয়ন্ত্রণ করুন।'
  },

  // 2. Pro Typography
  {
    id: 't_1',
    category: 'typography',
    featureName: 'Bangla Unicode & ANSI Auto-Converter',
    featureNameBn: 'বাংলা ইউনিকোড ও আন্সি অটো-কনভার্টার',
    scaleMetric: 'Dual-encoding live interpreter',
    scaleMetricBn: 'দ্বৈত-কোডিং লাইভ কনভার্টার',
    status: 'active',
    description: 'Automatically detects and parses Bijoy Keyboard ANSI inputs to elegant web Unicode fonts.',
    descriptionBn: 'বিজয় কিবোর্ডের আন্সি বা ইউনিকোড লেখা অটো সনাক্ত করে সঠিক ফন্টে রূপান্তর করে।'
  },
  {
    id: 't_2',
    category: 'typography',
    featureName: 'Letter Spacing (Tracking) Scale Slider',
    featureNameBn: 'লেটার স্পেসিং (ট্র্যাকিং) স্কেল স্লাইডার',
    scaleMetric: '-5px to 30px micro-adjustments',
    scaleMetricBn: '-৫px থেকে ৩০px পর্যন্ত ট্র্যাকিং নিয়ন্ত্রণ',
    status: 'active',
    description: 'Increase or decrease horizontal space between characters for elegant titles.',
    descriptionBn: 'টাইটেল আকর্ষণীয় করতে অক্ষরের মধ্যবর্তী আনুভূমিক দূরত্ব নিখুঁতভাবে নির্ধারণ করুন।'
  },
  {
    id: 't_3',
    category: 'typography',
    featureName: 'Line Height (Leading) Multiple Controller',
    featureNameBn: 'লাইন হাইট (লিডিং) মাল্টিপল কন্ট্রোলার',
    scaleMetric: '0.8x to 3.5x line space multiplier',
    scaleMetricBn: '০.৮x থেকে ৩.৫x পর্যন্ত লাইনের দূরত্ব',
    status: 'active',
    description: 'Modify spacing between paragraphs and multiple text lines on posters.',
    descriptionBn: 'পোস্টারের একাধিক প্যারাগ্রাফ বা বড় লেখার লাইনগুলোর মধ্যবর্তী দূরত্ব সামঞ্জস্য করুন।'
  },
  {
    id: 't_4',
    category: 'typography',
    featureName: '3D Extruded Text & Perspective Depth Scale',
    featureNameBn: 'থ্রিডি এক্সট্রুডেড টেক্সট ও পার্সপেক্টিভ ডেপথ স্কেল',
    scaleMetric: '360° rotation with 100px shadow extrusion',
    scaleMetricBn: '৩৬০ ডিগ্রি রোটেশন ও ১০০px থ্রিডি গভীরতা',
    status: 'planned',
    description: 'Adds isometric rendering to Bangla fonts to create royal 3D typography panels.',
    descriptionBn: 'বাংলা ফন্টে আকর্ষণীয় থ্রিডি ইফেক্ট ও বাঁকানো রয়াল স্টাইল যুক্ত করার প্রো টুল।'
  },

  // 3. Canvas & Layouts
  {
    id: 'c_1',
    category: 'canvas',
    featureName: 'Canvas Scaling & Zoom Engine',
    featureNameBn: 'ক্যানভাস স্কেলিং ও জুম ইঞ্জিন',
    scaleMetric: '50% to 200% workspace viewport zoom',
    scaleMetricBn: '৫০% থেকে ২০০% ক্যানভাস জুম স্কেল',
    status: 'active',
    description: 'Enables zooming into canvas for detail adjustments or scaling down to view wide banners.',
    descriptionBn: 'ছোট এলিমেন্ট নিখুঁত করতে ক্যানভাস জুম করুন অথবা বড় ব্যানার এক নজরে দেখার জন্য স্কেল ডাউন করুন।'
  },
  {
    id: 'c_2',
    category: 'canvas',
    featureName: 'Smart Grid Guidelines & Ruler Scales',
    featureNameBn: 'স্মার্ট গ্রিড গাইডলাইনস ও রুলার স্কেল',
    scaleMetric: '6x6 Rule-of-Thirds overlay lines',
    scaleMetricBn: '৬x৬ রুল-অব-থার্ডস গ্রিড অ্যালাইনমেন্ট',
    status: 'active',
    description: 'Displays a high contrast alignment grid to keep text and logos perfectly symmetrical.',
    descriptionBn: 'ডিজাইনের লেখা ও ছবিগুলোকে একদম সমান লাইনে ও সমান্তরালে সাজানোর জন্য গ্রিডলাইন।'
  },
  {
    id: 'c_3',
    category: 'canvas',
    featureName: 'Bleed Safety Safe-Zones Overlay',
    featureNameBn: 'ব্লিড সেফটি সেফ-জোন ওভারলে',
    scaleMetric: '6% print margin offset boundaries',
    scaleMetricBn: '৬% প্রিন্টিং মার্জিন অফসেট বাউন্ডারি',
    status: 'active',
    description: 'Shows printable safe margins so designs do not get cut during industrial printing.',
    descriptionBn: 'প্রিন্ট করার সময় যেন গুরুত্বপূর্ণ ডিজাইন বা লেখা কেটে না যায়, তার জন্য মার্জিন নির্দেশক।'
  },
  {
    id: 'c_4',
    category: 'canvas',
    featureName: 'Interactive Outliner & Layer List',
    featureNameBn: 'ইন্টারেক্টিভ আউটলাইনার ও লেয়ার লিস্ট',
    scaleMetric: 'Unlimited nested layer hierarchy controls',
    scaleMetricBn: 'অসীম লেয়ার সাজানো ও ড্র্যাগ-ড্রপ কন্ট্রোল',
    status: 'active',
    description: 'Enables viewing all text, images, and shapes in a stack to lock, rename, or order easily.',
    descriptionBn: 'পোস্টারের সবগুলো লেখা, লোগো ও ছবির ব্যাকগ্রাউন্ড সিরিয়াল সহজেই সাজানোর লেয়ার ম্যানেজার।'
  },

  // 4. Color & Effects
  {
    id: 'e_1',
    category: 'color',
    featureName: 'Linear & Radial Gradient Stop Editor',
    featureNameBn: 'লিনিয়ার ও রেডিয়াল গ্রেডিয়েন্ট স্টপ এডিটর',
    scaleMetric: 'Unlimited stop markers with hex matching',
    scaleMetricBn: 'অসীম কালার মার্কার ও হেক্স কালার ম্যাচিং',
    status: 'active',
    description: 'Customize stunning backgrounds with multi-stop color gradients and direction angle scales.',
    descriptionBn: 'একাধিক রঙের মিশ্রণে রাজকীয় ব্যাকগ্রাউন্ড গ্রেডিয়েন্ট তৈরি এবং কোণ পরিবর্তন করার ক্ষমতা।'
  },
  {
    id: 'e_2',
    category: 'color',
    featureName: 'Color Contrast Analyzer & WCAG Scale',
    featureNameBn: 'কালার কনট্রাস্ট অ্যানালাইজার ও WCAG স্কেল',
    scaleMetric: 'AA / AAA rating live verification',
    scaleMetricBn: 'AA এবং AAA প্রিন্টিং মান লাইভ যাচাই',
    status: 'planned',
    description: 'Checks if text color has sufficient contrast over the background to ensure premium print legibility.',
    descriptionBn: 'ব্যাকগ্রাউন্ডের ওপর টেক্সট পরিষ্কার পড়া যাবে কিনা তা স্বয়ংক্রিয়ভাবে পরিমাপ করার সিস্টেম।'
  },
  {
    id: 'e_3',
    category: 'color',
    featureName: 'CSS Backdrop Filter Scale (Blur/Hue/Saturate)',
    featureNameBn: 'ব্যাকড্রপ ফিল্টার স্কেল (ব্লার/হিউ/স্যাচুরেট)',
    scaleMetric: '0px to 40px blur with 360° hue shift',
    scaleMetricBn: '০ থেকে ৪০px ব্লার ও ৩৬০ ডিগ্রি হিউ শিফট',
    status: 'active',
    description: 'Adjust elements depth using backdrop blurs and beautiful high-saturation overlays.',
    descriptionBn: 'ছবির ব্যাকগ্রাউন্ড ব্লার বা রঙের স্যাচুরেশন বাড়িয়ে আধুনিক সিনেমাটিক ফিল তৈরি করুন।'
  },

  // 5. High-Res & Print
  {
    id: 'p_1',
    category: 'export',
    featureName: '300 DPI Ultra HD Print Export Scale',
    featureNameBn: '৩০০ DPI আল্ট্রা এইচডি প্রিন্ট এক্সপোর্ট স্কেল',
    scaleMetric: '1x, 2x, 4x double-pixel PNG/PDF rendering',
    scaleMetricBn: '১x, ২x এবং ৪x গুণ পিক্সেল কোয়ালিটি রেন্ডার',
    status: 'active',
    description: 'Generates high-definition files up to 4x dimensions without any blur or pixel loss.',
    descriptionBn: 'বড় ব্যানার বা বিলবোর্ড প্রিন্ট করার জন্য ৪ গুণ শার্প আল্ট্রা এইচডি কোয়ালিটি ডাউনলোড করুন।'
  },
  {
    id: 'p_2',
    category: 'export',
    featureName: 'RGB to CMYK Print Ink Converter',
    featureNameBn: 'RGB থেকে CMYK প্রিন্ট কালি কনভার্টার',
    scaleMetric: 'Cyan-Magenta-Yellow-Black gamut matching',
    scaleMetricBn: 'ছাপার কালির নিখুঁত রূপান্তর রেশিও',
    status: 'proposed',
    description: 'Translates screen hex values into physical offset printing inks color coordinates.',
    descriptionBn: 'মনিটরের কালারকে সরাসরি প্রেসের প্রিন্টিং কালার বা কালির মোডে পরিবর্তন করার সুবিধা।'
  },

  // 6. AI Copilot Scales
  {
    id: 'a_1',
    category: 'ai',
    featureName: 'Collaborative Multi-AI Layout Planner',
    featureNameBn: 'মাল্টি-এআই লেআউট প্ল্যানার কোলাবোরেশন',
    scaleMetric: 'Coordinating ChatGPT, Midjourney & Canva systems',
    scaleMetricBn: '৩টি শীর্ষ এআই ইঞ্জিনের সমান্তরাল রেন্ডারিং',
    status: 'active',
    description: 'Orchestrates multi-agent pipelines to outline design plans and assemble elements in real time.',
    descriptionBn: 'চ্যাটজিপিটি, মিডজার্নি এবং ক্যানভা এআই যৌথভাবে কাজ করে আপনার পছন্দের ডিজাইন তৈরি করে।'
  },
  {
    id: 'a_2',
    category: 'ai',
    featureName: 'AI Context Prompt Tuning Scale',
    featureNameBn: 'এআই কন্টেক্সট প্রম্পট টিউনিং স্কেল',
    scaleMetric: 'Enhanced prompt engineering overlays',
    scaleMetricBn: 'উন্নত ডিজাইন প্রম্পট ওভারলে ফিল্টার',
    status: 'active',
    description: 'Enriches raw inputs into highly optimized art generative prompts for professional graphic backdrops.',
    descriptionBn: 'আপনার সাধারণ লেখাকে চমৎকার শৈল্পিক প্রম্পটে রূপান্তর করে দৃষ্টিনন্দন ইমেজ তৈরি করে।'
  }
];
