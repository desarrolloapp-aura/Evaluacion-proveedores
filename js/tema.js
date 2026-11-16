(function () {
    document.querySelectorAll('[data-tema-toggle]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var actual = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            var siguiente = actual === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', siguiente);
            localStorage.setItem('auraTema', siguiente);
            document.dispatchEvent(new CustomEvent('aura-tema-changed', { detail: { tema: siguiente } }));
        });
    });

    var colapsar = document.getElementById('colapsarMenuBtn');
    if (colapsar) {
        colapsar.addEventListener('click', function () {
            document.documentElement.classList.toggle('sidebar-collapsed');
            localStorage.setItem(
                'auraMenu',
                document.documentElement.classList.contains('sidebar-collapsed') ? 'collapsed' : 'open'
            );
        });
    }
})();
