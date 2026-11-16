// AI-assisted: see AI-ATTRIBUTION.md
import "isomorphic-fetch";
import { FakeData, User } from "tweeter-shared";
import { ServerFacade } from "../../src/network/ServerFacade";

jest.setTimeout(20000);

const serverFacade = new ServerFacade();
const allen = FakeData.instance.firstUser!;
const token = "integration-test-token";

describe("ServerFacade integration", () => {
  it("registers Allen Anderson and returns an auth token", async () => {
    const [user, authToken] = await serverFacade.register({
      firstName: "Test",
      lastName: "User",
      alias: "@test",
      password: "password",
      userImageBytes: "aGVsbG8=",
      imageFileExtension: "png",
    });

    expect(user.name).toBe("Allen Anderson");
    expect(user.alias).toBe("@allen");
    expect(user.imageUrl).toBe(allen.imageUrl);
    expect(authToken.token.length).toBeGreaterThan(0);
    expect(authToken.timestamp).toBeGreaterThan(0);
  });

  it("returns the first page of followers", async () => {
    const [followers, hasMore] = await expectFollowerPage(null);

    expect(hasMore).toBe(true);
    expect(followers[0].alias).toBe("@amy");
  });

  it("returns every follower page until there are no more", async () => {
    let lastItem: User | null = null;
    let hasMore = true;
    const aliases: string[] = [];

    while (hasMore) {
      const [followers, more]: [User[], boolean] =
        await expectFollowerPage(lastItem);

      expect(followers.length).toBeGreaterThan(0);
      aliases.push(...followers.map((follower) => follower.alias));
      lastItem = followers[followers.length - 1];
      hasMore = more;
      expect(aliases.length).toBeLessThanOrEqual(
        FakeData.instance.fakeUsers.length,
      );
    }

    expect(hasMore).toBe(false);
    expect(aliases).toEqual(
      FakeData.instance.fakeUsers
        .filter((user) => user.alias !== allen.alias)
        .map((user) => user.alias),
    );
  });

  it("returns a positive followee count and follower count", async () => {
    const request = { token, user: allen.dto };

    const followeeCount = await serverFacade.getFolloweeCount(request);
    const followerCount = await serverFacade.getFollowerCount(request);

    expect(followeeCount).toBeGreaterThan(0);
    expect(followeeCount).toBeLessThanOrEqual(10);
    expect(followerCount).toBeGreaterThan(0);
    expect(followerCount).toBeLessThanOrEqual(10);
  });
});

async function expectFollowerPage(
  lastItem: User | null,
): Promise<[User[], boolean]> {
  const [expectedFollowers, expectedHasMore] = FakeData.instance.getPageOfUsers(
    lastItem,
    10,
    allen.alias,
  );
  const [followers, hasMore] = await serverFacade.getMoreFollowers({
    token,
    alias: allen.alias,
    pageSize: 10,
    lastItem: lastItem === null ? null : lastItem.dto,
  });

  expect(hasMore).toBe(expectedHasMore);
  expect(followers.map(describeUser)).toEqual(
    expectedFollowers.map(describeUser),
  );
  expect(followers.some((follower) => follower.alias === allen.alias)).toBe(
    false,
  );
  return [followers, hasMore];
}

function describeUser(user: User): string {
  return `${user.name} ${user.alias} ${user.imageUrl}`;
}
