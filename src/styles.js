const stylesHTML = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF Kita</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>PDF Kita</h1>
            <p>Menyelesaikan Pekerjaan Anda Dengan Mudah</p>
        </div>
        <div class="converter">
            <h2>PDF To WORD Converter</h2>
            <p>Masukkan File PDF dan Nikmati hasil Convertternya</p>
            <input type="file" id="fileInput" accept=".pdf" />
            <button id="convertButton">Select PDF File</button>
            <p class="drop-text">Drop Your FILE</p>
        </div>
        <div class="sidebar">
            <h2>WELCOME To PDF Kita</h2>
            <p>Menyelesaikan Pekerjaan Anda Dengan Mudah</p>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>
`;

export default stylesHTML;