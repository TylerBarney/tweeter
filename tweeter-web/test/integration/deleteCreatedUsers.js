// AI-assisted: see AI-ATTRIBUTION.md
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

const REGION = "us-east-1";
const USERS_TABLE = "tweeter-users";
const AUTH_TOKENS_TABLE = "tweeter-auth-tokens";
const FOLLOWS_TABLE = "tweeter-follows";
const FOLLOWERS_INDEX = "followers";
const STORY_TABLE = "tweeter-story";
const FEED_TABLE = "tweeter-feed";

const document = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: REGION }),
  { marshallOptions: { removeUndefinedValues: true } },
);
const s3 = new S3Client({ region: REGION });

async function deleteCreatedUsers(users) {
  const failures = [];

  for (const user of users) {
    const problems = await deleteUser(user);
    if (problems.length > 0) {
      failures.push(`${user.alias}: ${problems.join("; ")}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(
      `Failed to clean up integration data\n${failures.join("\n")}`,
    );
  }
}

async function deleteUser(user) {
  const problems = [];

  await run(problems, () => deleteFollows(user.alias));
  await run(problems, () =>
    deletePartition(STORY_TABLE, user.alias, "timestamp"),
  );
  await run(problems, () => deletePartition(FEED_TABLE, user.alias, "postedAt"));
  await run(problems, () =>
    deleteKey(AUTH_TOKENS_TABLE, { token: user.token }),
  );
  await run(problems, () => deleteImage(user.imageUrl));
  await run(problems, () => deleteKey(USERS_TABLE, { alias: user.alias }));
  await run(problems, () => assertDeleted(user));

  return problems;
}

async function run(problems, work) {
  try {
    await work();
  } catch (error) {
    problems.push(error instanceof Error ? error.message : String(error));
  }
}

async function deleteFollows(alias) {
  const edges = [
    ...(await queryAll({
      TableName: FOLLOWS_TABLE,
      KeyConditionExpression: "followerAlias = :alias",
      ExpressionAttributeValues: { ":alias": alias },
    })),
    ...(await queryAll({
      TableName: FOLLOWS_TABLE,
      IndexName: FOLLOWERS_INDEX,
      KeyConditionExpression: "followeeAlias = :alias",
      ExpressionAttributeValues: { ":alias": alias },
    })),
  ];
  const seen = new Set();

  for (const edge of edges) {
    const followerAlias = String(edge.followerAlias);
    const followeeAlias = String(edge.followeeAlias);
    const key = `${followerAlias}\0${followeeAlias}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    await deleteKey(FOLLOWS_TABLE, { followerAlias, followeeAlias });
  }
}

async function deletePartition(tableName, alias, sortKey) {
  const items = await queryAll({
    TableName: tableName,
    KeyConditionExpression: "#alias = :alias",
    ExpressionAttributeNames: { "#alias": "alias" },
    ExpressionAttributeValues: { ":alias": alias },
  });

  for (const item of items) {
    await deleteKey(tableName, { alias, [sortKey]: item[sortKey] });
  }
}

async function deleteImage(imageUrl) {
  const url = new URL(imageUrl);
  const bucket = url.hostname.split(".s3.")[0];
  const key = decodeURIComponent(url.pathname.slice(1));
  if (
    bucket.length === 0 ||
    key.length === 0 ||
    !url.hostname.includes(".s3.")
  ) {
    throw new Error(`Cannot find profile image location in ${imageUrl}`);
  }

  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

async function assertDeleted(user) {
  await assertMissing(USERS_TABLE, { alias: user.alias }, `User ${user.alias}`);
  await assertMissing(
    AUTH_TOKENS_TABLE,
    { token: user.token },
    `Auth token for ${user.alias}`,
  );
  await assertNoItems(STORY_TABLE, user.alias, `Story items for ${user.alias}`);
  await assertNoItems(FEED_TABLE, user.alias, `Feed items for ${user.alias}`);
  const follows = await queryAll({
    TableName: FOLLOWS_TABLE,
    KeyConditionExpression: "followerAlias = :alias",
    ExpressionAttributeValues: { ":alias": user.alias },
    ConsistentRead: true,
  });
  if (follows.length > 0) {
    throw new Error(`Follows for ${user.alias} were not deleted`);
  }
}

async function assertMissing(tableName, key, label) {
  const result = await document.send(
    new GetCommand({
      TableName: tableName,
      Key: key,
      ConsistentRead: true,
    }),
  );
  if (result.Item !== undefined) {
    throw new Error(`${label} was not deleted`);
  }
}

async function assertNoItems(tableName, alias, label) {
  const items = await queryAll({
    TableName: tableName,
    KeyConditionExpression: "#alias = :alias",
    ExpressionAttributeNames: { "#alias": "alias" },
    ExpressionAttributeValues: { ":alias": alias },
    ConsistentRead: true,
  });
  if (items.length > 0) {
    throw new Error(`${label} were not deleted`);
  }
}

async function deleteKey(tableName, key) {
  await document.send(
    new DeleteCommand({
      TableName: tableName,
      Key: key,
    }),
  );
}

async function queryAll(input) {
  const items = [];
  let startKey;

  do {
    const result = await document.send(
      new QueryCommand({ ...input, ExclusiveStartKey: startKey }),
    );
    items.push(...(result.Items ?? []));
    startKey = result.LastEvaluatedKey;
  } while (startKey !== undefined);

  return items;
}

function readInput() {
  return new Promise((resolve, reject) => {
    const chunks = [];
    process.stdin.on("data", (chunk) => chunks.push(chunk));
    process.stdin.on("end", () => {
      resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    });
    process.stdin.on("error", reject);
  });
}

readInput()
  .then((users) => deleteCreatedUsers(users))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
