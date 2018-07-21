import instance from '~/services/axios-instance';
import { ProjectEntity } from '~/services/models';

export default {
  getList() {
    return instance.get(`projects`).then(res => res.data as ProjectEntity[]);
  },
  get(id: number) {
    return instance
      .get(`projects/${id}`)
      .then(res => res.data as ProjectEntity);
  },
};
