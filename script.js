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
    }, 2000);
}

// Otomatik algılamayı durdur
function stopAutoDetection() {
    if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
    }
}

// Görüntüyü yakala ve analiz et (kamera için)
async function captureAndAnalyze() {
    if (isProcessing || !videoElement.videoWidth) return;
    
    isProcessing = true;
    
    try {
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        const ctx = canvasElement.getContext('2d');
        ctx.drawImage(videoElement, 0, 0);
        
        const imageData = canvasElement.toDataURL('image/jpeg', 0.8);
        
        const { data: { text } } = await Tesseract.recognize(
            imageData,
            'tur+eng',
            {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        loadingText.textContent = 'Telefon numarası algılanıyor...';
                    }
                }
            }
        );

        const phoneNumbers = extractPhoneNumbers(text);
        
        if (phoneNumbers.length > 0) {
            displayNumbersOnOverlay(phoneNumbers, overlayNumbers);
            statusInfo.textContent = `${phoneNumbers.length} telefon numarası bulundu!`;
        } else if (!isAutoMode) {
            statusInfo.textContent = 'Telefon numarası bulunamadı. Lütfen etiketi daha net gösterin.';
        }
        
    } catch (error) {
        console.error('OCR hatası:', error);
        if (!isAutoMode) {
            statusInfo.textContent = 'Analiz hatası. Lütfen tekrar deneyin.';
        }
    } finally {
        isProcessing = false;
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

// Fotoğraf analiz butonu
analyzeBtn.addEventListener('click', async () => {
    if (!previewImage.src) return;

    loadingSection.style.display = 'block';
    previewSection.style.display = 'block';
    loadingText.textContent = 'Fotoğraf analiz ediliyor...';

    try {
        const { data: { text } } = await Tesseract.recognize(
            previewImage.src,
            'tur+eng',
            {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        loadingText.textContent = 'Telefon numarası algılanıyor...';
                    }
                }
            }
        );

        const phoneNumbers = extractPhoneNumbers(text);
        displayResults(phoneNumbers);
        
    } catch (error) {
        console.error('OCR hatası:', error);
        alert('Fotoğraf analiz edilirken bir hata oluştu. Lütfen tekrar deneyin.');
        loadingSection.style.display = 'none';
    }
});

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

// Sayfa kapatılırken kamerayı durdur
window.addEventListener('beforeunload', () => {
    stopCamera();
});
