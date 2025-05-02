// Fetch GitHub statistics
async function fetchGitHubStats() {
    try {
        const response = await fetch('https://api.github.com/repos/pashkov256/deletor');
        const data = await response.json();
        
        document.getElementById('stars-count').textContent = data.stargazers_count;
        document.getElementById('forks-count').textContent = data.forks_count;
    } catch (error) {
        console.error('Error fetching GitHub stats:', error);
    }
}

// Fetch contributors
async function fetchContributors() {
    try {
        const response = await fetch('https://api.github.com/repos/pashkov256/deletor/contributors');
        const contributors = await response.json();
        
        const contributorsGrid = document.getElementById('contributors-grid');
        contributors.forEach(contributor => {
            const contributorElement = document.createElement('div');
            contributorElement.className = 'contributor';
            contributorElement.innerHTML = `
                <a href="${contributor.html_url}" target="_blank">
                    <img src="${contributor.avatar_url}" alt="${contributor.login}">
                    <p>${contributor.login}</p>
                </a>
            `;
            contributorsGrid.appendChild(contributorElement);
        });
    } catch (error) {
        console.error('Error fetching contributors:', error);
    }
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile menu functionality
const mobileMenuButton = document.querySelector('.mobile-menu-button');
const navLinks = document.querySelector('.nav-links');

mobileMenuButton.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!mobileMenuButton.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchGitHubStats();
    fetchContributors();
}); 