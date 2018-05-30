export interface ProjectEntity {
  id: number;
  title: string;
  nodes: Node[];
}

export interface NodeEntity {
  id: number;
  title: string;
  order: number;
  parent_id: number;
  project_id: number;
}
