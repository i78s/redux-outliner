export interface Project {
  id: number;
  title: string;
  nodes: Node[];
}

export interface Node {
  id: number;
  title: string;
  parent_id: number;
  project_id: number;
}
