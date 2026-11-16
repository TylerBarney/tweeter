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
import { AuthToken, FakeData, Status } from "tweeter-shared";
import { ServerFacade } from "../../src/network/ServerFacade";
import { StatusService } from "../../src/model.service/StatusService";

jest.setTimeout(30000);

const authToken = new AuthToken("integration-test-token", Date.now());
let statusService: StatusService;
let facadeSpy: ServerFacade;

beforeEach(() => {
  const realService = new StatusService();
  const serviceSpy = spy(realService);
  facadeSpy = spy(realService.serverFacade);
  when(serviceSpy.serverFacade).thenReturn(instance(facadeSpy));
  statusService = instance(serviceSpy);
});

describe("StatusService integration", () => {
  it("returns a page of story statuses", async () => {
    await expectStoryPage(null);
  });

  it("returns every story page until there are no more", async () => {
    let lastItem: Status | null = null;
    let hasMore = true;
    const posts: string[] = [];

    while (hasMore) {
      const [items, more]: [Status[], boolean] =
        await expectStoryPage(lastItem);

      expect(items.length).toBeGreaterThan(0);
      posts.push(...items.map((status) => status.post));
      lastItem = items[items.length - 1];
      hasMore = more;
      expect(posts.length).toBeLessThanOrEqual(
        FakeData.instance.fakeStatuses.length,
      );
    }

    expect(hasMore).toBe(false);
    expect(posts).toEqual(
      FakeData.instance.fakeStatuses.map((status) => status.post),
    );
  });
});

async function expectStoryPage(
  lastItem: Status | null,
): Promise<[Status[], boolean]> {
  const [expectedItems, expectedHasMore] = FakeData.instance.getPageOfStatuses(
    lastItem,
    10,
  );
  const [items, hasMore] = await statusService.loadMoreStoryItems(
    authToken,
    "@allen",
    10,
    lastItem,
  );

  const request = {
    token: authToken.token,
    alias: "@allen",
    pageSize: 10,
    lastItem: lastItem === null ? null : lastItem.dto,
  };
  verify(facadeSpy.getMoreStoryItems(deepEqual(request))).once();
  verify(facadeSpy.getMoreFeedItems(anything())).never();
  const [capturedRequest] = capture(facadeSpy.getMoreStoryItems).last();
  expect(capturedRequest).toEqual(request);

  expect(hasMore).toBe(expectedHasMore);
  expect(items.map(describeStatus)).toEqual(expectedItems.map(describeStatus));
  return [items, hasMore];
}

function describeStatus(status: Status): string {
  return `${status.user.name} ${status.user.alias} ${status.timestamp} ${status.post}`;
}
