document.getElementById('convertButton').addEventListener('click', function() {
    const fileInput = document.getElementById('fileInput');
    fileInput.click();
    
    fileInput.onchange = function() {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const fileExtension = file.name.split('.').pop().toLowerCase(); // Get the file extension
            
            // Check if the file is a PDF
            if (fileExtension === 'pdf') {
                localStorage.setItem('selectedFile', file.name); // Store file info in local storage
                window.location.href = 'halaman.html'; // Redirect to halaman.html
            } else {
                // Alert the user if the file is not a PDF
                alert("Sorry Bro Hanya File PDF Yang dapat di unggah.");
            }
        }
    };
});