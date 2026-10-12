import { platformRepository } from "./platform.repository";

export const platformService = {
  getAll: async () => await platformRepository.get(),
};
