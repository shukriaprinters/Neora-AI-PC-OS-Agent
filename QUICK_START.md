# NEORA Neural OS Agent - 5 Minute Quick Start

## সবচেয়ে দ্রুত উপায়ে শুরু করুন | Fastest Way to Get Started

---

## ১ মিনিট: ডাউনলোড ও ইনস্টল | Download & Install

### Windows/Mac/Linux

```bash
# ১. GitHub থেকে ডাউনলোড করুন
git clone https://github.com/shukriaprinters/Neora-AI-PC-OS-Agent.git
cd Neora-AI-PC-OS-Agent
git checkout neural-os-agent

# ২. প্যাকেজ ইনস্টল করুন
npm install
```

**এটাই! এখন পরবর্তী ধাপে যান।**

---

## ২ মিনিট: চালু করুন | Start Server

```bash
# টার্মিনালে এই কমান্ড চালান:
npm run dev

# আপনি দেখবেন:
# ✓ Neora OS Agent running on http://localhost:3000
```

**হয়ে গেছে! সার্ভার চলছে।**

---

## ৩ মিনিট: ব্রাউজারে খুলুন | Open in Browser

আপনার ওয়েব ব্রাউজার খুলুন এবং এটি ভিজিট করুন:

```
http://localhost:3000
```

**আপনার Neora এজেন্ট এখন লাইভ! 🎉**

---

## কী করতে পারবেন | What You Can Do Now

### রিয়েল-টাইম মনিটরিং
- CPU, Memory, Disk, Network দেখুন
- লাইভ চার্ট দেখুন
- সিস্টেম স্ট্যাটাস পরীক্ষা করুন

### ভয়েস কমান্ড
```
মাইক আইকন → কথা বলুন → এন্টার দিন
```

### টার্মিনাল
```
ls -la
npm --version
node --version
```

### ওয়ার্কফ্লো
- অটোমেশন তৈরি করুন
- সময়সূচী সেট করুন
- কমান্ড সংরক্ষণ করুন

---

## পরবর্তী ধাপ | Next Steps

### অন্য ডিভাইস থেকে অ্যাক্সেস করুন

```bash
# আপনার IP জানুন:
# Windows: ipconfig
# Mac/Linux: ifconfig | grep inet

# অন্য ডিভাইসে খুলুন:
http://192.168.1.100:3000
```

### API কী যোগ করুন (ঐচ্ছিক)

প্রকল্পের মূলে `.env.local` ফাইল তৈরি করুন:

```env
VITE_GROQ_API_KEY=your_key_here
VITE_GOOGLE_API_KEY=your_key_here
```

তারপর সার্ভার পুনরায় চালু করুন: `npm run dev`

---

## অনলাইনে স্থাপন করুন | Deploy Online

### Vercel (সবচেয়ে সহজ)

```bash
# ইতিমধ্যে GitHub পুশ করুন
git push

# Vercel.com যান
# "Import Project" ক্লিক করুন
# আপনার রিপোজিটরি নির্বাচন করুন
# "Deploy" ক্লিক করুন

# ✓ আপনার অ্যাপ এখন অনলাইনে!
# URL: https://neora-yourname.vercel.app
```

### AWS, DigitalOcean, Heroku

বিস্তারিত গাইডের জন্য দেখুন: `NEORA_LOCAL_WEB_GUIDE_ENGLISH.md`

---

## সাধারণ কমান্ড | Common Commands

```bash
# সার্ভার চালু করুন
npm run dev

# প্রোডাকশন বিল্ড করুন
npm run build

# প্রোডাকশন চালু করুন
npm start

# ডিপেন্ডেন্সি আপডেট করুন
npm update

# নতুন ডিপেন্ডেন্সি ইনস্টল করুন
npm install package-name
```

---

## সমস্যা? | Problem?

### পোর্ট ব্যবহারে আছে

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID xxxx /F

# Mac/Linux
lsof -i :3000
kill -9 xxxx
```

### "Cannot find module"

```bash
npm install
# অথবা
npm cache clean --force
npm install
```

### ব্রাউজার সংযোগ করতে পারছে না

```bash
# সার্ভার চলছে কিনা পরীক্ষা করুন:
curl http://localhost:3000

# ব্রাউজার ক্যাশ পরিষ্কার করুন: Ctrl+Shift+Delete
```

---

## সম্পূর্ণ ডকুমেন্টেশন | Full Documentation

- **বিস্তারিত গাইড (বাংলা)**: `NEORA_LOCAL_WEB_GUIDE_BENGALI.md`
- **বিস্তারিত গাইড (ইংরেজি)**: `NEORA_LOCAL_WEB_GUIDE_ENGLISH.md`
- **প্রিমিয়াম ফিচার**: `README_PREMIUM.md`
- **ডিপ্লয়মেন্ট**: `BROWSER_DEPLOYMENT_GUIDE.md`

---

## আরও সাহায্য | Need More Help?

1. **GitHub Issues**: https://github.com/shukriaprinters/Neora-AI-PC-OS-Agent/issues
2. **ডকুমেন্টেশন ফোল্ডার**: সমস্ত .md ফাইল দেখুন
3. **সার্ভার লগ**: `npm run dev` এর আউটপুট দেখুন

---

**আপনি প্রস্তুত! হ্যাপি কোডিং! 🚀**

**You're all set! Happy coding! 🚀**
