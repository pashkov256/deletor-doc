const REPO_OWNER = 'pashkov256';
const REPO_NAME = 'deletor';

// GitHub API endpoints
const API_BASE = 'https://api.github.com';
const REPO_URL = `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}`;
const CONTRIBUTORS_URL = `${REPO_URL}/contributors`;
const COMMITS_URL = `${REPO_URL}/commits`;

// Optional: Add your GitHub token here for higher rate limits
// const GITHUB_TOKEN = 'your_github_token';

// Add loading state
function setLoading(elementId, isLoading) {
    const element = document.getElementById(elementId);
    if (isLoading) {
        element.innerHTML = '<div class="loading">Loading...</div>';
    }
}

// Format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Fetch repository statistics
async function fetchRepoStats() {
    setLoading('repo-stats', true);
    try {
        // Use fetch with proper headers
        const headers = {};
        // if (GITHUB_TOKEN) {
        //     headers['Authorization'] = `token ${GITHUB_TOKEN}`;
        // }

        const response = await fetch(REPO_URL, { headers });
        if (!response.ok) {
            throw new Error(`Failed to fetch repo stats: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        // Update statistics
        document.getElementById('stars-count').textContent = data.stargazers_count || '0';
        document.getElementById('forks-count').textContent = data.forks_count || '0';

        // Fetch issues count
        const issuesResponse = await fetch(`${REPO_URL}/issues?state=open`, { headers });
        if (!issuesResponse.ok) {
            throw new Error(`Failed to fetch issues: ${issuesResponse.status} ${issuesResponse.statusText}`);
        }
        const issues = await issuesResponse.json();
        document.getElementById('issues-count').textContent = issues.length || '0';

        // Fetch pull requests count
        const prResponse = await fetch(`${REPO_URL}/pulls?state=open`, { headers });
        if (!prResponse.ok) {
            throw new Error(`Failed to fetch pull requests: ${prResponse.status} ${prResponse.statusText}`);
        }
        const prs = await prResponse.json();
        document.getElementById('pr-count').textContent = prs.length || '0';
    } catch (error) {
        console.error('Error fetching repository statistics:', error);
        document.getElementById('repo-stats').innerHTML = `
            <div class="error">
                <p>Failed to load repository statistics</p>
                <p class="error-details">${error.message}</p>
                <p>Please try again later or check your internet connection.</p>
            </div>
        `;
    }
}

// Fetch commit information for a contributor
async function fetchContributorCommits(login) {
    try {
        const headers = {};
        // if (GITHUB_TOKEN) {
        //     headers['Authorization'] = `token ${GITHUB_TOKEN}`;
        // }

        const response = await fetch(`${COMMITS_URL}?author=${login}`, { headers });
        if (!response.ok) {
            throw new Error(`Failed to fetch commits: ${response.status} ${response.statusText}`);
        }
        const commits = await response.json();
        return commits.length;
    } catch (error) {
        console.error(`Error fetching commits for ${login}:`, error);
        return 0;
    }
}

// Fetch and display contributors
async function fetchContributors() {
    setLoading('contributors-list', true);
    try {
        const headers = {};
        // if (GITHUB_TOKEN) {
        //     headers['Authorization'] = `token ${GITHUB_TOKEN}`;
        // }

        const response = await fetch(CONTRIBUTORS_URL, { headers });
        console.log(response);

        if (!response.ok) {
            throw new Error(`Failed to fetch contributors: ${response.status} ${response.statusText}`);
        }
        const contributors = await response.json();

        const contributorsList = document.getElementById('contributors-list');
        contributorsList.innerHTML = ''; // Clear existing content

        if (contributors.length === 0) {
            contributorsList.innerHTML = '<div class="no-contributors">No contributors found</div>';
            return;
        }

        for (const contributor of contributors) {
            const commitCount = await fetchContributorCommits(contributor.login);

            const contributorCard = document.createElement('div');
            contributorCard.className = 'contributor-card';

            contributorCard.innerHTML = `
                <img class="contributor-avatar" src="${contributor.avatar_url}" alt="${contributor.login}">
                <div class="contributor-info">
                    <a href="${contributor.html_url}" target="_blank" class="contributor-name">${contributor.login}</a>
                    <div class="contributor-stats">
                        <span class="contributor-stat">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
                            </svg>
                            ${contributor.contributions} contributions
                        </span>
                        <span class="contributor-stat">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.124-.922.33l-.655.48a.75.75 0 01-1.12-.65V2.5z"/>
                            </svg>
                            ${commitCount} commits
                        </span>
                    </div>
                </div>
            `;

            contributorsList.appendChild(contributorCard);
        }
    } catch (error) {
        console.error('Error fetching contributors:', error);
        document.getElementById('contributors-list').innerHTML = `
            <div class="error">
                <p>Failed to load contributors</p>
                <p class="error-details">${error.message}</p>
                <p>Please try again later or check your internet connection.</p>
            </div>
        `;
    }
}

// Add error handling for API rate limits
async function checkRateLimit() {
    try {
        const headers = {};
        // if (GITHUB_TOKEN) {
        //     headers['Authorization'] = `token ${GITHUB_TOKEN}`;
        // }

        const response = await fetch(`${API_BASE}/rate_limit`, { headers });
        const data = await response.json();
        if (data.resources.core.remaining < 10) {
            console.warn('GitHub API rate limit is low:', data.resources.core.remaining);
        }
    } catch (error) {
        console.error('Error checking rate limit:', error);
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await checkRateLimit();
        await fetchRepoStats();
        await fetchContributors();
    } catch (error) {
        console.error('Error initializing GitHub stats:', error);
    }
}); 