const fse = require('fs-extra');
const fetch = require('node-fetch');

const github = require('../utils/github');

async function testCaseHandler(id) {
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json; charset=utf-8',
            authorization: process.env.TM4J_API_KEY,
        },
    };
    const caseResponse = await fetch(`https://api.adaptavist.io/tm4j/v2/testcases/${id}`, options);
    const caseJson = await caseResponse.json();
    if (!caseJson) {
        console.log(`Test case for ${id} not found.`);
        return;
    }
    console.log('caseResponse', caseResponse)
    console.log('caseJson', caseJson)
    const stepResponse = await fetch(`https://api.adaptavist.io/tm4j/v2/testcases/${id}/teststeps`, options);
    const stepJson = await stepResponse.json();
    if (!stepJson || !stepJson.values) {
        console.log(`Test step for ${id} not found.`);
        return;
    }
    console.log('stepJson', stepJson)
    const content = generateContent({
        key: caseJson.key,
        name: caseJson.name,
        objective: caseJson.objective,
        precondition: caseJson.precondition,
        steps: stepJson.values,
    });
    const title = `Write Webapp E2E with Cypress: "${caseJson.key} ${caseJson.name}"`;

    fse.outputFileSync(`cypress/${caseJson.key}.md`, content)

    github.createIssue(title, content);

    console.log(`Success: ${caseJson.key}`);
}

const generateContent = (data) => {
    const re = /\/"/gi;
    let content = '';

    if (data?.precondition) {
        content += '<h3>Test Preparation</h3>';
        content += data?.precondition.replace(re, '"');
        content += '<hr>';
    }

    for (let i = 0; i < data?.steps.length; i++) {
        const step = data?.steps[i];
        const num = data?.steps.length > 1 ? i + 1 : '';

        const {inline} = step;

        if (inline?.description) {
            content += `<h3>Steps ${num ? ' #' + num : ''}</h3>`;
            content += inline.description.replace(re, '"');
        }

        if (inline?.testData) {
            content += '<h3>Test Data</h3>';
            content += inline.testData.replace(re, '"');
        }

        if (inline?.expectedResult) {
            content += '<h3>Expected</h3>';
            content += inline.expectedResult.replace(re, '"');
        }

        content += '<hr>';
    }

    const reSpace = /\s/gi;
    const folder = process.env.TEST_FOLDER.toLowerCase().replace(reSpace, '_');

    return `
See our [documentation for Webapp end-to-end testing with Cypress](https://developers.mattermost.com/contribute/webapp/end-to-end-tests/) for reference.

<article>
<h1>${data.key} ${data.name}</h1>
<div>
<div>
${content}
</div>
</div>
</article>

**Test Folder:** \`\`/cypress/integration/${folder}\`\`
**Test code arrangement:**
\`\`\`
describe('${process.env.TEST_FOLDER}', () => {
    it('${data.key} ${data.name}', () => {
        // code
    });
});
\`\`\`

Notes:
1. Do not add \`\`@prod\`\` label in a spec file
  - If you're writing script into a newly created test file, \`\`@prod\`\` label should not be included.
  - If you're adding script into an existing test file, \`\`@prod\`\` label should removed.
2. Use [queries from testing-library](https://testing-library.com/docs/dom-testing-library/api-queries) whenever possible. We share the same philosophy as the [testing-library](https://testing-library.com/) when doing UI automation like "Interact with your app the same way as your users" and so, please follow their guidelines especially when querying an element. 

If you're interested, please comment here and come [join our "Contributors" community channel](https://community.mattermost.com/core/channels/tickets) on our daily build server, where you can discuss questions with community members and the Mattermost core team. For technical advice or questions, please  [join our "Developers" community channel](https://community.mattermost.com/core/channels/developers).


New contributors please see our [Developer's Guide](https://developers.mattermost.com/contribute/getting-started/).
`;
};

if (process.env.TEST_KEY) {
    process.env.TEST_KEY.split(',').forEach(id => {
        const testCase = `MM-T${id}`;
        console.log('Processing:', testCase);

        testCaseHandler(testCase)
    })
} else {
    console.log('No test case to generate. Pass TEST_KEY env variable with test case number/s, comma separated if passing multiple IDs. Example command: \'TEST_KEY="662,663" TEST_FOLDER="Integrations" node index.js\'')
}


