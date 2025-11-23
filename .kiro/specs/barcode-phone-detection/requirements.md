# Requirements Document

## Introduction

Bu özellik, kargo etiketlerindeki barkodları kamera ile otomatik olarak algılayıp, barkod içindeki telefon numarasını çıkararak kullanıcıya doğrudan arama yapma imkanı sunar. Mevcut OCR tabanlı metin algılama sistemine ek olarak, barkod okuma özelliği eklenecektir.

## Glossary

- **Sistem**: Kargo etiketi telefon numarası arama web uygulaması
- **Barkod**: Kargo etiketlerinde bulunan 1D veya 2D (QR kod) barkod formatları
- **Kamera Akışı**: Kullanıcının cihaz kamerasından gelen canlı video görüntüsü
- **Telefon Numarası**: Türkiye formatında telefon numarası (0XXX XXX XX XX formatı)
- **Otomatik Algılama**: Kullanıcı müdahalesi olmadan sürekli barkod tarama işlemi

## Requirements

### Requirement 1

**User Story:** Kullanıcı olarak, kamerayı açtığımda barkodları otomatik algılamasını istiyorum, böylece manuel işlem yapmadan hızlıca telefon numarasına ulaşabilirim.

#### Acceptance Criteria

1. WHEN kullanıcı kamera modunu başlattığında THEN Sistem barkod algılama kütüphanesini başlatmalıdır
2. WHILE kamera aktif olduğunda THE Sistem her kare için barkod taraması yapmalıdır
3. WHEN bir barkod algılandığında THEN Sistem barkod içeriğini çözümlemeli ve telefon numarası aramalıdır
4. WHEN barkod içinde telefon numarası bulunduğunda THEN Sistem numarayı ekranda görüntülemeli ve arama butonu sunmalıdır
5. WHEN birden fazla barkod algılandığında THEN Sistem tüm bulunan telefon numaralarını listelemeli ve her biri için arama butonu sunmalıdır

### Requirement 2

**User Story:** Kullanıcı olarak, algılanan telefon numarasına tek tıkla arama yapmak istiyorum, böylece hızlı bir şekilde müşteriyle iletişime geçebilirim.

#### Acceptance Criteria

1. WHEN bir telefon numarası algılandığında THEN Sistem numarayı tıklanabilir bir buton olarak göstermelidir
2. WHEN kullanıcı telefon numarası butonuna tıkladığında THEN Sistem cihazın arama uygulamasını açmalı ve numarayı otomatik doldurmalıdır
3. WHEN arama butonu görüntülendiğinde THEN Sistem numarayı okunabilir formatta (0XXX XXX XX XX) göstermelidir

### Requirement 3

**User Story:** Kullanıcı olarak, hem barkod hem de OCR ile telefon numarası algılamasını istiyorum, böylece farklı etiket formatlarında da çalışabilir.

#### Acceptance Criteria

1. WHEN kamera modu aktif olduğunda THEN Sistem hem barkod hem de OCR algılamasını paralel olarak çalıştırmalıdır
2. WHEN barkod algılaması başarısız olduğunda THEN Sistem OCR ile metin algılamaya devam etmelidir
3. WHEN hem barkod hem de OCR telefon numarası bulduğunda THEN Sistem tekrarlanan numaraları filtrelemeli ve benzersiz numaraları göstermelidir

### Requirement 4

**User Story:** Kullanıcı olarak, barkod algılama performansının iyi olmasını istiyorum, böylece uygulama akıcı çalışır ve cihazım yavaşlamaz.

#### Acceptance Criteria

1. WHEN barkod taraması yapılırken THEN Sistem saniyede en fazla 10 kare işlemelidir
2. WHEN barkod algılama işlemi devam ederken THEN Sistem kullanıcı arayüzünün donmamasını sağlamalıdır
3. WHEN kamera durdurulduğunda THEN Sistem tüm barkod algılama işlemlerini temizlemeli ve kaynakları serbest bırakmalıdır

### Requirement 5

**User Story:** Kullanıcı olarak, hangi barkod formatlarının desteklendiğini bilmek istiyorum, böylece uygulamanın sınırlarını anlayabilirim.

#### Acceptance Criteria

1. THE Sistem en az şu barkod formatlarını desteklemelidir: QR Code, Code 128, Code 39, EAN-13, EAN-8
2. WHEN desteklenmeyen bir barkod formatı algılandığında THEN Sistem OCR ile metin algılamaya devam etmelidir
3. WHEN barkod başarıyla okunduğunda THEN Sistem barkod formatını konsola loglamalıdır (debugging için)

### Requirement 6

**User Story:** Kullanıcı olarak, barkod algılama durumunu görmek istiyorum, böylece sistemin çalışıp çalışmadığını anlayabilirim.

#### Acceptance Criteria

1. WHEN barkod algılama başlatıldığında THEN Sistem "Barkod algılama aktif" mesajını göstermelidir
2. WHEN bir barkod algılandığında THEN Sistem "Barkod okundu" mesajını göstermelidir
3. WHEN barkod içinde telefon numarası bulunamadığında THEN Sistem "Barkod okundu ama telefon numarası bulunamadı" mesajını göstermelidir
4. WHEN barkod algılama hatası oluştuğunda THEN Sistem hata mesajını kullanıcıya göstermelidir

### Requirement 7

**User Story:** Kullanıcı olarak, mobil cihazlarda da barkod algılamasının çalışmasını istiyorum, böylece sahada kolayca kullanabilirim.

#### Acceptance Criteria

1. WHEN uygulama mobil cihazda açıldığında THEN Sistem arka kamerayı kullanmalıdır
2. WHEN mobil cihazda barkod algılama yapılırken THEN Sistem dokunmatik kontrolleri desteklemelidir
3. WHEN mobil cihazda performans düşük olduğunda THEN Sistem tarama hızını otomatik olarak azaltmalıdır
