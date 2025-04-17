  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>

  <script type="module" src="https://cdnjs.cloudflare.com/ajax/libs/ionicons/7.4.0/ionicons/ionicons.esm.js"></script>
  <script nomodule="" src="https://cdnjs.cloudflare.com/ajax/libs/ionicons/7.4.0/ionicons/ionicons.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.23.4/ace.js"></script>
 
 
 
 
 <html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WorkerZet - AI Code Workspace</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.6/ace.min.js"></script>
    <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
    <script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
    <link rel="stylesheet" href="css/style.css">
</head>

</html>

<style>
.editor-container {
    height: calc(100% - 40px);
}

#fileMenu {
    scrollbar-width: thin;
    scrollbar-color: #4a5568 #2d3748;
}

#fileMenu::-webkit-scrollbar {
    width: 6px;
}

#fileMenu::-webkit-scrollbar-thumb {
    background-color: #4a5568;
    border-radius: 3px;
}

@media (max-width: 768px) {
    #fileMenu {
        width: 75%;
    }
    .editor-container {
        height: calc(100% - 36px);
    }
}
</style>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const editor = ace.edit("editor");
    editor.setTheme("ace/theme/twilight");
    editor.session.setMode("ace/mode/javascript");
    editor.setOptions({
        fontSize: "14px",
        showPrintMargin: false
    });

    const menuToggle = document.getElementById('menuToggle');
    const fileMenu = document.getElementById('fileMenu');
    
    menuToggle.addEventListener('click', () => {
        fileMenu.classList.toggle('-translate-x-full');
    });

    window.addEventListener('resize', () => {
        editor.resize();
    });
});
</script>