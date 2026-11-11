export const themeBootScript = `
(function(){
  try{
    var t = localStorage.getItem('gundam-theme');
    if(t !== 'light' && t !== 'dark') t = 'dark';
    document.documentElement.dataset.theme = t;
    var h = localStorage.getItem('gundam-hud');
    document.documentElement.dataset.hud = (h === 'off') ? 'off' : 'on';
    var r = localStorage.getItem('gundam-read');
    document.documentElement.dataset.read = (r === 'lg') ? 'lg' : 'std';
  }catch(e){}
})();
`;
