// Navigation controller

const Navigation = {
    currentPage: 'landing',
    
    init() {
        // Setup navigation links
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.navigateTo(page);
            });
        });
        
        // Back button in fighter details
        const backBtn = document.getElementById('back-to-fighters');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.navigateTo('fighters');
            });
        }
    },
    
    navigateTo(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        const targetPage = document.getElementById(pageName);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // Update nav links
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageName) {
                link.classList.add('active');
            }
        });
        
        this.currentPage = pageName;
        
        // Trigger page-specific initialization
        if (pageName === 'fighters' && FightersTable.needsRefresh) {
            FightersTable.render();
        }
    }
};