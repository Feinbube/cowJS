function Button (text, description, callback, rect) {
    this.text = text;
    this.description = description;
    this.callback = callback;
    this.rect = rect;

    this.hit = function() { callback(); }; 
}