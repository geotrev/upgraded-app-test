import debounce from "lodash-es/debounce"
import { UpgradedElement, register } from "upgraded-element"
import { dispatch, subscribe, actions } from "../../store"
import "../../shared/todo-action-button"
import styles from "./styles.scss"

class TodoBody extends UpgradedElement {
  static get properties() {
    return {
      todos: {
        default: [],
        type: "array",
      },
    }
  }

  static get styles() {
    return styles
  }

  constructor() {
    super()
    this.handleDelete = this.handleDelete.bind(this)
    this.addTodoEvents = this.addTodoEvents.bind(this)
    this.handleInput = this.handleInput.bind(this)
    this.debounceInput = debounce(this.handleInput, 500)
  }

  elementDidMount() {
    subscribe(this, ["todos"])
    this.registerTodos()
  }

  elementDidUpdate() {
    const newTodo = this.todos[0]

    if (newTodo && newTodo.draft) {
      const todo = this.shadowRoot.querySelector(".todo")
      this.addTodoEvents(todo)
      todo.querySelector(".todo--input").focus()
    }
  }

  registerTodos() {
    const todos = this.shadowRoot.querySelectorAll(".todo")
    todos.forEach(this.addTodoEvents)
  }

  addTodoEvents(todoElement) {
    const deleteBtn = todoElement.querySelector("todo-action-button")
    const input = todoElement.querySelector(".todo--input")
    deleteBtn.addEventListener("click", this.handleDelete)
    input.addEventListener("input", this.debounceInput)
  }

  handleDelete(event) {
    const todoElement = event.target.parentElement

    const deleteBtn = todoElement.querySelector("todo-action-button")
    deleteBtn.removeEventListener("click", this.handleDelete)
    const input = todoElement.querySelector(".todo--input")
    input.removeEventListener("input", this.debounceInput)

    dispatch(actions.DELETE_TODO, {
      id: event.target.parentElement.id,
    })
  }

  handleInput(event) {
    dispatch(actions.SAVE_TODO, {
      id: event.path[0].parentElement.id,
      value: event.path[0].textContent,
    })
  }

  renderTodos() {
    if (!this.todos.length) {
      return `
        <p>You're done! Rejoice! :)</p>
        <br/>
        <p>Or... create more todos!</p>
      `
    }

    return this.todos.reduce((todos, todo) => {
      todos += `
        <div class="todo" data-key='${todo.id}' id='${todo.id}'>
          <div class="todo--input" contenteditable="true"></div>
          <todo-action-button icon="–">Delete</todo-action-button>
        </div>
      `
      return todos
    }, "")
  }

  render() {
    return `
      <main class="todo-body">
        ${this.renderTodos()}
      </main>
    `
  }
}

register("todo-body", TodoBody)
