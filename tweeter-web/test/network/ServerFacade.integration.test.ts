// AI-assisted: see AI-ATTRIBUTION.md
import "isomorphic-fetch";
import { User } from "tweeter-shared";
import { ServerFacade } from "../../src/network/ServerFacade";
import {
  PAGE_SIZE,
  RegisteredUser,
  alias,
  createLiveApi,
  describeUser,
  uniqueSuffix,
} from "../integration/liveApi";

jest.setTimeout(90000);

const serverFacade = new ServerFacade();
const api = createLiveApi(serverFacade);

afterAll(async () => {
  await api.cleanup();
});

describe("ServerFacade integration", () => {
  it("registers the submitted user and returns an auth token", async () => {
    const userAlias = alias("register", uniqueSuffix());
    const { user, authToken } = await api.registerUser(
      userAlias,
      "Test",
      "User",
    );

    expect(user.name).toBe("Test User");
    expect(user.alias).toBe(userAlias);
    expect(user.imageUrl).toContain(`${userAlias}.png`);
    expect(authToken.token.length).toBeGreaterThan(0);
    expect(authToken.timestamp).toBeGreaterThan(0);
  });

  describe("followers", () => {
    let followee: RegisteredUser;
    let followers: RegisteredUser[];

    beforeAll(async () => {
      const suffix = uniqueSuffix();
      followee = await api.registerUser(
        alias("z", suffix),
        "Follow",
        "Target",
      );
      followers = [];

      for (const label of ["a", "b", "c"]) {
        const follower = await api.registerUser(
          alias(label, suffix),
          label.toUpperCase(),
          "Follower",
        );
        await serverFacade.follow({
          token: follower.authToken.token,
          user: followee.user.dto,
        });
        followers.push(follower);
      }
    });

    it("returns the first page of followers", async () => {
      const [page, hasMore] = await loadFollowers(null);

      expect(hasMore).toBe(true);
      expect(page.map(describeUser)).toEqual(
        followers.slice(0, PAGE_SIZE).map((follower) => describeUser(follower.user)),
      );
      expect(page.some((follower) => follower.alias === followee.user.alias)).toBe(
        false,
      );
    });

    it("returns every follower page until there are no more", async () => {
      let lastItem: User | null = null;
      let hasMore = true;
      const aliases: string[] = [];

      while (hasMore) {
        const [page, more]: [User[], boolean] = await loadFollowers(lastItem);

        expect(page.length).toBeGreaterThan(0);
        aliases.push(...page.map((follower) => follower.alias));
        lastItem = page[page.length - 1];
        hasMore = more;
        expect(aliases.length).toBeLessThanOrEqual(followers.length);
      }

      expect(hasMore).toBe(false);
      expect(aliases).toEqual(followers.map((follower) => follower.user.alias));
    });

    function loadFollowers(
      lastItem: User | null,
    ): Promise<[User[], boolean]> {
      return serverFacade.getMoreFollowers({
        token: followee.authToken.token,
        alias: followee.user.alias,
        pageSize: PAGE_SIZE,
        lastItem: lastItem === null ? null : lastItem.dto,
      });
    }
  });

  it("returns follow counts for the relationships it creates", async () => {
    const suffix = uniqueSuffix();
    const user = await api.registerUser(
      alias("count", suffix),
      "Count",
      "User",
    );
    const other = await api.registerUser(
      alias("other", suffix),
      "Other",
      "User",
    );

    expect(await followerCount(user)).toBe(0);
    expect(await followeeCount(user)).toBe(0);

    const [followerCountAfterFollow, followeeCountAfterFollow] =
      await serverFacade.follow({
        token: other.authToken.token,
        user: user.user.dto,
      });

    expect(followerCountAfterFollow).toBe(1);
    expect(followeeCountAfterFollow).toBe(0);
    expect(await followerCount(user)).toBe(1);
    expect(await followeeCount(other)).toBe(1);
  });
});

function followerCount(registered: RegisteredUser): Promise<number> {
  return serverFacade.getFollowerCount({
    token: registered.authToken.token,
    user: registered.user.dto,
  });
}

function followeeCount(registered: RegisteredUser): Promise<number> {
  return serverFacade.getFolloweeCount({
    token: registered.authToken.token,
    user: registered.user.dto,
  });
}
