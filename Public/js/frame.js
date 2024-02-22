function updatemenu() {
    if (document.getElementById('responsive-menu').checked == true) {
      document.getElementById('menu').style.borderBottomRightRadius = '0';
      document.getElementById('menu').style.borderBottomLeftRadius = '0';
    }else{
      document.getElementById('menu').style.borderRadius = '0px';
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    const subMenus = document.querySelectorAll('.sub-menus');
    subMenus.forEach(function(subMenu) {
        subMenu.parentElement.addEventListener('click', function() {
            subMenu.style.display = subMenu.style.display === 'block' ? 'none' : 'block';
        });
    });
});