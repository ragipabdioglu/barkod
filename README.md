# 📦 Kargo Etiketi Telefon Numarası Arama

Kargo etiketlerindeki telefon numaralarını fotoğraf yükleyerek veya kameradan canlı olarak algılayan ve tek tıkla aramaya yönlendiren web uygulaması.

## Özellikler

- 📸 **Fotoğraf Yükleme:** Fotoğraf yükleyerek telefon numarası algılama
- 📷 **Kameradan Canlı Görüntü:** Kameradan canlı görüntü alma
- 🔍 OCR (Optical Character Recognition) ile otomatik telefon numarası algılama
- 🔄 Otomatik algılama modu (kamera için, her 2 saniyede bir kontrol)
- 📞 Algılanan numaraları görüntü üzerinde gösterip tek tıkla arama
- 📱 Mobil uyumlu tasarım
- 🇹🇷 Türkiye telefon numarası formatlarını destekler

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
- **Tesseract.js** - OCR (Optical Character Recognition) kütüphanesi

## Notlar

- **HTTPS gereklidir:** Kameraya erişim için HTTPS bağlantısı gereklidir (localhost'ta çalışır). Fotoğraf modu için HTTPS gerekmez.
- İlk kullanımda Tesseract.js model dosyaları indirilecektir (birkaç MB)
- İnternet bağlantısı gereklidir (Tesseract.js CDN üzerinden yüklenir)
- Etiket ne kadar net görünürse, algılama o kadar doğru olur
- Telefon numaraları Türkiye formatlarına göre algılanır (0XXX XXX XX XX)
- Otomatik mod (kamera) her 2 saniyede bir kontrol yapar (performans için)
- Mobil cihazlarda arka kamera kullanılır
- Fotoğraf modu: PNG, JPG, JPEG formatları desteklenir

## Tarayıcı Desteği

- Chrome (önerilen)
- Firefox
- Safari
- Edge

## Lisans

Bu proje açık kaynaklıdır ve özgürce kullanılabilir.

