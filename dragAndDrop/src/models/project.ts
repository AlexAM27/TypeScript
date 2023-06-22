export enum ProjectStatus {
  Active,
  Finished
}

export class Project {
  constructor(public id: string, public name: string, public description: string, public people: number, public status: ProjectStatus) {}
}


