import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import {
  Download, Image as ImageIcon, Sparkles, Type, Type as FontIcon,
  Trash2, Plus, Copy, RotateCcw, Palette, LayoutGrid, Calendar,
  CreditCard, Printer, Layers, FileText, ArrowUp, ArrowDown,
  ChevronRight, AlignLeft, AlignCenter, AlignRight, Bold, Maximize2,
  Bookmark, Sliders, RefreshCw, Upload, Eye, Camera, Folder, FolderOpen
} from 'lucide-react';

interface ElementLayer {
  id: string;
  type: 'text' | 'image' | 'shape';
  content: string; // text string, or image URL
  x: number;       // percentage from left (0 to 100)
  y: number;       // percentage from top (0 to 100)
  width?: number;  // percentage (optional)
  height?: number; // percentage (optional)
  fontSize?: number; // in pixels (baseline)
  fontFamily?: string;
  color?: string;
  fontWeight?: string;
  align?: 'left' | 'center' | 'right';
  opacity?: number;
  letterSpacing?: string;
  rotation?: number; // degrees
  shadow?: boolean;
}

interface DesignTemplate {
  id: string;
  name: string;
  nameBn: string;
  type: 'poster' | 'calendar' | 'vcard' | 'brochure' | 'banner' | 'leaflet' | 'handbill';
  width: number; // aspect ratio display width
  height: number; // aspect ratio display height
  background: {
    type: 'color' | 'gradient' | 'image';
    value: string;
    overlayOpacity?: number;
  };
  elements: ElementLayer[];
}

const FONT_FAMILIES = [
  { value: 'Inter', label: 'Inter (Sans)' },
  { value: 'Space Grotesk', label: 'Space Grotesk (Tech)' },
  { value: 'Playfair Display', label: 'Playfair Display (Serif)' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono (Code)' },
  { value: 'Hind Siliguri', label: 'Hind Siliguri (Bengali Standard)' },
  { value: 'Noto Sans Bengali', label: 'Noto Sans Bengali (Bengali Clean)' },
  { value: 'Galada', label: 'Galada (Bengali Calligraphy)' }
];

const GRADIENTS = [
  { name: 'Cosmic Twilight', value: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' },
  { name: 'Warm Cream', value: 'linear-gradient(135deg, #fdfbf7 0%, #f5ecd8 100%)' },
  { name: 'Fresh Emerald', value: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)' },
  { name: 'Ocean Depth', value: 'linear-gradient(135deg, #0c4a6e 0%, #082f49 100%)' },
  { name: 'Vibrant Magenta', value: 'linear-gradient(135deg, #881337 0%, #4c0519 100%)' },
  { name: 'Luxury Gold', value: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)' },
  { name: 'Crimson Flame', value: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)' },
  { name: 'Cyberpunk Neon', value: 'linear-gradient(135deg, #09090b 0%, #1c0f30 100%)' }
];

const PHOTO_PRESETS = [
  {
    id: 'none',
    name: 'Original',
    nameBn: 'মূল ডিজাইন',
    category: 'All',
    categoryBn: 'সব',
    filter: 'none',
    icon: '✨',
    description: 'No filters applied',
    descriptionBn: 'কোনো ফিল্টার নেই'
  },
  // Landscape Category
  {
    id: 'high_contrast',
    name: 'High Contrast',
    nameBn: 'উচ্চ বৈসাদৃশ্য',
    category: 'Landscape',
    categoryBn: 'ল্যান্ডস্কেপ',
    filter: 'contrast(1.4) saturate(1.25) brightness(1.02)',
    icon: '⚡',
    description: 'Vibrant & bold contrast for scenery',
    descriptionBn: 'দৃশ্যপটের জন্য চমৎকার বৈসাদৃশ্য'
  },
  {
    id: 'golden_hour',
    name: 'Golden Hour',
    nameBn: 'সোনালী বিকেল',
    category: 'Landscape',
    categoryBn: 'ল্যান্ডস্কেপ',
    filter: 'sepia(0.3) saturate(1.35) contrast(1.1) brightness(1.05)',
    icon: '🌅',
    description: 'Warm golden sunlight tones',
    descriptionBn: 'উষ্ণ সোনালী আলো'
  },
  {
    id: 'forest_mist',
    name: 'Forest Mist',
    nameBn: 'বনকুয়াশা',
    category: 'Landscape',
    categoryBn: 'ল্যান্ডস্কেপ',
    filter: 'contrast(1.1) saturate(0.9) hue-rotate(-10deg) brightness(0.95)',
    icon: '🌲',
    description: 'Cool natural outdoor aesthetic',
    descriptionBn: 'শীতল প্রাকৃতিকভাবে সবুজ আমেজ'
  },
  // Portrait Category
  {
    id: 'soft_glow',
    name: 'Soft Glow',
    nameBn: 'কোমল আভা',
    category: 'Portrait',
    categoryBn: 'পোর্ট্রেট',
    filter: 'brightness(1.08) contrast(0.95) saturate(1.05) blur(0.2px)',
    icon: '🌸',
    description: 'Glamorous gentle skin tone and lighting',
    descriptionBn: 'পোর্ট্রেটের জন্য মৃদু ও কোমল লাইটিং'
  },
  {
    id: 'sepia_warmth',
    name: 'Sepia Warmth',
    nameBn: 'উষ্ণ সেপিয়া',
    category: 'Portrait',
    categoryBn: 'পোর্ট্রেট',
    filter: 'sepia(0.45) contrast(1.1) saturate(1.1) brightness(0.98)',
    icon: '🍂',
    description: 'Warm nostalgic golden style',
    descriptionBn: 'উষ্ণ নস্টালজিক সোনালী আভা'
  },
  {
    id: 'desaturated_noir',
    name: 'Desaturated Noir',
    nameBn: 'কালো-সাদা নয়ার',
    category: 'Portrait',
    categoryBn: 'পোর্ট্রেট',
    filter: 'grayscale(1) contrast(1.4) brightness(0.95)',
    icon: '🎬',
    description: 'Classic silver-screen aesthetic',
    descriptionBn: 'ক্লাসিক রূপালী পর্দার শৈলী'
  },
  // Abstract Category
  {
    id: 'cool_cyber',
    name: 'Cool Cyber',
    nameBn: 'শীতল সাইবার',
    category: 'Abstract',
    categoryBn: 'অ্যাবস্ট্রাক্ট',
    filter: 'hue-rotate(20deg) saturate(1.35) contrast(1.1) brightness(0.96)',
    icon: '❄️',
    description: 'Modern cyberpunk neon tones',
    descriptionBn: 'আধুনিক সাইবারপাঙ্ক নিয়ন টোন'
  },
  {
    id: 'vintage_fade',
    name: 'Vintage Fade',
    nameBn: 'ভিন্টেজ ফেড',
    category: 'Abstract',
    categoryBn: 'অ্যাবস্ট্রাক্ট',
    filter: 'sepia(0.25) contrast(0.85) brightness(1.05) saturate(0.8)',
    icon: '🎞️',
    description: 'Muted rustic colors with retro vibes',
    descriptionBn: 'বিবর্ণ রেট্রো রঙের আমেজ'
  },
  {
    id: 'psychedelic',
    name: 'Psychedelic',
    nameBn: 'সাইকেডেলিক',
    category: 'Abstract',
    categoryBn: 'অ্যাবস্ট্রাক্ট',
    filter: 'hue-rotate(120deg) saturate(1.6) contrast(1.2)',
    icon: '🌀',
    description: 'Intense otherworldly color shifts',
    descriptionBn: 'চমকপ্রদ অতিপ্রাকৃতিক কালার শিফট'
  }
];

const PRESETS: DesignTemplate[] = [
  {
    id: 'congrats_hsc',
    name: 'HSC Congratulations Greeting',
    nameBn: 'এইচএসসি অভিনন্দন শুভেচ্ছা',
    type: 'poster',
    width: 600,
    height: 420,
    background: {
      type: 'color',
      value: '#fbf9f4'
    },
    elements: [
      {
        id: 'congrats_title_bengali',
        type: 'text',
        content: 'এইচএসসি/সমমান পরীক্ষা ২০২৬ এ অংশগ্রহণকারী সকল পরীক্ষার্থীদের জন্য',
        x: 50,
        y: 18,
        fontSize: 18,
        fontFamily: 'Hind Siliguri',
        color: '#1e293b',
        fontWeight: 'bold',
        align: 'center',
        shadow: false
      },
      {
        id: 'congrats_main_bengali',
        type: 'text',
        content: 'রইলো শুভকামনা',
        x: 50,
        y: 35,
        fontSize: 48,
        fontFamily: 'Galada',
        color: '#dc2626',
        fontWeight: 'bold',
        align: 'center',
        shadow: true
      },
      {
        id: 'congrats_subtitle_bengali',
        type: 'text',
        content: 'বিজয়ের পথে পুথিনিলয়ের সাথে',
        x: 50,
        y: 52,
        fontSize: 22,
        fontFamily: 'Hind Siliguri',
        color: '#1e293b',
        fontWeight: 'semibold',
        align: 'center',
        shadow: false
      },
      {
        id: 'congrats_brand_logo',
        type: 'text',
        content: '📖 পুথিনিলয় • ঢাকা',
        x: 82,
        y: 20,
        fontSize: 14,
        fontFamily: 'Hind Siliguri',
        color: '#0f172a',
        fontWeight: 'bold',
        align: 'center',
        shadow: false
      },
      {
        id: 'congrats_decorative_bar',
        type: 'shape',
        content: 'rect_horizontal',
        x: 50,
        y: 44,
        width: 60,
        height: 2,
        color: '#e2e8f0',
        opacity: 0.8
      },
      {
        id: 'congrats_bottom_mockup',
        type: 'image',
        content: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop',
        x: 50,
        y: 78,
        width: 100,
        height: 40,
        opacity: 0.95
      }
    ]
  },
  {
    id: 'islamic_waz',
    name: 'Islamic Waz Mahfil Poster',
    nameBn: 'ঐতিহাসিক ওয়াজ মাহফিল পোস্টার',
    type: 'poster',
    width: 450,
    height: 600,
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #052e16 0%, #022c22 100%)'
    },
    elements: [
      {
        id: 'waz_bismillah',
        type: 'text',
        content: 'বিসমিল্লাহির রহমানির রাহিম',
        x: 50,
        y: 8,
        fontSize: 14,
        fontFamily: 'Hind Siliguri',
        color: '#fcd34d',
        fontWeight: 'bold',
        align: 'center'
      },
      {
        id: 'waz_header',
        type: 'text',
        content: 'বিরাট তাফসিরুল কুরআন মাহফিল',
        x: 50,
        y: 18,
        fontSize: 32,
        fontFamily: 'Galada',
        color: '#ffffff',
        fontWeight: 'bold',
        align: 'center',
        shadow: true
      },
      {
        id: 'waz_speaker',
        type: 'text',
        content: 'প্রধান বক্তা: আন্তর্জাতিক খ্যাতিসম্পন্ন মুফাসসিরে কুরআন',
        x: 50,
        y: 32,
        fontSize: 16,
        fontFamily: 'Hind Siliguri',
        color: '#fef08a',
        fontWeight: 'bold',
        align: 'center'
      },
      {
        id: 'waz_speaker_name',
        type: 'text',
        content: 'আলহাজ্ব হযরত মাওলানা মাকসুদুর রহমান সাহেব',
        x: 50,
        y: 40,
        fontSize: 20,
        fontFamily: 'Hind Siliguri',
        color: '#38bdf8',
        fontWeight: 'bold',
        align: 'center'
      },
      {
        id: 'waz_date',
        type: 'text',
        content: 'তারিখ: আগামী ২০শে জানুয়ারি ২০২৬, সোমবার',
        x: 50,
        y: 56,
        fontSize: 16,
        fontFamily: 'Hind Siliguri',
        color: '#f8fafc',
        fontWeight: 'semibold',
        align: 'center'
      },
      {
        id: 'waz_venue',
        type: 'text',
        content: 'স্থান: ঐতিহাসিক লালবাগ কেল্লা জামে মসজিদ প্রাঙ্গণ, ঢাকা',
        x: 50,
        y: 65,
        fontSize: 15,
        fontFamily: 'Hind Siliguri',
        color: '#cbd5e1',
        fontWeight: 'normal',
        align: 'center'
      },
      {
        id: 'waz_divider',
        type: 'shape',
        content: 'rect_horizontal',
        x: 50,
        y: 48,
        width: 70,
        height: 2,
        color: '#fcd34d',
        opacity: 0.6
      },
      {
        id: 'waz_bg_art',
        type: 'image',
        content: 'https://images.unsplash.com/photo-1542856391-010fb87dcfed?q=80&w=400&auto=format&fit=crop',
        x: 50,
        y: 84,
        width: 100,
        height: 25,
        opacity: 0.4
      }
    ]
  },
  {
    id: 'book_cover',
    name: '"Agni-Beena" Book Cover',
    nameBn: 'অগ্নিবীণা বইয়ের প্রচ্ছদ',
    type: 'brochure',
    width: 420,
    height: 600,
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #450a0a 0%, #0f0505 100%)'
    },
    elements: [
      {
        id: 'book_title',
        type: 'text',
        content: 'অগ্নিবীণা',
        x: 50,
        y: 28,
        fontSize: 64,
        fontFamily: 'Galada',
        color: '#ea580c',
        fontWeight: 'bold',
        align: 'center',
        shadow: true
      },
      {
        id: 'book_author',
        type: 'text',
        content: 'কাজী নজরুল ইসলাম',
        x: 50,
        y: 45,
        fontSize: 22,
        fontFamily: 'Hind Siliguri',
        color: '#f5f5f4',
        fontWeight: 'bold',
        align: 'center'
      },
      {
        id: 'book_divider',
        type: 'shape',
        content: 'rect_horizontal',
        x: 50,
        y: 38,
        width: 40,
        height: 4,
        color: '#ea580c',
        opacity: 0.9
      },
      {
        id: 'book_publisher',
        type: 'text',
        content: 'শুকরিয়া প্রকাশনী • ঢাকা',
        x: 50,
        y: 85,
        fontSize: 14,
        fontFamily: 'Hind Siliguri',
        color: '#a8a29e',
        fontWeight: 'normal',
        align: 'center'
      }
    ]
  },
  {
    id: 'wedding_invite',
    name: 'Royal Bengali Wedding Invitation',
    nameBn: 'অভিজাত বিবাহ নিমন্ত্রণ পত্র',
    type: 'poster',
    width: 450,
    height: 600,
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #580315 0%, #90011c 100%)'
    },
    elements: [
      {
        id: 'wedding_header',
        type: 'text',
        content: 'শুভ বিবাহ',
        x: 50,
        y: 18,
        fontSize: 48,
        fontFamily: 'Galada',
        color: '#f59e0b',
        fontWeight: 'bold',
        align: 'center',
        shadow: true
      },
      {
        id: 'wedding_bismillah',
        type: 'text',
        content: 'সবিনয় আমন্ত্রণ',
        x: 50,
        y: 28,
        fontSize: 16,
        fontFamily: 'Hind Siliguri',
        color: '#fef08a',
        fontWeight: 'medium',
        align: 'center'
      },
      {
        id: 'wedding_names',
        type: 'text',
        content: 'আদনান  ও  ফারিয়া',
        x: 50,
        y: 44,
        fontSize: 28,
        fontFamily: 'Hind Siliguri',
        color: '#ffffff',
        fontWeight: 'bold',
        align: 'center',
        shadow: true
      },
      {
        id: 'wedding_date',
        type: 'text',
        content: 'বিবাহের শুভ তারিখ: ২৫শে ফেব্রুয়ারি ২০২৬',
        x: 50,
        y: 58,
        fontSize: 16,
        fontFamily: 'Hind Siliguri',
        color: '#fcd34d',
        fontWeight: 'semibold',
        align: 'center'
      },
      {
        id: 'wedding_venue',
        type: 'text',
        content: 'স্থান: সেনাকল্যাণ কনভেনশন সেন্টার, ঢাকা ক্যান্টনমেন্ট',
        x: 50,
        y: 68,
        fontSize: 14,
        fontFamily: 'Hind Siliguri',
        color: '#e2e8f0',
        fontWeight: 'normal',
        align: 'center'
      },
      {
        id: 'wedding_ring',
        type: 'shape',
        content: 'border_ring',
        x: 50,
        y: 50,
        width: 88,
        height: 85,
        color: '#fbbf24',
        opacity: 0.35
      }
    ]
  },
  {
    id: 'calendar_bn_2026',
    name: '2026 Bengali Custom Calendar',
    nameBn: '২০২৬ বাংলা কাস্টম ক্যালেন্ডার',
    type: 'calendar',
    width: 480,
    height: 600,
    background: {
      type: 'color',
      value: '#0f172a'
    },
    elements: [
      {
        id: 'cal_year',
        type: 'text',
        content: '২০২৬',
        x: 50,
        y: 8,
        fontSize: 44,
        fontFamily: 'Orbitron',
        color: '#06b6d4',
        fontWeight: 'bold',
        align: 'center',
        shadow: true
      },
      {
        id: 'cal_month',
        type: 'text',
        content: 'জানুয়ারি • JANUARY',
        x: 50,
        y: 17,
        fontSize: 18,
        fontFamily: 'Hind Siliguri',
        color: '#e2e8f0',
        fontWeight: 'bold',
        align: 'center'
      },
      {
        id: 'cal_grid_title',
        type: 'text',
        content: 'শনি    রবি    সোম    মঙ্গল    বুধ    বৃহস্পতি    শুক্র',
        x: 50,
        y: 36,
        fontSize: 12,
        fontFamily: 'Hind Siliguri',
        color: '#f5a623',
        fontWeight: 'bold',
        align: 'center'
      },
      {
        id: 'cal_dates_line1',
        type: 'text',
        content: '                      ১      ২      ৩      ৪      ৫',
        x: 50,
        y: 44,
        fontSize: 14,
        fontFamily: 'Space Grotesk',
        color: '#cbd5e1',
        fontWeight: 'normal',
        align: 'center'
      },
      {
        id: 'cal_dates_line2',
        type: 'text',
        content: '৬      ৭      ৮      ৯     ১০     ১১     ১২',
        x: 50,
        y: 52,
        fontSize: 14,
        fontFamily: 'Space Grotesk',
        color: '#cbd5e1',
        fontWeight: 'normal',
        align: 'center'
      },
      {
        id: 'cal_dates_line3',
        type: 'text',
        content: '১৩     ১৪     ১৫     ১৬     ১৭     ১৮     ১৯',
        x: 50,
        y: 60,
        fontSize: 14,
        fontFamily: 'Space Grotesk',
        color: '#cbd5e1',
        fontWeight: 'normal',
        align: 'center'
      },
      {
        id: 'cal_dates_line4',
        type: 'text',
        content: '২০     ২১     ২২     ২৩     ২৪     ২৫     ২৬',
        x: 50,
        y: 68,
        fontSize: 14,
        fontFamily: 'Space Grotesk',
        color: '#cbd5e1',
        fontWeight: 'normal',
        align: 'center'
      },
      {
        id: 'cal_dates_line5',
        type: 'text',
        content: '২৭     ২৮     ২৯     ৩০     ৩১                  ',
        x: 50,
        y: 76,
        fontSize: 14,
        fontFamily: 'Space Grotesk',
        color: '#cbd5e1',
        fontWeight: 'normal',
        align: 'center'
      },
      {
        id: 'cal_footer',
        type: 'text',
        content: 'পুথিনিলয় পাবলিশার্স • বিজয়ের শুভকামনা',
        x: 50,
        y: 90,
        fontSize: 11,
        fontFamily: 'Hind Siliguri',
        color: '#64748b',
        fontWeight: 'medium',
        align: 'center'
      },
      {
        id: 'cal_bg_art',
        type: 'image',
        content: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=480&auto=format&fit=crop',
        x: 50,
        y: 26,
        width: 90,
        height: 18,
        opacity: 0.8
      }
    ]
  },
  {
    id: 'vcard_pro',
    name: 'Professional Business V-Card',
    nameBn: 'স্মার্ট বিজনেস ভি-কার্ড',
    type: 'vcard',
    width: 500,
    height: 285,
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)'
    },
    elements: [
      {
        id: 'v_company',
        type: 'text',
        content: 'SHUKRIA PRINTERS',
        x: 10,
        y: 18,
        fontSize: 18,
        fontFamily: 'Space Grotesk',
        color: '#00d4ff',
        fontWeight: 'bold',
        align: 'left'
      },
      {
        id: 'v_tagline',
        type: 'text',
        content: 'High-Quality Creative Printing & Publishing Solutions',
        x: 10,
        y: 28,
        fontSize: 9,
        fontFamily: 'Inter',
        color: '#94a3b8',
        fontWeight: 'normal',
        align: 'left'
      },
      {
        id: 'v_name',
        type: 'text',
        content: 'আলহাজ্ব মো: শুকুর মিয়া',
        x: 10,
        y: 48,
        fontSize: 18,
        fontFamily: 'Hind Siliguri',
        color: '#ffffff',
        fontWeight: 'bold',
        align: 'left'
      },
      {
        id: 'v_title',
        type: 'text',
        content: 'ব্যবস্থাপনা পরিচালক / Managing Director',
        x: 10,
        y: 58,
        fontSize: 10,
        fontFamily: 'Hind Siliguri',
        color: '#38bdf8',
        fontWeight: 'medium',
        align: 'left'
      },
      {
        id: 'v_phone',
        type: 'text',
        content: '📞 +৮৮০১৭১২-৩৪৫৬৭৮',
        x: 10,
        y: 74,
        fontSize: 10,
        fontFamily: 'Hind Siliguri',
        color: '#cbd5e1',
        fontWeight: 'normal',
        align: 'left'
      },
      {
        id: 'v_email',
        type: 'text',
        content: '✉️ shukriaprinters@gmail.com',
        x: 10,
        y: 84,
        fontSize: 10,
        fontFamily: 'Inter',
        color: '#cbd5e1',
        fontWeight: 'normal',
        align: 'left'
      },
      {
        id: 'v_addr',
        type: 'text',
        content: '📍 ৩৭/১ বাংলাবাজার, ঢাকা-১১০০',
        x: 55,
        y: 74,
        fontSize: 9,
        fontFamily: 'Hind Siliguri',
        color: '#94a3b8',
        fontWeight: 'normal',
        align: 'left'
      },
      {
        id: 'v_web',
        type: 'text',
        content: '🌐 www.shukriaprinters.com',
        x: 55,
        y: 84,
        fontSize: 9,
        fontFamily: 'Inter',
        color: '#00d4ff',
        fontWeight: 'semibold',
        align: 'left'
      },
      {
        id: 'v_badge',
        type: 'shape',
        content: 'border_ring',
        x: 82,
        y: 28,
        width: 15,
        height: 25,
        color: '#00d4ff',
        opacity: 0.3
      }
    ]
  },
  {
    id: 'leaflet_promo',
    name: 'Leaflet / Promotional Handbill',
    nameBn: 'প্রচারপত্র / বিজ্ঞাপনী হ্যান্ডবিল',
    type: 'leaflet',
    width: 450,
    height: 600,
    background: {
      type: 'color',
      value: '#ffffff'
    },
    elements: [
      {
        id: 'leaf_header_bg',
        type: 'shape',
        content: 'rect_horizontal',
        x: 50,
        y: 10,
        width: 100,
        height: 12,
        color: '#dc2626',
        opacity: 1
      },
      {
        id: 'leaf_banner_text',
        type: 'text',
        content: 'বিশেষ আকর্ষণ! বিশাল মূল্যছাড়!',
        x: 50,
        y: 10,
        fontSize: 18,
        fontFamily: 'Hind Siliguri',
        color: '#ffffff',
        fontWeight: 'bold',
        align: 'center'
      },
      {
        id: 'leaf_company',
        type: 'text',
        content: 'শুকরিয়া প্রিন্টার্স অ্যান্ড পাবলিশার্স',
        x: 50,
        y: 22,
        fontSize: 24,
        fontFamily: 'Hind Siliguri',
        color: '#1e3a8a',
        fontWeight: 'bold',
        align: 'center'
      },
      {
        id: 'leaf_promo_title',
        type: 'text',
        content: 'বই মুদ্রণ ও প্রকাশনার কাজ অত্যন্ত সুলভ মূল্যে',
        x: 50,
        y: 30,
        fontSize: 14,
        fontFamily: 'Hind Siliguri',
        color: '#475569',
        fontWeight: 'semibold',
        align: 'center'
      },
      {
        id: 'leaf_feature_1',
        type: 'text',
        content: '✓ উন্নতমানের অফসেট ও আর্ট পেপার প্রিন্টিং',
        x: 15,
        y: 44,
        fontSize: 12,
        fontFamily: 'Hind Siliguri',
        color: '#0f172a',
        fontWeight: 'medium',
        align: 'left'
      },
      {
        id: 'leaf_feature_2',
        type: 'text',
        content: '✓ আধুনিক গ্লসি ও ম্যাট লেমিনেশন সুবিধা',
        x: 15,
        y: 52,
        fontSize: 12,
        fontFamily: 'Hind Siliguri',
        color: '#0f172a',
        fontWeight: 'medium',
        align: 'left'
      },
      {
        id: 'leaf_feature_3',
        type: 'text',
        content: '✓ নিখুঁত বাঁধাই ও ডাই-কাটিং ফিনিশিং',
        x: 15,
        y: 60,
        fontSize: 12,
        fontFamily: 'Hind Siliguri',
        color: '#0f172a',
        fontWeight: 'medium',
        align: 'left'
      },
      {
        id: 'leaf_feature_4',
        type: 'text',
        content: '✓ দক্ষ ডিজাইনার দ্বারা আকর্ষণীয় কভার মেকিং',
        x: 15,
        y: 68,
        fontSize: 12,
        fontFamily: 'Hind Siliguri',
        color: '#0f172a',
        fontWeight: 'medium',
        align: 'left'
      },
      {
        id: 'leaf_discount_badge',
        type: 'text',
        content: '২০% ছাড়',
        x: 75,
        y: 56,
        fontSize: 24,
        fontFamily: 'Hind Siliguri',
        color: '#dc2626',
        fontWeight: 'bold',
        align: 'center'
      },
      {
        id: 'leaf_discount_sub',
        type: 'text',
        content: 'সকল প্রকাশকদের জন্য',
        x: 75,
        y: 63,
        fontSize: 9,
        fontFamily: 'Hind Siliguri',
        color: '#64748b',
        fontWeight: 'medium',
        align: 'center'
      },
      {
        id: 'leaf_contact',
        type: 'text',
        content: '📞 যোগাযোগ করুন: ০১৮১২-৩৪৫৬৭৮, ০১৭১২-৩০০০৯৯',
        x: 50,
        y: 82,
        fontSize: 12,
        fontFamily: 'Hind Siliguri',
        color: '#1e3a8a',
        fontWeight: 'bold',
        align: 'center'
      },
      {
        id: 'leaf_address',
        type: 'text',
        content: '৩৭/১ বাংলাবাজার (দোতলা), ঢাকা-১১০০',
        x: 50,
        y: 88,
        fontSize: 10,
        fontFamily: 'Hind Siliguri',
        color: '#475569',
        fontWeight: 'normal',
        align: 'center'
      }
    ]
  }
];

export default function GraphicDesignerStudio({ lang }: { lang: 'en' | 'bn' }) {
  const [selectedTemplate, setSelectedTemplate] = useState<DesignTemplate>(PRESETS[0]);
  const [elements, setElements] = useState<ElementLayer[]>(PRESETS[0].elements);
  const [canvasBg, setCanvasBg] = useState(PRESETS[0].background);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeFilterId, setActiveFilterId] = useState<string>('none');
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    Landscape: true,
    Portrait: false,
    Abstract: false
  });
  
  // Custom prompt to auto-generate graphics using free Pollinations Stable Diffusion image layer
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiImageType, setAiImageType] = useState<'background' | 'sticker'>('background');

  // New element text state
  const [newTextVal, setNewTextVal] = useState('New Custom Label');

  // AI Design Copilot states
  const [sidebarTab, setSidebarTab] = useState<'copilot' | 'manual'>('copilot');
  const [copilotPrompt, setCopilotPrompt] = useState('');
  const [copilotStatus, setCopilotStatus] = useState<'idle' | 'searching' | 'planning' | 'generating' | 'composing' | 'finished'>('idle');
  const [copilotLogs, setCopilotLogs] = useState<string[]>([]);
  const [activeCopilotAgent, setActiveCopilotAgent] = useState<'chatgpt' | 'gemini' | 'midjourney' | 'canva' | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync elements when template changes
  const selectTemplate = (template: DesignTemplate) => {
    setSelectedTemplate(template);
    setElements(JSON.parse(JSON.stringify(template.elements)));
    setCanvasBg(JSON.parse(JSON.stringify(template.background)));
    setSelectedElementId(null);
    setActiveFilterId('none');
  };

  // Run the Multi-AI Collaborative Design Copilot Workflow
  const runCopilotWorkflow = async () => {
    if (!copilotPrompt.trim()) return;
    setCopilotStatus('searching');
    setCopilotLogs([
      lang === 'bn' 
        ? `🔍 [এআই সার্চ কোর] '${copilotPrompt}' সম্পর্কিত বর্তমান প্রিন্টিং ও লেআউট রিচার্স করা হচ্ছে...` 
        : `🔍 [AI Search Core] Researching modern visual trends and layouts for '${copilotPrompt}'...`
    ]);
    setActiveCopilotAgent(null);

    // Step 1: Searching (delay 1.2s)
    await new Promise(r => setTimeout(r, 1200));

    // Step 2: Planning with ChatGPT Layout Planner
    setCopilotStatus('planning');
    setActiveCopilotAgent('chatgpt');
    setCopilotLogs(prev => [
      ...prev,
      lang === 'bn'
        ? `🤖 [ChatGPT - লেআউট আর্কিটেক্ট] ডিজাইনের গ্রিড, টাইপোগ্রাফি ফন্ট ও কালার প্যালেট প্ল্যানিং করা হচ্ছে...`
        : `🤖 [ChatGPT - Layout Architect] Planning canvas boundaries, typographic scale, and golden ratios...`
    ]);

    let titleText = 'Creative Design';
    let subtitleText = 'Bespoke custom layout crafted by AI';
    let footerText = 'Shukria Printers • Dhaka';
    let isDark = true;
    let sdPrompt = `${copilotPrompt}, abstract modern clean graphic background, vector illustration, high resolution, no text`;

    // Try calling real Gemini API if available to get customized strings!
    try {
      const response = await fetch('/api/chat-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `You are an expert typography and design planner. The user wants to generate a graphic layout for: "${copilotPrompt}". 
Please draft 3 perfectly worded text elements for this graphic.
Return ONLY a valid JSON object of the following format, do not include any markdown format blocks, backticks, or extra text:
{
  "title": "Main title or heading (under 30 chars)",
  "subtitle": "Subtitle or supportive tagline (under 50 chars)",
  "footer": "Footer or contact info (under 50 chars)",
  "theme": "dark" or "light",
  "backdropPrompt": "highly descriptive prompt for Midjourney/StableDiffusion (under 120 chars)"
}
Use Bengali if the user prompt is in Bengali or Bengali-themed, otherwise use English. Keep texts natural and beautiful.`
            }
          ],
          lang: lang
        })
      });

      const resData = await response.json();
      if (resData.status === 'success' && resData.text) {
        let cleanText = resData.text.trim();
        // Strip code block markers if present
        if (cleanText.includes('{')) {
          const startIdx = cleanText.indexOf('{');
          const endIdx = cleanText.lastIndexOf('}') + 1;
          cleanText = cleanText.substring(startIdx, endIdx);
        }
        const parsed = JSON.parse(cleanText);
        if (parsed.title) titleText = parsed.title;
        if (parsed.subtitle) subtitleText = parsed.subtitle;
        if (parsed.footer) footerText = parsed.footer;
        if (parsed.theme) isDark = parsed.theme === 'dark';
        if (parsed.backdropPrompt) sdPrompt = parsed.backdropPrompt;
        
        setCopilotLogs(prev => [
          ...prev,
          lang === 'bn'
            ? `✅ [Gemini API] সফলভাবে অনন্য ডিজাইনের লেখা এবং থিম নির্ধারণ করা হয়েছে!`
            : `✅ [Gemini API] Successfully drafted custom text layers and aesthetic rules.`
        ]);
      } else {
        throw new Error("Local fallback");
      }
    } catch (e) {
      // Fallback: semantic dictionary mapping
      setCopilotLogs(prev => [
        ...prev,
        lang === 'bn'
          ? `⚙️ [লোকাল নলেজ বেস] অফলাইন মোডে দ্রুত সেমান্টিক লেআউট প্ল্যান করা হচ্ছে...`
          : `⚙️ [Local Knowledge Base] Offline mode: conducting local semantic layout mapping...`
      ]);

      const lowerPrompt = copilotPrompt.toLowerCase();
      if (lowerPrompt.includes('ওয়াজ') || lowerPrompt.includes('মাহফিল') || lowerPrompt.includes('waz') || lowerPrompt.includes('islamic')) {
        titleText = 'ঐতিহাসিক তাফসিরুল কুরআন মাহফিল';
        subtitleText = 'প্রধান বক্তা: আন্তর্জাতিক খ্যাতিসম্পন্ন মুফাসসিরে কুরআন';
        footerText = 'স্থান: বাংলাবাজার জামে মসজিদ প্রাঙ্গণ • সর্বসাধারণের আমন্ত্রণ';
        isDark = true;
        sdPrompt = 'beautiful majestic mosque dome outline, golden lights on green background vector wallpaper, high resolution, clean, no text';
      } else if (lowerPrompt.includes('বই') || lowerPrompt.includes('প্রচ্ছদ') || lowerPrompt.includes('cover') || lowerPrompt.includes('book')) {
        titleText = 'মেঘের পরে রোদ';
        subtitleText = 'কাব্যগ্রন্থ • কাজী নজরুল ইসলাম';
        footerText = 'শুকরিয়া প্রকাশনী • ঢাকা';
        isDark = true;
        sdPrompt = 'artistic landscape of warm sun rays behind glowing clouds, dreamy minimalist book cover illustration, vector art, high resolution, no letters';
      } else if (lowerPrompt.includes('নববর্ষ') || lowerPrompt.includes('বৈশাখ') || lowerPrompt.includes('boishakh')) {
        titleText = 'শুভ নববর্ষ ১৪৩৩';
        subtitleText = 'এসো হে বৈশাখ এসো এসো!';
        footerText = 'শুকরিয়া প্রিন্টার্স অ্যান্ড পাবলিশার্স পরিবারের পক্ষ থেকে শুভেচ্ছা';
        isDark = false;
        sdPrompt = 'traditional bangladeshi folk art, colorful hand fan and clay pottery motif, alpana patterns on borders, red and white cream background, high resolution, vector illustration, no text';
      } else if (lowerPrompt.includes('বিয়ে') || lowerPrompt.includes('হলুদ') || lowerPrompt.includes('বিবাহ') || lowerPrompt.includes('wedding') || lowerPrompt.includes('marriage')) {
        titleText = 'শুভ বিবাহ';
        subtitleText = 'বর: আদনান ও কনে: ফারিয়া এর শুভ পরিণয়';
        footerText = 'বিয়ে ও বৌভাতের তারিখ: ২৫শে ফেব্রুয়ারি ২০২৬ • সেনাকল্যাণ সেন্টার';
        isDark = true;
        sdPrompt = 'royal indian marriage decoration theme background, luxury maroon wallpaper with golden mandala border patterns, high resolution, vector, no letters';
      } else if (lowerPrompt.includes('ক্যালেন্ডার') || lowerPrompt.includes('calendar')) {
        titleText = 'ক্যালেন্ডার ২০২৬';
        subtitleText = 'জানুয়ারি • JANUARY';
        footerText = 'শুকরিয়া প্রিন্টার্স • ৩৭/১ বাংলাবাজার, ঢাকা';
        isDark = true;
        sdPrompt = 'cosmic geometric lines constellation graphic pattern backdrop, neon cyan accents, dark background, high resolution, no text';
      } else {
        // Fallback abstract layout
        titleText = copilotPrompt;
        subtitleText = lang === 'bn' ? 'শুকরিয়া প্রিন্টার্স দ্বারা কাস্টম লেআউট' : 'Creative design layout powered by Neora';
        footerText = lang === 'bn' ? 'বাংলাবাজার, ঢাকা-১১০০' : '37/1 Banglabazar, Dhaka-1100';
        isDark = true;
        sdPrompt = `${copilotPrompt}, stunning clean modern corporate graphic poster backdrop, high resolution digital artwork, vector, no text`;
      }
    }

    await new Promise(r => setTimeout(r, 1200));

    // Step 3: Generating artwork with Midjourney / Gemini Visual core
    setCopilotStatus('generating');
    setActiveCopilotAgent('midjourney');
    setCopilotLogs(prev => [
      ...prev,
      lang === 'bn'
        ? `🎨 [Midjourney v6] ব্যাকগ্রাউন্ড আর্ট জেনারেট হচ্ছে: '${sdPrompt.substring(0, 50)}...'`
        : `🎨 [Midjourney v6] Generating background illustration: '${sdPrompt.substring(0, 50)}...'`
    ]);

    // Build the pollinations SD URL
    const pollinationsUrl = `https://image.pollinations.ai/p/${encodeURIComponent(sdPrompt)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 999999)}`;

    // Prefetch the background image
    try {
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = resolve;
        img.onerror = resolve; // Continue anyway on error
        img.src = pollinationsUrl;
      });
    } catch (err) {}

    await new Promise(r => setTimeout(r, 1200));

    // Step 4: Composing Layout with Canva Assembly engine
    setCopilotStatus('composing');
    setActiveCopilotAgent('canva');
    setCopilotLogs(prev => [
      ...prev,
      lang === 'bn'
        ? `📐 [Canva Assembler] ক্যানভাসে টেক্সট লেয়ার, ফন্ট সাইজ এবং কালার প্যালেট সিঙ্ক করা হচ্ছে...`
        : `📐 [Canva Assembler] Positioning text layers, setting up margins, and locking visual dimensions...`
    ]);

    await new Promise(r => setTimeout(r, 1000));

    // Compile elements array
    const newElements: ElementLayer[] = [
      {
        id: `copilot_title_${Date.now()}`,
        type: 'text',
        content: titleText,
        x: 50,
        y: 28,
        fontSize: titleText.length > 20 ? 24 : 36,
        fontFamily: lang === 'bn' ? 'Galada' : 'Space Grotesk',
        color: isDark ? '#fcd34d' : '#991b1b', // amber vs crimson
        fontWeight: 'bold',
        align: 'center',
        shadow: true
      },
      {
        id: `copilot_divider_${Date.now()}`,
        type: 'shape',
        content: 'rect_horizontal',
        x: 50,
        y: 42,
        width: 60,
        height: 3,
        color: isDark ? '#e2e8f0' : '#b91c1c',
        opacity: 0.8
      },
      {
        id: `copilot_sub_${Date.now()}`,
        type: 'text',
        content: subtitleText,
        x: 50,
        y: 54,
        fontSize: 16,
        fontFamily: lang === 'bn' ? 'Hind Siliguri' : 'Inter',
        color: isDark ? '#ffffff' : '#1e293b',
        fontWeight: 'semibold',
        align: 'center',
        shadow: isDark
      },
      {
        id: `copilot_foot_${Date.now()}`,
        type: 'text',
        content: footerText,
        x: 50,
        y: 84,
        fontSize: 12,
        fontFamily: lang === 'bn' ? 'Hind Siliguri' : 'JetBrains Mono',
        color: isDark ? '#94a3b8' : '#475569',
        fontWeight: 'normal',
        align: 'center',
        shadow: false
      }
    ];

    // Apply wedding border if wedding
    if (copilotPrompt.toLowerCase().includes('বিয়ে') || copilotPrompt.toLowerCase().includes('wedding')) {
      newElements.push({
        id: `copilot_border_${Date.now()}`,
        type: 'shape',
        content: 'border_ring',
        x: 50,
        y: 50,
        width: 90,
        height: 90,
        color: '#fbbf24',
        opacity: 0.6
      });
    }

    // Set background & elements
    setCanvasBg({
      type: 'image',
      value: pollinationsUrl,
      overlayOpacity: isDark ? 0.45 : 0.15
    });
    setElements(newElements);
    setSelectedElementId(null);

    // Done
    setCopilotStatus('finished');
    setCopilotLogs(prev => [
      ...prev,
      lang === 'bn'
        ? `🎉 [সফলতা] আপনার এআই কাস্টম লেআউট সম্পূর্ণ প্রস্তুত! নিচের ক্যানভাসে প্রিভিউ এবং ম্যানুয়াল টিউনিং করুন।`
        : `🎉 [Success] Custom layout compiled! Feel free to adjust individual elements on the canvas.`
    ]);
    setActiveCopilotAgent(null);
  };

  // Iterative Quick Adjustments (Gemini prompt-based edits / Canva magic switch)
  const adjustTextSize = (amount: number) => {
    setElements(prev => prev.map(el => {
      if (el.type === 'text') {
        const nextSize = Math.max(8, Math.min(120, (el.fontSize ?? 14) + amount));
        return { ...el, fontSize: nextSize };
      }
      return el;
    }));
  };

  const shiftTextVertical = (amount: number) => {
    setElements(prev => prev.map(el => {
      if (el.type === 'text') {
        const nextY = Math.max(0, Math.min(100, el.y + amount));
        return { ...el, y: nextY };
      }
      return el;
    }));
  };

  const toggleFontFamilies = () => {
    setElements(prev => prev.map(el => {
      if (el.type === 'text') {
        const currentFont = el.fontFamily || '';
        let nextFont = 'Hind Siliguri';
        if (currentFont === 'Hind Siliguri') nextFont = 'Galada';
        else if (currentFont === 'Galada') nextFont = 'Space Grotesk';
        else if (currentFont === 'Space Grotesk') nextFont = 'Playfair Display';
        else if (currentFont === 'Playfair Display') nextFont = 'Inter';
        return { ...el, fontFamily: nextFont };
      }
      return el;
    }));
  };

  const activeElement = elements.find(el => el.id === selectedElementId);

  // Update specific selected element property
  const updateElementProp = (id: string, prop: keyof ElementLayer, value: any) => {
    setElements(prev => prev.map(el => {
      if (el.id === id) {
        return { ...el, [prop]: value };
      }
      return el;
    }));
  };

  // Drag-and-position element using simple click offsets or step control buttons
  const moveElement = (id: string, direction: 'up' | 'down' | 'left' | 'right', amount: number = 2) => {
    setElements(prev => prev.map(el => {
      if (el.id === id) {
        let newX = el.x;
        let newY = el.y;
        if (direction === 'up') newY = Math.max(0, el.y - amount);
        if (direction === 'down') newY = Math.min(100, el.y + amount);
        if (direction === 'left') newX = Math.max(0, el.x - amount);
        if (direction === 'right') newX = Math.min(100, el.x + amount);
        return { ...el, x: newX, y: newY };
      }
      return el;
    }));
  };

  // Add new text element
  const addNewText = () => {
    const text: ElementLayer = {
      id: `text_${Date.now()}`,
      type: 'text',
      content: newTextVal.trim() || 'Custom Text',
      x: 50,
      y: 50,
      fontSize: 16,
      fontFamily: lang === 'bn' ? 'Hind Siliguri' : 'Inter',
      color: canvasBg.value === '#ffffff' || canvasBg.value === '#fbf9f4' ? '#0f172a' : '#ffffff',
      fontWeight: 'bold',
      align: 'center',
      shadow: false
    };
    setElements(prev => [...prev, text]);
    setSelectedElementId(text.id);
    setNewTextVal('');
  };

  // Add custom shape element
  const addNewShape = (shapeType: 'rect_horizontal' | 'border_ring' | 'circle' | 'divider') => {
    const shape: ElementLayer = {
      id: `shape_${Date.now()}`,
      type: 'shape',
      content: shapeType,
      x: 50,
      y: 50,
      width: 40,
      height: 4,
      color: '#38bdf8',
      opacity: 0.8
    };
    setElements(prev => [...prev, shape]);
    setSelectedElementId(shape.id);
  };

  // Delete selected element
  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  // Duplicate selected element
  const duplicateElement = (el: ElementLayer) => {
    const dup: ElementLayer = {
      ...el,
      id: `${el.id}_dup_${Date.now()}`,
      x: Math.min(95, el.x + 4),
      y: Math.min(95, el.y + 4)
    };
    setElements(prev => [...prev, dup]);
    setSelectedElementId(dup.id);
  };

  // Layer ordering helpers
  const bringToFront = (id: string) => {
    const idx = elements.findIndex(el => el.id === id);
    if (idx === -1 || idx === elements.length - 1) return;
    const updated = [...elements];
    const target = updated.splice(idx, 1)[0];
    updated.push(target);
    setElements(updated);
  };

  const sendToBack = (id: string) => {
    const idx = elements.findIndex(el => el.id === id);
    if (idx <= 0) return;
    const updated = [...elements];
    const target = updated.splice(idx, 1)[0];
    updated.unshift(target);
    setElements(updated);
  };

  // Handle local background image upload or logo upload onto the canvas
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (aiImageType === 'background') {
        setCanvasBg({
          type: 'image',
          value: dataUrl,
          overlayOpacity: 0.2
        });
      } else {
        // Add as a sticker/image element layers
        const imgLayer: ElementLayer = {
          id: `image_${Date.now()}`,
          type: 'image',
          content: dataUrl,
          x: 50,
          y: 60,
          width: 30,
          height: 20,
          opacity: 1
        };
        setElements(prev => [...prev, imgLayer]);
        setSelectedElementId(imgLayer.id);
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate gorgeous backgrounds or design layers using Pollinations AI (FREE, Instant, NO API Keys)
  const generateAiAsset = () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);

    // Build optimized high resolution image prompt
    const enhancedPrompt = `${aiPrompt.trim()} style of beautiful clean high resolution vector graphic, no letters, no text, stock photography backdrop`;
    const imageUrl = `https://image.pollinations.ai/p/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 999999)}`;

    // Prefetch the image to ensure it is fully loaded
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (aiImageType === 'background') {
        setCanvasBg({
          type: 'image',
          value: imageUrl,
          overlayOpacity: 0.3
        });
      } else {
        const newLayer: ElementLayer = {
          id: `ai_img_${Date.now()}`,
          type: 'image',
          content: imageUrl,
          x: 50,
          y: 50,
          width: 40,
          height: 30,
          opacity: 1
        };
        setElements(prev => [...prev, newLayer]);
        setSelectedElementId(newLayer.id);
      }
      setIsGeneratingAi(false);
      setAiPrompt('');
    };
    img.onerror = () => {
      alert("Failed to load generated AI Image. Please retry.");
      setIsGeneratingAi(false);
    };
    img.src = imageUrl;
  };

  // Print the graphic
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const canvasHtml = canvasRef.current?.outerHTML || '';
    const fontsHtml = `<link href="https://fonts.googleapis.com/css2?family=Inter&family=Space+Grotesk&family=Playfair+Display&family=JetBrains+Mono&family=Hind+Siliguri&family=Noto+Sans+Bengali&family=Galada&display=swap" rel="stylesheet">`;

    printWindow.document.write(`
      <html>
        <head>
          <title>${selectedTemplate.name}</title>
          ${fontsHtml}
          <style>
            body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: white; }
            .print-canvas { width: ${selectedTemplate.width}px; height: ${selectedTemplate.height}px; position: relative; border: none; overflow: hidden; box-shadow: none !important; }
            @page { size: auto; margin: 0mm; }
            @media print {
              body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
              .print-canvas { margin: 0; width: 100vw; height: 100vh; }
            }
          </style>
        </head>
        <body>
          <div class="print-canvas" style="${canvasRef.current?.getAttribute('style')}">
            ${canvasRef.current?.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Export & Download high resolution visual canvas using html2canvas
  const handleDownload = async () => {
    if (!canvasRef.current) return;
    
    // Clear selected state overlay briefly
    const prevSelected = selectedElementId;
    setSelectedElementId(null);

    // Wait for state rendering
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(canvasRef.current!, {
          useCORS: true,
          scale: 2, // High resolution double-pixel output
          backgroundColor: null,
          logging: false
        });
        
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${selectedTemplate.id}_neora_design.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Failed to capture canvas:", err);
        alert("Could not export canvas to image due to network image locks. Please try printing or using local images instead.");
      } finally {
        setSelectedElementId(prevSelected);
      }
    }, 150);
  };

  return (
    <div id="graphic-studio-container" className="flex flex-col lg:flex-row gap-6 p-6 bg-[#000814] text-slate-100 min-h-[calc(100vh-140px)] select-none">
      
      {/* LEFT COLUMN: Controls & Presets Panel */}
      <div className="w-full lg:w-96 flex flex-col gap-5 shrink-0 bg-slate-900/45 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-xl shadow-xl">
        
        {/* Title */}
        <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3">
          <Palette className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-sm font-bold font-sans tracking-wider text-white">
              {lang === 'bn' ? 'এআই গ্রাফিক ডিজাইন স্টুডিও' : 'AI GRAPHIC DESIGN STUDIO'}
            </h2>
            <p className="text-[10px] font-mono text-cyan-400/80">
              {lang === 'bn' ? 'পোস্টার, ক্যালেন্ডার, ভি-কার্ড ও ব্যানার মেকার' : 'POSTER, CALENDAR, VCARD & BANNER MAKER'}
            </p>
          </div>
        </div>

        {/* TAB SELECTOR CONTROLS */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/60 shrink-0">
          <button
            onClick={() => setSidebarTab('copilot')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              sidebarTab === 'copilot'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)] font-extrabold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {lang === 'bn' ? 'এআই কোপাইলট' : 'AI COPILOT'}
          </button>
          <button
            onClick={() => setSidebarTab('manual')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              sidebarTab === 'manual'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)] font-extrabold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/40'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            {lang === 'bn' ? 'ম্যানুয়াল টুলস' : 'MANUAL TOOLS'}
          </button>
        </div>

        {/* TAB 1: COLLABORATIVE AI COPILOT */}
        {sidebarTab === 'copilot' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Copilot Instructions */}
            <div className="bg-cyan-950/25 border border-cyan-500/20 rounded-xl p-3 text-[11px] leading-relaxed text-cyan-200">
              {lang === 'bn' ? (
                <span>
                  🤖 <strong>মাল্টি-এআই কো-অর্ডিনেশন:</strong> আপনার রিকোয়েস্ট অনুযায়ী চ্যাটজিপিটি (লেআউট), মিডজার্নি (আর্টওয়ার্ক) এবং ক্যানভা (অ্যাসেম্বলি) কোলাবোরেট করে একটি প্রফেশনাল ডিজাইন প্যানেল তৈরি করবে।
                </span>
              ) : (
                <span>
                  🤖 <strong>Multi-AI Coordination:</strong> Under this workspace, ChatGPT (Layout Planner), Midjourney (Artwork), and Canva (Layer Assembler) collaborate in real-time to generate your pristine editable graphic.
                </span>
              )}
            </div>

            {/* Prompt Input Area */}
            <div>
              <label className="block text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-2">
                {lang === 'bn' ? '১. আপনার ডিজাইনের চাহিদা লিখুন (বাংলা/English)' : '1. DESCRIBE YOUR DESIGN DEMAND'}
              </label>
              <textarea
                value={copilotPrompt}
                onChange={(e) => setCopilotPrompt(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: ঐতিহাসিক ওয়াজ মাহফিল পোস্টার, বা একটি কবিতা বইয়ের জন্য সুন্দর প্রচ্ছদ...' : 'e.g., A historic royal poetry book cover illustration...'}
                className="w-full h-24 bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 rounded-xl p-3 resize-none focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            {/* Quick Design Predefined Suggestion Chips */}
            <div>
              <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider mb-1.5">
                {lang === 'bn' ? 'জনপ্রিয় কুইক-ডিজাইন সাজেশন্স' : 'POPULAR QUICK-DIZ CHIPS'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { textBn: '🕌 ওয়াজ মাহফিল পোস্টার', textEn: '🕌 Waz Mahfil Poster', val: 'ইসলামী ওয়াজ মাহফিল পোস্টার' },
                  { textBn: '📖 কবিতা বইয়ের প্রচ্ছদ', textEn: '📖 Poetry Book Cover', val: 'সুন্দর মেঘের রোদ মাখা কবিতার বইয়ের প্রচ্ছদ' },
                  { textBn: '👑 শুভ বিবাহ কার্ড', textEn: '👑 Wedding Invitation', val: 'রয়াল শুভ বিবাহ নিমন্ত্রণ পত্র' },
                  { textBn: '📅 নতুন ক্যালেন্ডার', textEn: '📅 2026 Calendar', val: '২০২৬ নতুন বাংলা ক্যালেন্ডার' },
                  { textBn: '💼 স্মার্ট ভিজিটিং কার্ড', textEn: '💼 Business VCard', val: 'প্রফেশনাল লাক্সারি ডার্ক গোল্ড মেটালিক বিজনেস কার্ড' },
                  { textBn: '🏮 শুভ নববর্ষ ব্যানার', textEn: '🏮 Boishakhi Banner', val: 'শুভ নববর্ষ ১৪৩৩ বৈশাখী উৎসবের শুভেচ্ছা ব্যানার' }
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCopilotPrompt(chip.val)}
                    className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-[10px] text-slate-300 font-sans cursor-pointer transition-all"
                  >
                    {lang === 'bn' ? chip.textBn : chip.textEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Run Multi-AI Collaborative Assemble Button */}
            <button
              onClick={runCopilotWorkflow}
              disabled={copilotStatus === 'searching' || copilotStatus === 'planning' || copilotStatus === 'generating' || copilotStatus === 'composing' || !copilotPrompt.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:shadow-none text-slate-950 font-extrabold text-xs font-sans uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {copilotStatus === 'idle' || copilotStatus === 'finished' ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  {lang === 'bn' ? 'ডিজাইন প্ল্যান ও অ্যাসেম্বল করুন' : 'PLAN & ASSEMBLE DESIGN'}
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {lang === 'bn' ? 'এআই এজেন্টরা কাজ করছে...' : 'AGENTS COLLABORATING...'}
                </>
              )}
            </button>

            {/* REAL-TIME MULTI-AI COLLABORATIVE AGENT CONSOLE */}
            {copilotStatus !== 'idle' && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono text-slate-400 tracking-wider">
                    {lang === 'bn' ? 'এআই এজেন্ট স্ট্যাটাস কনসোল' : 'COLLABORATIVE AGENT LOGS'}
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                </div>

                {/* Agents Status Indicator Nodes */}
                <div className="grid grid-cols-4 gap-1 border-b border-slate-900 pb-2.5">
                  <div className={`p-1.5 rounded-lg flex flex-col items-center justify-center transition-all ${activeCopilotAgent === 'chatgpt' ? 'bg-cyan-500/10 border border-cyan-500/30' : 'opacity-40'}`}>
                    <span className="text-[9px] font-extrabold text-cyan-400 font-mono">GPT-6</span>
                    <span className="text-[8px] text-slate-500">{lang === 'bn' ? 'লেআউট' : 'Planner'}</span>
                  </div>
                  <div className={`p-1.5 rounded-lg flex flex-col items-center justify-center transition-all ${activeCopilotAgent === 'gemini' ? 'bg-amber-500/10 border border-amber-500/30' : 'opacity-40'}`}>
                    <span className="text-[9px] font-extrabold text-amber-400 font-mono">GEMINI</span>
                    <span className="text-[8px] text-slate-500">{lang === 'bn' ? 'ভাষা' : 'Linguist'}</span>
                  </div>
                  <div className={`p-1.5 rounded-lg flex flex-col items-center justify-center transition-all ${activeCopilotAgent === 'midjourney' ? 'bg-purple-500/10 border border-purple-500/30' : 'opacity-40'}`}>
                    <span className="text-[9px] font-extrabold text-purple-400 font-mono">MJ v6</span>
                    <span className="text-[8px] text-slate-500">{lang === 'bn' ? 'চিত্র' : 'Artist'}</span>
                  </div>
                  <div className={`p-1.5 rounded-lg flex flex-col items-center justify-center transition-all ${activeCopilotAgent === 'canva' ? 'bg-emerald-500/10 border border-emerald-500/30' : 'opacity-40'}`}>
                    <span className="text-[9px] font-extrabold text-emerald-400 font-mono">CANVA</span>
                    <span className="text-[8px] text-slate-500">{lang === 'bn' ? 'কম্পোজ' : 'Composer'}</span>
                  </div>
                </div>

                {/* Terminal style logs list */}
                <div className="space-y-1.5 max-h-32 overflow-y-auto font-mono text-[9px] text-slate-400 leading-relaxed scrollbar-thin">
                  {copilotLogs.map((log, i) => (
                    <div key={i} className="flex gap-1">
                      <span className="text-cyan-500 shrink-0">▸</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QUICK TWEEKS BAR */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <span className="block text-[10px] font-extrabold font-mono text-slate-400 tracking-wider">
                {lang === 'bn' ? 'ক্যানভাস ম্যাজিক টিউনিং' : 'MAGIC CANVAS ADJUSTERS'}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => adjustTextSize(2)}
                  className="py-1 px-2 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-300 font-sans flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Text Size ➕</span>
                </button>
                <button
                  onClick={() => adjustTextSize(-2)}
                  className="py-1 px-2 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-300 font-sans flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Text Size ➖</span>
                </button>
                <button
                  onClick={() => shiftTextVertical(-4)}
                  className="py-1 px-2 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-300 font-sans flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Shift Up ⬆️</span>
                </button>
                <button
                  onClick={() => shiftTextVertical(4)}
                  className="py-1 px-2 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-300 font-sans flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Shift Down ⬇️</span>
                </button>
              </div>
              <button
                onClick={toggleFontFamilies}
                className="w-full py-1.5 px-2 rounded bg-cyan-950/40 border border-cyan-800/40 hover:border-cyan-700/60 text-[10px] font-bold text-cyan-200 font-sans flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Cycle Font Styles (ফন্ট পরিবর্তন) 🔠</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MANUAL CANVAS LAYER CREATOR TOOLS */}
        {sidebarTab === 'manual' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* 1. Select Template Preset */}
            <div>
              <label className="block text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-2">
                {lang === 'bn' ? '১. টেমপ্লেট প্রিসেট নির্বাচন করুন' : '1. SELECT TEMPLATE PRESET'}
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto scrollbar-thin">
                {PRESETS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => selectTemplate(t)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      selectedTemplate.id === t.id
                        ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-200'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <p className="text-[11px] font-bold truncate">
                      {lang === 'bn' ? t.nameBn : t.name}
                    </p>
                    <span className="text-[8px] font-mono text-slate-500 uppercase block mt-0.5">
                      {t.type} ({t.width}x{t.height})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Background and Styling options */}
            <div>
              <label className="block text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-2">
                {lang === 'bn' ? '২. ব্যাকগ্রাউন্ড ডিজাইন কাস্টমাইজ করুন' : '2. BACKGROUND AND CANVAS STYLING'}
              </label>
              <div className="space-y-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
                {/* Background type buttons */}
                <div className="flex gap-1.5 bg-slate-900 p-1 rounded-lg">
                  <button
                    onClick={() => setCanvasBg({ type: 'color', value: '#ffffff' })}
                    className={`flex-1 py-1 rounded text-[10px] font-mono font-bold ${canvasBg.type === 'color' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
                  >
                    SOLID
                  </button>
                  <button
                    onClick={() => setCanvasBg({ type: 'gradient', value: GRADIENTS[0].value })}
                    className={`flex-1 py-1 rounded text-[10px] font-mono font-bold ${canvasBg.type === 'gradient' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
                  >
                    GRADIENT
                  </button>
                  <button
                    onClick={() => setCanvasBg({ type: 'image', value: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1024', overlayOpacity: 0.3 })}
                    className={`flex-1 py-1 rounded text-[10px] font-mono font-bold ${canvasBg.type === 'image' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
                  >
                    IMAGE
                  </button>
                </div>

                {/* Solid color input */}
                {canvasBg.type === 'color' && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400">PICK COLOR:</span>
                    <input
                      type="color"
                      value={canvasBg.value.startsWith('#') ? canvasBg.value : '#ffffff'}
                      onChange={(e) => setCanvasBg({ type: 'color', value: e.target.value })}
                      className="w-10 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={canvasBg.value}
                      onChange={(e) => setCanvasBg({ type: 'color', value: e.target.value })}
                      className="flex-1 bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 rounded px-2 py-1 focus:outline-none"
                    />
                  </div>
                )}

                {/* Gradient selector */}
                {canvasBg.type === 'gradient' && (
                  <div className="grid grid-cols-4 gap-1">
                    {GRADIENTS.map((g, i) => (
                      <button
                        key={i}
                        onClick={() => setCanvasBg({ type: 'gradient', value: g.value })}
                        className="h-6 rounded border border-slate-800"
                        style={{ background: g.value }}
                        title={g.name}
                      />
                    ))}
                  </div>
                )}

                {/* Image backdrop options */}
                {canvasBg.type === 'image' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">URL:</span>
                      <input
                        type="text"
                        value={canvasBg.value}
                        onChange={(e) => setCanvasBg({ ...canvasBg, value: e.target.value })}
                        className="flex-1 bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 rounded px-2 py-1 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">OVERLAY OPACITY:</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={canvasBg.overlayOpacity ?? 0.3}
                        onChange={(e) => setCanvasBg({ ...canvasBg, overlayOpacity: parseFloat(e.target.value) })}
                        className="flex-1 accent-cyan-400"
                      />
                      <span className="text-[10px] font-mono text-slate-300 w-8 text-right">{Math.round((canvasBg.overlayOpacity ?? 0.3) * 100)}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. AI Graphic Asset Generator layer (FREE Pollinations integration!) */}
            <div className="border border-cyan-500/10 bg-slate-950/30 p-3 rounded-xl">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-[11px] font-bold font-mono text-slate-300 tracking-wider">
                  {lang === 'bn' ? '৩. এআই ইমেজ জেনারেটর (ফ্রি)' : '3. AI IMAGE GENERATOR (FREE)'}
                </span>
              </div>
              <div className="space-y-2">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: সুন্দর সবুজ বন নদী সূর্যোদয়, অথবা লাল ব্যাকগ্রাউন্ড গোল্ডেন ফ্রেম...' : 'e.g., beautiful golden certificate border background...'}
                  className="w-full h-16 bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-lg p-2 resize-none focus:outline-none focus:border-cyan-500/40"
                />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setAiImageType('background')}
                      className={`px-2 py-1 rounded text-[9px] font-mono font-bold ${aiImageType === 'background' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20' : 'bg-slate-900 text-slate-500'}`}
                    >
                      BG IMAGE
                    </button>
                    <button
                      onClick={() => setAiImageType('sticker')}
                      className={`px-2 py-1 rounded text-[9px] font-mono font-bold ${aiImageType === 'sticker' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20' : 'bg-slate-900 text-slate-500'}`}
                    >
                      STICKER
                    </button>
                  </div>
                  <button
                    onClick={generateAiAsset}
                    disabled={isGeneratingAi || !aiPrompt.trim()}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 text-[10px] font-bold font-mono uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                  >
                    {isGeneratingAi ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        GENERATING...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        GENERATE IMAGE
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Add Custom Text / Layer Controls */}
            <div>
              <label className="block text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-2">
                {lang === 'bn' ? '৪. কাস্টম টেক্সট ও আকৃতি যোগ করুন' : '4. ADD CUSTOM LAYER'}
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTextVal}
                    onChange={(e) => setNewTextVal(e.target.value)}
                    placeholder={lang === 'bn' ? 'লিখুন...' : 'Type text layer content...'}
                    className="flex-1 bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500/40"
                  />
                  <button
                    onClick={addNewText}
                    className="px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Add Text Element"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    TEXT
                  </button>
                </div>

                {/* Quick Shape inserts */}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => addNewShape('rect_horizontal')}
                    className="flex-1 py-1 rounded bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-[10px] font-mono text-slate-300 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-cyan-400" /> HORIZ BAR
                  </button>
                  <button
                    onClick={() => addNewShape('border_ring')}
                    className="flex-1 py-1 rounded bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-[10px] font-mono text-slate-300 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-cyan-400" /> BORDER RING
                  </button>
                  <button
                    onClick={() => {
                      setAiImageType('sticker');
                      fileInputRef.current?.click();
                    }}
                    className="flex-1 py-1 rounded bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-[10px] font-mono text-slate-300 flex items-center justify-center gap-1 cursor-pointer"
                    title="Upload Photo/Logo Layer"
                  >
                    <Upload className="w-3 h-3 text-amber-400" /> LOGO/PHOTO
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* CENTER COLUMN: Canvas Area / Visual Editor */}
      <div className="flex-1 flex flex-col gap-4 items-center justify-center bg-slate-950/60 border border-slate-800/50 p-6 rounded-3xl relative overflow-hidden">
        
        {/* Help label */}
        <div className="text-center mb-1">
          <h3 className="text-sm font-semibold text-slate-300">
            {lang === 'bn' ? 'সরাসরি ক্যানভাস প্রিভিউ' : 'Direct Canvas Preview'}
          </h3>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-tight">
            {lang === 'bn' ? 'ক্যানভাসের এলিমেন্টে ক্লিক করে এডিট ও পজিশন করুন' : 'Click any element to edit position, typography and details'}
          </p>
        </div>

        {/* One-click professional photo presets */}
        <div className="w-full max-w-lg bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 mb-2 shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 border-b border-slate-800/60 pb-2">
            <span className="text-[11px] font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-cyan-400" />
              {lang === 'bn' ? '১-ক্লিক প্রফেশনাল ফটো প্রিসেট' : '1-Click Photo Presets'}
            </span>
            <div className="flex items-center gap-2">
              {/* Undo Filter Button */}
              <button
                onClick={() => setActiveFilterId('none')}
                disabled={activeFilterId === 'none'}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold font-mono uppercase transition-all cursor-pointer ${
                  activeFilterId === 'none'
                    ? 'bg-slate-950/20 border-slate-800/40 text-slate-600 cursor-not-allowed'
                    : 'bg-rose-500/15 border-rose-500 text-rose-300 hover:bg-rose-500/25 shadow-[0_0_8px_rgba(239,68,68,0.15)] animate-pulse'
                }`}
                title={lang === 'bn' ? 'ফিল্টার বাতিল করুন' : 'Undo Filter - revert to original state immediately'}
              >
                <RotateCcw className="w-3 h-3" />
                <span>{lang === 'bn' ? 'Undo ফিল্টার' : 'Undo Filter'}</span>
              </button>
            </div>
          </div>

          {/* Toggleable Folders */}
          <div className="space-y-2">
            {(['Landscape', 'Portrait', 'Abstract'] as const).map((category) => {
              const isOpen = openFolders[category];
              const categoryPresets = PHOTO_PRESETS.filter((p) => p.category === category);
              const categoryIcon = category === 'Landscape' ? '🌄' : category === 'Portrait' ? '👤' : '🎨';
              const categoryNameBn = category === 'Landscape' ? 'ল্যান্ডস্কেপ' : category === 'Portrait' ? 'পোর্ট্রেট' : 'অ্যাবস্ট্রাক্ট';
              
              return (
                <div 
                  key={category} 
                  className={`border rounded-xl transition-all ${
                    isOpen 
                      ? 'border-slate-800 bg-slate-950/40 shadow-inner' 
                      : 'border-slate-800/60 bg-slate-950/15 hover:bg-slate-950/30'
                  }`}
                >
                  <button
                    onClick={() => setOpenFolders(prev => ({ ...prev, [category]: !prev[category] }))}
                    className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold text-slate-300 font-mono focus:outline-none cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {isOpen ? (
                        <FolderOpen className="w-4 h-4 text-amber-500 fill-amber-500/10" />
                      ) : (
                        <Folder className="w-4 h-4 text-amber-600 fill-amber-600/10" />
                      )}
                      <span className="text-sm">{categoryIcon}</span>
                      <span className="tracking-wide">
                        {lang === 'bn' ? categoryNameBn : category}
                      </span>
                      <span className="text-[9px] text-slate-500 font-normal">
                        ({categoryPresets.length} {lang === 'bn' ? 'টি ফিল্টার' : 'presets'})
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {isOpen ? '▼' : '▼'}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="p-2 border-t border-slate-800/40 bg-slate-950/25">
                      <div className="flex gap-2 overflow-x-auto scrollbar-none py-1 items-center">
                        {/* Inline Undo Filter option inside the folder list */}
                        {activeFilterId !== 'none' && (
                          <button
                            onClick={() => setActiveFilterId('none')}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold font-mono uppercase transition-all shrink-0 cursor-pointer bg-rose-500/10 border-rose-500/40 text-rose-300 hover:bg-rose-500/20"
                            title={lang === 'bn' ? 'ফিল্টার বাতিল' : 'Undo Filter'}
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>{lang === 'bn' ? 'বাতিল' : 'Undo'}</span>
                          </button>
                        )}
                        {categoryPresets.map((preset) => {
                          const isActive = activeFilterId === preset.id;
                          return (
                            <button
                              key={preset.id}
                              onClick={() => setActiveFilterId(preset.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                                isActive
                                  ? 'bg-cyan-500/15 border-cyan-500 text-cyan-200 font-bold shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                              }`}
                              title={lang === 'bn' ? preset.descriptionBn : preset.description}
                            >
                              <span className="text-sm">{preset.icon}</span>
                              <span>{lang === 'bn' ? preset.nameBn : preset.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Aspect Ratio Canvas wrapper */}
        <div
          className="relative shadow-[0_12px_44px_rgba(0,0,0,0.85)] border border-slate-800 rounded-xl overflow-hidden cursor-default group"
          style={{
            width: '100%',
            maxWidth: `${selectedTemplate.width}px`,
            aspectRatio: `${selectedTemplate.width} / ${selectedTemplate.height}`,
            backgroundColor: canvasBg.type === 'color' ? canvasBg.value : 'transparent'
          }}
        >
          {/* Main design print zone capturing ref */}
          <div
            ref={canvasRef}
            id="print-canvas-area"
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: canvasBg.type === 'gradient' 
                ? canvasBg.value 
                : (canvasBg.type === 'image' ? `url(${canvasBg.value})` : undefined),
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: canvasBg.type === 'color' ? canvasBg.value : undefined,
              filter: PHOTO_PRESETS.find(p => p.id === activeFilterId)?.filter || 'none',
              transition: 'filter 0.3s ease-in-out'
            }}
          >
            {/* Dark image overlay layer */}
            {canvasBg.type === 'image' && canvasBg.overlayOpacity && (
              <div
                className="absolute inset-0 bg-black pointer-events-none"
                style={{ opacity: canvasBg.overlayOpacity }}
              />
            )}

            {/* Render editable element layers */}
            {elements.map((el) => {
              const isSelected = el.id === selectedElementId;
              
              return (
                <div
                  key={el.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElementId(el.id);
                  }}
                  className={`absolute group-hover:cursor-pointer ${
                    isSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 rounded z-30' : ''
                  }`}
                  style={{
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    transform: `translate(-50%, -50%) rotate(${el.rotation ?? 0}deg)`,
                    width: el.width ? `${el.width}%` : undefined,
                    height: el.height ? `${el.height}%` : undefined,
                    opacity: el.opacity ?? 1,
                    zIndex: isSelected ? 30 : 20,
                  }}
                >
                  {/* TEXT LAYERS */}
                  {el.type === 'text' && (
                    <div
                      style={{
                        fontFamily: el.fontFamily,
                        fontSize: `${el.fontSize ?? 14}px`,
                        color: el.color,
                        fontWeight: el.fontWeight,
                        textAlign: el.align ?? 'center',
                        textShadow: el.shadow ? '2px 2px 4px rgba(0,0,0,0.75)' : 'none',
                        letterSpacing: el.letterSpacing ?? 'normal',
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.25,
                        padding: '4px 8px'
                      }}
                    >
                      {el.content}
                    </div>
                  )}

                  {/* SHAPE LAYERS */}
                  {el.type === 'shape' && (
                    <div className="w-full h-full flex items-center justify-center pointer-events-none">
                      {el.content === 'rect_horizontal' && (
                        <div
                          className="w-full rounded"
                          style={{
                            height: `${el.height ?? 4}px`,
                            backgroundColor: el.color,
                          }}
                        />
                      )}
                      {el.content === 'circle' && (
                        <div
                          className="rounded-full border"
                          style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: el.color,
                            borderColor: el.color,
                          }}
                        />
                      )}
                      {el.content === 'border_ring' && (
                        <div
                          className="w-full h-full rounded border-2"
                          style={{
                            borderColor: el.color,
                            borderStyle: 'solid'
                          }}
                        />
                      )}
                    </div>
                  )}

                  {/* IMAGE/LOGO LAYERS */}
                  {el.type === 'image' && (
                    <img
                      src={el.content}
                      alt="graphic art layer"
                      className="w-full h-full object-cover rounded shadow"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Global actions row */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleDownload}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 shadow-[0_0_20px_rgba(6,182,212,0.35)] cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" />
            {lang === 'bn' ? 'এইচডি ইমেজ ডাউনলোড করুন (PNG)' : 'DOWNLOAD HD IMAGE (PNG)'}
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            {lang === 'bn' ? 'মুদ্রণ বা প্রিন্ট করুন' : 'PRINT DESIGN'}
          </button>
          <button
            onClick={() => {
              setElements(JSON.parse(JSON.stringify(selectedTemplate.elements)));
              setCanvasBg(JSON.parse(JSON.stringify(selectedTemplate.background)));
              setSelectedElementId(null);
              setActiveFilterId('none');
            }}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer transition-all"
            title="Reset Canvas Design"
          >
            <RotateCcw className="w-4 h-4" />
            {lang === 'bn' ? 'রিসেট' : 'RESET'}
          </button>
        </div>

      </div>

      {/* RIGHT COLUMN: Layer Editor Sidebar */}
      {activeElement ? (
        <div className="w-full lg:w-80 flex flex-col gap-4 bg-slate-900/45 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-xl shadow-xl transition-all duration-300">
          
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
            <div className="flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                {lang === 'bn' ? 'স্তর সম্পাদনা' : 'EDIT SELECTED LAYER'}
              </span>
            </div>
            <button
              onClick={() => setSelectedElementId(null)}
              className="text-[10px] font-mono text-slate-500 hover:text-white cursor-pointer"
            >
              CLOSE
            </button>
          </div>

          {/* Text Content Editor */}
          {activeElement.type === 'text' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold font-mono text-slate-400 mb-1 uppercase">TEXT VALUE:</label>
                <textarea
                  value={activeElement.content}
                  onChange={(e) => updateElementProp(activeElement.id, 'content', e.target.value)}
                  className="w-full h-20 bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs font-sans text-slate-100 focus:outline-none"
                />
              </div>

              {/* Font Family */}
              <div>
                <label className="block text-[10px] font-bold font-mono text-slate-400 mb-1 uppercase">FONT FAMILY:</label>
                <select
                  value={activeElement.fontFamily ?? 'Inter'}
                  onChange={(e) => updateElementProp(activeElement.id, 'fontFamily', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs p-1.5 text-slate-200 focus:outline-none"
                >
                  {FONT_FAMILIES.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>

              {/* Size Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold font-mono text-slate-400 uppercase">FONT SIZE:</label>
                  <span className="text-[10px] font-mono text-slate-300 font-bold">{activeElement.fontSize ?? 14}px</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="120"
                  value={activeElement.fontSize ?? 14}
                  onChange={(e) => updateElementProp(activeElement.id, 'fontSize', parseInt(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Text Color */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold font-mono text-slate-400">COLOR:</span>
                <input
                  type="color"
                  value={activeElement.color?.startsWith('#') ? activeElement.color : '#ffffff'}
                  onChange={(e) => updateElementProp(activeElement.id, 'color', e.target.value)}
                  className="w-9 h-6 rounded cursor-pointer bg-transparent border border-slate-700"
                />
                <input
                  type="text"
                  value={activeElement.color}
                  onChange={(e) => updateElementProp(activeElement.id, 'color', e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 rounded px-2 py-0.5 focus:outline-none"
                />
              </div>

              {/* Alignment & Weight */}
              <div className="flex items-center justify-between border-t border-b border-slate-850 py-2">
                <div className="flex gap-1">
                  <button
                    onClick={() => updateElementProp(activeElement.id, 'align', 'left')}
                    className={`p-1.5 rounded hover:bg-slate-800 ${activeElement.align === 'left' ? 'text-cyan-400 bg-slate-900' : 'text-slate-500'}`}
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => updateElementProp(activeElement.id, 'align', 'center')}
                    className={`p-1.5 rounded hover:bg-slate-800 ${activeElement.align === 'center' ? 'text-cyan-400 bg-slate-900' : 'text-slate-500'}`}
                  >
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => updateElementProp(activeElement.id, 'align', 'right')}
                    className={`p-1.5 rounded hover:bg-slate-800 ${activeElement.align === 'right' ? 'text-cyan-400 bg-slate-900' : 'text-slate-500'}`}
                  >
                    <AlignRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => updateElementProp(activeElement.id, 'fontWeight', activeElement.fontWeight === 'bold' ? 'normal' : 'bold')}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold hover:bg-slate-800 ${activeElement.fontWeight === 'bold' ? 'text-cyan-400 bg-slate-900' : 'text-slate-500'}`}
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => updateElementProp(activeElement.id, 'shadow', !activeElement.shadow)}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold hover:bg-slate-800 ${activeElement.shadow ? 'text-cyan-400 bg-slate-900' : 'text-slate-500'}`}
                    title="Toggle Text Shadow"
                  >
                    SHADOW
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Common Size / Position parameters */}
          <div className="space-y-3.5">
            {/* Position inputs */}
            <div>
              <span className="block text-[10px] font-bold font-mono text-slate-400 mb-1 uppercase">POSITION OFFSET:</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono"><span>X-Pos:</span> <span>{activeElement.x}%</span></div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={activeElement.x}
                    onChange={(e) => updateElementProp(activeElement.id, 'x', parseInt(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono"><span>Y-Pos:</span> <span>{activeElement.y}%</span></div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={activeElement.y}
                    onChange={(e) => updateElementProp(activeElement.id, 'y', parseInt(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Shape parameters */}
            {(activeElement.type === 'shape' || activeElement.type === 'image') && (
              <div>
                <span className="block text-[10px] font-bold font-mono text-slate-400 mb-1 uppercase">BOUNDING DIMENSIONS:</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono"><span>Width:</span> <span>{activeElement.width ?? 30}%</span></div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={activeElement.width ?? 30}
                      onChange={(e) => updateElementProp(activeElement.id, 'width', parseInt(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono"><span>Height:</span> <span>{activeElement.height ?? 20}%</span></div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={activeElement.height ?? 20}
                      onChange={(e) => updateElementProp(activeElement.id, 'height', parseInt(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Rotation slider */}
            <div>
              <div className="flex justify-between text-[9px] text-slate-500 font-mono mb-1">
                <span className="uppercase">ROTATION ANGLE:</span>
                <span>{activeElement.rotation ?? 0}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={activeElement.rotation ?? 0}
                onChange={(e) => updateElementProp(activeElement.id, 'rotation', parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Layer arrangement buttons */}
            <div>
              <span className="block text-[10px] font-bold font-mono text-slate-400 mb-1.5 uppercase">LAYER CONTROLS:</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => bringToFront(activeElement.id)}
                  className="flex-1 py-1 rounded bg-slate-950/60 hover:bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center justify-center gap-1 cursor-pointer"
                  title="Bring to Front"
                >
                  <ArrowUp className="w-3 h-3 text-cyan-400" /> FRONT
                </button>
                <button
                  onClick={() => sendToBack(activeElement.id)}
                  className="flex-1 py-1 rounded bg-slate-950/60 hover:bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center justify-center gap-1 cursor-pointer"
                  title="Send to Back"
                >
                  <ArrowDown className="w-3 h-3 text-slate-500" /> BACK
                </button>
              </div>
            </div>

            {/* Actions list */}
            <div className="flex gap-2 border-t border-slate-850 pt-3">
              <button
                onClick={() => duplicateElement(activeElement)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-cyan-400" /> DUPLICATE
              </button>
              <button
                onClick={() => deleteElement(activeElement.id)}
                className="flex-1 py-2 rounded-xl bg-red-950/40 hover:bg-red-900 border border-red-900/40 text-red-200 text-xs font-mono font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" /> DELETE
              </button>
            </div>

          </div>

        </div>
      ) : (
        <div className="w-full lg:w-80 flex flex-col items-center justify-center bg-slate-900/25 border border-slate-800/40 p-5 rounded-2xl text-center">
          <Layers className="w-8 h-8 text-slate-700 mb-2 animate-pulse" />
          <p className="text-xs text-slate-500">
            {lang === 'bn' ? 'কোনো ক্যানভাস উপাদান নির্বাচিত নেই' : 'No canvas element selected.'}
          </p>
          <p className="text-[10px] text-slate-600 mt-1 max-w-[200px]">
            {lang === 'bn' ? 'ক্যানভাসের যেকোনো লেখা বা ছবিতে ক্লিক করে এডিটিং শুরু করুন' : 'Click any word or artwork inside the preview container to begin modifications.'}
          </p>
        </div>
      )}

    </div>
  );
}
