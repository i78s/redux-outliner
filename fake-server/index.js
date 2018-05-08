const faker = require('faker');

module.exports = () => {
  const data = { 
    projects: [],
    nodes: [] 
  };
  
  const max = 50;
  for (let i = 1; i <= max; i++) {
    data.nodes.push({
      id: i,
      title: faker.name.title(),
      parent_id: i % 3 === 0 ? 0 : faker.random.number(max),
      project_id: faker.random.number({min: 1, max: 5}),
    });
  }

  for (let i = 1; i <= 5; i++) {
    data.projects.push({
      id: i,
      title: faker.name.title(),
      nodes: data.nodes.filter(el => el.project_id === i),
    });
  }

  return data;
};