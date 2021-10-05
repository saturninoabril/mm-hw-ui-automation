const {Octokit} = require('@octokit/rest');

const GITHUB_LABELS = [
    'Hacktoberfest',
    'Area/E2E Tests',
    'Difficulty/1:Easy',
    'Help Wanted',
    'Up For Grabs',
    'Tech/Automation'
]

function createIssue(title, description) {
    const {
        GITHUB_TOKEN_DEV,
        GITHUB_OWNER_DEV,
        GITHUB_REPO_DEV,
    } = process.env;

    const octokit = new Octokit({
        auth: GITHUB_TOKEN_DEV,
    });

    return octokit.issues.create({
            owner: GITHUB_OWNER_DEV,
            repo: GITHUB_REPO_DEV,
            title,
            body: description,
            labels: GITHUB_LABELS,
        })
        .then(resp => {
            console.log('Successfully created Github issue - ', resp.data.html_url);
            return { status: resp.status, data: resp.data };
        })
        .catch(err => {
            console.log('Failed to create Github issue for:', title);
            return { error: err };
        });
}

module.exports = {
    createIssue,
};
