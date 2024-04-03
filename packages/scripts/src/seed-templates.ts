import { Prisma, PrismaClient } from "@nook/common/prisma/nook";
import {
  ChannelFilterType,
  FormComponentType,
  UserFilterType,
  NookTemplate,
} from "@nook/common/types";

const NOOK_FID = "262426";
const NEYNAR_FID = "6131";

const TEMPLATES: Omit<NookTemplate, "id">[] = [
  {
    name: "Onboarding",
    description: "Recreate the nook from onboarding",
    creatorFid: NOOK_FID,
    form: {
      steps: [
        {
          fields: [
            {
              name: "Channels",
              description: "Select your channels",
              field: "channels",
              required: true,
              component: {
                type: FormComponentType.SELECT_CHANNELS,
                allowed: [ChannelFilterType.CHANNEL_URLS],
                limit: 20,
              },
            },
          ],
        },
      ],
    },
  },
  {
    name: "Farcaster Channel",
    description: "Create a nook from a channel",
    creatorFid: NOOK_FID,
    form: {
      steps: [
        {
          fields: [
            {
              name: "Channel",
              description: "Select your channel",
              field: "channel",
              required: true,
              component: {
                type: FormComponentType.SELECT_CHANNELS,
                allowed: [ChannelFilterType.CHANNEL_URLS],
                limit: 1,
              },
            },
          ],
        },
      ],
    },
  },
  {
    name: "Project / Team",
    description: "Create a nook for your project or team",
    creatorFid: NOOK_FID,
    form: {
      steps: [
        {
          fields: [
            {
              name: "Team Members",
              description: "Select your project or team members",
              field: "users",
              required: true,
              component: {
                type: FormComponentType.SELECT_USERS,
                allowed: [UserFilterType.FIDS],
                limit: 20,
              },
            },
            {
              name: "Channels",
              description: "Select your project or team's channels",
              field: "channels",
              required: true,
              component: {
                type: FormComponentType.SELECT_CHANNELS,
                allowed: [ChannelFilterType.CHANNEL_URLS],
                limit: 20,
              },
            },
          ],
        },
      ],
    },
  },
];

const run = async () => {
  const client = new PrismaClient();

  for (const template of TEMPLATES) {
    const existingTemplate = await client.nookTemplate.findUnique({
      where: {
        name: template.name,
      },
    });

    if (existingTemplate) {
      await client.nookTemplate.update({
        where: {
          id: existingTemplate.id,
        },
        data: {
          ...template,
          form: template.form as Prisma.InputJsonValue,
        },
      });

      continue;
    }

    await client.nookTemplate.create({
      data: {
        ...template,
        form: template.form as Prisma.InputJsonValue,
      },
    });
  }
};

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
