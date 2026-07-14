    // Initialize modals and carousels
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize modals
        const modalElems = document.querySelectorAll('.modal');
        
        // mobile sidenav init
         const elems = document.querySelectorAll('.sidenav');
        M.Sidenav.init(elems);

        // Scroll-to-top button functionality
        const scrollButton = document.createElement('button');
        scrollButton.innerHTML = '<i class="bi bi-arrow-up"></i>';
        scrollButton.className = 'scroll-to-top';
        scrollButton.title = 'Scroll to top';
        document.body.appendChild(scrollButton);

        // Scroll to down button functionality
        const scrollDownButton = document.createElement('button');
        scrollDownButton.innerHTML = '<i class="bi bi-arrow-down"></i>';
        scrollDownButton.className = 'scroll-to-down';
        scrollDownButton.style.bottom = '80px';
        scrollDownButton.title = 'Scroll down';
        document.body.appendChild(scrollDownButton);

        // Show/hide scroll button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollButton.classList.add('show');
            } else {
                scrollButton.classList.remove('show');
            }
        });

        // Show/ hide scroll down button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset < document.body.scrollHeight - window.innerHeight - 300) {
                scrollDownButton.classList.add('show');
            } else {                scrollDownButton.classList.remove('show');
            }
        });

        // Scroll to top when button is clicked
        scrollButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Scroll to down when button is clicked
        scrollDownButton.addEventListener('click', () => {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        });
    });