# 📦 Kargo Etiketi Telefon Numarası Arama

Kargo etiketlerindeki telefon numaralarını fotoğraf yükleyerek veya kameradan canlı olarak algılayan ve tek tıkla aramaya yönlendiren web uygulaması.

## ✨ Yeni Özellikler (v2.0)

- 🚀 **%50 Daha Hızlı Barkod Okuma** - 15 FPS tarama hızı
- 🎯 **Görsel Tarama Çerçevesi** - Barkodu nereye tutacağınızı gösterir
- 💡 **Akıllı Yardım İpuçları** - Kullanımı kolaylaştıran rehber
- 🎨 **Geliştirilmiş UI/UX** - Daha büyük butonlar, daha iyi animasyonlar
- ⚡ **Daha Hızlı Tepki** - 0.5 saniye debounce süresi
- 📱 **Optimize Mobil Deneyim** - Touch-friendly arayüz
- 🎭 **Animasyonlu Geri Bildirim** - Her işlem için görsel feedback

## Özellikler

- 📸 **Fotoğraf Yükleme:** Fotoğraf yükleyerek telefon numarası algılama
- 📷 **Kameradan Canlı Görüntü:** Kameradan canlı görüntü alma
- 🔍 **Barkod + OCR:** Hem barkod hem metin algılama (paralel çalışma)
- 🔄 **Otomatik Algılama:** Sürekli tarama modu
- 📞 **Tek Tıkla Arama:** Algılanan numaraları görüntü üzerinde gösterip tek tıkla arama
- 📱 **Mobil Uyumlu:** Responsive tasarım
- 🇹🇷 **Türkiye Formatları:** Tüm Türkiye telefon numarası formatlarını destekler
- 🎯 **5 Barkod Formatı:** QR Code, Code 128, Code 39, EAN-13, EAN-8

## Kullanım

### Fotoğraf Modu

1. `index.html` dosyasını bir web tarayıcısında açın
2. Üstteki "📸 Fotoğraf" butonuna tıklayın
3. Fotoğrafı sürükle-bırak yapın veya tıklayarak seçin
4. "Telefon Numarasını Algıla" butonuna tıklayın
5. Algılanan telefon numaraları fotoğraf üzerinde yeşil kutularda görünecektir
6. Numaraya tıklayarak doğrudan arama yapabilirsiniz

### Kamera Modu

1. Üstteki "📷 Kamera" butonuna tıklayın
2. "📷 Kamerayı Başlat" butonuna tıklayın ve kamera izni verin
3. Kamerayı kargo etiketine yöneltin
4. **Otomatik Mod:** "🔄 Otomatik Algılama" butonunu açın - numaralar otomatik algılanacak
5. **Manuel Mod:** Video ekranına tıklayarak manuel algılama yapabilirsiniz
6. Algılanan telefon numaraları video üzerinde yeşil kutularda görünecektir
7. Numaraya tıklayarak doğrudan arama yapabilirsiniz

## Teknolojiler

- **HTML5** - Yapı
- **CSS3** - Modern ve responsive tasarım
- **JavaScript** - İşlevsellik
- **OCR.space API** - Hızlı ve ücretsiz OCR servisi

## 🎯 Performans İyileştirmeleri

- **15 FPS Tarama:** Önceki 10 FPS'den %50 daha hızlı
- **0.5 Saniye Debounce:** Daha hızlı tepki süresi
- **300x300px Tarama Alanı:** Daha geniş algılama bölgesi
- **Native Barkod API:** Tarayıcı native API kullanımı (destekleniyorsa)
- **Optimize Görüntü İşleme:** Daha hızlı OCR

## 💡 Kullanım İpuçları

1. **Kamera Modu:**
   - Etiketi yeşil çerçevenin içine getirin
   - Otomatik algılama için "Otomatik" butonunu açın
   - Manuel algılama için ekrana dokunun

2. **Fotoğraf Modu:**
   - Net ve iyi ışıklı fotoğraf çekin
   - Barkod ve metin net görünmeli
   - Sistem hem barkodu hem metni tarar

3. **En İyi Sonuçlar İçin:**
   - İyi ışıklandırma kullanın
   - Etiketi düz tutun
   - Kamerayı sabit tutun
   - Etiketi çerçeveye tam sığdırın

## Notlar

- **HTTPS gereklidir:** Kameraya erişim için HTTPS bağlantısı gereklidir (localhost'ta çalışır)
- **OCR.space API:** Ücretsiz public API key kullanılıyor (günlük sınırlı istek)
- İnternet bağlantısı gereklidir
- Telefon numaraları Türkiye formatlarına göre algılanır (0XXX XXX XX XX)
- Mobil cihazlarda arka kamera kullanılır
- **Hız:** Barkod okuma ~0.5 saniye, OCR ~1-2 saniye

## Tarayıcı Desteği

- Chrome (önerilen)
- Firefox
- Safari
- Edge

## Lisans

Bu proje açık kaynaklıdır ve özgürce kullanılabilir.

