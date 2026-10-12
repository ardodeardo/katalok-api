import { contactRepository } from "./contact.repository";

export const contactService = {
  getAll: async () => {
    const rows = await contactRepository.get();

    return rows
      .filter((f) => !f.user.deletedAt && !f.platform.deletedAt)
      .map((row) => {
        const { uuid, content, user, platform } = row;

        return {
          uuid,
          fullName: `${user.firstName} ${user.lastName}`,
          username: user.username,
          platform: platform.name,
          content,
        };
      });
  },
};
