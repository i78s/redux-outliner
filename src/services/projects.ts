import instance from 'services/axios-instance';

export default {
  getList() {
    return instance.get(`projects`)
      .then(res => res.data);
  },
  get(id: number) {
    return instance.get(`projects/${id}`)
      .then(res => res.data);
  },
};
