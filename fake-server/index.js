const faker = require('faker');

/* tslint:disable */
module.exports = () => {
  const data = {
    projects: [],
    nodes: [],
  };

  const max = 15;
  for (let i = 1; i <= max; i++) {
    const parent_id = i % 3 === 0 ? 0 : faker.random.number(max);
    const sibling = data.nodes.filter(el => el.parent_id === parent_id);
    data.nodes.push({
      id: i,
      title: faker.name.title(),
      order: sibling.length,
      parent_id,
      project_id: 1,
    });
  }

  data.projects.push({
    id: 1,
    title: faker.name.title(),
    nodes: data.nodes,
  });

  return data;
};
