const faker = require('faker');

module.exports = () => {
  const data = { 
    projects: [],
    nodes: [] 
  };
  
  const max = 100;
  for (let i = 1; i <= max; i++) {
    data.nodes.push({
      id: i,
      title: faker.name.title(),
      parent_id: i % 3 === 0 ? 0 : faker.random.number(max),
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