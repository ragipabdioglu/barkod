# Design Document

## Overview

Bu tasarım, mevcut kargo etiketi telefon numarası arama uygulamasına barkod okuma özelliği ekler. Sistem, kamera akışından gelen görüntüleri hem barkod okuyucu hem de OCR motoru ile paralel olarak işleyecek, telefon numaralarını algılayıp kullanıcıya sunacaktır.

**Temel Yaklaşım:**
- html5-qrcode kütüphanesi ile barkod okuma
- Mevcut OCR.space API ile metin algılama (paralel)
- Birleşik sonuç gösterimi
- Performans için throttling ve debouncing

## Architecture

### Katmanlı Mimari

```
┌─────────────────────────────────────┐
│     Kullanıcı Arayüzü (UI)          │
│  - Video görüntüsü                  │
│  - Telefon numarası overlay'leri    │
│  - Durum mesajları                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Algılama Koordinatörü             │
│  - Barkod ve OCR yönetimi           │
│  - Sonuç birleştirme                │
│  - Tekrar filtreleme                │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌─────▼──────┐
│   Barkod    │  │    OCR     │
│   Okuyucu   │  │   Motor    │
│ (html5-qr)  │  │ (OCR.space)│
└─────────────┘  └────────────┘
```

### Veri Akışı

1. Kamera başlatılır
2. Video akışı başlar
3. Her kare için:
   - Barkod okuyucu tarama yapar (10 FPS)
   - OCR motor paralel çalışır (1 saniyede bir)
4. Sonuçlar birleştirilir ve tekrarlar filtrelenir
5. Telefon numaraları UI'da gösterilir
6. Kullanıcı tıklayarak arama yapar

## Components and Interfaces

### 1. BarcodeScanner Sınıfı

**Sorumluluk:** Barkod okuma işlemlerini yönetir

```javascript
class BarcodeScanner {
  constructor(videoElement, onDetected, onError)
  start()
  stop()
  isScanning()
  getSupportedFormats()
}
```

**Metodlar:**
- `start()`: Barkod taramayı başlatır
- `stop()`: Barkod taramayı durdurur
- `isScanning()`: Tarama durumunu döner
- `getSupportedFormats()`: Desteklenen formatları listeler

**Events:**
- `onDetected(barcodeText, format)`: Barkod algılandığında
- `onError(error)`: Hata oluştuğunda

### 2. DetectionCoordinator Sınıfı

**Sorumluluk:** Barkod ve OCR sonuçlarını koordine eder

```javascript
class DetectionCoordinator {
  constructor()
  addBarcodeResult(text, format)
  addOCRResult(text)
  getUniquePhoneNumbers()
  clear()
}
```

**Metodlar:**
- `addBarcodeResult(text, format)`: Barkod sonucu ekler
- `addOCRResult(text)`: OCR sonucu ekler
- `getUniquePhoneNumbers()`: Benzersiz telefon numaralarını döner
- `clear()`: Tüm sonuçları temizler

### 3. PhoneNumberExtractor Modülü

**Sorumluluk:** Metinden telefon numarası çıkarır (mevcut)

```javascript
function extractPhoneNumbers(text)
function formatPhoneNumber(phone)
function normalizePhoneNumber(phone)
```

### 4. UIManager Sınıfı

**Sorumluluk:** Kullanıcı arayüzü güncellemelerini yönetir

```javascript
class UIManager {
  showStatus(message, type)
  displayPhoneNumbers(numbers, source)
  clearOverlay()
  showError(error)
}
```

## Data Models

### BarcodeResult

```javascript
{
  text: string,           // Barkod içeriği
  format: string,         // Barkod formatı (QR_CODE, CODE_128, vb.)
  timestamp: number,      // Algılama zamanı
  phoneNumbers: string[]  // Çıkarılan telefon numaraları
}
```

### DetectionResult

```javascript
{
  source: 'barcode' | 'ocr',  // Kaynak
  phoneNumbers: string[],      // Bulunan numaralar
  timestamp: number,           // Algılama zamanı
  metadata: object            // Ek bilgiler (format, confidence vb.)
}
```

### PhoneNumberDisplay

```javascript
{
  number: string,        // Telefon numarası
  formatted: string,     // Formatlanmış numara
  source: string,        // Kaynak (barcode/ocr)
  position: {x, y}      // Ekran pozisyonu
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Barkod algılama telefon numarası çıkarımını tetikler

*For any* barkod içeriği, barkod algılandığında sistem telefon numarası çıkarma fonksiyonunu çağırmalıdır.

**Validates: Requirements 1.3**

### Property 2: Telefon numarası içeren barkodlar UI'da gösterilir

*For any* telefon numarası içeren barkod sonucu, sistem numarayı ekranda tıklanabilir buton olarak göstermelidir.

**Validates: Requirements 1.4, 2.1**

### Property 3: Çoklu barkod sonuçları tüm numaraları gösterir

*For any* birden fazla barkod sonucu, sistem tüm bulunan telefon numaralarını listelemeli ve her biri için arama butonu sunmalıdır.

**Validates: Requirements 1.5**

### Property 4: Telefon numarası butonu doğru tel: URL oluşturur

*For any* telefon numarası, buton tıklandığında sistem doğru formatta tel: protokolü URL'i oluşturmalıdır.

**Validates: Requirements 2.2**

### Property 5: Telefon numaraları okunabilir formatta gösterilir

*For any* telefon numarası, sistem numarayı 0XXX XXX XX XX formatında göstermelidir.

**Validates: Requirements 2.3**

### Property 6: Tekrarlanan numaralar filtrelenir

*For any* barkod ve OCR sonuçları, sistem tekrarlanan telefon numaralarını filtrelemeli ve benzersiz numaraları göstermelidir.

**Validates: Requirements 3.3**

## Error Handling

### Barkod Okuma Hataları

1. **Kütüphane yükleme hatası**
   - html5-qrcode kütüphanesi yüklenemezse
   - Kullanıcıya bildirim göster
   - OCR moduna geri dön

2. **Kamera erişim hatası**
   - Kamera izni reddedilirse
   - Kullanıcıya açıklayıcı mesaj göster
   - Fotoğraf modunu öner

3. **Barkod okuma hatası**
   - Barkod okunamıyorsa
   - Sessizce OCR'a devam et
   - Konsola log yaz (debugging)

4. **Format desteği hatası**
   - Desteklenmeyen format algılanırsa
   - OCR ile metin algılamaya devam et
   - Kullanıcıya bilgi verme (sessiz fallback)

### Performans Hataları

1. **Yüksek CPU kullanımı**
   - FPS'i otomatik düşür (10 -> 5 -> 2)
   - Kullanıcıya performans uyarısı göster

2. **Bellek sızıntısı**
   - Kamera durdurulduğunda tüm kaynakları temizle
   - Event listener'ları kaldır
   - Scanner instance'ı destroy et

### Veri Hataları

1. **Geçersiz telefon numarası**
   - Regex ile validate et
   - Geçersiz numaraları filtrele
   - Sadece geçerli numaraları göster

2. **Boş barkod içeriği**
   - Boş string kontrolü yap
   - Kullanıcıya mesaj gösterme
   - Taramaya devam et

## Testing Strategy

### Unit Testing

**Framework:** Jest veya Vitest (mevcut proje yapısına göre)

**Test Kapsamı:**

1. **PhoneNumberExtractor Tests**
   - Barkod içeriğinden telefon numarası çıkarma
   - Farklı formatları normalize etme
   - Geçersiz numaraları filtreleme

2. **DetectionCoordinator Tests**
   - Barkod ve OCR sonuçlarını birleştirme
   - Tekrar filtreleme
   - Benzersiz numara listesi oluşturma

3. **BarcodeScanner Tests**
   - Scanner başlatma/durdurma
   - Event handler'ların çalışması
   - Hata yönetimi

4. **UIManager Tests**
   - Durum mesajlarını gösterme
   - Telefon numarası overlay'lerini oluşturma
   - Hata mesajlarını gösterme

### Property-Based Testing

**Framework:** fast-check (JavaScript için PBT kütüphanesi)

**Minimum Iterations:** 100

**Property Tests:**

1. **Property 1: Barkod algılama telefon numarası çıkarımını tetikler**
   - Generator: Rastgele barkod içeriği
   - Test: extractPhoneNumbers fonksiyonunun çağrıldığını doğrula

2. **Property 2: Telefon numarası içeren barkodlar UI'da gösterilir**
   - Generator: Telefon numarası içeren barkod sonuçları
   - Test: UI'da buton elementinin oluşturulduğunu doğrula

3. **Property 3: Çoklu barkod sonuçları tüm numaraları gösterir**
   - Generator: Birden fazla barkod sonucu
   - Test: Tüm numaraların UI'da gösterildiğini doğrula

4. **Property 4: Telefon numarası butonu doğru tel: URL oluşturur**
   - Generator: Rastgele telefon numaraları
   - Test: tel: URL'inin doğru formatı doğrula

5. **Property 5: Telefon numaraları okunabilir formatta gösterilir**
   - Generator: Rastgele telefon numaraları
   - Test: Formatlanmış stringin 0XXX XXX XX XX formatında olduğunu doğrula

6. **Property 6: Tekrarlanan numaralar filtrelenir**
   - Generator: Tekrarlanan numaralar içeren sonuç setleri
   - Test: Sonuç listesinin benzersiz numaralar içerdiğini doğrula

### Integration Testing

1. **Barkod + OCR Entegrasyonu**
   - Her iki sistemin paralel çalıştığını test et
   - Sonuçların doğru birleştirildiğini doğrula

2. **Kamera + Scanner Entegrasyonu**
   - Kamera akışından barkod okumayı test et
   - Gerçek barkod görüntüleri kullan

3. **UI + Detection Entegrasyonu**
   - Algılama sonuçlarının UI'da doğru gösterildiğini test et
   - Kullanıcı etkileşimlerini test et

### Edge Cases

1. **Çok küçük barkodlar** - Okuma başarısız olabilir
2. **Bulanık görüntüler** - OCR fallback devreye girmeli
3. **Çoklu barkodlar aynı karede** - Tümü algılanmalı
4. **Telefon numarası olmayan barkodlar** - Sessizce atlanmalı
5. **Geçersiz barkod formatları** - Hata vermeden devam etmeli

## Implementation Notes

### Kütüphane Entegrasyonu

**html5-qrcode kurulumu:**

```html
<script src="https://unpkg.com/html5-qrcode"></script>
```

veya npm ile:

```bash
npm install html5-qrcode
```

### Performans Optimizasyonları

1. **Throttling:** Barkod taraması 10 FPS ile sınırlandırılmalı
2. **Debouncing:** Aynı barkod 1 saniye içinde tekrar işlenmemeli
3. **Web Worker:** Ağır işlemler için (opsiyonel, gelecek iyileştirme)

### Mobil Optimizasyonlar

1. **Kamera çözünürlüğü:** Mobilde 1280x720 max
2. **Touch events:** Tüm butonlarda touchend desteği
3. **Viewport:** Safe area insets kullan

### Güvenlik

1. **XSS Koruması:** Barkod içeriğini sanitize et
2. **Tel: URL Validation:** Sadece geçerli telefon numaraları
3. **HTTPS:** Kamera erişimi için gerekli

## Future Enhancements

1. **Offline Destek:** Service Worker ile çevrimdışı çalışma
2. **Barkod Geçmişi:** Okunan barkodları kaydetme
3. **Çoklu Dil Desteği:** OCR için farklı diller
4. **Gelişmiş Filtreleme:** Barkod tipine göre filtreleme
5. **Analytics:** Barkod okuma başarı oranı takibi
