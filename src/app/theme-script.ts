export const themeBootScript = `
(function(){
  try{
    var t = localStorage.getItem('gundam-theme');
    if(t !== 'light' && t !== 'dark') t = 'dark';
    document.documentElement.dataset.theme = t;
  }catch(e){}
})();
`;
