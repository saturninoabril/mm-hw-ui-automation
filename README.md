#### Set your credentials via environment variables
It would be best to have it in your `.profile` or `.bashrc`, but will work quickly using `export`.
From Github:
- `GITHUB_TOKEN_DEV=[token]`
- `GITHUB_OWNER_DEV=[saturninoabril]`
- `GITHUB_REPO_DEV=[mm-hw-ui-automation]`

From Jira/TM4J
- `TM4J_API_KEY=[key]`

#### How to run the script
Pick up test case/s from Zephyr Scale (formerly TM4J) and take note of its test ID as `TEST_KEY` and test folder as `TEST_FOLDER`. You may assign one or more keys to `TEST_KEY`, separated by comma.
```bash
TEST_KEY=3201,3202 TEST_FOLDER=messaging node cypress/index.js
TEST_KEY=3203,3204 TEST_FOLDER=messaging node detox/index.js
```
The script will create a file like `/cypress/MM-T3201.md` and will publish an issue as help-wanted to the Github repo based from the template.

#### Before publishing
1. Create a test Github repo to see if the newly created issue/help-wanted is as expected.
2. Adjust the template or labels accordingly before using the intended Github repo.
