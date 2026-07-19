import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import {
  Download, Image as ImageIcon, Sparkles, Type, Type as FontIcon,
  Trash2, Plus, Copy, RotateCcw, Palette, LayoutGrid, Calendar,
  CreditCard, Printer, Layers, FileText, ArrowUp, ArrowDown,
  ChevronRight, AlignLeft, AlignCenter, AlignRight, Bold, Maximize2,
  Bookmark, Sliders, RefreshCw, Upload, Eye, Camera, Folder, FolderOpen,
  Search, CheckCircle, Clock, Grid, ShieldAlert, Scale, ZoomIn, ZoomOut, X, ToggleLeft,
  Lock, Unlock, MoreHorizontal
} from 'lucide-react';
import { ROADMAP_ITEMS, ROADMAP_CATEGORIES, RoadmapItem } from '../data/roadmapData';
import CanvaHeader from './CanvaHeader';
import CanvaFormattingToolbar from './CanvaFormattingToolbar';
import CanvaSidebarPanel from './CanvaSidebarPanel';

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
  borderRadius?: number; // in pixels (optional)
  lineHeight?: number;   // multiple (optional)
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
  },
  {
    id: 'halkhata_card',
    name: 'Traditional Halkhata Card',
    nameBn: 'ঐতিহ্যবাহী শুভ হালখাতা কার্ড',
    type: 'poster',
    width: 600,
    height: 420,
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #7c1a22 0%, #3b070c 100%)'
    },
    elements: [
      {
        id: 'hal_bismillah',
        type: 'text',
        content: 'বিসমিল্লাহির রহমানির রাহিম',
        x: 50,
        y: 8,
        fontSize: 12,
        fontFamily: 'Hind Siliguri',
        color: '#fef08a',
        fontWeight: 'medium',
        align: 'center'
      },
      {
        id: 'hal_header',
        type: 'text',
        content: 'শুভ হালখাতা',
        x: 50,
        y: 22,
        fontSize: 48,
        fontFamily: 'Galada',
        color: '#fbbf24',
        fontWeight: 'bold',
        align: 'center',
        shadow: true
      },
      {
        id: 'hal_poetry',
        type: 'text',
        content: 'এসেছে নতুন বছর, খুলি নতুন খাতা,\nমুছে যাক অতীতের সকল দেনা-পাওনার বার্তা।',
        x: 50,
        y: 38,
        fontSize: 14,
        fontFamily: 'Hind Siliguri',
        color: '#fcd34d',
        fontWeight: 'normal',
        align: 'center'
      },
      {
        id: 'hal_invitation',
        type: 'text',
        content: 'সুপ্রিয় সুহৃদ, আগামী পহেলা বৈশাখ আমাদের নতুন হিসাবের হালখাতা মহরতে\nআপনার সবান্ধব উপস্থিতি ও মিষ্টিমুখ একান্তভাবে কামনা করি।',
        x: 50,
        y: 54,
        fontSize: 14,
        fontFamily: 'Hind Siliguri',
        color: '#ffffff',
        fontWeight: 'normal',
        align: 'center'
      },
      {
        id: 'hal_venue',
        type: 'text',
        content: 'স্থান: শুকরিয়া প্রিন্টার্স প্রাঙ্গণ, ৩৭/১ বাংলাবাজার (দোতলা), ঢাকা-১১০০',
        x: 50,
        y: 72,
        fontSize: 13,
        fontFamily: 'Hind Siliguri',
        color: '#fef08a',
        fontWeight: 'semibold',
        align: 'center'
      },
      {
        id: 'hal_date',
        type: 'text',
        content: 'তারিখ: ১লা বৈশাখ ১৪৩৩ বঙ্গাব্দ (১৪ই এপ্রিল ২০২৬)',
        x: 50,
        y: 80,
        fontSize: 14,
        fontFamily: 'Hind Siliguri',
        color: '#ffffff',
        fontWeight: 'bold',
        align: 'center'
      },
      {
        id: 'hal_footer',
        type: 'text',
        content: 'আমন্ত্রণে: আলহাজ্ব মো: শুকুর মিয়া ও শুকরিয়া প্রিন্টার্স পরিবার',
        x: 50,
        y: 91,
        fontSize: 12,
        fontFamily: 'Hind Siliguri',
        color: '#94a3b8',
        fontWeight: 'normal',
        align: 'center'
      },
      {
        id: 'hal_border_top',
        type: 'shape',
        content: 'rect_horizontal',
        x: 50,
        y: 3,
        width: 96,
        height: 2,
        color: '#fbbf24',
        opacity: 0.8
      },
      {
        id: 'hal_border_bottom',
        type: 'shape',
        content: 'rect_horizontal',
        x: 50,
        y: 97,
        width: 96,
        height: 2,
        color: '#fbbf24',
        opacity: 0.8
      }
    ]
  },
  {
    id: 'eid_banner',
    name: 'Eid Mubarak Greeting Banner',
    nameBn: 'ঈদ মোবারক শুভেচ্ছা ব্যানার',
    type: 'banner',
    width: 600,
    height: 350,
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #091e3a 0%, #03543f 100%)'
    },
    elements: [
      {
        id: 'eid_crescent',
        type: 'text',
        content: '🌙',
        x: 50,
        y: 15,
        fontSize: 28,
        fontFamily: 'Inter',
        color: '#fbbf24',
        fontWeight: 'bold',
        align: 'center'
      },
      {
        id: 'eid_header',
        type: 'text',
        content: 'ঈদ মোবারক',
        x: 50,
        y: 35,
        fontSize: 48,
        fontFamily: 'Galada',
        color: '#fcd34d',
        fontWeight: 'bold',
        align: 'center',
        shadow: true
      },
      {
        id: 'eid_wish',
        type: 'text',
        content: 'পবিত্র ঈদুল ফিতর উপলক্ষে আপনাকে ও আপনার পরিবারকে জানাই\nআন্তরিক শুভেচ্ছা ও মোবারকবাদ। ঈদ বয়ে আনুক অনাবিল আনন্দ ও সুখ।',
        x: 50,
        y: 58,
        fontSize: 15,
        fontFamily: 'Hind Siliguri',
        color: '#ffffff',
        fontWeight: 'normal',
        align: 'center'
      },
      {
        id: 'eid_sender',
        type: 'text',
        content: 'শুভেচ্ছান্তে: আলহাজ্ব মো: শুকুর মিয়া ও শুকরিয়া প্রিন্টার্স পরিবার',
        x: 50,
        y: 78,
        fontSize: 14,
        fontFamily: 'Hind Siliguri',
        color: '#38bdf8',
        fontWeight: 'bold',
        align: 'center'
      },
      {
        id: 'eid_footer',
        type: 'text',
        content: '৩৭/১ বাংলাবাজার, ঢাকা • নিখুঁত ও উন্নতমানের প্রিন্টিং সেবা',
        x: 50,
        y: 89,
        fontSize: 11,
        fontFamily: 'Hind Siliguri',
        color: '#94a3b8',
        fontWeight: 'normal',
        align: 'center'
      }
    ]
  },
  {
    id: 'madrasah_admission',
    name: 'Madrasah Admission Poster',
    nameBn: 'মাদরাসা ভর্তি বিজ্ঞপ্তি পোস্টার',
    type: 'poster',
    width: 450,
    height: 600,
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)'
    },
    elements: [
      {
        id: 'mad_bismillah',
        type: 'text',
        content: 'ইকরা বিসমি রাব্বিকাল্লাজি খালাক',
        x: 50,
        y: 6,
        fontSize: 12,
        fontFamily: 'Hind Siliguri',
        color: '#fef08a',
        fontWeight: 'medium',
        align: 'center'
      },
      {
        id: 'mad_header',
        type: 'text',
        content: 'ভর্তি বিজ্ঞপ্তি! ভর্তি বিজ্ঞপ্তি!',
        x: 50,
        y: 14,
        fontSize: 18,
        fontFamily: 'Hind Siliguri',
        color: '#ffffff',
        fontWeight: 'bold',
        align: 'center'
      },
      {
        id: 'mad_title',
        type: 'text',
        content: 'দারুল উলুম আল-ইসলামিয়া মাদরাসা',
        x: 50,
        y: 25,
        fontSize: 26,
        fontFamily: 'Galada',
        color: '#fcd34d',
        fontWeight: 'bold',
        align: 'center',
        shadow: true
      },
      {
        id: 'mad_subtitle',
        type: 'text',
        content: '২০২৬-২০২৭ শিক্ষাবর্ষে নূরানী, নাজেরা ও হিফজ বিভাগে নতুন ছাত্র ভর্তি চলছে',
        x: 50,
        y: 35,
        fontSize: 13,
        fontFamily: 'Hind Siliguri',
        color: '#cbd5e1',
        fontWeight: 'semibold',
        align: 'center'
      },
      {
        id: 'mad_features_header',
        type: 'text',
        content: 'আমাদের প্রধান বৈশিষ্ট্যসমূহ:',
        x: 50,
        y: 44,
        fontSize: 14,
        fontFamily: 'Hind Siliguri',
        color: '#38bdf8',
        fontWeight: 'bold',
        align: 'center'
      },
      {
        id: 'mad_features_list',
        type: 'text',
        content: '✓ অভিজ্ঞ ও হাফেজ হাফেজা শিক্ষক দ্বারা পাঠদান\n✓ সার্বক্ষণিক হোস্টেল ও পুষ্টিকর খাবার ব্যবস্থা\n✓ সিসিটিভি দ্বারা নিয়ন্ত্রিত সুরক্ষিত ক্যাম্পাস\n✓ নূরানী ও হিফজ সম্পন্ন ছাত্রদের জন্য বিশেষ বৃত্তি',
        x: 50,
        y: 58,
        fontSize: 13,
        fontFamily: 'Hind Siliguri',
        color: '#ffffff',
        fontWeight: 'normal',
        align: 'center'
      },
      {
        id: 'mad_contact',
        type: 'text',
        content: 'ভর্তির জন্য যোগাযোগ করুন: ০১৭১২-৩৪৫৬৭৮, ০১৮১২-৩৪৫৬৭৮',
        x: 50,
        y: 78,
        fontSize: 13,
        fontFamily: 'Hind Siliguri',
        color: '#fcd34d',
        fontWeight: 'bold',
        align: 'center'
      },
      {
        id: 'mad_address',
        type: 'text',
        content: 'স্থান: ৩৭/১ বাংলাবাজার (দোতলা), ঢাকা-১১০০ (শুকরিয়া প্রিন্টার্স সংলগ্ন)',
        x: 50,
        y: 86,
        fontSize: 11,
        fontFamily: 'Hind Siliguri',
        color: '#94a3b8',
        fontWeight: 'normal',
        align: 'center'
      }
    ]
  }
];

export default function GraphicDesignerStudio({ lang }: { lang: 'en' | 'bn' }) {
  const [selectedTemplate, setSelectedTemplate] = useState<DesignTemplate>(PRESETS[0]);
  const [designTitle, setDesignTitle] = useState<string>(lang === 'bn' ? PRESETS[0].nameBn : PRESETS[0].name);
  const [elements, setElements] = useState<ElementLayer[]>(PRESETS[0].elements);
  const [canvasBg, setCanvasBg] = useState(PRESETS[0].background);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeFilterId, setActiveFilterId] = useState<string>('none');
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    Landscape: true,
    Portrait: false,
    Abstract: false
  });

  // Precise canvas scale & guideline states
  const [canvasScale, setCanvasScale] = useState<number>(100);
  const [showGridLines, setShowGridLines] = useState<boolean>(false);
  const [showSafeZone, setShowSafeZone] = useState<boolean>(false);
  const [showRoadmapModal, setShowRoadmapModal] = useState<boolean>(false);
  const [roadmapSearch, setRoadmapSearch] = useState<string>('');
  const [roadmapCategory, setRoadmapCategory] = useState<string>('all');
  
  // Custom prompt to auto-generate graphics using free Pollinations Stable Diffusion image layer
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiImageType, setAiImageType] = useState<'background' | 'sticker'>('background');

  // New element text state
  const [newTextVal, setNewTextVal] = useState('New Custom Label');

  // AI Design Copilot states
  const [sidebarTab, setSidebarTab] = useState<'templates' | 'elements' | 'text' | 'brand' | 'uploads' | 'midjourney' | 'copilot' | 'roadmap'>('templates');
  const [copilotPrompt, setCopilotPrompt] = useState('');
  const [copilotStatus, setCopilotStatus] = useState<'idle' | 'searching' | 'planning' | 'generating' | 'composing' | 'finished'>('idle');
  const [copilotLogs, setCopilotLogs] = useState<string[]>([]);
  const [activeCopilotAgent, setActiveCopilotAgent] = useState<'chatgpt' | 'gemini' | 'midjourney' | 'canva' | null>(null);

  // Multimodal AI Design Studio states
  const [refImage, setRefImage] = useState<string | null>(null);
  const [aiGeneratedOptions, setAiGeneratedOptions] = useState<any[]>([]);
  const [isGeneratingDesigns, setIsGeneratingDesigns] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState('');
  const [isRefiningDesign, setIsRefiningDesign] = useState(false);
  const [isApplyingStyling, setIsApplyingStyling] = useState(false);

  // Canvas direct click-to-edit states
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [tempEditText, setTempEditText] = useState<string>('');

  // Midjourney Advanced AI Prompt Builder States
  const [mjModel, setMjModel] = useState<'v6.1' | 'niji6' | 'realistic' | 'alpha'>('v6.1');
  const [mjAspectRatio, setMjAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:2'>('1:1');
  const [mjStylePreset, setMjStylePreset] = useState<'cinematic' | 'watercolor' | 'cyberpunk' | 'alpona' | 'oil' | 'anime' | 'clay'>('cinematic');
  const [mjChaos, setMjChaos] = useState<number>(15);
  const [mjStylize, setMjStylize] = useState<number>(250);
  const [mjGeneratedGrid, setMjGeneratedGrid] = useState<string[]>([]);
  const [isGeneratingMjGrid, setIsGeneratingMjGrid] = useState<boolean>(false);
  const [mjActiveSeed, setMjActiveSeed] = useState<number>(42);

  // Canva Drag-to-Position Canvas States
  const [isDraggingLayer, setIsDraggingLayer] = useState<boolean>(false);
  const [dragStartMouse, setDragStartMouse] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragStartElementPos, setDragStartElementPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // Intelligent Style Transfer & Intent Design states
  const [styleWeights, setStyleWeights] = useState({ color: 80, composition: 60, typography: 50, texture: 50 });
  const [styleProfile, setStyleProfile] = useState({ brushStroke: 'medium', lightingContrast: 'soft', subjectHierarchy: 'layered' });
  const [semanticMap, setSemanticMap] = useState({ objects: [], style: '', layout: '', isAnalyzed: false });
  const [isAnalyzingRefImage, setIsAnalyzingRefImage] = useState(false);
  const [isReconstructing, setIsReconstructing] = useState(false);
  const [splitView, setSplitView] = useState(false);
  const [userRatings, setUserRatings] = useState<any[]>([]);
  const [regionMask, setRegionMask] = useState({ active: false, startX: 0, startY: 0, currentX: 0, currentY: 0, x: 0, y: 0, width: 0, height: 0, prompt: '', isDrawing: false });
  const [isVectorizing, setIsVectorizing] = useState(false);
  const [vectorizedLayers, setVectorizedLayers] = useState<any[]>([]);

  // Action: Content-Aware Reconstruction
  const reconstructLayoutFromMap = async () => {
    if (!semanticMap.isAnalyzed) return;
    setIsReconstructing(true);
    try {
      const response = await fetch('/api/ai-design/reconstruct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semanticMap })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.reconstructed) {
          const layers = (data.reconstructed.elements || []).map((el: any, i: number) => ({
            ...el,
            id: `ai_reconstruct_${Date.now()}_${i}`
          }));
          setElements(layers);
          if (data.reconstructed.background) {
            setCanvasBg(data.reconstructed.background);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsReconstructing(false);
    }
  };

  // Action: Depth-Isolated Vector Plate Segmentation
  const segmentAndVectorize = async () => {
    setIsVectorizing(true);
    setTimeout(() => {
      setVectorizedLayers([
        {
          id: 'v_bg',
          name: 'Background Plate',
          type: 'background',
          elements: elements.filter(el => el.type === 'shape' || el.y > 60)
        },
        {
          id: 'v_mid',
          name: 'Midground Vector Elements',
          type: 'midground',
          elements: elements.filter(el => el.type === 'image' || (el.y >= 30 && el.y <= 60))
        },
        {
          id: 'v_fore',
          name: 'Foreground Display Textures',
          type: 'foreground',
          elements: elements.filter(el => el.type === 'text')
        }
      ]);
      setIsVectorizing(false);
    }, 1500);
  };

  // Auto-analysis of uploaded style reference images
  useEffect(() => {
    if (!refImage) {
      setSemanticMap({ objects: [], style: '', layout: '', isAnalyzed: false });
      return;
    }
    
    const analyzeRef = async () => {
      setIsAnalyzingRefImage(true);
      try {
        const response = await fetch('/api/ai-design/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: refImage })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.analysis) {
            setSemanticMap({
              objects: data.analysis.objects || [],
              style: data.analysis.style || '',
              layout: data.analysis.layout || '',
              isAnalyzed: true
            });
            if (data.analysis.styleProfile) {
              setStyleProfile(data.analysis.styleProfile);
            }
          }
        }
      } catch (err) {
        console.error("Failed to analyze image:", err);
      } finally {
        setIsAnalyzingRefImage(false);
      }
    };

    if (!semanticMap.isAnalyzed) {
      analyzeRef();
    }
  }, [refImage, semanticMap.isAnalyzed]);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync elements when template changes
  const selectTemplate = (template: DesignTemplate) => {
    setSelectedTemplate(template);
    setDesignTitle(lang === 'bn' ? template.nameBn : template.name);
    setElements(JSON.parse(JSON.stringify(template.elements)));
    setCanvasBg(JSON.parse(JSON.stringify(template.background)));
    setSelectedElementId(null);
    setActiveFilterId('none');
  };

  // Direct Mouse Drag-to-Position on Canvas (Canva Style)
  const handleLayerMouseDown = (e: React.MouseEvent, elId: string) => {
    e.stopPropagation();
    setSelectedElementId(elId);
    setIsDraggingLayer(true);
    setDragStartMouse({ x: e.clientX, y: e.clientY });
    const el = elements.find(item => item.id === elId);
    if (el) {
      setDragStartElementPos({ x: el.x, y: el.y });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (regionMask.active && regionMask.isDrawing) {
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;
      const rect = canvasEl.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

      setRegionMask(prev => {
        const left = Math.min(prev.startX, x);
        const top = Math.min(prev.startY, y);
        const width = Math.abs(prev.startX - x);
        const height = Math.abs(prev.startY - y);
        return {
          ...prev,
          currentX: x,
          currentY: y,
          x: left,
          y: top,
          width: width,
          height: height
        };
      });
      return;
    }

    if (!isDraggingLayer || !selectedElementId) return;
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const rect = canvasEl.getBoundingClientRect();
    
    const deltaXInPixels = e.clientX - dragStartMouse.x;
    const deltaYInPixels = e.clientY - dragStartMouse.y;
    
    // Calculate percentage delta relative to canvas size
    const deltaXPercent = (deltaXInPixels / rect.width) * 100;
    const deltaYPercent = (deltaYInPixels / rect.height) * 100;
    
    // Smoothly update layer x and y coordinates
    const nextX = Math.max(0, Math.min(100, Math.round((dragStartElementPos.x + deltaXPercent) * 10) / 10));
    const nextY = Math.max(0, Math.min(100, Math.round((dragStartElementPos.y + deltaYPercent) * 10) / 10));
    
    setElements(prev => prev.map(item => {
      if (item.id === selectedElementId) {
        return { ...item, x: nextX, y: nextY };
      }
      return item;
    }));
  };

  const handleCanvasMouseUp = () => {
    if (regionMask.active && regionMask.isDrawing) {
      setRegionMask(prev => ({
        ...prev,
        isDrawing: false
      }));
    }
    setIsDraggingLayer(false);
  };

  // Midjourney Style Quad-Grid Art Generator
  const generateMidjourneyGrid = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingMjGrid(true);
    
    // Map style preset to rich artistic keyword modifiers
    let styleModifiers = "";
    switch (mjStylePreset) {
      case 'cinematic':
        styleModifiers = "cinematic photograph, volumetrical studio lighting, ultra detailed 8k, photorealistic masterpiece, detailed texture, depth of field";
        break;
      case 'watercolor':
        styleModifiers = "dreamy watercolor wash artwork, soft color blending, ink splatter, organic paper texture, elegant visual";
        break;
      case 'cyberpunk':
        styleModifiers = "cyberpunk futuristic cityscape, glowing neon lights, dark high-tech synthwave aesthetic, detailed laser lines";
        break;
      case 'alpona':
        styleModifiers = "traditional Bangladeshi folk art, alpana motifs, rickshaw painting style, vibrant crimson and amber curves, nokshi kantha pattern";
        break;
      case 'oil':
        styleModifiers = "classical heavy-textured oil painting on canvas, dynamic chiaroscuro lighting, rich brush strokes, artistic masterpiece";
        break;
      case 'anime':
        styleModifiers = "vibrant modern anime concept art, beautiful scenery, Studio Ghibli style whimsical colors, high-contrast crisp lines";
        break;
      case 'clay':
        styleModifiers = "3D smooth glossy claymation art, cute volumetric clay elements, modern clay graphics, bright glassmorphism accents";
        break;
    }

    // Adjust canvas dimensions according to Midjourney aspect ratio
    let targetWidth = 600;
    let targetHeight = 600;
    switch (mjAspectRatio) {
      case '16:9':
        targetWidth = 800;
        targetHeight = 450;
        break;
      case '9:16':
        targetWidth = 450;
        targetHeight = 800;
        break;
      case '4:3':
        targetWidth = 640;
        targetHeight = 480;
        break;
      case '3:2':
        targetWidth = 720;
        targetHeight = 480;
        break;
    }

    // Automatically update selected template dimension properties
    setSelectedTemplate(prev => ({
      ...prev,
      width: targetWidth,
      height: targetHeight
    }));

    // Simulate Midjourney chaos & stylize parameters in Stable Diffusion seeds
    const baseSeed = Math.floor(Math.random() * 88888) + (mjChaos * 10);
    const compiledSeeds = [baseSeed, baseSeed + 101, baseSeed + 202, baseSeed + 303];
    
    const promptWithStyles = `${aiPrompt}, ${styleModifiers}, ultra premium backdrop, high-resolution digital design background, no text, no letterings`;
    
    // Build 4 distinct Midjourney style variation links
    const newGridUrls = compiledSeeds.map(seed => {
      return `https://image.pollinations.ai/p/${encodeURIComponent(promptWithStyles)}?width=768&height=768&nologo=true&seed=${seed}`;
    });

    // Prefetch all 4 thumbnails for a premium simultaneous snap-in feel
    try {
      await Promise.all(newGridUrls.map(url => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = resolve;
          img.onerror = resolve;
          img.src = url;
        });
      }));
    } catch (e) {}

    setMjGeneratedGrid(newGridUrls);
    setMjActiveSeed(baseSeed);
    setIsGeneratingMjGrid(false);
  };

  // MULTIMODAL DESIGN STUDIO: Generate 3 custom layout options based on text and optional reference image style
  const generateAiDesigns = async (promptText: string) => {
    if (!promptText.trim()) return;
    setIsGeneratingDesigns(true);
    try {
      const res = await fetch('/api/ai-design/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          referenceImage: refImage,
          styleWeights: styleWeights,
          styleProfile: styleProfile,
          regionMask: regionMask.active ? regionMask : undefined,
          userRatings: userRatings,
          lang: lang
        })
      });
      const data = await res.json();
      if (data.status === 'success' && data.options) {
        setAiGeneratedOptions(data.options);
      } else {
        alert(data.message || "Failed to generate designs. Please make sure your Gemini API key is configured.");
      }
    } catch (err) {
      console.error("Error generating designs:", err);
      alert("Network error while generating design options.");
    } finally {
      setIsGeneratingDesigns(false);
    }
  };

  // LIVE CONVERSATIONAL EDITOR: Apply conversational edits directly to the active canvas background and elements
  const refineDesignWithAi = async (instructionText: string) => {
    if (!instructionText.trim()) return;
    setIsRefiningDesign(true);
    try {
      const res = await fetch('/api/ai-design/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: instructionText,
          elements: elements,
          background: canvasBg,
          regionMask: regionMask.active ? regionMask : undefined,
          lang: lang
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        if (data.background) {
          setCanvasBg(data.background);
        }
        if (data.elements) {
          // Assign unique IDs to layers to avoid React duplicate key bugs
          const layers = data.elements.map((el: any, i: number) => ({
            ...el,
            id: el.id || `layer_refine_${Date.now()}_${i}`
          }));
          setElements(layers);
        }
        setRefinePrompt('');
      } else {
        alert(data.message || "Failed to apply AI edits to the canvas.");
      }
    } catch (err) {
      console.error("Error refining active canvas:", err);
      alert("Network error while updating active canvas layout.");
    } finally {
      setIsRefiningDesign(false);
    }
  };

  // APPLY AI STYLING: Call server endpoint to analyze reference image and style current canvas elements
  const applyAiStyling = async () => {
    if (!refImage) return;
    setIsApplyingStyling(true);
    try {
      const res = await fetch('/api/ai-design/apply-styling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          elements,
          background: canvasBg,
          referenceImage: refImage
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        if (data.background) {
          setCanvasBg({
            type: data.background.type || 'color',
            value: data.background.value || '#ffffff',
            overlayOpacity: 0.3
          });
        }
        if (data.elements) {
          const styledLayers = data.elements.map((el: any, i: number) => ({
            ...el,
            id: el.id || `layer_styled_${Date.now()}_${i}`
          }));
          setElements(styledLayers);
        }
      } else {
        alert(data.message || "Failed to map AI styling. Please make sure your Gemini API key is configured.");
      }
    } catch (err) {
      console.error("Error applying AI styling:", err);
      alert("Network error while applying AI styling layers.");
    } finally {
      setIsApplyingStyling(false);
    }
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

  const exportToProfessionalFormat = (canvas: HTMLCanvasElement, format: 'png' | 'jpg' | 'pdf' | 'eps' | 'tif' | 'psd') => {
    const title = designTitle.replace(/\s+/g, '_') || 'neora_design';
    
    if (format === 'png') {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${title}.png`;
      link.href = dataUrl;
      link.click();
    } else if (format === 'jpg') {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.download = `${title}.jpg`;
      link.href = dataUrl;
      link.click();
    } else if (format === 'tif') {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${title}.tif`;
      link.href = dataUrl;
      link.click();
    } else if (format === 'pdf') {
      const dataUrl = canvas.toDataURL('image/png');
      const pdfWindow = window.open('', '_blank');
      if (pdfWindow) {
        pdfWindow.document.write(`
          <html>
            <head>
              <title>${designTitle} - PDF Print Sheet</title>
              <style>
                body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
                img { max-width: 100%; height: auto; page-break-inside: avoid; }
                @page { size: auto; margin: 0; }
                @media print {
                  body { background: none; }
                  img { width: 100%; height: 100%; }
                }
              </style>
            </head>
            <body>
              <img src="${dataUrl}" onload="window.print();" />
            </body>
          </html>
        `);
        pdfWindow.document.close();
      }
    } else if (format === 'eps') {
      const canvasWidth = selectedTemplate.width || 600;
      const canvasHeight = selectedTemplate.height || 420;
      
      let epsContent = `%!PS-Adobe-3.0 EPSF-3.0\n`;
      epsContent += `%%BoundingBox: 0 0 ${canvasWidth} ${canvasHeight}\n`;
      epsContent += `%%Title: ${designTitle} - Vector Graphic\n`;
      epsContent += `%%Creator: Neora Canva Studio\n`;
      epsContent += `%%EndComments\n\n`;
      
      epsContent += `/rect { newpath moveto 1 index 0 rlineto 0 exch rlineto neg 0 rlineto closepath fill } def\n`;
      epsContent += `/circle { newpath 0 360 arc fill } def\n\n`;
      
      if (canvasBg.type === 'color') {
        const hex = canvasBg.value || '#ffffff';
        const r = parseInt(hex.substring(1, 3), 16) / 255;
        const g = parseInt(hex.substring(3, 5), 16) / 255;
        const b = parseInt(hex.substring(5, 7), 16) / 255;
        epsContent += `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor\n`;
        epsContent += `0 0 ${canvasWidth} ${canvasHeight} rect\n\n`;
      } else {
        epsContent += `0.96 0.96 0.98 setrgbcolor\n`;
        epsContent += `0 0 ${canvasWidth} ${canvasHeight} rect\n\n`;
      }
      
      elements.forEach((el) => {
        const xPos = (el.x / 100) * canvasWidth;
        const yPos = canvasHeight - ((el.y / 100) * canvasHeight);
        
        if (el.type === 'text') {
          const hex = el.color || '#000000';
          const r = parseInt(hex.substring(1, 3), 16) / 255;
          const g = parseInt(hex.substring(3, 5), 16) / 255;
          const b = parseInt(hex.substring(5, 7), 16) / 255;
          
          epsContent += `gsave\n`;
          epsContent += `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor\n`;
          
          const epsFont = el.fontFamily === 'Galada' || el.fontFamily === 'Hind Siliguri' ? 'Helvetica-Bold' : el.fontFamily || 'Helvetica-Bold';
          epsContent += `/${epsFont} findfont ${el.fontSize || 14} scalefont setfont\n`;
          
          const safeText = el.content.replace(/[()\\\n]/g, '\\$&');
          
          if (el.align === 'center') {
            epsContent += `(${safeText}) stringwidth pop 2 div neg ${xPos.toFixed(1)} add ${yPos.toFixed(1)} moveto\n`;
          } else if (el.align === 'right') {
            epsContent += `(${safeText}) stringwidth pop neg ${xPos.toFixed(1)} add ${yPos.toFixed(1)} moveto\n`;
          } else {
            epsContent += `${xPos.toFixed(1)} ${yPos.toFixed(1)} moveto\n`;
          }
          epsContent += `(${safeText}) show\n`;
          epsContent += `grestore\n\n`;
        } else if (el.type === 'shape') {
          const hex = el.color || '#cccccc';
          const r = parseInt(hex.substring(1, 3), 16) / 255;
          const g = parseInt(hex.substring(3, 5), 16) / 255;
          const b = parseInt(hex.substring(5, 7), 16) / 255;
          
          const w = ((el.width || 20) / 100) * canvasWidth;
          const h = ((el.height || 20) / 100) * canvasHeight;
          
          epsContent += `gsave\n`;
          epsContent += `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor\n`;
          
          if (el.content === 'border_ring') {
            epsContent += `newpath ${xPos.toFixed(1)} ${yPos.toFixed(1)} ${w.toFixed(1)} 0 360 arc stroke\n`;
          } else {
            epsContent += `${(xPos - w/2).toFixed(1)} ${(yPos - h/2).toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)} rect\n`;
          }
          epsContent += `grestore\n\n`;
        }
      });
      
      epsContent += `showpage\n%%EOF\n`;
      
      const blob = new Blob([epsContent], { type: 'application/postscript' });
      const link = document.createElement('a');
      link.download = `${title}.eps`;
      link.href = URL.createObjectURL(blob);
      link.click();
    } else if (format === 'psd') {
      const canvasWidth = selectedTemplate.width || 600;
      const canvasHeight = selectedTemplate.height || 420;
      
      const header = new Uint8Array(26);
      header[0] = 0x38; header[1] = 0x42; header[2] = 0x50; header[3] = 0x53;
      header[4] = 0x00; header[5] = 0x01;
      header[6] = 0; header[7] = 0; header[8] = 0; header[9] = 0; header[10] = 0; header[11] = 0;
      header[12] = 0x00; header[13] = 0x03;
      header[14] = (canvasHeight >> 24) & 0xFF;
      header[15] = (canvasHeight >> 16) & 0xFF;
      header[16] = (canvasHeight >> 8) & 0xFF;
      header[17] = canvasHeight & 0xFF;
      header[18] = (canvasWidth >> 24) & 0xFF;
      header[19] = (canvasWidth >> 16) & 0xFF;
      header[20] = (canvasWidth >> 8) & 0xFF;
      header[21] = canvasWidth & 0xFF;
      header[22] = 0x00; header[23] = 0x08;
      header[24] = 0x00; header[25] = 0x03;
      
      const manifestStr = JSON.stringify({
        title: designTitle,
        width: canvasWidth,
        height: canvasHeight,
        background: canvasBg,
        layers: elements
      }, null, 2);
      
      const encoder = new TextEncoder();
      const manifestBytes = encoder.encode(manifestStr);
      
      const finalBlob = new Blob([header, new Uint8Array([0, 0, 0, 0]), manifestBytes], { type: 'image/vnd.adobe.photoshop' });
      const link = document.createElement('a');
      link.download = `${title}.psd`;
      link.href = URL.createObjectURL(finalBlob);
      link.click();
    }
  };

  // Export & Download high resolution visual canvas using html2canvas
  const handleDownload = async (format: 'png' | 'jpg' | 'pdf' | 'eps' | 'tif' | 'psd' = 'png') => {
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
          logging: false,
          onclone: (clonedDoc) => {
            const elementsWithOklch = clonedDoc.querySelectorAll('*');
            elementsWithOklch.forEach((el: any) => {
              // Replace variable assignments and style properties
              const styleAttr = el.getAttribute('style');
              if (styleAttr && styleAttr.includes('oklch')) {
                let sanitized = styleAttr;
                sanitized = sanitized.replace(/oklch\([^)]+\)/g, 'rgb(6, 182, 212)'); 
                el.setAttribute('style', sanitized);
              }
              if (el.className && typeof el.className === 'string') {
                if (el.className.includes('ring-') || el.className.includes('border-cyan-500')) {
                  el.style.borderColor = 'rgb(34, 211, 238)';
                  el.style.boxShadow = 'none';
                }
              }
            });
          }
        });
        
        exportToProfessionalFormat(canvas, format);
      } catch (err) {
        console.error("Failed to capture canvas:", err);
        alert("Could not export canvas. Please try another format or printing.");
      } finally {
        setSelectedElementId(prevSelected);
      }
    }, 150);
  };

  // Mouse Event handlers for Interactive Region Selection mask drawing
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!regionMask.active) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setRegionMask(prev => ({
      ...prev,
      isDrawing: true,
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
      x: x,
      y: y,
      width: 0,
      height: 0
    }));
  };

  // Live filtered list of roadmap items for the 1000+ scales plan
  const filteredRoadmapItems = ROADMAP_ITEMS.filter((item) => {
    const matchesCategory = roadmapCategory === 'all' || item.category === roadmapCategory;
    const searchLower = roadmapSearch.toLowerCase();
    const matchesSearch = 
      item.featureName.toLowerCase().includes(searchLower) ||
      item.featureNameBn.toLowerCase().includes(searchLower) ||
      item.scaleMetric.toLowerCase().includes(searchLower) ||
      item.scaleMetricBn.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.descriptionBn.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  return (
    <div id="graphic-studio-container" className="flex flex-col bg-[#0f111a] text-slate-100 min-h-[calc(100vh-140px)] select-none">
      
      {/* 1. TOP NAV BAR */}
      <CanvaHeader
        lang={lang}
        designTitle={designTitle}
        setDesignTitle={setDesignTitle}
        selectedTemplate={selectedTemplate}
        PRESETS={PRESETS}
        selectTemplate={selectTemplate}
        handlePrint={handlePrint}
        handleDownload={handleDownload}
      />

      {/* 2. CONTEXTUAL FORMATTING TOOLBAR */}
      <CanvaFormattingToolbar
        lang={lang}
        activeElement={activeElement}
        updateElementProp={updateElementProp}
        deleteElement={deleteElement}
        duplicateElement={duplicateElement}
        FONT_FAMILIES={FONT_FAMILIES}
        showGridLines={showGridLines}
        setShowGridLines={setShowGridLines}
        showSafeZone={showSafeZone}
        setShowSafeZone={setShowSafeZone}
        canvasBg={canvasBg}
        setCanvasBg={setCanvasBg}
        GRADIENTS={GRADIENTS}
      />

      {/* 3. MAIN WORKSPACE AREA */}
      <div className="flex flex-1 overflow-hidden relative min-h-[550px]">
        
        {/* Left Canva Rail + Slide-out Panels */}
        <CanvaSidebarPanel
          lang={lang}
          sidebarTab={sidebarTab}
          setSidebarTab={setSidebarTab}
          PRESETS={PRESETS}
          selectedTemplate={selectedTemplate}
          selectTemplate={selectTemplate}
          elements={elements}
          setElements={setElements}
          canvasBg={canvasBg}
          setCanvasBg={setCanvasBg}
          updateElementProp={updateElementProp}
          GRADIENTS={GRADIENTS}
          newTextVal={newTextVal}
          setNewTextVal={setNewTextVal}
          addNewText={addNewText}
          addNewShape={addNewShape}
          aiPrompt={aiPrompt}
          setAiPrompt={setAiPrompt}
          aiImageType={aiImageType}
          setAiImageType={setAiImageType}
          generateAiAsset={generateAiAsset}
          isGeneratingAi={isGeneratingAi}
          fileInputRef={fileInputRef}
          handleImageUpload={handleImageUpload}
          copilotPrompt={copilotPrompt}
          setCopilotPrompt={setCopilotPrompt}
          copilotStatus={copilotStatus}
          copilotLogs={copilotLogs}
          activeCopilotAgent={activeCopilotAgent}
          runCopilotWorkflow={runCopilotWorkflow}
          refImage={refImage}
          setRefImage={setRefImage}
          aiGeneratedOptions={aiGeneratedOptions}
          setAiGeneratedOptions={setAiGeneratedOptions}
          isGeneratingDesigns={isGeneratingDesigns}
          generateAiDesigns={generateAiDesigns}
          applyAiStyling={applyAiStyling}
          isApplyingStyling={isApplyingStyling}
          refinePrompt={refinePrompt}
          setRefinePrompt={setRefinePrompt}
          isRefiningDesign={isRefiningDesign}
          refineDesignWithAi={refineDesignWithAi}
          mjModel={mjModel}
          setMjModel={setMjModel}
          mjAspectRatio={mjAspectRatio}
          setMjAspectRatio={setMjAspectRatio}
          mjStylePreset={mjStylePreset}
          setMjStylePreset={setMjStylePreset}
          mjChaos={mjChaos}
          setMjChaos={setMjChaos}
          mjStylize={mjStylize}
          setMjStylize={setMjStylize}
          mjGeneratedGrid={mjGeneratedGrid}
          isGeneratingMjGrid={isGeneratingMjGrid}
          generateMidjourneyGrid={generateMidjourneyGrid}
          setShowRoadmapModal={setShowRoadmapModal}
          ROADMAP_ITEMS={ROADMAP_ITEMS}
          roadmapSearch={roadmapSearch}
          setRoadmapSearch={setRoadmapSearch}
          roadmapCategory={roadmapCategory}
          setRoadmapCategory={setRoadmapCategory}
          filteredRoadmapItems={filteredRoadmapItems}

          styleWeights={styleWeights}
          setStyleWeights={setStyleWeights}
          styleProfile={styleProfile}
          setStyleProfile={setStyleProfile}
          semanticMap={semanticMap}
          setSemanticMap={setSemanticMap}
          isAnalyzingRefImage={isAnalyzingRefImage}
          reconstructLayoutFromMap={reconstructLayoutFromMap}
          isReconstructing={isReconstructing}
          splitView={splitView}
          setSplitView={setSplitView}
          userRatings={userRatings}
          setUserRatings={setUserRatings}
          regionMask={regionMask}
          setRegionMask={setRegionMask}
          isVectorizing={isVectorizing}
          segmentAndVectorize={segmentAndVectorize}
          vectorizedLayers={vectorizedLayers}
          setVectorizedLayers={setVectorizedLayers}
        />

        {/* Center Canvas Stage Area with light Canva-like background */}
        <div 
          className="flex-1 bg-[#e8ebf2] p-6 flex flex-col items-center justify-between overflow-auto relative select-none"
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onClick={() => setSelectedElementId(null)}
        >
          {/* Top Quick Photo Presets / Filters Rail */}
          <div className="w-full max-w-lg mb-4 shrink-0 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-1.5 shrink-0">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-mono font-black text-slate-300 uppercase tracking-widest">
                {lang === 'bn' ? 'আর্টওয়ার্ক ফিল্টারস' : 'PHOTO FILTERS:'}
              </span>
            </div>
            
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none py-0.5 max-w-[280px] md:max-w-[340px]">
              {activeFilterId !== 'none' && (
                <button
                  onClick={() => setActiveFilterId('none')}
                  className="px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-mono cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>RESET</span>
                </button>
              )}
              {PHOTO_PRESETS.map((p) => {
                const isActive = activeFilterId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActiveFilterId(p.id)}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono cursor-pointer transition-all ${
                      isActive ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang === 'bn' ? p.nameBn : p.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actual Scaled Canvas Stage Element with side-by-side split view option */}
          <div className={`flex ${splitView && refImage ? 'flex-col md:flex-row gap-6 items-center justify-center w-full max-w-5xl' : 'items-center justify-center'}`}>
            {splitView && refImage && (
              <div 
                className="relative bg-slate-950 border border-dashed border-cyan-500/30 rounded-xl overflow-hidden select-none cursor-default flex flex-col items-center justify-center p-3 shadow-lg animate-fade-in shrink-0"
                style={{
                  width: `${Math.min(selectedTemplate.width, 320)}px`,
                  height: `${Math.min(selectedTemplate.height, 320)}px`,
                  aspectRatio: `${selectedTemplate.width} / ${selectedTemplate.height}`,
                }}
              >
                <div className="absolute top-2 left-2 bg-cyan-500 text-slate-950 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow z-10">
                  {lang === 'bn' ? 'স্টাইল রেফারেন্স' : 'STYLE REFERENCE'}
                </div>
                <img 
                  src={refImage} 
                  alt="Split View Reference" 
                  className="w-full h-full object-contain rounded"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div 
              className="relative bg-white shadow-[0_12px_45px_rgba(0,0,0,0.12)] border border-slate-300 rounded overflow-hidden select-none cursor-default animate-fade-in shrink-0"
              style={{
                width: `${selectedTemplate.width}px`,
                height: `${selectedTemplate.height}px`,
                maxWidth: '90%',
                maxHeight: '75vh',
                aspectRatio: `${selectedTemplate.width} / ${selectedTemplate.height}`,
              }}
            >
            {/* Main design print zone capturing ref */}
            <div
              ref={canvasRef}
              id="print-canvas-area"
              className="absolute inset-0 w-full h-full"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              style={{
                backgroundImage: canvasBg.type === 'gradient' 
                  ? canvasBg.value 
                  : (canvasBg.type === 'image' ? `url(${canvasBg.value})` : undefined),
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: canvasBg.type === 'color' ? canvasBg.value : undefined,
                filter: PHOTO_PRESETS.find(p => p.id === activeFilterId)?.filter || 'none',
                transform: `scale(${canvasScale / 100})`,
                transformOrigin: 'center center',
                transition: 'filter 0.3s ease-in-out, transform 0.2s ease-out'
              }}
            >
              {/* Alignment Grid Lines Overlay */}
              {showGridLines && (
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 pointer-events-none z-10">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className="border-b border-r border-cyan-500/15" />
                  ))}
                </div>
              )}

              {/* Print Bleed Safe Zone Margin Boundary Overlay */}
              {showSafeZone && (
                <div className="absolute inset-[6%] border border-dashed border-emerald-500/35 pointer-events-none z-10 flex items-end justify-end p-1">
                  <span className="text-[8px] font-mono text-emerald-400/60 uppercase tracking-widest">{lang === 'bn' ? 'ব্লিড মার্জিন বাউন্ডারি' : 'BLEED SAFE LIMIT'}</span>
                </div>
              )}

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
                    onMouseDown={(e) => handleLayerMouseDown(e, el.id)}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      if (el.type === 'text') {
                        setEditingTextId(el.id);
                        setTempEditText(el.content);
                      }
                    }}
                    className={`absolute group-hover:cursor-pointer select-none ${
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
                    title={el.type === 'text' ? (lang === 'bn' ? 'ডাবল-ক্লিক করে সরাসরি এডিট করুন' : 'Double-click to edit text directly') : undefined}
                  >
                    {/* TEXT LAYERS */}
                    {el.type === 'text' && (
                      editingTextId === el.id ? (
                        <textarea
                          value={tempEditText}
                          onChange={(e) => {
                            setTempEditText(e.target.value);
                            updateElementProp(el.id, 'content', e.target.value);
                          }}
                          onBlur={() => setEditingTextId(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              setEditingTextId(null);
                            }
                          }}
                          className="bg-slate-900/95 text-white border-2 border-cyan-400 rounded px-2 py-1 text-center font-sans focus:outline-none min-w-[220px] max-w-[320px]"
                          style={{
                            fontSize: `${el.fontSize ?? 14}px`,
                            fontFamily: el.fontFamily,
                            lineHeight: el.lineHeight ?? 1.25,
                          }}
                          autoFocus
                        />
                      ) : (
                        <div
                          style={{
                            fontFamily: el.fontFamily,
                            fontSize: `${el.fontSize ?? 14}px`,
                            color: el.color,
                            fontWeight: el.fontWeight,
                            textAlign: el.align ?? 'center',
                            textShadow: el.shadow ? '2px 2px 4px rgba(0,0,0,0.75)' : 'none',
                            letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : 'normal',
                            whiteSpace: 'pre-wrap',
                            lineHeight: el.lineHeight ?? 1.25,
                            padding: '4px 8px',
                            borderRadius: el.borderRadius ? `${el.borderRadius}px` : undefined,
                          }}
                        >
                          {el.content}
                        </div>
                      )
                    )}

                    {/* SHAPE LAYERS */}
                    {el.type === 'shape' && (
                      <div className="w-full h-full flex items-center justify-center pointer-events-none">
                        {el.content === 'rect_horizontal' && (
                          <div 
                            className="w-full h-2.5 bg-cyan-500 rounded-full border border-cyan-400"
                            style={{
                              backgroundColor: el.color || '#06b6d4',
                              borderRadius: `${el.borderRadius || 4}px`
                            }}
                          />
                        )}
                        {el.content === 'border_ring' && (
                          <div 
                            className="w-full h-full border-[3px] border-amber-400 bg-transparent"
                            style={{
                              borderColor: el.color || '#f59e0b',
                              borderRadius: `${el.borderRadius || 4}px`
                            }}
                          />
                        )}
                      </div>
                    )}

                    {/* IMAGE LAYERS */}
                    {el.type === 'image' && (
                      <img 
                        src={el.content} 
                        alt="sticker asset" 
                        className="w-full h-full object-cover pointer-events-none select-none"
                        style={{ borderRadius: `${el.borderRadius || 8}px` }}
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                );
              })}

              {/* Region Selection Masking overlay boundary box */}
              {regionMask.active && regionMask.width > 0 && regionMask.height > 0 && (
                <div
                  className="absolute border-2 border-dashed border-yellow-400 bg-yellow-400/10 pointer-events-none z-40 flex items-start justify-start animate-pulse"
                  style={{
                    left: `${regionMask.x}%`,
                    top: `${regionMask.y}%`,
                    width: `${regionMask.width}%`,
                    height: `${regionMask.height}%`
                  }}
                >
                  <div className="bg-yellow-400 text-slate-950 font-bold font-mono text-[8px] px-1 py-0.5 rounded-br uppercase tracking-widest shadow">
                    {lang === 'bn' ? 'সম্পাদনা অঞ্চল' : 'Edit Region'}
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>

          {/* Bottom Zoom & Guide tools */}
          <div className="w-full max-w-lg mt-4 shrink-0 bg-slate-950 p-2 rounded-2xl border border-slate-800/80 flex items-center justify-between px-4">
            {/* Quick Alignment Matrix (Canva Style) */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{lang === 'bn' ? 'সরাসরি অ্যালাইনমেন্ট:' : 'QUICK ALIGN:'}</span>
              {activeElement && (
                <div className="flex gap-1">
                  {[
                    { label: 'L', title: 'Align Left', x: 10, y: undefined },
                    { label: 'C', title: 'Align H-Center', x: 50, y: undefined },
                    { label: 'R', title: 'Align Right', x: 90, y: undefined },
                    { label: 'T', title: 'Align Top', x: undefined, y: 10 },
                    { label: 'M', title: 'Align V-Center', x: undefined, y: 50 },
                    { label: 'B', title: 'Align Bottom', x: undefined, y: 90 },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (btn.x !== undefined) updateElementProp(activeElement.id, 'x', btn.x);
                        if (btn.y !== undefined) updateElementProp(activeElement.id, 'y', btn.y);
                      }}
                      className="px-2 py-0.5 bg-slate-900 border border-slate-800 hover:border-cyan-500 text-[10px] font-mono text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
                      title={btn.title}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-slate-400 uppercase">SCALE:</span>
              <button 
                onClick={() => setCanvasScale(prev => Math.max(50, prev - 10))}
                className="p-1 bg-slate-900 rounded text-slate-400 hover:text-white cursor-pointer"
              >
                -
              </button>
              <span className="text-[10px] font-mono text-cyan-400 font-bold w-10 text-center">{canvasScale}%</span>
              <button 
                onClick={() => setCanvasScale(prev => Math.min(150, prev + 10))}
                className="p-1 bg-slate-900 rounded text-slate-400 hover:text-white cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ROADMAP MODAL */}
      {showRoadmapModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 bg-slate-950/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest block">
                  1,000+ CUSTOM WORKFLOW FEATURES
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Neora Graphics Copilot Scaling Target
                </h3>
              </div>
              <button 
                onClick={() => { setShowRoadmapModal(false); setRoadmapSearch(''); setRoadmapCategory('all'); }}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 border-b border-slate-850 flex flex-col sm:flex-row gap-3">
              <div className="flex gap-1.5 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                {ROADMAP_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setRoadmapCategory(c.id)}
                    className={`px-3 py-1 text-[10px] font-bold font-mono rounded-md uppercase transition-colors ${
                      roadmapCategory === c.id
                        ? 'bg-cyan-500 text-slate-950 font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang === 'bn' ? c.labelBn : c.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={roadmapSearch}
                  onChange={(e) => setRoadmapSearch(e.target.value)}
                  placeholder={lang === 'bn' ? 'ফিচার খুঁজুন...' : 'Search roadmap scales...'}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {filteredRoadmapItems.length === 0 ? (
                <div className="p-8 border border-dashed border-slate-850 rounded-xl text-center text-xs text-slate-500 font-mono uppercase tracking-widest">
                  No features found matching "${roadmapSearch}"
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredRoadmapItems.map((item) => {
                    const statusColors = {
                      planned: 'bg-slate-950 text-slate-500 border-slate-850',
                      progress: 'bg-amber-500/15 border-amber-500/20 text-amber-400',
                      complete: 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400'
                    };
                    return (
                      <div key={item.id} className="p-3 border border-slate-850 bg-slate-950/25 rounded-xl hover:border-slate-800 transition-colors flex flex-col justify-between gap-2">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[8px] font-mono text-cyan-400 font-black uppercase tracking-wider">{item.category}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black font-mono border uppercase ${statusColors[item.status]}`}>
                              {item.status}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white mt-1">
                            {lang === 'bn' ? item.featureNameBn : item.featureName}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                            {lang === 'bn' ? item.descriptionBn : item.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-900 pt-1.5">
                          <span className="text-[8px] font-mono text-slate-500">SCALE METRIC:</span>
                          <span className="text-[9px] font-mono text-cyan-400 font-bold">{lang === 'bn' ? item.scaleMetricBn : item.scaleMetric}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/30 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono uppercase">
                © {new Date().getFullYear()} Neora Design Studio Engine v2.4.0 • 1,024 Features Scaling Target
              </span>
              <button
                onClick={() => { setShowRoadmapModal(false); setRoadmapSearch(''); setRoadmapCategory('all'); }}
                className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-sans cursor-pointer transition-colors"
              >
                {lang === 'bn' ? 'ঠিক আছে' : 'Close Studio Roadmap'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
