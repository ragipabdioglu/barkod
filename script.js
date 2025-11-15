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
cameraModeBtn.addEventListener('click', () => switchMode('camera'));
photoModeBtn.addEventListener('click', () => switchMode('photo'));

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

// Kamerayı başlat
startCameraBtn.addEventListener('click', async () => {
    try {
        statusInfo.textContent = 'Kamera erişimi isteniyor...';
        
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        videoElement.srcObject = stream;
        videoElement.play();

        startCameraBtn.style.display = 'none';
        stopCameraBtn.style.display = 'inline-block';
        toggleAutoBtn.style.display = 'inline-block';
        statusInfo.textContent = 'Kamera hazır! Etiketi kameraya gösterin.';
        
    } catch (error) {
        console.error('Kamera hatası:', error);
        statusInfo.textContent = 'Kamera erişimi reddedildi. Lütfen izin verin.';
        alert('Kamera erişimi gerekli. Lütfen tarayıcı ayarlarından kamera iznini verin.');
    }
});

// OCR.space API ile metin tanıma
async function recognizeTextWithOCR(imageData) {
    try {
        // Base64'ten sadece data kısmını al
        const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
        
        const formData = new FormData();
        formData.append('base64Image', base64Data);
        formData.append('language', 'tur'); // Türkçe
        formData.append('apikey', OCR_API_KEY);
        formData.append('isOverlayRequired', 'false');
        formData.append('detectOrientation', 'false');
        formData.append('scale', 'true');
        formData.append('OCREngine', '2'); // Engine 2 daha hızlı
        
        const response = await fetch(OCR_API_URL, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.ErrorMessage?.[0] || `API hatası: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.OCRExitCode === 1 && data.ParsedResults && data.ParsedResults.length > 0) {
            // Tüm metinleri birleştir
            const fullText = data.ParsedResults
                .map(result => result.ParsedText || '')
                .join('\n')
                .trim();
            return fullText;
        }
        
        return '';
    } catch (error) {
        console.error('OCR API hatası:', error);
        throw error;
    }
}

// Kamerayı durdur
stopCameraBtn.addEventListener('click', () => {
    stopCamera();
});

// Otomatik algılama toggle
toggleAutoBtn.addEventListener('click', () => {
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
});

// Video üzerine tıklama ile manuel algılama
videoElement.addEventListener('click', async (e) => {
    if (!isAutoMode && !isProcessing) {
        await captureAndAnalyze();
    }
});

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
uploadArea.addEventListener('click', () => {
    fileInput.click();
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
resetBtn.addEventListener('click', () => {
    fileInput.value = '';
    previewImage.src = '';
    uploadArea.style.display = 'block';
    previewSection.style.display = 'none';
    photoOverlayNumbers.innerHTML = '';
    loadingSection.style.display = 'none';
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
        
        phoneElement.addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = `tel:${phone}`;
        });
        
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

// Görüntüyü optimize et (OCR.space için)
function optimizeImage(imageSrc, maxWidth = 1600) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // OCR.space için daha büyük görüntü kullanabiliriz (daha iyi sonuç)
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            // Görüntüyü çiz
            ctx.drawImage(img, 0, 0, width, height);
            
            // JPEG formatında, yüksek kalite (OCR.space için)
            resolve(canvas.toDataURL('image/jpeg', 0.9));
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
        const optimizedImage = await optimizeImage(imageData, 1600);
        
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
analyzeBtn.addEventListener('click', async () => {
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
        
        // Görüntüyü optimize et
        const optimizedImage = await optimizeImage(previewImage.src, 1600);
        
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
});

// Sayfa kapatılırken kamerayı durdur
window.addEventListener('beforeunload', () => {
    stopCamera();
});
