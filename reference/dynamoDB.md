# DynamoDB

Terraform in `terraform/data.tf` creates these five tables. Non-key attributes are stored on the item and are not declared in Terraform. DynamoDB only requires the key attributes. Profile image bytes stay in S3. The user row stores the public URL.

Page size is 10. Status pages are newest first (`ScanIndexForward` false). Names and photos are not copied onto follow, story, or feed rows. A page that needs them loads the user rows with one `BatchGetItem`: dedupe the aliases, request those keys, put the users in a map keyed by alias, and walk the original page in order.

## users

Table `tweeter-users`. Resource `aws_dynamodb_table.users`.

- Partition key: `alias` (S). No sort key. One item per person.
- `firstName` (S), `lastName` (S), `imageUrl` (S).
- `passwordHash` (S). A bcrypt hash from `bcryptjs`. The plaintext password is never stored.
- `followerCount` (N) and `followeeCount` (N), both `0` at registration.

Login, register, and get-user are a `GetItem` by alias. Register is a conditional `PutItem` with `attribute_not_exists(alias)`, so a taken alias fails. A follower, followee, story, or feed page hydrates names and photos with `BatchGetItem`. Follow and unfollow adjust the two counts with an atomic `ADD`. Reading a count is a `GetItem`.

## auth_tokens

Table `tweeter-auth-tokens`. Resource `aws_dynamodb_table.auth_tokens`.

- Partition key: `token` (S). No sort key. One item per token.
- `alias` (S). The user the token belongs to.
- `timestamp` (N). Epoch milliseconds. This is the value returned on the `AuthToken`, and the last time the session was used.
- `expiresAt` (N). Epoch seconds. DynamoDB TTL is enabled on this attribute.

Login and register `PutItem`. Logout `DeleteItem`. Every authenticated call is a `GetItem` by the token string. Write `expiresAt` as `Math.floor(Date.now() / 1000)` plus the lifetime. A millisecond value would live about 1000 times too long. The lifetime is 30 minutes of inactivity. A successful authenticated call updates `timestamp` and pushes `expiresAt` forward. TTL deletion is not immediate, so a lookup still rejects a row whose `expiresAt` is in the past. Nothing looks tokens up by alias, so this table has no index.

## follows

Table `tweeter-follows`. Resource `aws_dynamodb_table.follows`.

- Partition key: `followerAlias` (S). Sort key: `followeeAlias` (S).
- No other attributes.
- Global secondary index `followers`: partition `followeeAlias` (S), sort `followerAlias` (S), projection `ALL`. This is the only extra index.

A followee page queries the table by `followerAlias`. A follower page queries the `followers` index by `followeeAlias`. "Is the signed-in user following this user?" is a `GetItem` on `(followerAlias, followeeAlias)`. The next page starts after the previous alias.

Follow and unfollow are one `TransactWriteItems`: put or delete the edge, `ADD` `followeeCount` on the follower, and `ADD` `followerCount` on the followee. The put fails if the edge already exists. A self-follow is rejected before the write. Unfollow does not delete feed rows. Each follow write consumes one write on the table and one write on the index.

## story

Table `tweeter-story`. Resource `aws_dynamodb_table.story`.

- Partition key: `alias` (S). The author.
- Sort key: `timestamp` (N). Epoch milliseconds.
- `post` (S).

One author cannot post twice in the same millisecond, so the numeric timestamp is unique and numeric order is chronological. Mentions, URLs, and newlines are parsed by `Status` when the row is read. They are not stored. The author is the partition key, so a story page loads that user with one `GetItem` rather than copying the name and photo onto each row.

A post writes one item here. A story page is a `Query` on the author alias, newest first. The next page starts after the last item's timestamp.

## feed

Table `tweeter-feed`. Resource `aws_dynamodb_table.feed`.

- Partition key: `alias` (S). The viewer, not the author.
- Sort key: `postedAt` (S). The ISO-8601 timestamp, then `#`, then the author alias. Example: `2026-11-22T22:49:01.123Z#amy`.
- `post` (S), `timestamp` (N), `authorAlias` (S).

`Date.toISOString()` is fixed width, so string order is time order. The timestamp comes first. Two different authors can post in the same millisecond, and the author alias makes the sort key unique. `authorAlias` is also the suffix of `postedAt`. Storing it keeps the page mapper from parsing the key.

`post` and `timestamp` are a copy of the story row. Posts cannot be edited, so the copy never has to be updated. A feed page is one `Query` on the viewer alias, newest first, then one `BatchGetItem` for the distinct author aliases on that page.

On post: write the story item, query the author's followers on the `followers` index, then `BatchWriteItem` one feed row per follower. A batch holds 25 items. Retry `unprocessedItems` until none remain. Only people who follow the author at that moment get a row. Unfollow stops future rows and leaves the rows already written.
