function convertMdCodeBlocksToJson(markdown) {
  const codeBlockRegex = /```(\w+)?\s*([^\n]*)\n([\s\S]*?)\n```/g;
  const results = [];
  let match;
  
  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    const [fullMatch, language, firstLine, code] = match;
    
    // Parse the first line for path information
    let filename = '';
    let folder = [];
    
    if (firstLine.includes('/')) {
      const pathParts = firstLine.split('/');
      filename = pathParts.pop().trim();
      folder = pathParts.map(part => part.replace('# ', '').trim()).filter(part => part);
    } else if (firstLine.trim()) {
      filename = firstLine.trim();
    }
    
    // If no filename detected in first line, generate a default
    if (!filename && language) {
      filename = `code.${language}`;
    } else if (!filename) {
      filename = 'code.txt';
    }
    
    results.push({
      code: code.trim(),
      filename,
      folder,
      language: language || 'plaintext',
      explanation: '' // Can be populated separately
    });
  }
  
  return results;
}



ace.define("ace/theme/cyberpunk_enhanced", ["require", "exports", "module", "ace/lib/dom"], function(require, exports, module) {
    const dom = require("ace/lib/dom");
    
    exports.isDark = true;
    exports.cssClass = "ace-cyberpunk-enhanced";
    
    // Pastel color palette
    const colors = {
        background: "#323243",
        text: "#E0F4FF",
        keyword: "#FFAA66",       // Pastel orange
        string: "#88ff88",       // Pastel green
        variable: "#59C8FF",     // Pastel blue
        error: "#ff6680",        // Pastel red
        warning: "#ff9966",       // Pastel orange
        purple: "#CC88FF",        // Pastel purple
        cyan: "#66ffff",          // Pastel cyan
        highlight: "rgba(255, 170, 102, 0.2)"
    };

    exports.cssText = `
.ace-cyberpunk-enhanced {
    background: ${colors.background} !important;
    color: ${colors.text} !important;
    font-family: 'Cousine', monospace !important;
}

${/* Glowing keyword effect */''}
.ace-cyberpunk-enhanced .ace_keyword {
    color: ${colors.keyword} !important;
    text-shadow: 0 0 10px ${colors.keyword} !important;
    animation: keyword-glow 2s ease-in-out infinite !important;
}

${/* Syntax highlighting */''}
.ace-cyberpunk-enhanced .ace_string { color: ${colors.string}; font-style: italic; }
.ace-cyberpunk-enhanced .ace_variable { color: ${colors.variable} !important; }
.ace-cyberpunk-enhanced .ace_type { color: ${colors.purple} !important; font-weight: 100; animation: keyword-glow 2s ease-in-out infinite !important;}
.ace-cyberpunk-enhanced .ace_support { color: ${colors.purple}; }
.ace-cyberpunk-enhanced .ace_constant { color: ${colors.cyan}; }
.ace-cyberpunk-enhanced .ace_comment { color: #6688aa; font-style: italic; }
.ace-cyberpunk-enhanced .ace_identifier { color: #B8D6FF; }
.ace-cyberpunk-enhanced .ace_paren { color: #E7D858;  }


${/* Error/Warning lines */''}
.ace_error_line { 
    background: ${colors.error}22 !important; 
    border-bottom: 2px solid ${colors.error};
}
.ace_warning_line {
    background: ${colors.warning}22 !important;
    border-bottom: 2px solid ${colors.warning};
}

${/* Animations */''}
@keyframes keyword-glow {
    0%, 100% { text-shadow: 0 0 10px ${colors.keyword}; }
    50% { text-shadow: 0 0 5px ${colors.keyword}, 0 0 5px ${colors.keyword}; }
}

@keyframes paren-glow {
    0%, 100% { text-shadow: 0 0 10px #58E75D; }
    50% { text-shadow: 0 0 6px #FFF67A, 0 0 6px #41BA45; }
}

@keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
}

${/* Gutter styling */''}
.ace-cyberpunk-enhanced .ace_gutter {
    background: #000018;
    color: #6688aa;
    border-right: 1px solid #334466;
}

${/* Suggestion menu */''}
.ace_editor.ace-cyberpunk-enhanced .ace_autocomplete {
    border: 1px solid ${colors.purple} !important;
    background: ${colors.background} !important;
    box-shadow: 0 0 20px ${colors.purple}80 !important;
}
.ace_autocomplete .ace_selected {
    background: ${colors.purple}40;
    color: ${colors.cyan};
}
`;

    // Add SVG gutter icons
    const warningSVG = `<svg width="18" height="18" viewBox="0 0 24 24" style="color: ${colors.warning}">
        <path fill="currentColor" d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6zm-1 4v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
    </svg>`;

    const errorSVG = `<svg width="18" height="18" viewBox="0 0 24 24" style="color: ${colors.error}">
        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg>`;

    // Add editor enhancements
    exports.onLoad = function(editor) {
        const session = editor.session;
        
        // Add gutter decorations
        session.on('changeFrontMarker', function(e) {
            const markers = session.getMarkers();
            Object.keys(markers).forEach(markerId => {
                const marker = markers[markerId];
                if (marker.type === "errorLine") {
                    addGutterDecoration(marker.range.start.row, errorSVG);
                } else if (marker.type === "warningLine") {
                    addGutterDecoration(marker.range.start.row, warningSVG);
                }
            });
        });

        function addGutterDecoration(row, html) {
            const gutter = editor.renderer.$gutterLayer;
            const cell = gutter.element.querySelector(`[data-ace-gutter-id="${row}"]`);
            if (cell && !cell.querySelector('svg')) {
                cell.insertAdjacentHTML('beforeend', html);
            }
        }

        // Add scanline animation
        const scanline = document.createElement('div');
        scanline.style.cssText = `
            position: absolute;
            width: 100%;
            height: 2px;
            background: linear-gradient(to bottom, transparent, ${colors.cyan}80, transparent);
            animation: scanline 5s linear infinite;
            pointer-events: none;
            z-index: 9999;
        `;
        editor.container.appendChild(scanline);
    };

    // Suggestion menu styling
    dom.importCssString(`
.ace_cyberpunk-enhanced .ace_autocomplete .ace_content {
    background: linear-gradient(160deg, #0a0a12 0%, #00001a 100%);
}
.ace_cyberpunk-enhanced .ace_autocomplete .ace_completion-highlight {
    text-shadow: 0 0 10px ${colors.cyan};
    color: ${colors.cyan} !important;
}
.ace_cyberpunk-enhanced .ace_autocomplete {
    text-shadow: 0 0 5px ${colors.purple};
}
    `, "editor_cyberpunk_style");
});