class TagString extends String {
  constructor(code, isTag = false) {
    super((isTag ? '<'+code+'></'+code+'>' : code));
  }

  parse(next) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(this, "text/html");
    if (typeof next == "function") next({ content: doc, str: this });
    return doc;
  }

  parseElement() {
    var parsed = this.parse();
    return parsed.body.children;
  }

  setOptions(obj = {}) {
    var doc = this.parse();
    doc = doc.body.children[0];

    Object.keys(obj).forEach(function(key) {
      doc[key] = obj[key];
    });

    return new TagString(doc.outerHTML);
  }

  setAttributes(obj = {}) {
    var doc = this.parse();
    doc = doc.body.children[0];

    Object.keys(obj).forEach(function(key) {
      if (doc.setAttribute) {
        doc.setAttribute(key, obj[key]);
      }
    });

    return new TagString(doc.outerHTML);
  }

  child(html) {
    var doc = this.parse();
    doc = doc.body.children[0];
    doc.innerHTML = html;
    return new TagString(doc.outerHTML);
  }

  data(next) {
    if (typeof next === "function") {
      var data = next(this);
      if (data) return data;
    }
    return this;
  }

  eval(obj = window) {
    
    var str = new TagString(this.replace(/#\(([^)]+)\)/g, function(match, variableName) {
      // Access the variable value using eval (use with caution)
      return obj[variableName];
    }))
    
    str = str.replaceAll('&amp;', '&')
    str = new TagString(str.replace(/&\((.*?)\)&/g, function(match, variableName) {
      // Access the variable value using eval (use with caution)
      return eval(variableName);
    }))
    
    return str
  }
  
  fixOutput(){
    var str = this.replaceAll('"', "'");
    return new TagString(str)
  }
}

