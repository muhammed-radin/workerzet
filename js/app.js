document.addEventListener('DOMContentLoaded', () => {
  // Initialize Ace Editor
  const editor = ace.edit("editor");
  window.editor = editor;
  ace.require("ace/ext/language_tools")
  editor.setTheme("ace/theme/one_dark");
  editor.session.setMode("ace/mode/javascript");
  editor.setOptions({
    fontSize: "14px",
    showPrintMargin: false,
    lineHeight: 1.5,
    
    cursorStyle: 'slim',
    highlightSelectedWord: true,
    
    fontFamily: 'Cousine',
    enableLigatures: true,
    
    useSvgGutterIcons: true,
    
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    highlightActiveLine: true,
    highlightSelectedWord: true,
  });
  
  
  
  audio.play(audio.CONFIRM)
  
  // Force Flat Design
  document.styleSheets[0].insertRule(`
  .ace_editor * {
    border-radius: 0 !important;
    box-shadow: none !important;
  }
`, 0);
  
  
  //editor.setTheme("ace/theme/cyberpunk_enhanced");
  
  // DOM Elements
  const menuToggle = document.getElementById('menuToggle');
  const fileMenu = document.getElementById('fileMenu');
  const settingsToggle = document.getElementById('settingsToggle');
  const settingsMenu = document.getElementById('settingsMenu');
  const aiModal = document.getElementById('aiModal');
  const saveSettingsBtn = document.getElementById('saveSettings');
  
  // File Explorer Menu
  let isMenuOpen = false;
  
  menuToggle.addEventListener('click', (e) => {
    fileMenu.classList.toggle('-translate-x-full');
    isMenuOpen = !isMenuOpen;
    e.stopPropagation();
  });
  
  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (isMenuOpen && !fileMenu.contains(e.target)) {
      fileMenu.classList.add('-translate-x-full');
      isMenuOpen = false;
    }
  });
  
  // Settings Menu
  settingsToggle.addEventListener('click', (e) => {
    settingsMenu.classList.toggle('hidden');
    e.stopPropagation();
  });
  
  saveSettingsBtn.addEventListener('click', () => {
    const title = document.querySelector('#settingsMenu input[type="text"]').value;
    const description = document.querySelector('#settingsMenu textarea').value;
    
    // Save to localStorage (you can replace with API call)
    localStorage.setItem('projectSettings', JSON.stringify({ title, description }));
    settingsMenu.classList.add('hidden');
  });
  
  // AI Prompt Modal
  document.getElementById('aiPrompt').addEventListener('click', () => {
    aiModal.classList.remove('hidden');
  });
  
  document.querySelector('#aiModal button').addEventListener('click', () => {
    const prompt = document.querySelector('#aiModal textarea').value;
    // Handle AI generation here
    aiModal.classList.add('hidden');
  });
  
  
  // File Explorer Interactions
  document.querySelectorAll('#fileMenu .file-item').forEach(item => {
    item.addEventListener('click', () => {
      // Handle file/folder selection
      const fileName = item.querySelector('span').textContent;
      editor.session.setValue(`// ${fileName} content\n// Add your code here`);
    });
  });
  
  
  // Window Resize Handler
  window.addEventListener('resize', () => {
    editor.resize();
    //settingsMenu.classList.add('hidden');
  });
  
  
  
  
  editor.on('change', () => {
    let v = editor.getValue();
    if (currentTab && currentTab.type === 'file') {
      var file = rootFs.searchById(currentTab.id);
      if (file) {
        file.content = v;
      }
    }
  })
});



async function asyncMap(array, asyncCallback) {
  const results = [];
  for (const item of array) {
    results.push(await asyncCallback(item));
  }
  return results;
}


function genProject(title, des, target) {
  api.post(`Create new project with given details from user. \n Title: ${title} \n Description: ${des} \n Target: ${target}`,
    api.PROMPT_ENHANCE_PROMPT).then((prmpt) => {
    audio.play(audio.HINT)
    api.post(prmpt, api.PROMPT_PLAN_GEN).then(function(txt) {
      var jsonCode = convertMdCodeBlocksToJson(txt)[0].code;
      jsonCode = '[' + jsonCode;
      editor.setValue(jsonCode);
      let files = JSON.parse(jsonCode);
      
      rootFs.fromObject(files)
      updateFilesRender();
      
      
      asyncMap(rootFs.getAllFilesList(), async (item) => {
        let fileCode = await api.post(`write code for project.` + (item.getLocation() + item.name) + ` \n File Des` + item.des, api.PROMPT_NO_EXP_FILE_GEN())
        let convertedCodeBlock = await convertMdCodeBlocksToJson(fileCode)[0].code;
        
        if (convertedCodeBlock) {
          item.setContent(convertedCodeBlock);
          item.status = 'READY'
          audio.play(audio.CLICK)
          return convertedCodeBlock
        }
      })
      
    })
  })
}


function openPrompt() {
  return new Promise((resolve, reject) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50';
    
    modal.innerHTML = `
          <div class="bg-gray-900 rounded-xl w-full max-w-[500px] p-6 space-y-6">
            <h2 class="text-2xl font-bold text-white">Create New Project</h2>
            
            <form id="promptForm" class="space-y-4">
              <!-- Title Input -->
              <div>
                <label class="block text-white mb-2">Title</label>
                <input 
                  type="text" 
                  id="title"
                  required
                  class="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
              </div>

              <!-- Description Input -->
              <div>
                <label class="block text-white mb-2">Description</label>
                <textarea 
                  id="description"
                  rows="3"
                  class="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>
              </div>

              <!-- Goal/Target Textarea -->
              <div>
                <label class="block text-white mb-2">AI Target Goal</label>
                <textarea 
                  id="goal"
                  rows="2"
                  required
                  class="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Describe your AI target goal..."
                ></textarea>
              </div>

              <!-- Form Actions -->
              <div class="flex justify-end space-x-3">
                <button 
                  type="button"
                  class="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700"
                  onclick="this.closest('.fixed').remove()"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        `;
    
    const form = modal.querySelector('#promptForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        title: form.title.value,
        description: form.description.value,
        goal: form.goal.value
      };
      modal.remove();
      resolve(data);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        reject('Modal closed');
      }
    });
    
    document.body.appendChild(modal);
  });
}

openPrompt().then((opt) => {
  genProject(opt.title, opt.description, opt.goal)
  
  document.getElementById("DownloadIt").onclick = function() {
    rootFs.exportFolderAsZip().then(function(blob) {
      downloadFile(blob)
    })
  }
})