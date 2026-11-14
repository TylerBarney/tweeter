## 2026-11-11: AGENTS.md (new file), reference/domain.md (new file), reference/requirements.md (new file), reference/architecture.md (new file), AI-ATTRIBUTION.md (new file)

- Tool: Cursor (Grok 4.7)
- Task: Add AGENTS.md for the Tweeter project, with short reference docs for the domain, requirements, current MVP architecture, and later goals, plus the AI attribution rule.
- Review: Everything looked good. Had to correct some of the current and future architecture writing but otherwise everything looked good.

## 2026-11-13: tweeter-server/scripts/package-lambda.sh (new file), tweeter-server/package.json, .gitignore, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add an npm script that builds the Lambda layer and function zips, including only tweeter-shared, date-fns, and uuid in the layer.
- Review: Reviewed and tested it. It was simple so it got it all right

## 2026-11-13: terraform/versions.tf (new file), terraform/lambda.tf (new file), terraform/api.tf (new file), terraform/outputs.tf (new file), terraform/.gitignore (new file), terraform/.terraform.lock.hcl (new file), AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add Terraform that deploys the GetFollowees Lambda and a non-proxy API Gateway POST /followee/list endpoint, using the existing function and layer zips.
- Review: There were a few API Gateway setups that needed to be changed. The layer created needed to be updated from node 20 to node24.

## 2026-11-13: AGENTS.md, reference/architecture.md, reference/lambda-api.md (new file), AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Document the deployed Lambda and API Gateway setup, and how future agents should add functions and routes, in AGENTS.md and the reference docs.
- Review: Everything looked good here.
