# Implementation Plan

- [x] 1. html5-qrcode kütüphanesini projeye ekle


  - index.html dosyasına CDN linki ekle veya npm ile kur
  - Kütüphanenin yüklendiğini test et
  - _Requirements: 1.1, 5.1_

- [x] 2. BarcodeScanner sınıfını oluştur


  - BarcodeScanner sınıfını script.js'e ekle
  - Constructor, start(), stop(), isScanning() metodlarını implement et
  - html5-qrcode instance'ını yönet
  - Event callback'leri (onDetected, onError) ekle
  - _Requirements: 1.1, 1.2, 4.3_

- [x] 2.1 BarcodeScanner için property test yaz


  - **Property 1: Barkod algılama telefon numarası çıkarımını tetikler**
  - **Validates: Requirements 1.3**

- [x] 3. DetectionCoordinator sınıfını oluştur


  - DetectionCoordinator sınıfını script.js'e ekle
  - addBarcodeResult(), addOCRResult() metodlarını implement et
  - getUniquePhoneNumbers() metodunu implement et
  - Tekrar filtreleme mantığını ekle
  - clear() metodunu implement et
  - _Requirements: 3.1, 3.3_

- [x] 3.1 DetectionCoordinator için property test yaz


  - **Property 6: Tekrarlanan numaralar filtrelenir**
  - **Validates: Requirements 3.3**

- [x] 4. UIManager sınıfını oluştur


  - UIManager sınıfını script.js'e ekle
  - showStatus() metodunu implement et
  - displayPhoneNumbers() metodunu implement et
  - clearOverlay() metodunu implement et
  - showError() metodunu implement et
  - _Requirements: 1.4, 2.1, 6.1, 6.2, 6.3, 6.4_

- [x] 4.1 UIManager için property testler yaz


  - **Property 2: Telefon numarası içeren barkodlar UI'da gösterilir**
  - **Validates: Requirements 1.4, 2.1**
  - **Property 3: Çoklu barkod sonuçları tüm numaraları gösterir**
  - **Validates: Requirements 1.5**

- [x] 5. Barkod ve OCR paralel çalışma entegrasyonu


  - startCamera() fonksiyonunu güncelle - hem barkod hem OCR başlat
  - BarcodeScanner'ı kamera başladığında başlat
  - Barkod sonuçlarını DetectionCoordinator'a gönder
  - OCR sonuçlarını DetectionCoordinator'a gönder
  - Birleştirilmiş sonuçları UI'da göster
  - _Requirements: 3.1, 3.2_

- [x] 5.1 Entegrasyon testleri yaz


  - Barkod + OCR paralel çalışma testi
  - Barkod başarısız olduğunda OCR fallback testi
  - _Requirements: 3.1, 3.2_

- [x] 6. Telefon numarası buton ve arama fonksiyonalitesi


  - displayPhoneNumbers() içinde tel: URL oluştur
  - Butonlara click ve touchend event'leri ekle
  - formatPhoneNumber() fonksiyonunu güncelle (0XXX XXX XX XX formatı)
  - _Requirements: 2.2, 2.3_

- [x] 6.1 Telefon numarası fonksiyonları için property testler


  - **Property 4: Telefon numarası butonu doğru tel: URL oluşturur**
  - **Validates: Requirements 2.2**
  - **Property 5: Telefon numaraları okunabilir formatta gösterilir**
  - **Validates: Requirements 2.3**

- [x] 7. Performans optimizasyonları ekle

  - Barkod taraması için throttling ekle (10 FPS)
  - Aynı barkod için debouncing ekle (1 saniye)
  - FPS ayarını html5-qrcode config'e ekle
  - _Requirements: 4.1_

- [x] 8. Hata yönetimi ve fallback mekanizmaları


  - Kütüphane yükleme hatası için try-catch ekle
  - Barkod okuma hatası için OCR fallback ekle
  - Desteklenmeyen format için sessiz fallback
  - Hata mesajlarını UIManager ile göster
  - _Requirements: 5.2, 6.4_

- [x] 8.1 Hata senaryoları için unit testler


  - Kütüphane yükleme hatası testi
  - Desteklenmeyen format fallback testi
  - _Requirements: 5.2_

- [x] 9. Mobil optimizasyonları


  - Mobil cihaz tespiti için isMobile kontrolü kullan
  - Touch event'leri tüm butonlara ekle
  - Kamera çözünürlüğünü mobilde düşür (1280x720)
  - _Requirements: 7.1, 7.2_

- [x] 9.1 Mobil özellikler için unit testler


  - Mobil cihaz tespiti testi
  - Touch event handler testi
  - _Requirements: 7.1, 7.2_

- [x] 10. Durum mesajları ve kullanıcı bildirimleri

  - "Barkod algılama aktif" mesajını ekle
  - "Barkod okundu" mesajını ekle
  - "Barkod okundu ama telefon numarası bulunamadı" mesajını ekle
  - Tüm mesajları UIManager.showStatus() ile göster
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 11. Cleanup ve kaynak yönetimi

  - stopCamera() fonksiyonunu güncelle - BarcodeScanner'ı durdur
  - BarcodeScanner.stop() içinde html5-qrcode instance'ını temizle
  - Event listener'ları kaldır
  - DetectionCoordinator.clear() çağır
  - _Requirements: 4.3_

- [x] 12. Checkpoint - Tüm testlerin geçtiğinden emin ol


  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Fotoğraf modu için barkod desteği ekle


  - analyzePhoto() fonksiyonunu güncelle
  - Fotoğraftan barkod okuma ekle
  - Barkod ve OCR sonuçlarını birleştir
  - Sonuçları displayResults() ile göster
  - _Requirements: 1.3, 3.1_

- [x] 13.1 Fotoğraf modu için integration test


  - Fotoğraftan barkod okuma testi
  - _Requirements: 1.3_

- [x] 14. Desteklenen barkod formatlarını yapılandır

  - html5-qrcode config'e formatsToSupport ekle
  - QR_CODE, CODE_128, CODE_39, EAN_13, EAN_8 formatlarını ekle
  - Console'a format bilgisini logla
  - _Requirements: 5.1, 5.3_

- [x] 15. Final Checkpoint - Tüm testlerin geçtiğinden emin ol



  - Ensure all tests pass, ask the user if questions arise.
