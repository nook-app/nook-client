import {
  Entity,
  EntityBlockchain,
  EntityFarcaster,
  EntityUsername,
} from "../prisma/entity";

export type EntityWithRelations = Entity & {
  farcasterAccounts: EntityFarcaster[];
  blockchainAccounts: EntityBlockchain[];
  usernames: EntityUsername[];
};
