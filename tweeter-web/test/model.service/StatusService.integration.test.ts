// AI-assisted: see AI-ATTRIBUTION.md
import "isomorphic-fetch";
import {
  anything,
  capture,
  deepEqual,
  instance,
  spy,
  verify,
  when,
} from "@typestrong/ts-mockito";
import { AuthToken, Status, User } from "tweeter-shared";
import { ServerFacade } from "../../src/network/ServerFacade";
import { StatusService } from "../../src/model.service/StatusService";
import {
  PAGE_SIZE,
  alias,
  createLiveApi,
  uniqueSuffix,
} from "../integration/liveApi";

jest.setTimeout(90000);

const api = createLiveApi();

afterAll(async () => {
  await api.cleanup();
});

const posts = ["oldest post", "middle post", "newest post"];
let statusService: StatusService;
let facadeSpy: ServerFacade;
let user: User;
let authToken: AuthToken;
let timestamps: number[];

beforeAll(async () => {
  const registered = await api.registerUser(
    alias("story", uniqueSuffix()),
    "Story",
    "Author",
  );
  user = registered.user;
  authToken = registered.authToken;
  const base = Date.now();
  timestamps = posts.map((_, index) => base + index * 1000);

  const writer = new StatusService();
  for (let index = 0; index < posts.length; index++) {
    await writer.postStatus(
      authToken,
      new Status(posts[index], user, timestamps[index]),
    );
  }
});

beforeEach(() => {
  const realService = new StatusService();
  const serviceSpy = spy(realService);
  facadeSpy = spy(realService.serverFacade);
  when(serviceSpy.serverFacade).thenReturn(instance(facadeSpy));
  statusService = instance(serviceSpy);
});

describe("StatusService integration", () => {
  it("returns a page of story statuses", async () => {
    const [items, hasMore] = await expectStoryPage(null);

    expect(hasMore).toBe(true);
    expect(items.map(describeStatus)).toEqual(
      expectedStatuses().slice(0, PAGE_SIZE).map(describeStatus),
    );
  });

  it("returns every story page until there are no more", async () => {
    let lastItem: Status | null = null;
    let hasMore = true;
    const seen: string[] = [];
    const expected = expectedStatuses();

    while (hasMore) {
      const [items, more]: [Status[], boolean] = await expectStoryPage(lastItem);

      expect(items.length).toBeGreaterThan(0);
      seen.push(...items.map(describeStatus));
      lastItem = items[items.length - 1];
      hasMore = more;
      expect(seen.length).toBeLessThanOrEqual(expected.length);
    }

    expect(hasMore).toBe(false);
    expect(seen).toEqual(expected.map(describeStatus));
  });
});

function expectedStatuses(): Status[] {
  return posts
    .map((post, index) => new Status(post, user, timestamps[index]))
    .reverse();
}

async function expectStoryPage(
  lastItem: Status | null,
): Promise<[Status[], boolean]> {
  const [items, hasMore] = await statusService.loadMoreStoryItems(
    authToken,
    user.alias,
    PAGE_SIZE,
    lastItem,
  );

  const request = {
    token: authToken.token,
    alias: user.alias,
    pageSize: PAGE_SIZE,
    lastItem: lastItem === null ? null : lastItem.dto,
  };
  verify(facadeSpy.getMoreStoryItems(deepEqual(request))).once();
  verify(facadeSpy.getMoreFeedItems(anything())).never();
  const [capturedRequest] = capture(facadeSpy.getMoreStoryItems).last();
  expect(capturedRequest).toEqual(request);

  return [items, hasMore];
}

function describeStatus(status: Status): string {
  return `${status.user.name} ${status.user.alias} ${status.timestamp} ${status.post}`;
}
