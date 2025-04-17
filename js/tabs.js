class Tab extends EventEmitter {
  constructor(id, name, exe = () => {}, type = 'file') {
    super()
    this.id = id;
    this.name = name;
    this.active = false;
    this.type = type;
    if (!this.id) {
      this.id = Math.floor(Math.random() * 9999999999);
    }
    this.exe = exe;
  }
  
}

let tabData = [];
let currentTab = null;

function removeDuplicates(arr, idKey = 'id') {
  if (!Array.isArray(arr)) return []; // Handle non-array inputs
  const seen = new Map();
  return arr.filter(item => {
    if (!item || typeof item !== 'object') return false; // Skip non-objects
    const id = item[idKey];
    if (seen.has(id)) return false; // Skip duplicates
    seen.set(id, true);
    return true;
  });
}

function setCurrenTab(tab) {
  if (currentTab) {
    currentTab.active = false
    currentTab.emit('active', false)
  }
  
  currentTab = tab;
  tab.active = true
  tab.emit('active', true)
  renderTabs(tabData)
  tab.exe(tab);
  
  tabData = removeDuplicates(tabData);
}

function addTab(tab) {
  tabData.push(tab)
  tabData = removeDuplicates(tabData);
}


function htmlTab(filename, icon = 'document', style = "") {
  return new TagString(`
            <button class="px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-gray-600 transition-colors ${style}">
              <ion-icon name="${icon}-outline" class="text-sm"></ion-icon>
              <span class="text-sm">${filename}</span>
            </button>`).parseElement()[0]
}

function renderTabs(tabList = []) {
  let tabs = document.getElementById('tabs');
  tabs.innerHTML = "";
  tabList.forEach(function(tab, i) {
    let elem = htmlTab(tab.name, 'document', (currentTab && currentTab.id == tab.id ? 'bg-red-500' : 'bg-gray-700'));
    console.log((currentTab && currentTab.id == tab.id ? 'bg-red-500' : 'bg-gray-700'))
    tabs.appendChild(elem);
    elem.onclick = function() {
      setCurrenTab(tab)
    }
  })
}

renderTabs()