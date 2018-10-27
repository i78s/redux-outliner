import { NodeEntity } from './node';

export interface ProjectEntity {
  id: number;
  title: string;
  nodes: NodeEntity[];
}
