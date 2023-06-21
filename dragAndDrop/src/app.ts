enum ProjectStatus {
  Active,
  Finished
}

class Project {
  constructor(public id: string, public name: string, public description: string, public people: number, public status: ProjectStatus) {}
}

type Listener<T> = (items: T[]) => void;

abstract class State<T> {
  protected listeners: Listener<T>[] = [];
  
  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

class ProjectState extends State<Project>{
  
  private projects: Project [] = [];
  private static instance: ProjectState;

  private constructor(){
    super()
  }

  static getInstance() {
    if(this.instance) {
      return this.instance;
    } else {
      this.instance = new ProjectState();
      return this.instance;
    }
  }

  

  addProject(title: string, description: string, numOfPeople: number) {
    const project = new Project(Math.random.toString(), title, description, numOfPeople, ProjectStatus.Active)

    this.projects.push(project);
    for(const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

interface Validatable {
  value: string | number;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatable: Validatable) {
  let isValid = true;

  if(validatable.required) {
    isValid = isValid && validatable.value.toString().trim().length !== 0;
  }
  if (validatable.minLength != null && typeof validatable.value === 'string') {
    isValid = isValid && validatable.value.length >= validatable.minLength;
  }
  if (validatable.maxLength != null && typeof validatable.value === 'string') {
    isValid = isValid && validatable.value.length <= validatable.maxLength;
  }
  if (validatable.min != null) {
    isValid = isValid && +validatable.value >= validatable.min;
  }
  if (validatable.max != null) {
    isValid = isValid && +validatable.value <= validatable.max;
  }
  return isValid;
}


function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    }
  };
  return adjDescriptor;
}

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateElementId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ){
    this.templateElement = document.getElementById(templateElementId)! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart);
  }

  private attach(insertAfterBegin: boolean) {
    this.hostElement.insertAdjacentElement(insertAfterBegin ? 'afterbegin' : 'beforeend', this.element);
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

//ProjectItem class

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement>{
  private project: Project;

  get persons() {
    if (this.project.people === 1) {
      return '1 person'
    } else {
      return `${this.project.people} persons`
    }
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id)
    this.project = project;

    this.configure();
    this.renderContent();
  }

  configure(): void {
      
  }

  renderContent(): void {
      this.element.querySelector('h2')!.textContent = this.project.name;
      this.element.querySelector('h3')!.textContent = this.persons + ' assigned';
      this.element.querySelector('p')!.textContent = this.project.description;
  }
}

//ProjectList class
class ProjectList extends Component<HTMLDivElement, HTMLElement>{
  assignedProjects: Project[];

  constructor( private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`)
    this.assignedProjects = [];
       
    this.configure();
    this.renderContent();
  }

  configure(): void {
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter(pr => {
        if(this.type === 'active') {
          return pr.status === ProjectStatus.Active
        } else {
          return pr.status === ProjectStatus.Finished
        }
        
      })
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    })
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`
  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    listEl.innerHTML = '';
    for (const prjItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id, prjItem);
    }
  }

}

//ProjectInput class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{

  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;
  
  constructor() {
    super('project-input', 'app', true)

    this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;
    
    this.configure();

  }

  configure() {
    this.element.addEventListener('submit', this.submitHandler)
  }

  renderContent(): void {
      
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput()
    if(Array.isArray(userInput)) {
      const [title, description, people] = userInput;
      projectState.addProject(title, description, people);
      this.clearInput();
    }
  }

  private clearInput() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  private gatherUserInput(): [string, string, number] | undefined {
    const title = this.titleInputElement.value;
    const description = this.descriptionInputElement.value;
    const peopleAmount = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: title,
      required: true
    }; 

    const descriptionValidatable: Validatable = {
      value: description,
      required: true,
      minLength: 5,
      maxLength: 10
    }; 

    const peopleValidatable: Validatable = {
      value: peopleAmount,
      required: true,
      min: 1,
      max: 5
    }; 

    if (!validate(titleValidatable) || !validate(descriptionValidatable) || !validate(peopleValidatable)) {
      alert('Wrong input!');
      return;
    } else {
      return [title, description, +peopleAmount];
    }    
  }

}


const newProject = new ProjectInput();
const activeProjects = new ProjectList('active');
const finishedProjects = new ProjectList('finished');