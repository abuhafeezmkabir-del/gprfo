// Report Form JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // File upload handling
    const dropZone = document.getElementById('file-drop-zone');
    const fileInput = document.getElementById('evidence_files');
    const browseButton = document.getElementById('browse-files');
    const fileList = document.getElementById('file-list');
    const form = document.getElementById('incident-report-form');

    // Browse files
    if (browseButton) {
        browseButton.addEventListener('click', function(e) {
            e.preventDefault();
            fileInput.click();
        });
    }

    // File input change
    if (fileInput) {
        fileInput.addEventListener('change', handleFiles);
    }

    // Drag and drop
    if (dropZone) {
        dropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            dropZone.classList.add('border-accent', 'bg-blue-50');
        });

        dropZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            dropZone.classList.remove('border-accent', 'bg-blue-50');
        });

        dropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            dropZone.classList.remove('border-accent', 'bg-blue-50');
            
            const files = e.dataTransfer.files;
            fileInput.files = files;
            handleFiles({ target: { files: files } });
        });
    }

    function handleFiles(e) {
        const files = Array.from(e.target.files);
        fileList.innerHTML = '';

        // Check file sizes
        const maxSize = 50 * 1024 * 1024; // 50MB
        let totalSize = 0;
        
        files.forEach(file => {
            totalSize += file.size;
        });

        if (totalSize > maxSize) {
            alert('Total file size exceeds 50MB limit. Please reduce file sizes.');
            fileInput.value = '';
            return;
        }

        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'flex items-center justify-between bg-neutral-50 p-3 rounded';
            
            const fileSize = (file.size / (1024 * 1024)).toFixed(2);
            const icon = file.type.startsWith('image/') ? 'fa-image' : 'fa-video';
            
            fileItem.innerHTML = `
                <div class="flex items-center">
                    <i class="fas ${icon} text-neutral-500 mr-3"></i>
                    <div>
                        <p class="text-sm font-medium text-neutral-700">${file.name}</p>
                        <p class="text-xs text-neutral-500">${fileSize} MB</p>
                    </div>
                </div>
                <button type="button" class="text-red-500 hover:text-red-700" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            fileList.appendChild(fileItem);
        });
    }

    // Form submission
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Validate form
            if (!window.validateForm(form)) {
                alert('Please fill in all required fields.');
                return;
            }

            // Disable submit button and show loading
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Submitting...';

            // Create FormData
            const formData = new FormData(form);

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    // Show success message
                    form.innerHTML = `
                        <div class="text-center py-12">
                            <i class="fas fa-check-circle text-6xl text-green-500 mb-6"></i>
                            <h2 class="text-2xl font-semibold text-primary mb-4">Report Submitted Successfully</h2>
                            <p class="text-neutral-700 mb-6">Your report reference number is: <strong>${result.reference_id}</strong></p>
                            <p class="text-sm text-neutral-600">We will verify the information and follow up if needed. For urgent matters, please contact us via WhatsApp.</p>
                        </div>
                    `;
                } else {
                    throw new Error(result.message || 'Submission failed');
                }
            } catch (error) {
                alert('Error submitting report. Please try again or contact us directly.');
                console.error('Submission error:', error);
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        });
    }
});