import { userRepository } from "./user.repository";
import type { SearchUserInput } from "./user.schema";

// internal helper
const findConflicts = async (
  email: string,
  username: string,
  excludeUuid?: string,
) => {
  // handle duplicate fields
  const existed = await userRepository.findDuplicates(
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
  getAllActiveUsers: async () => await userRepository.findAllActive(),

  getActiveUserByUuid: async (uuid: string) =>
    await userRepository.findActiveByUuid(uuid),

  searchUsers: async (body: SearchUserInput) => {
    const { q, page, perPage } = body;

    const escaped = q?.replace(/[\\%_]/g, "\\$&");

    const { rows, totalRow } = await userRepository.search({
      ...body,
      q: escaped,
    });

    const totalPage: number = Math.ceil(totalRow / perPage);
    const prevPage: number | null = page > 1 ? page - 1 : null;
    const nextPage: number | null = page < totalPage ? page + 1 : null;

    return {
      data: rows,
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

  createUser: async (data: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
  }) => {
    const conflicts = await findConflicts(data.email, data.username);

    if (conflicts) {
      return { conflicts, user: null };
    }

    const user = await userRepository.create(data);

    return {
      conflicts: null,
      user,
    };
  },

  updateUser: async (
    uuid: string,
    data: {
      firstName: string;
      lastName: string;
      username: string;
      email: string;
    },
  ) => {
    // check if the user existed at first
    const existing = await userRepository.findActiveByUuid(uuid);

    if (!existing) {
      return {
        notFound: true,
        conflicts: null,
        user: null,
      };
    }

    // check if the user data passed conflicted with exeptional uuid (self uuid)
    const conflicts = await findConflicts(data.email, data.username, uuid);

    if (conflicts) {
      return {
        notFound: null,
        conflicts: conflicts,
        user: null,
      };
    }

    const user = await userRepository.update(uuid, data);

    return {
      notFound: null,
      conflicts: null,
      user: user,
    };
  },

  deleteUser: async (uuid: string) => {
    // check if the user existed at first
    const existing = await userRepository.findActiveByUuid(uuid);

    if (!existing) {
      return false;
    }

    await userRepository.softDelete(uuid);

    return true;
  },
};
