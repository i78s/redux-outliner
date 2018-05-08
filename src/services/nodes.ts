import instance from 'services/axios-instance';
import { Node } from 'services/models';

export default {
  getList() {
    return instance.get(`nodes`)
      .then(res => res.data as Node[]);
  },
  get(id: number) {
    return instance.get(`nodes/${id}`)
      .then(res => res.data as Node);
  },
};
