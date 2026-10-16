import { userRepository } from "./user.repository";

import type {
  UserTablePayload,
  CreateUserPayload,
  UpdateUserPayload,
  UpdateVisibilityPayload,
} from "./user.schema";

// internal helper
const findTaken = async (
  email: string,
  username: string,
  excludeUuid?: string,
) => {
  // handle duplicate fields
  const existed = await userRepository.selectExisted(
    email,
    username,
    excludeUuid,
  );

  const taken = (["email", "username"] as const).filter((field) =>
    existed.some(
      (row) => row[field] === (field === "email" ? email : username),
    ),
  );

  if (taken.length === 0) {
    return null;
  }

  return taken.map((field) => {
    return {
      path: [field],
      message: `${field} already used`,
    };
  });
};

export const userService = {
  getAll: async () => {
    const rows = await userRepository.get();

    return rows.map((row) => {
      return {
        ...row,
        contacts: row.contacts
          .filter((c) => !c.platform.deletedAt)
          .map((c) => ({
            uuid: c.uuid,
            platform: c.platform.name,
            type: c.platform.type,
            content: c.content,
          })),
      };
    });
  },

  getUsers: async (body: UserTablePayload) => {
    const { q, page, perPage } = body;

    const escaped = q?.replace(/[\\%_]/g, "\\$&");

    const { rows, totalRow } = await userRepository.select({
      ...body,
      q: escaped,
    });

    const totalPage: number = Math.ceil(totalRow / perPage);
    const prevPage: number | null = page > 1 ? page - 1 : null;
    const nextPage: number | null = page < totalPage ? page + 1 : null;

    return {
      data: rows.map((row) => {
        return {
          ...row,
          contacts: row.contacts
            .filter((c) => !c.platform.deletedAt)
            .map((c) => ({
              uuid: c.uuid,
              platform: c.platform.name,
              type: c.platform.type,
              content: c.content,
            })),
        };
      }),
      meta: {
        page,
        perPage,
        totalRow,
        totalPage,
        prevPage,
        nextPage,
      },
    };
  },

  readUser: async (uuid: string) => {
    const row = await userRepository.selectByUuid(uuid);

    if (!row) {
      return null;
    }

    return {
      ...row,
      contacts: row?.contacts
        .filter((c) => !c.platform.deletedAt)
        .map((c) => ({
          uuid: c.uuid,
          platform: c.platform.name,
          type: c.platform.type,
          content: c.content,
        })),
    };
  },

  createUser: async (data: CreateUserPayload) => {
    const conflicts = await findTaken(data.email, data.username);

    if (conflicts) {
      return { conflicts, user: null };
    }

    const user = await userRepository.create(data);

    return {
      conflicts: null,
      user,
    };
  },

  updateUser: async (uuid: string, data: UpdateUserPayload) => {
    const { contacts, ...fields } = data;

    // check if the user existed and active at first
    const { id } = await userRepository.getId(uuid);

    if (!id) {
      return {
        notFound: true,
        conflicts: null,
        user: null,
      };
    }

    // check if the user data passed conflicted with exeptional uuid (self uuid)
    const conflicts = await findTaken(data.email, data.username, uuid);

    if (conflicts) {
      return {
        notFound: null,
        conflicts: conflicts,
        user: null,
      };
    }

    const user = await userRepository.update(uuid, id, fields, contacts);

    return {
      notFound: null,
      conflicts: null,
      user: user,
    };
  },

  updateCatalogVisibility: async (
    uuid: string,
    data: UpdateVisibilityPayload,
  ) => await userRepository.updateVisibility(uuid, data),

  deleteUser: async (uuid: string) => await userRepository.softDelete(uuid),
};
