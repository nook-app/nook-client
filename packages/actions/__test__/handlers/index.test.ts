// import { getActionsHandler } from './handlers/index';
import { MongoClient } from "@flink/common/mongo";
import { insertPostContent } from "@flink/content/utils";
import { getActionsHandler } from "@flink/actions/handlers";
import { EventActionType } from "@flink/common/types";
// Other imports...

jest.mock("@flink/common/mongo");
jest.mock("@flink/content/utils");
// Other mocks...

describe("getActionsHandler", () => {
  let mockClient: MongoClient;

  beforeEach(() => {
    mockClient = new MongoClient();
    // Set up other mocks and common setup...
  });

  describe("EventActionType.POST", () => {
    it("should handle POST action correctly", async () => {
      MongoClient.prototype.findAction = jest.fn().mockResolvedValue({
        type: EventActionType.POST,
        data: {
          contentId: "mockContentId",
          content: { embeds: ["mockEmbedId"] },
        },
        source: { id: "mockSourceId" },
      });
      // MongoClient.prototype.incrementEngagement = jest.fn();
      // Mock job data
      const mockJob = {
        data: {
          actionId: 5,
          created: true,
        },
      };
      console.log(mockJob.data.actionId);
      // Call handler
      const handler = await getActionsHandler();
      //@ts-ignore
      await handler(mockJob);
      // Assertions
      expect(insertPostContent).toHaveBeenCalledWith(
        expect.anything(),
        "mockContentId",
        {
          embeds: ["mockEmbedId"],
        },
      );
      // Other test cases...
      // Other assertions...
    });

    // Other test cases...
  });

  // Tests for other action types...

  describe("Error handling", () => {
    it("should throw an error for unknown action types", async () => {
      // Test error handling
    });
  });
});
