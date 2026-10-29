# KAIWEN CHESS

KAIWEN CHESS, modern web standartlarına uygun olarak React, TypeScript ve Vite ile geliştirilmiş, tam satranç kurallarına ve Stockfish yapay zeka entegrasyonuna sahip profesyonel bir satranç platformudur.

Uygulama istemci taraflı (serverless) mimaride çalışmakta olup, GitHub Pages üzerinde sıfır sunucu maliyetiyle doğrudan barındırılabilir.

---

## Proje Yapısı ve Mimari

Uygulama, oyun motoru ile görsel arayüzü birbirinden kesin sınırlarla ayıran modüler bir mimari üzerine kurulmuştur:

```
chess/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions otomatik derleme ve dağıtım iş akışı
├── public/
│   ├── kaiwen-logo-dark.png    # Açık tema kurumsal logosu
│   └── kaiwen-logo-white.png   # Koyu tema kurumsal logosu
├── src/
│   ├── assets/
│   │   ├── PieceIcons.tsx      # Ölçeklenebilir vektörel satranç taşları (SVG)
│   │   └── icons.js            # Sistem arayüz ikonları
│   ├── components/
│   │   ├── ChessBoard.tsx      # Sabit oranlı ve kayma yapmayan tahta bileşeni
│   │   ├── PlayerCard.tsx      # Oyuncu kimlik, süre ve yenen taş göstergeleri
│   │   ├── MoveHistory.tsx     # Hamle geçmişi, FEN ve PGN kopyalama paneli
│   │   ├── StartScreen.tsx     # Ana menü, zorluk seviyesi ve süre seçim ekranı
│   │   ├── GameOverModal.tsx   # Oyun sonu analiz ve istatistik penceresi
│   │   ├── PromotionModal.tsx  # Piyon terfi seçim ekranı
│   │   ├── EvaluationBar.tsx   # Pozisyon değerlendirme çubuğu
│   │   └── Toast.tsx           # Bildirim bileşeni
│   ├── engine/
│   │   ├── types.ts            # Tip tanımları ve veri yapıları
│   │   ├── constants.ts        # Tahta koordinatları ve taş değerleri
│   │   └── chessEngine.ts      # FIDE kuralları, yasal hamle denetimi ve mat tespiti
│   ├── services/
│   │   ├── aiService.ts        # Stockfish REST API ve yerel yedek motor
│   │   └── statsService.ts     # LocalStorage tabanlı istatistik yönetimi
│   ├── styles/
│   │   ├── main.css            # Tipografi, tema değişkenleri ve temel yerleşim
│   │   ├── board.css           # Tahta geometrisi ve taş animasyonları
│   │   └── components.css      # Bileşen stilleri
│   ├── utils/
│   │   ├── helpers.ts          # FEN ve PGN dönüştürücüleri
│   │   └── sound.ts            # Web Audio API ses sentezleyici
│   ├── App.tsx                 # Ana durum yönetimi ve oyun döngüsü
│   └── main.tsx                # Uygulama giriş noktası
├── index.html                  # HTML şablonu
├── package.json                # Proje bağımlılıkları
├── tsconfig.json               # TypeScript yapılandırması
├── vite.config.ts              # Vite derleme yapılandırması
└── README.md
```

---

## Teknik Özellikler

### 1. Satranç Motoru ve Kural Seti
- FIDE standartlarına uygun tüm taş hareket kuralları
- Şah çekme (Check), Şah-Mat (Checkmate) ve Pat (Stalemate) tespiti
- Kısa ve uzun rok (Castling) kuralları (tehdit altındaki karelerden geçiş engeli dahil)
- Geçerken alma (En Passant) mekanizması
- Piyon terfisi (Vezir, Kale, Fil, At)
- Standart cebirsel notasyon (SAN) üretimi ve PGN dışa aktarımı

### 2. Stockfish Yapay Zeka Entegrasyonu
- Chess-API üzerinden doğrudan Stockfish analiz motoru bağlantısı
- Dört farklı zorluk derecesi: Kolay (Derinlik 4), Orta (Derinlik 8), Zor (Derinlik 12), Usta (Derinlik 16)
- Çevrimdışı veya kesinti durumlarında oyunun kesilmesini önleyen yerel buluşsal (heuristic) yedek motor
- Eşzamanlı istek çakışmalarını önleyen sürüm kontrollü asenkron hamle doğrulama mimarisi

### 3. Arayüz ve Kullanıcı Deneyimi
- Dikey kaydırma gerektirmeyen (Zero Scroll), ekran yüksekliğine duyarlı (100vh) sabit yerleşim
- Ayrılmış tam ekran ana menü (oyun modu, zorluk, renk ve süre seçimi)
- Oyun esnasında üst çubuğun gizlendiği, kontrollere sağ kenar panelinden erişilen temiz oyun alanı
- Açık tema (varsayılan) ve koyu tema arasında anlık geçiş
- Yapılan hamlelerin pürüzsüz kayması için optimize edilmiş geçiş animasyonları
- Sağ alt köşede konumlandırılmış minimalist bildirim sistemi
- Hamle geri alma (Undo) ve ileri alma (Redo) desteği

---

## Kurulum ve Yerel Çalıştırma

Projeyi yerel ortamda çalıştırmak için aşağıdaki adımları takip edebilirsiniz:

```bash
# 1. Bağımlılıkları yükleyin
npm install

# 2. Geliştirme sunucusunu başlatın
npm run dev

# 3. Canlı önizleme için tarayıcınızda açın:
# http://localhost:5173/
```

Üretim derlemesi oluşturmak için:

```bash
npm run build
```

---

## GitHub Pages Dağıtımı

Depo içerisinde yer alan `.github/workflows/deploy.yml` yapılandırması sayesinde, `main` dalına yapılan her push işleminde proje otomatik olarak derlenir ve GitHub Pages üzerinde yayına alınır.

GitHub Pages ayarlarını yapılandırmak için:
1. GitHub deposunda **Settings** sekmesine gidin.
2. Sol menüden **Pages** bölümünü seçin.
3. **Build and deployment > Source** seçeneğini **GitHub Actions** olarak ayarlayın.

Yayın adresi:
`https://ImtheKaiwen.github.io/chess/`

---

## Klavye Kısayolları

| Kısayol | İşlev |
| :--- | :--- |
| Ctrl + Z | Son hamleyi geri al (Undo) |
| Ctrl + Y | Geri alınan hamleyi tekrar uygula (Redo) |
| F | Tahtayı 180 derece çevir (Flip Board) |
| M | Ses efektlerini aç / kapat (Mute) |

---

## Lisans

Bu proje MIT lisansı altında dağıtılmaktadır. Vektörel satranç taşları Colin M.L. Burnett tasarımıdır (CC BY-SA 3.0).
