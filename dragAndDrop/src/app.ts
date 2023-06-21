class ProjectState {
  private listeners: any[] = [];
  private projects: any [] = [];
  private static instance: ProjectState;

  private constructor(){

  }

  static getInstance() {
    if(this.instance) {
      return this.instance;
    } else {
      this.instance = new ProjectState();
      return this.instance;
    }
  }

  addListener(listenerFn: Function) {
    this.listeners.push(listenerFn);
  }

  addProject(title: string, description: string, numOfPeople: number) {
    const project = {
      id: Math.random.toString(),
      title: title,
      description: description,
      people: numOfPeople
    }
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


//ProjectList class
class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProjects: any[];

  constructor( private type: 'active' | 'finished') {
    this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;
    this.assignedProjects = [];
    
    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    projectState.addListener((projects: any[]) => {
      this.assignedProjects = projects;
      this.renderProjects();
    })

    this.renderContent();
    this.attach();
  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-project-list`)! as HTMLUListElement;
    for (const prjItem of this.assignedProjects) {
      const listItem = document.createElement('li');
      listItem.textContent = prjItem.title
      listEl.appendChild(listItem)
    }
  }

  private attach() {
    this.hostElement.insertAdjacentElement('beforeend', this.element);
  }

  private renderContent() {
    const listId = `${this.type}-project`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`
  }
}

//ProjectInput class
class ProjectInput {

  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;
  
  
  constructor() {
    this.templateElement = document.getElementById('project-input') as HTMLTemplateElement;
    this.hostElement = document.getElementById('app') as HTMLDivElement;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;
    
    this.configure();

    this.attach();
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

  private configure() {
    this.element.addEventListener('submit', this.submitHandler)
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }

}


const newProject = new ProjectInput();
const activeProjects = new ProjectList('active');
const finishedProjects = new ProjectList('finished');