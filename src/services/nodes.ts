import instance from 'services/axios-instance';
import { NodeEntity } from 'services/models';

export default {
  getList() {
    return instance.get(`nodes`)
      .then(res => res.data as NodeEntity[]);
  },
  get(id: number) {
    return instance.get(`nodes/${id}`)
      .then(res => res.data as NodeEntity);
  },
  post(params: NodeEntity) {
    return instance.post(`nodes`, params)
      .then(res => res.data as NodeEntity);
  },
  put(params: NodeEntity) {
    return instance.put(`nodes/${params.id}`, params)
      .then(res => res.data as NodeEntity);
  },
  delete(id: number) {
    return instance.delete(`nodes/${id}`)
      .then(res => res.data);
  },
};
