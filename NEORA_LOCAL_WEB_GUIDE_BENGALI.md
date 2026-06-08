# NEORA NEURAL OS AGENT - স্থানীয় এবং ওয়েব স্থাপনা গাইড (বাংলা)

## সূচিপত্র
1. [সিস্টেম প্রয়োজনীয়তা](#সিস্টেম-প্রয়োজনীয়তা)
2. [স্থানীয় PC তে চালানো](#স্থানীয়-pc-তে-চালানো)
3. [ওয়েব স্থাপনা](#ওয়েব-স্থাপনা)
4. [ব্যবহারকারীর নির্দেশিকা](#ব্যবহারকারীর-নির্দেশিকা)
5. [সমস্যা সমাধান](#সমস্যা-সমাধান)

---

## সিস্টেম প্রয়োজনীয়তা

### ন্যূনতম প্রয়োজনীয়তা
- **অপারেটিং সিস্টেম**: Windows 10/11, macOS 10.15+, Linux (Ubuntu 18.04+)
- **প্রসেসর**: Intel i5 বা সমতুল্য
- **RAM**: 4GB (8GB সুপারিশকৃত)
- **ডিস্ক স্থান**: 2GB
- **ইন্টারনেট**: ওয়েব স্থাপনার জন্য প্রয়োজন

### প্রয়োজনীয় সফটওয়্যার
- **Node.js**: v18.0.0 বা উচ্চতর ([nodejs.org](https://nodejs.org) থেকে ডাউনলোড করুন)
- **Git**: সংস্করণ নিয়ন্ত্রণের জন্য ([git-scm.com](https://git-scm.com))
- **npm/yarn/pnpm**: Node.js এর সাথে আসে

---

## স্থানীয় PC তে চালানো

### ধাপ 1: প্রকল্প সেটআপ

```bash
# ধাপ 1: GitHub থেকে প্রকল্প ক্লোন করুন
git clone https://github.com/shukriaprinters/Neora-AI-PC-OS-Agent.git
cd Neora-AI-PC-OS-Agent

# ধাপ 2: সঠিক শাখায় যান
git checkout neural-os-agent

# ধাপ 3: নির্ভরতা ইনস্টল করুন
npm install
# বা
yarn install
# বা
pnpm install
```

### ধাপ 2: পরিবেশ ভেরিয়েবল সেটআপ

একটি `.env.local` ফাইল তৈরি করুন প্রকল্পের মূলে:

```env
# সার্ভার কনফিগারেশন
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000

# AI মডেল কীগুলি (ঐচ্ছিক - কিন্তু সম্পূর্ণ কার্যকারিতার জন্য সুপারিশকৃত)
VITE_GROQ_API_KEY=আপনার_গ্রোক_এপিআই_কী
VITE_GOOGLE_API_KEY=আপনার_গুগল_এপিআই_কী

# ডাটাবেস
DATABASE_URL=sqlite:./neora.db
```

**API কীগুলি কীভাবে পান:**
- **Groq**: [console.groq.com](https://console.groq.com) এ যান এবং একটি API কী তৈরি করুন
- **Google GenAI**: [makersuite.google.com](https://makersuite.google.com) এ যান এবং একটি API কী তৈরি করুন

### ধাপ 3: স্থানীয়ভাবে চালান

```bash
# উন্নয়ন মোডে চালান
npm run dev

# আউটপুট দেখবেন:
# ✓ Neora OS Agent running on http://localhost:3000
# ✓ WebSocket server ready on ws://localhost:3000
```

### ধাপ 4: ব্রাউজারে অ্যাক্সেস করুন

আপনার প্রিয় ওয়েব ব্রাউজার খুলুন এবং নেভিগেট করুন:

```
http://localhost:3000
```

এখন আপনার স্থানীয় Neora এজেন্ট সম্পূর্ণভাবে কার্যকর!

---

## স্থানীয় PC থেকে অন্যান্য ডিভাইসে অ্যাক্সেস

আপনার নেটওয়ার্কের অন্যান্য ডিভাইস থেকে Neora অ্যাক্সেস করতে চাইলে:

### আপনার স্থানীয় IP খুঁজুন

**Windows:**
```bash
ipconfig
# "IPv4 Address" খুঁজুন (উদাহরণ: 192.168.1.100)
```

**macOS/Linux:**
```bash
ifconfig | grep inet
# 192.168.x.x খুঁজুন
```

### অন্য ডিভাইস থেকে অ্যাক্সেস করুন

একই নেটওয়ার্কের অন্য ডিভাইসে ব্রাউজার খুলুন এবং টাইপ করুন:

```
http://192.168.1.100:3000
```

(192.168.1.100 কে আপনার প্রকৃত IP দিয়ে প্রতিস্থাপন করুন)

---

## ওয়েব স্থাপনা

### অপশন 1: Vercel এ স্থাপনা (সবচেয়ে সহজ)

**পূর্বশর্ত:**
- Vercel অ্যাকাউন্ট ([vercel.com](https://vercel.com))
- GitHub অ্যাকাউন্ট

**ধাপগুলি:**

1. Vercel এ লগইন করুন
2. "Import Project" ক্লিক করুন
3. আপনার GitHub রিপোজিটরি নির্বাচন করুন
4. পরিবেশ ভেরিয়েবল যোগ করুন:
   ```
   VITE_GROQ_API_KEY = আপনার_কী
   VITE_GOOGLE_API_KEY = আপনার_কী
   ```
5. "Deploy" ক্লিক করুন

**ফলাফল:**
- আপনার অ্যাপ স্বয়ংক্রিয়ভাবে স্থাপিত হবে
- URL হবে: `https://neora-[your-project].vercel.app`

---

### অপশন 2: AWS EC2 এ স্থাপনা

**ধাপ 1: EC2 ইনস্ট্যান্স তৈরি করুন**

```bash
# AWS কনসোলে:
# 1. EC2 ড্যাশবোর্ডে যান
# 2. "Launch Instance" ক্লিক করুন
# 3. Ubuntu 22.04 LTS নির্বাচন করুন
# 4. t3.small বা বৃহত্তর নির্বাচন করুন
# 5. নিরাপত্তা গ্রুপ: পোর্ট 80, 443, 3000 খুলুন
```

**ধাপ 2: সার্ভারে সংযোগ করুন**

```bash
# PEM ফাইল ডাউনলোড করুন এবং এটি সংযোগ করুন
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@your-ec2-ip
```

**ধাপ 3: সফটওয়্যার ইনস্টল করুন**

```bash
# Node.js ইনস্টল করুন
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Git ইনস্টল করুন
sudo apt-get install -y git

# Nginx ইনস্টল করুন (রিভার্স প্রক্সির জন্য)
sudo apt-get install -y nginx
```

**ধাপ 4: অ্যাপ্লিকেশন স্থাপন করুন**

```bash
# প্রকল্প ক্লোন করুন
git clone https://github.com/shukriaprinters/Neora-AI-PC-OS-Agent.git
cd Neora-AI-PC-OS-Agent
git checkout neural-os-agent

# নির্ভরতা ইনস্টল করুন
npm install

# প্রোডাকশন বিল্ড করুন
npm run build

# পরিবেশ ফাইল তৈরি করুন
cat > .env << 'EOF'
VITE_GROQ_API_KEY=আপনার_কী
VITE_GOOGLE_API_KEY=আপনার_কী
DATABASE_URL=sqlite:./neora.db
NODE_ENV=production
EOF

# PM2 ইনস্টল করুন (অ্যাপ পুনরায় চালু করার জন্য)
sudo npm install -g pm2

# অ্যাপ চালু করুন
pm2 start "npm start" --name "neora"
pm2 startup
pm2 save
```

**ধাপ 5: Nginx সেটআপ করুন**

```bash
# Nginx কনফিগ ফাইল তৈরি করুন
sudo nano /etc/nginx/sites-available/neora

# নিম্নলিখিত কন্টেন্ট পেস্ট করুন:
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /ws {
        proxy_pass http://localhost:3000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

```bash
# সক্ষম করুন এবং পুনরায় চালু করুন
sudo ln -s /etc/nginx/sites-available/neora /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL সেটআপ করুন (বিনামূল্যে Let's Encrypt ব্যবহার করে)
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### অপশন 3: DigitalOcean App Platform এ স্থাপনা

**ধাপ 1: app.yaml তৈরি করুন**

প্রকল্পের মূলে একটি ফাইল তৈরি করুন:

```yaml
name: neora-agent
services:
- name: api
  github:
    branch: neural-os-agent
    repo: shukriaprinters/Neora-AI-PC-OS-Agent
  build_command: npm install && npm run build
  run_command: npm start
  http_port: 3000
  envs:
  - key: VITE_GROQ_API_KEY
    scope: RUN_AND_BUILD_TIME
    value: ${GROQ_API_KEY}
  - key: VITE_GOOGLE_API_KEY
    scope: RUN_AND_BUILD_TIME
    value: ${GOOGLE_API_KEY}
  - key: NODE_ENV
    value: production
static_sites:
- name: static
  source_dir: dist
domains:
- domain: your-domain.com
  type: PRIMARY
```

**ধাপ 2: DigitalOcean App Platform এ স্থাপন করুন**

1. [digitalocean.com/apps](https://digitalocean.com/apps) যান
2. "Create App" ক্লিক করুন
3. GitHub সংযুক্ত করুন
4. রিপোজিটরি নির্বাচন করুন
5. `app.yaml` লোড করুন
6. পরিবেশ ভেরিয়েবল যোগ করুন
7. স্থাপন করুন

---

## ব্যবহারকারীর নির্দেশিকা

### সিস্টেম ড্যাশবোর্ড ব্যবহার করা

**রিয়েল-টাইম মেট্রিক্স দেখুন:**
1. মূল পৃষ্ঠায় "Dashboard" ট্যাব খোলা থাকে
2. আপনার সিস্টেমের CPU, Memory, Disk, Network দেখুন
3. লাইভ চার্টগুলি স্বয়ংক্রিয়ভাবে আপডেট হয়

### ভয়েস কমান্ড ব্যবহার করা

**ভয়েস দিয়ে কমান্ড দিন:**
1. "Voice Command" ট্যাব খুলুন
2. মাইক আইকন ক্লিক করুন
3. আপনার কমান্ড বলুন (ইংরেজিতে)
4. অথবা সরাসরি টেক্সট টাইপ করুন

**উদাহরণ কমান্ড:**
```
"show system status"
"list running processes"
"get disk usage"
"show network info"
"execute command ls -la"
```

### ওয়ার্কফ্লো তৈরি করা

**স্বয়ংক্রিয় কাজ সেটআপ করুন:**
1. "Workflows" ট্যাব খুলুন
2. "Create Workflow" বাটন ক্লিক করুন
3. নাম এবং বর্ণনা যোগ করুন
4. ধাপ যোগ করুন:
   - প্রতিটি ধাপে একটি কমান্ড বা ক্রিয়া যোগ করুন
   - শর্তাবলী সেট করুন (ঐচ্ছিক)
5. নিয়মিত সময় সেট করুন
6. সংরক্ষণ এবং সক্ষম করুন

### টার্মিনাল ব্যবহার করা

**সরাসরি কমান্ড চালান:**
1. "Terminal" ট্যাব খুলুন
2. কমান্ড প্রম্পটে টাইপ করুন
3. Enter চাপুন
4. ফলাফল তাৎক্ষণিকভাবে দেখুন

**অন্তর্নির্মিত কমান্ডগুলি:**
```
help              - সমস্ত উপলব্ধ কমান্ড দেখুন
system            - সিস্টেম তথ্য দেখুন
processes         - চলমান প্রক্রিয়াগুলি তালিকাভুক্ত করুন
memory            - মেমরি ব্যবহার দেখুন
disk              - ডিস্ক স্থান দেখুন
network           - নেটওয়ার্ক তথ্য দেখুন
clear             - টার্মিনাল সাফ করুন
```

### প্রক্রিয়া এক্সপ্লোরার ব্যবহার করা

**চলমান প্রক্রিয়াগুলি পর্যবেক্ষণ করুন:**
1. "Process Explorer" ট্যাব খুলুন
2. সমস্ত সক্রিয় প্রক্রিয়াগুলি দেখুন
3. CPU এবং Memory ব্যবহার জানুন
4. প্রক্রিয়াটি বন্ধ করতে "Kill" ক্লিক করুন

---

## সমস্যা সমাধান

### সমস্যা 1: "Cannot find module" ত্রুটি

**সমাধান:**
```bash
# npm cache সাফ করুন
npm cache clean --force

# পুনরায় ইনস্টল করুন
rm -rf node_modules package-lock.json
npm install
```

### সমস্যা 2: পোর্ট 3000 ইতিমধ্যে ব্যবহারে আছে

**সমাধান:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# macOS/Linux
lsof -i :3000
kill -9 [PID]
```

### সমস্যা 3: WebSocket সংযোগ ব্যর্থ

**সমাধান:**
1. ফায়ারওয়াল নিয়ম পরীক্ষা করুন
2. নিশ্চিত করুন পোর্ট 3000 খোলা আছে
3. সার্ভার পুনরায় চালু করুন:
   ```bash
   npm run dev
   ```

### সমস্যা 4: ব্রাউজার থেকে অ্যাক্সেস করতে পারছি না

**সমাধান:**
```bash
# সার্ভার চলছে কিনা পরীক্ষা করুন
curl http://localhost:3000

# লগ চেক করুন
npm run dev  # সম্পূর্ণ লগ দেখুন
```

### সমস্যা 5: API কী কাজ করছে না

**সমাধান:**
1. `.env.local` ফাইল পরীক্ষা করুন
2. API কী সঠিকভাবে কপি করা হয়েছে কিনা যাচাই করুন
3. সার্ভার পুনরায় চালু করুন
4. ব্রাউজার ক্যাশ সাফ করুন (Ctrl+Shift+Delete)

---

## নিরাপত্তা টিপস

### স্থানীয় ব্যবহারের জন্য
- আপনার .env ফাইল সুরক্ষিত রাখুন
- API কীগুলি কখনও শেয়ার করবেন না
- নিয়মিত আপডেট করুন: `npm update`

### ওয়েব স্থাপনার জন্য
- সর্বদা HTTPS ব্যবহার করুন
- শক্তিশালী পাসওয়ার্ড সেট করুন
- নিয়মিত ব্যাকআপ নিন
- ফায়ারওয়াল নিয়ম সেট করুন
- নিয়মিত লগ পর্যবেক্ষণ করুন

---

## অতিরিক্ত সম্পদ

- **GitHub**: https://github.com/shukriaprinters/Neora-AI-PC-OS-Agent
- **ডকুমেন্টেশন**: README_PREMIUM.md
- **API ডকুমেন্টেশন**: BROWSER_DEPLOYMENT_GUIDE.md
- **সমর্থন**: Issues সেকশনে প্রশ্ন পোস্ট করুন

---

## প্রায়শই জিজ্ঞাসিত প্রশ্ন

**Q: আমি কি Neora অফলাইনে ব্যবহার করতে পারি?**
A: হ্যাঁ, স্থানীয়ভাবে চালানোর সময় ইন্টারনেট ছাড়াই সমস্ত বৈশিষ্ট্য ব্যবহার করতে পারেন (API কী ছাড়া)।

**Q: ডাটাবেস তথ্য কোথায় সংরক্ষিত হয়?**
A: স্থানীয়ভাবে: `neora.db` ফাইলে। ওয়েবে: আপনার হোস্টের ডাটাবেসে।

**Q: আমি কি একাধিক মেশিন থেকে সংযুক্ত হতে পারি?**
A: হ্যাঁ, সার্ভার একাধিক WebSocket সংযোগ সমর্থন করে।

**Q: স্থানীয় ডাটা কি নিরাপদ?**
A: হ্যাঁ, সবকিছু স্থানীয়ভাবে সংরক্ষিত এবং কোথাও পাঠানো হয় না (যদি না আপনি API ব্যবহার করেন)।

---

**সর্বশেষ আপডেট**: জুন 2024
**সংস্করণ**: 2.0.0
**লেখক**: Neora Development Team
