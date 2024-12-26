const qrReader = document.getElementById('qr-reader');
        const qrVideo = document.getElementById('qr-video');
        const uploadedQR = document.getElementById('uploaded-qr');
        const result = document.getElementById('result');
        const fileUpload = document.getElementById('file-upload');
        const uploadArea = document.getElementById('upload-area');
        const redirectOptions = document.getElementById('redirect-options');
        const redirectDelay = document.getElementById('redirect-delay');
        const redirectNowBtn = document.getElementById('redirect-now');
        const cancelRedirectBtn = document.getElementById('cancel-redirect');

        let codeReader = new ZXing.BrowserQRCodeReader();
        let redirectTimer;
        let scannedUrl;

        // Function to handle successful scans
        function onScanSuccess(decodedText, decodedResult) {
            result.textContent = `Scanned QR Code: ${decodedText}`;
            scannedUrl = decodedText;
            showRedirectOptions();
        }

        // Start camera scanning
        codeReader.decodeFromVideoDevice(null, 'qr-video', (result, err) => {
            if (result) {
                onScanSuccess(result.text, result);
            }
            if (err && !(err instanceof ZXing.NotFoundException)) {
                console.error(err);
            }
        }).catch((err) => {
            console.error(err);
            result.textContent = 'Error: Could not access the camera. Please make sure you have granted camera permissions.';
        });

        // Function to handle file input
        function handleFileInput(file) {
            const img = new Image();
            img.onload = () => {
                uploadedQR.src = img.src;
                uploadedQR.style.display = 'block';
                qrVideo.style.display = 'none';

                codeReader.decodeFromImage(img).then((result) => {
                    onScanSuccess(result.text, result);
                }).catch((err) => {
                    console.error(err);
                    result.textContent = 'Error: Could not decode QR code from image.';
                });
            };
            img.src = URL.createObjectURL(file);
        }

        // File upload event listener
        fileUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleFileInput(file);
            }
        });

        // Drag and drop functionality
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
            if (file) {
                handleFileInput(file);
            }
        });

        // Click to upload
        uploadArea.addEventListener('click', () => {
            fileUpload.click();
        });

        // Function to show redirect options
        function showRedirectOptions() {
            redirectOptions.style.display = 'block';
            startRedirectTimer();
        }

        // Function to start redirect timer
        function startRedirectTimer() {
            clearTimeout(redirectTimer);
            const delay = parseInt(redirectDelay.value, 10);
            if (delay > 0) {
                redirectTimer = setTimeout(() => {
                    redirectToScannedUrl();
                }, delay * 1000);
            }
        }

        // Function to redirect to scanned URL
        function redirectToScannedUrl() {
            if (scannedUrl) {
                window.location.href = scannedUrl;
            }
        }

        // Event listeners for redirect options
        redirectDelay.addEventListener('change', startRedirectTimer);
        redirectNowBtn.addEventListener('click', redirectToScannedUrl);
        cancelRedirectBtn.addEventListener('click', () => {
            clearTimeout(redirectTimer);
            redirectOptions.style.display = 'none';
        });

        // Function to reset the QR reader
        function resetQRReader() {
            uploadedQR.style.display = 'none';
            qrVideo.style.display = 'block';
            result.textContent = '';
            redirectOptions.style.display = 'none';
            clearTimeout(redirectTimer);
        }

        // Add reset button
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset Scanner';
        resetButton.className = 'button';
        resetButton.addEventListener('click', resetQRReader);
        document.querySelector('.container').appendChild(resetButton);