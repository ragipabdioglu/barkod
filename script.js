// DOM elementleri
const videoElement = document.getElementById('videoElement');
const canvasElement = document.getElementById('canvasElement');
const overlayNumbers = document.getElementById('overlayNumbers');
const photoOverlayNumbers = document.getElementById('photoOverlayNumbers');
const startCameraBtn = document.getElementById('startCameraBtn');
const stopCameraBtn = document.getElementById('stopCameraBtn');
const toggleAutoBtn = document.getElementById('toggleAutoBtn');
const loadingSection = document.getElementById('loadingSection');
const loadingText = document.getElementById('loadingText');
const statusInfo = document.getElementById('statusInfo');

// Mod seçimi
const cameraModeBtn = document.getElementById('cameraModeBtn');
const photoModeBtn = document.getElementById('photoModeBtn');
const cameraSection = document.getElementById('cameraSection');
const photoSection = document.getElementById('photoSection');

// Fotoğraf yükleme
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const previewImage = document.getElementById('previewImage');
const analyzeBtn = document.getElementById('analyzeBtn');
const resetBtn = document.getElementById('resetBtn');

// Değişkenler
let stream = null;
let isAutoMode = false;
let autoInterval = null;
let isProcessing = false;
let detectedNumbers = new Map();
let currentMode = 'camera';

// OCR.space API - Ücretsiz API key (günlük 25,000 istek)
// Kendi API key'inizi almak için: https://ocr.space/ocrapi/freekey
const OCR_API_KEY = 'helloworld'; // Ücretsiz public key (sınırlı)
const OCR_API_URL = 'https://api.ocr.space/parse/image';

// Mod değiştirme
function handleModeSwitch(mode) {
    switchMode(mode);
}

cameraModeBtn.addEventListener('click', () => handleModeSwitch('camera'));
cameraModeBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleModeSwitch('camera');
});

photoModeBtn.addEventListener('click', () => handleModeSwitch('photo'));
photoModeBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleModeSwitch('photo');
});

function switchMode(mode) {
    currentMode = mode;
    
    if (mode === 'camera') {
        cameraModeBtn.classList.add('active');
        photoModeBtn.classList.remove('active');
        cameraSection.style.display = 'block';
        photoSection.style.display = 'none';
        // Kamerayı durdur
        if (stream) {
            stopCamera();
        }
    } else {
        photoModeBtn.classList.add('active');
        cameraModeBtn.classList.remove('active');
        cameraSection.style.display = 'none';
        photoSection.style.display = 'block';
        // Kamerayı durdur
        if (stream) {
            stopCamera();
        }
    }
}

// Mobil cihaz kontrolü
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Kamerayı başlat
async function startCamera() {
    try {
        statusInfo.textContent = 'Kamera erişimi isteniyor...';
        
        // Mobil için optimize edilmiş kamera ayarları
        const constraints = {
            video: {
                facingMode: 'environment', // Arka kamera
                width: isMobile ? { ideal: 1280, max: 1920 } : { ideal: 1280 },
                height: isMobile ? { ideal: 720, max: 1080 } : { ideal: 720 },
                aspectRatio: { ideal: 16/9 }
            }
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);

        videoElement.srcObject = stream;
        
        // Mobilde play() promise döndürebilir
        try {
            await videoElement.play();
        } catch (playError) {
            console.warn('Video play hatası:', playError);
            // Mobilde bazen play() başarısız olabilir ama video çalışır
        }

        startCameraBtn.style.display = 'none';
        stopCameraBtn.style.display = 'inline-block';
        toggleAutoBtn.style.display = 'inline-block';
        statusInfo.textContent = 'Kamera hazır! Etiketi kameraya gösterin.';
        
    } catch (error) {
        console.error('Kamera hatası:', error);
        let errorMsg = 'Kamera erişimi reddedildi. Lütfen izin verin.';
        
        if (error.name === 'NotAllowedError') {
            errorMsg = 'Kamera izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.';
        } else if (error.name === 'NotFoundError') {
            errorMsg = 'Kamera bulunamadı. Lütfen cihazınızda kamera olduğundan emin olun.';
        } else if (error.name === 'NotReadableError') {
            errorMsg = 'Kamera kullanılamıyor. Başka bir uygulama kamera kullanıyor olabilir.';
        }
        
        statusInfo.textContent = errorMsg;
        alert(errorMsg);
    }
}

startCameraBtn.addEventListener('click', startCamera);
// Touch event desteği
startCameraBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    startCamera();
});

// OCR.space API ile metin tanıma
async function recognizeTextWithOCR(imageData) {
    try {
        // OCR.space API base64 görüntüyü "data:image/jpeg;base64,XXXXX" formatında bekliyor
        let base64Image = imageData;
        
        // Eğer zaten "data:image" ile başlıyorsa olduğu gibi kullan
        if (!imageData.startsWith('data:image')) {
            // Prefix yoksa, sadece base64 string ise prefix ekle
            base64Image = `data:image/jpeg;base64,${imageData}`;
        }
        
        // Format kontrolü - "data:image" ile başlamalı
        if (!base64Image.startsWith('data:image')) {
            throw new Error('Geçersiz görüntü formatı: data:image prefix gerekli');
        }
        
        // Base64 kısmının uzunluğunu kontrol et
        const base64Part = base64Image.split(',')[1];
        if (!base64Part || base64Part.length < 100) {
            throw new Error('Görüntü çok küçük veya geçersiz base64 formatı');
        }
        
        const formData = new FormData();
        // OCR.space API - base64Image için "data:image/jpeg;base64,XXXXX" formatı gerekli
        formData.append('base64Image', base64Image);
        formData.append('language', 'tur'); // Türkçe
        formData.append('apikey', OCR_API_KEY);
        formData.append('isOverlayRequired', 'false');
        formData.append('detectOrientation', 'false');
        formData.append('scale', 'true');
        formData.append('OCREngine', '2'); // Engine 2 daha hızlı
        // Görüntü boyutu limiti için
        formData.append('filetype', 'JPG');
        
        // Debug: Base64 boyutunu kontrol et
        console.log('Base64 görüntü formatı:', base64Image.substring(0, 30) + '...');
        console.log('Base64 boyutu:', base64Part.length, 'karakter');
        if (base64Part.length > 1000000) {
            console.warn('Büyük görüntü tespit edildi, API limiti aşılabilir');
        }
        
        const response = await fetch(OCR_API_URL, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            let errorMessage = `API hatası: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.ErrorMessage && errorData.ErrorMessage.length > 0) {
                    errorMessage = errorData.ErrorMessage[0];
                } else if (errorData.error) {
                    errorMessage = errorData.error;
                }
            } catch (e) {
                // JSON parse hatası - response text'i al
                const text = await response.text().catch(() => '');
                if (text) errorMessage = text;
            }
            
            // Rate limit kontrolü
            if (response.status === 429) {
                errorMessage = 'Günlük istek limiti aşıldı. Lütfen daha sonra tekrar deneyin veya kendi API key\'inizi kullanın.';
            }
            
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        
        // Debug: API yanıtını logla
        console.log('OCR API Yanıtı:', data);
        
        // OCRExitCode kontrolü - eğer yoksa veya undefined ise kontrol et
        if (!data.hasOwnProperty('OCRExitCode')) {
            console.error('OCRExitCode bulunamadı. API yanıtı:', data);
            // Eğer hata mesajı varsa göster
            if (data.ErrorMessage && data.ErrorMessage.length > 0) {
                throw new Error(data.ErrorMessage[0]);
            }
            throw new Error('API yanıtı beklenen formatta değil');
        }
        
        // OCR hata kodları kontrolü
        if (data.OCRExitCode !== 1) {
            const errorMessages = {
                2: 'Görüntü işlenemedi',
                3: 'OCR işlemi başarısız',
                4: 'Görüntü formatı desteklenmiyor',
                99: 'Bilinmeyen hata'
            };
            
            // Eğer ErrorMessage varsa onu kullan
            if (data.ErrorMessage && data.ErrorMessage.length > 0) {
                throw new Error(data.ErrorMessage[0]);
            }
            
            const exitCode = data.OCRExitCode;
            const errorMsg = errorMessages[exitCode] || `OCR hatası (kod: ${exitCode})`;
            console.error('OCR Exit Code:', exitCode, 'Full response:', data);
            throw new Error(errorMsg);
        }
        
        if (data.ParsedResults && data.ParsedResults.length > 0) {
            // Tüm metinleri birleştir
            const fullText = data.ParsedResults
                .map(result => result.ParsedText || '')
                .join('\n')
                .trim();
            return fullText;
        }
        
        // OCRExitCode 1 ama sonuç yok
        if (data.OCRExitCode === 1) {
            console.warn('OCR başarılı ama metin bulunamadı');
            return '';
        }
        
        return '';
    } catch (error) {
        console.error('OCR API hatası:', error);
        throw error;
    }
}

// Kamerayı durdur
stopCameraBtn.addEventListener('click', stopCamera);
stopCameraBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    stopCamera();
});

// Otomatik algılama toggle
function toggleAutoDetection() {
    isAutoMode = !isAutoMode;
    
    if (isAutoMode) {
        toggleAutoBtn.textContent = '🔄 Otomatik Algılama: Açık';
        toggleAutoBtn.classList.add('btn-active');
        startAutoDetection();
        statusInfo.textContent = 'Otomatik algılama aktif. Telefon numaraları otomatik bulunacak.';
    } else {
        toggleAutoBtn.textContent = '🔄 Otomatik Algılama: Kapalı';
        toggleAutoBtn.classList.remove('btn-active');
        stopAutoDetection();
        statusInfo.textContent = 'Otomatik algılama kapalı. Manuel algılama için ekrana dokunun.';
    }
}

toggleAutoBtn.addEventListener('click', toggleAutoDetection);
toggleAutoBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    toggleAutoDetection();
});

// Video üzerine tıklama/dokunma ile manuel algılama
function handleVideoInteraction(e) {
    e.preventDefault();
    if (!isAutoMode && !isProcessing) {
        captureAndAnalyze();
    }
}

videoElement.addEventListener('click', handleVideoInteraction);
videoElement.addEventListener('touchend', handleVideoInteraction);

// Kamerayı durdurma fonksiyonu
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    videoElement.srcObject = null;
    startCameraBtn.style.display = 'inline-block';
    stopCameraBtn.style.display = 'none';
    toggleAutoBtn.style.display = 'none';
    overlayNumbers.innerHTML = '';
    detectedNumbers.clear();
    stopAutoDetection();
    statusInfo.textContent = 'Kamera durduruldu.';
}

// Otomatik algılamayı başlat
function startAutoDetection() {
    if (autoInterval) return;
    
    autoInterval = setInterval(async () => {
        if (!isProcessing && videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
            await captureAndAnalyze();
        }
    }, 1000); // OCR.space hızlı olduğu için 1 saniye yeterli
}

// Otomatik algılamayı durdur
function stopAutoDetection() {
    if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
    }
}


// Fotoğraf yükleme işlemleri
function triggerFileInput() {
    fileInput.click();
}

uploadArea.addEventListener('click', triggerFileInput);
uploadArea.addEventListener('touchend', (e) => {
    e.preventDefault();
    triggerFileInput();
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFile(file);
    }
});

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Lütfen bir resim dosyası seçin!');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        uploadArea.style.display = 'none';
        previewSection.style.display = 'block';
        photoOverlayNumbers.innerHTML = '';
    };
    reader.readAsDataURL(file);
}


// Reset butonu
function resetPhoto() {
    fileInput.value = '';
    previewImage.src = '';
    uploadArea.style.display = 'block';
    previewSection.style.display = 'none';
    photoOverlayNumbers.innerHTML = '';
    loadingSection.style.display = 'none';
}

resetBtn.addEventListener('click', resetPhoto);
resetBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    resetPhoto();
});

// Telefon numarası çıkarma
function extractPhoneNumbers(text) {
    const patterns = [
        /0\d{3}\s?\d{3}\s?\d{2}\s?\d{2}/g,
        /0\d{10}/g,
        /\+90\s?\d{3}\s?\d{3}\s?\d{2}\s?\d{2}/g,
        /\+90\d{10}/g,
        /\(\d{3}\)\s?\d{3}\s?-\s?\d{2}\s?-\s?\d{2}/g,
        /\d{3}\s?-\s?\d{3}\s?-\s?\d{2}\s?-\s?\d{2}/g,
        /Tel[:\s]*([0-9\s\-\(\)]+)/gi,
        /Telefon[:\s]*([0-9\s\-\(\)]+)/gi,
    ];

    const foundNumbers = new Set();

    patterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
            matches.forEach(match => {
                let cleaned = match.replace(/\D/g, '');
                
                if (cleaned.length >= 10) {
                    if (cleaned.length === 10 && cleaned.startsWith('0')) {
                        foundNumbers.add(cleaned);
                    }
                    else if (cleaned.length === 11 && cleaned.startsWith('0')) {
                        foundNumbers.add(cleaned);
                    }
                    else if (cleaned.length === 12 && cleaned.startsWith('90')) {
                        foundNumbers.add('0' + cleaned.substring(2));
                    }
                    else if (cleaned.length === 13 && cleaned.startsWith('90')) {
                        foundNumbers.add('0' + cleaned.substring(2));
                    }
                }
            });
        }
    });

    const telMatches = text.match(/Tel[:\s]*([0-9\s\-\(\)]+)/gi);
    if (telMatches) {
        telMatches.forEach(match => {
            const number = match.replace(/Tel[:\s]*/gi, '').replace(/\D/g, '');
            if (number.length >= 10 && number.length <= 11) {
                if (number.startsWith('0')) {
                    foundNumbers.add(number);
                } else if (number.length === 10) {
                    foundNumbers.add('0' + number);
                }
            }
        });
    }

    return Array.from(foundNumbers);
}

// Numaraları overlay'de göster (kamera için)
function displayNumbersOnOverlay(phoneNumbers, overlayContainer) {
    overlayContainer.innerHTML = '';
    detectedNumbers.clear();
    
    phoneNumbers.forEach((phone, index) => {
        const phoneElement = document.createElement('div');
        phoneElement.className = 'phone-overlay';
        phoneElement.textContent = formatPhoneNumber(phone);
        phoneElement.style.top = `${20 + index * 60}px`;
        phoneElement.style.left = '20px';
        
        function callPhone(e) {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = `tel:${phone}`;
        }
        
        phoneElement.addEventListener('click', callPhone);
        phoneElement.addEventListener('touchend', callPhone);
        
        overlayContainer.appendChild(phoneElement);
        detectedNumbers.set(phone, phoneElement);
    });
}

// Sonuçları gösterme (fotoğraf için)
function displayResults(phoneNumbers) {
    loadingSection.style.display = 'none';
    previewSection.style.display = 'block';

    if (phoneNumbers.length === 0) {
        photoOverlayNumbers.innerHTML = '<div class="no-results">Fotoğrafta telefon numarası bulunamadı. Lütfen daha net bir fotoğraf yükleyin.</div>';
        return;
    }

    // Fotoğraf üzerinde overlay olarak göster
    displayNumbersOnOverlay(phoneNumbers, photoOverlayNumbers);
}

// Telefon numarasını formatla
function formatPhoneNumber(phone) {
    if (phone.length === 11 && phone.startsWith('0')) {
        return `${phone.substring(0, 4)} ${phone.substring(4, 7)} ${phone.substring(7, 9)} ${phone.substring(9, 11)}`;
    }
    return phone;
}

// OCR.space API kontrolü
window.addEventListener('load', () => {
    console.log('OCR.space API hazır');
    if (OCR_API_KEY === 'helloworld') {
        console.warn('Ücretsiz public API key kullanılıyor. Daha fazla istek için: https://ocr.space/ocrapi/freekey');
    }
});

// Görüntüyü optimize et (OCR.space için - mobilde daha küçük)
function optimizeImage(imageSrc, maxWidth = 1024) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onerror = () => reject(new Error('Görüntü yüklenemedi'));
        
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Mobilde daha küçük görüntü kullan (performans ve API limiti için)
                // OCR.space API için maksimum 1024px önerilir (daha hızlı ve güvenilir)
                const apiMaxWidth = 1024; // API için optimal boyut
                const mobileMaxWidth = isMobile ? 1024 : apiMaxWidth;
                const targetWidth = width > mobileMaxWidth ? mobileMaxWidth : width;
                
                if (width > targetWidth) {
                    height = (height * targetWidth) / width;
                    width = targetWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                // Görüntüyü çiz
                ctx.drawImage(img, 0, 0, width, height);
                
                // Mobilde daha düşük kalite (daha küçük dosya boyutu)
                const quality = isMobile ? 0.8 : 0.9;
                resolve(canvas.toDataURL('image/jpeg', quality));
            } catch (error) {
                reject(error);
            }
        };
        
        img.src = imageSrc;
    });
}

// Görüntüyü yakala ve analiz et (kamera için - OCR.space API)
async function captureAndAnalyze() {
    if (isProcessing || !videoElement.videoWidth) return;
    
    isProcessing = true;
    
    try {
        statusInfo.textContent = 'Görüntü yakalanıyor...';
        
        // Görüntüyü yakala
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        const ctx = canvasElement.getContext('2d');
        ctx.drawImage(videoElement, 0, 0);
        
        const imageData = canvasElement.toDataURL('image/jpeg', 0.9);
        // OCR.space API için 1024px optimal boyut
        const optimizedImage = await optimizeImage(imageData, 1024);
        
        statusInfo.textContent = 'OCR işlemi başlatıldı...';
        
        // OCR.space API ile OCR
        const text = await recognizeTextWithOCR(optimizedImage);

        console.log('OCR Sonucu:', text);
        statusInfo.textContent = 'Metin algılandı, telefon numaraları aranıyor...';

        const phoneNumbers = extractPhoneNumbers(text);
        
        console.log('Bulunan numaralar:', phoneNumbers);
        
        if (phoneNumbers.length > 0) {
            displayNumbersOnOverlay(phoneNumbers, overlayNumbers);
            statusInfo.textContent = `${phoneNumbers.length} telefon numarası bulundu!`;
        } else if (!isAutoMode) {
            statusInfo.textContent = 'Telefon numarası bulunamadı. Lütfen etiketi daha net gösterin.';
            console.log('Algılanan metin:', text);
        }
        
    } catch (error) {
        console.error('OCR hatası:', error);
        if (!isAutoMode) {
            statusInfo.textContent = `HATA: ${error.message || 'Analiz başarısız oldu'}`;
            alert(`Analiz hatası: ${error.message || 'Bilinmeyen hata'}. Konsolu kontrol edin.`);
        }
    } finally {
        isProcessing = false;
    }
}

// Fotoğraf analiz butonu
async function analyzePhoto() {
    if (!previewImage.src) {
        alert('Lütfen önce bir fotoğraf yükleyin!');
        return;
    }

    loadingSection.style.display = 'block';
    previewSection.style.display = 'block';
    loadingText.textContent = 'Fotoğraf analiz ediliyor...';

    try {
        console.log('Fotoğraf analizi başlatılıyor...');
        loadingText.textContent = 'Görüntü optimize ediliyor...';
        
        // Görüntüyü optimize et - OCR.space API için 1024px optimal
        const optimizedImage = await optimizeImage(previewImage.src, 1024);
        
        loadingText.textContent = 'OCR işlemi başlatıldı...';
        
        // OCR.space API ile OCR
        const text = await recognizeTextWithOCR(optimizedImage);

        console.log('OCR Sonucu:', text);
        loadingText.textContent = 'Metin algılandı, telefon numaraları aranıyor...';

        const phoneNumbers = extractPhoneNumbers(text);
        
        console.log('Bulunan numaralar:', phoneNumbers);
        
        displayResults(phoneNumbers);
        
    } catch (error) {
        console.error('OCR hatası:', error);
        loadingText.textContent = `HATA: ${error.message || 'Analiz başarısız'}`;
        alert(`Fotoğraf analiz edilirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}. Konsolu kontrol edin.`);
        loadingSection.style.display = 'none';
    }
}

analyzeBtn.addEventListener('click', analyzePhoto);
analyzeBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    analyzePhoto();
});

// Sayfa kapatılırken kamerayı durdur
window.addEventListener('beforeunload', () => {
    stopCamera();
});
