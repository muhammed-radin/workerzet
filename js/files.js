class LocalFile extends EventEmitter {
  constructor(name, content = "", des = "", mime = "text/plain") {
    super()
    this.name = name;
    this.id = Math.floor(Math.random() * 99999999)
    this.location = [];
    this.content = content;
    this.mime = mime;
    this.type = 'file';
    this.des = des;
    this._status = 'INIT'
  }
  
  set status(s) {
    this.emit('status', s)
    this._status = s;
  }
  
  get status() {
    return this._status;
  }
  
  setContent(newContent) {
    this.content = newContent;
  }
  
  getContent() {
    return this.content;
  }
  
  getLocation() {
    return this.location.reverse().join('/').replace('root', '') + '/';
  }
}

class LocalFolder extends EventEmitter {
  constructor(name) {
    super()
    this.name = name;
    this.type = 'folder';
    this.items = [];
    this.location = [];
    this.id = Math.floor(Math.random() * 99999999)
  }
  
  addFile(file) {
    if (file instanceof LocalFile) {
      file.location.push(this.name)
      file.status = "PENDING"
      file.location = file.location.concat(this.location)
      this.items.push(file);
    } else {
      throw new Error('Argument must be an instance of LocalFile');
    }
  }
  
  addFolder(folder) {
    if (folder instanceof LocalFolder) {
      folder.location.push(this.name)
      folder.location = folder.location.concat(this.location)
      this.items.push(folder);
    } else {
      throw new Error('Argument must be an instance of LocalFolder');
    }
  }
  
  insertFile(pathArr, file) {
    var root = this.items;
    var dirName = pathArr[0];
    const idx = this.items.findIndex(
      (item) => item.name === dirName
    );
    if ((idx > -1 && root[idx].type == 'folder') || (pathArr.length - 1) <= 0) {
      root[idx].insertFile(pathArr.slice(1, pathArr.length - 1), file);
    } else {
      this.addFile(file);
    }
  }
  
  fromObject(objArr = [], root = this) {
    if (!root) {
      root = this;
    }
    
    objArr.forEach(function(content) {
      if (content.type === "file") {
        root.addFile(new LocalFile(content.name, "", content.des, content.mimeType))
      } else {
        let folder = new LocalFolder(content.name);
        root.addFolder(folder)
        folder.fromObject(content.contents)
      }
    })
  }
  
  delete(name) {
    const idx = this.items.findIndex(
      (item) => item.name === name
    );
    if (idx > -1) {
      this.items.splice(idx, 1);
      return true;
    }
    return false;
  }
  
  set(name, newItem) {
    const idx = this.items.findIndex(
      (item) => item.name === name
    );
    if (idx > -1) {
      this.items[idx] = newItem;
      return true;
    }
    return false;
  }
  
  indexOf(name) {
    const idx = this.items.findIndex(
      (item) => item.name === name
    );
    return idx
  }
  
  searchFile(name) {
    for (let item of this.items) {
      if (item.type === 'file' && item.name === name) {
        return item;
      }
    }
    for (let item of this.items) {
      if (item.type === 'folder') {
        const found = item.searchFile(name);
        if (found) return found;
      }
    }
    return null;
  }
  
  
  search(name) {
    for (let item of this.items) {
      if (item.name === name) {
        return item;
      }
      if (item.type === 'folder') {
        const found = item.search(name);
        if (found) return found;
      }
    }
    return null;
  }
  
  sort() {
    this.items.sort(function(a, b) {
      // First compare by type - folders come before files
      if (a.type === 'folder' && b.type !== 'folder') {
        return -1;
      }
      if (a.type !== 'folder' && b.type === 'folder') {
        return 1;
      }
      // If types are the same, compare by name
      return a.name.localeCompare(b.name);
    });
  }
  
  searchById(id) {
    for (let item of this.items) {
      if (item.id === id) {
        return item;
      }
      if (item.type === 'folder') {
        const found = item.searchById(id);
        if (found) return found;
      }
    }
    return null;
  }
  
  list() {
    return this.items.map(item => item.name);
  }
  
  getAllFilesList() {
    let list = [];
    for (let item of this.items) {
      if (item.type === "file") {
        list.push(item);
      }
      if (item.type === 'folder') {
        // Recursively get files from subfolder and concatenate them
        const filesInFolder = item.getAllFilesList();
        list = list.concat(filesInFolder);
      }
    }
    return list;
  }
  
  async exportFolderAsZip() {
    const zip = new JSZip();
    
    // Recursive function to add files and folders to the zip
    const addToZip = (item, path) => {
      const currentPath = path + item.name;
      
      if (item.type === 'folder') {
        item.items.forEach(child => addToZip(child, currentPath + '/'));
      } else {
        zip.file(currentPath, item.content);
      }
    };
    
    // Start processing from the root folder
    this.items.forEach(item => addToZip(item, ''));
    
    // Generate zip file as Blob
    return zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });
  }
}

const rootFs = new LocalFolder('root');


function htmlFile(name, icon, id, style = "") {
  return new TagString(`<div><div id="${id}" class="flex items-center space-x-3 px-3 py-2 hover:bg-gray-700 rounded-lg cursor-pointer ${style} .file-item">
            <ion-icon name="${icon}-outline" class="text-base"></ion-icon>
            <span class="text-sm">${name}</span>
          </div>
          <ul class="inner"></ul></div>`).parseElement()[0]
}

function renderFileItems(rootFS = rootFs, container = document.querySelector('.file_container')) {
  rootFS.sort()
  rootFS.items.forEach(function(item) {
    let fl;
    if (item.type == 'file') {
      fl = htmlFile(item.name, 'document', item.id, 'ml-[' + item.location.length * 23 + 'px]');
      container.appendChild(fl)
      
      item.on('status', function() {
        let icon = 'settings-outline'
        switch (item.status) {
          case 'INIT':
            icon = 'settings-outline'
            break;
          case "PENDING":
            icon = 'sparkles-outline'
            break;
          case "READY":
            icon = 'document-outline'
            break;
        }
        fl.querySelector('ion-icon').name = icon;
      })
      
      fl.onclick = function() {
        let flTab = new Tab(item.id, item.name, function(tab) {
          editor.setValue(item.content)
          editor.session.setMode("ace/mode/" + (item.mime.replace('application/', '').replace('text/', '')));
          editor.focus()
        })
        
        addTab(flTab);
        setCurrenTab(flTab)
      }
    } else {
      item.sort()
      fl = htmlFile(item.name, 'folder-open', item.id, 'ml-[' + item.location.length * 23 + 'px]');
      
      renderFileItems(item, fl.querySelector('.inner'))
      
      container.appendChild(fl)
    }
  })
}

function updateFilesRender() {
  document.querySelector('.file_container').innerHTML = ''
  renderFileItems(rootFs)
}

updateFilesRender();

/**
 * Downloads a File or Blob object
 * @param {File|Blob} file - The file or blob to download
 * @param {string} [customName] - Optional custom filename (uses original name if not provided)
 */
function downloadFile(file, customName) {
  // Create a URL for the blob
  const url = URL.createObjectURL(file);
  
  // Create an anchor element
  const a = document.createElement('a');
  a.href = url;
  
  // Use custom name if provided, otherwise try to get the original name
  a.download = customName || (file instanceof File ? file.name : 'download');
  
  // Trigger download
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

